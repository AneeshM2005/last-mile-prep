/**
 * session.ts – anonymous session ID management.
 * Session ID is stored in lmp.v1.sid.
 * regenerated on reset.
 */

import { storageGet, storageSet } from './storage';

const SID_KEY = 'lmp.v1.sid';

function generateUUID(): string {
  // crypto.randomUUID() is widely available; fallback for edge cases
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Safe fallback using Math.random (not cryptographically secure, acceptable for session IDs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadOrCreate(): string {
  const existing = storageGet(SID_KEY);
  if (existing) return existing;
  const id = generateUUID();
  storageSet(SID_KEY, id);
  return id;
}

let _sid: string = loadOrCreate();

export function getSessionId(): string {
  return _sid;
}

export function regenerateSessionId(): string {
  _sid = generateUUID();
  storageSet(SID_KEY, _sid);
  return _sid;
}
