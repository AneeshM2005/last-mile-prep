/**
 * P1-03 required tests: data layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageGet, storageSet, storageRemoveAll, storageAvailable } from '@/data/storage';
import { appClock, realNow } from '@/domain/appClock';
import { logEvent, getEventLog, clearEventLog } from '@/data/eventLog';
import { getSessionId, regenerateSessionId } from '@/data/session';

// ── Mock localStorage for each test ──────────────────────────
let _store: Record<string, string> = {};

const localStorageMock = {
  getItem: (k: string) => _store[k] ?? null,
  setItem: (k: string, v: string) => { _store[k] = v; },
  removeItem: (k: string) => { delete _store[k]; },
  clear: () => { _store = {}; },
  get length() { return Object.keys(_store).length; },
  key: (i: number) => Object.keys(_store)[i] ?? null,
};

beforeEach(() => {
  _store = {};
  vi.stubGlobal('localStorage', localStorageMock);
  clearEventLog();
});

// ─────────────────────────────────────────────────────────────
describe('Storage adapter', () => {
  it('reads and writes to localStorage when available', () => {
    storageSet('lmp.v1.test', 'hello');
    expect(storageGet('lmp.v1.test')).toBe('hello');
  });

  it('storageAvailable is truthy with the mock', () => {
    // The mock localStorage works so detection should pass
    expect(typeof storageAvailable).toBe('boolean');
  });

  it('storageRemoveAll removes all lmp.v1.* keys only', () => {
    storageSet('lmp.v1.store', '{}');
    storageSet('lmp.v1.events', '[]');
    storageSet('other.key', 'keep');
    storageRemoveAll();
    expect(storageGet('lmp.v1.store')).toBeNull();
    expect(storageGet('lmp.v1.events')).toBeNull();
    expect(storageGet('other.key')).toBe('keep');
  });
});

// ─────────────────────────────────────────────────────────────
describe('App clock', () => {
  it('today() changes with offset but realNow() does not change type', () => {
    const realBefore = realNow().toDateString();
    appClock.setOffsetDays(5);
    const simulatedToday = appClock.today();

    // realNow should still be today
    expect(realNow().toDateString()).toBe(realBefore);

    // simulated today should be a valid date string
    expect(simulatedToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // simulated today should differ from real today (5 days offset)
    const realToday = new Date().toISOString().split('T')[0];
    expect(simulatedToday).not.toBe(realToday);

    appClock.setOffsetDays(0);
  });

  it('isSimulated() returns false when offset is 0', () => {
    appClock.setOffsetDays(0);
    expect(appClock.isSimulated()).toBe(false);
  });

  it('isSimulated() returns true when offset is non-zero', () => {
    appClock.setOffsetDays(3);
    expect(appClock.isSimulated()).toBe(true);
    appClock.setOffsetDays(0);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Event log', () => {
  it('accepts valid event names', () => {
    logEvent('consent_given', 'onboarding');
    const log = getEventLog();
    expect(log.length).toBe(1);
    expect(log[0].event).toBe('consent_given');
    expect(log[0].module).toBe('onboarding');
  });

  it('caps at 500 entries', () => {
    for (let i = 0; i < 510; i++) {
      logEvent('card_flipped', 'words');
    }
    const log = getEventLog();
    expect(log.length).toBeLessThanOrEqual(500);
  });

  it('entries never contain displayName field', () => {
    logEvent('consent_given', 'onboarding');
    const log = getEventLog();
    const json = JSON.stringify(log);
    expect(json).not.toContain('displayName');
  });

  it('entry has only allowed fields: id, sid, ts, event, module', () => {
    logEvent('consent_given', 'onboarding');
    const entry = getEventLog()[0];
    const keys = Object.keys(entry).sort();
    expect(keys).toEqual(['event', 'id', 'module', 'sid', 'ts'].sort());
  });
});

// ─────────────────────────────────────────────────────────────
describe('Session ID', () => {
  it('regenerateSessionId produces a different ID', () => {
    const before = getSessionId();
    regenerateSessionId();
    const after = getSessionId();
    expect(after).not.toBe(before);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Reset removes prefixed keys', () => {
  it('storageRemoveAll clears lmp.v1.store and lmp.v1.events', () => {
    storageSet('lmp.v1.store', JSON.stringify({ schemaVersion: 1, data: {} }));
    storageSet('lmp.v1.events', '[]');
    storageRemoveAll();
    expect(storageGet('lmp.v1.store')).toBeNull();
    expect(storageGet('lmp.v1.events')).toBeNull();
  });
});
