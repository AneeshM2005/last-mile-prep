/**
 * eventLog.ts – local usage event log.
 * Accepts only the allowed EventName values (whitelist enforced by type).
 * Never stores display name, schools, scores or free text.
 * Capped at 500 entries.
 */

import type { EventName } from './schemas';
import { EVENT_NAMES } from './schemas';
import { storageGet, storageSet } from './storage';
import { getSessionId } from './session';

const EVENT_KEY = 'lmp.v1.events';
const MAX_ENTRIES = 500;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadLog(): import('./schemas').EventLogEntry[] {
  try {
    const raw = storageGet(EVENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as import('./schemas').EventLogEntry[];
  } catch {
    return [];
  }
}

function saveLog(entries: import('./schemas').EventLogEntry[]): void {
  storageSet(EVENT_KEY, JSON.stringify(entries));
}

/**
 * Log a usage event. Only EventName values from the whitelist are accepted.
 * The module string is a simple identifier like "onboarding" or "baseline".
 */
export function logEvent(event: EventName, module: string): void {
  // Validate the event is in the whitelist (redundant with types but safe at runtime)
  if (!(EVENT_NAMES as readonly string[]).includes(event)) return;

  const entries = loadLog();
  entries.push({
    id: generateId(),
    sid: getSessionId(),
    ts: new Date().toISOString(),
    event,
    module,
  });

  // Cap at 500
  const capped = entries.length > MAX_ENTRIES
    ? entries.slice(entries.length - MAX_ENTRIES)
    : entries;

  saveLog(capped);
}

export function getEventLog(): import('./schemas').EventLogEntry[] {
  return loadLog();
}

export function clearEventLog(): void {
  saveLog([]);
}

/** Get counts per event name (for session summary; never contains names or scores) */
export function getEventCounts(): Record<string, number> {
  const entries = loadLog();
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    counts[entry.event] = (counts[entry.event] ?? 0) + 1;
  }
  return counts;
}
