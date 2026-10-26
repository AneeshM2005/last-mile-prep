/**
 * collegeRotation.ts – Pure helper functions for target college countdown card rotation.
 * Rotates each time the app is opened afresh (session start), persists cursor, clamps to bounds.
 */

import { storageGet, storageSet } from '../data/storage';

export interface SchoolTarget {
  id: string;
  name: string;
  image?: string | { file: string; licence?: string; attribution?: string; sourceUrl?: string };
  credit?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Computes the next college index in order, wrapping around.
 * With 0 or 1 college, always 0.
 */
export function getNextCollegeIndex(currentCursor: number, totalColleges: number): number {
  if (totalColleges <= 1) return 0;
  return (currentCursor + 1) % totalColleges;
}

/**
 * Clamps a cursor to the valid range [0, totalColleges - 1].
 */
export function clampCollegeIndex(cursor: number, totalColleges: number): number {
  if (totalColleges <= 0) return 0;
  if (cursor < 0 || cursor >= totalColleges) return 0;
  return cursor;
}

export const STORAGE_CURSOR_KEY = 'lmp.v1.college_cursor';
export const SESSION_ROTATED_KEY = 'lmp.v1.college_session_rotated';

// In-memory session tracking fallback
let memorySessionRotated = false;

/**
 * Gets the active college cursor for the current session.
 * Advances cursor only once per fresh app open.
 */
export function resolveSessionCollegeCursor(
  totalColleges: number,
  customLocal?: StorageLike,
  customSession?: StorageLike,
): number {
  if (totalColleges <= 0) return 0;

  try {
    const rawCursor = customLocal
      ? customLocal.getItem(STORAGE_CURSOR_KEY)
      : storageGet(STORAGE_CURSOR_KEY);
    const savedCursor = rawCursor !== null ? parseInt(rawCursor, 10) : 0;
    const validSavedCursor = clampCollegeIndex(isNaN(savedCursor) ? 0 : savedCursor, totalColleges);

    let alreadyRotated = memorySessionRotated;
    if (customSession) {
      alreadyRotated = customSession.getItem(SESSION_ROTATED_KEY) === 'true';
    } else if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        alreadyRotated = window.sessionStorage.getItem(SESSION_ROTATED_KEY) === 'true';
      } catch {
        alreadyRotated = memorySessionRotated;
      }
    }

    if (alreadyRotated) {
      return validSavedCursor;
    }

    // Fresh app open: advance cursor
    const nextCursor = getNextCollegeIndex(validSavedCursor, totalColleges);
    if (customLocal) {
      customLocal.setItem(STORAGE_CURSOR_KEY, nextCursor.toString());
    } else {
      storageSet(STORAGE_CURSOR_KEY, nextCursor.toString());
    }

    memorySessionRotated = true;
    if (customSession) {
      customSession.setItem(SESSION_ROTATED_KEY, 'true');
    } else if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(SESSION_ROTATED_KEY, 'true');
      } catch {
        // Ignored
      }
    }

    return nextCursor;
  } catch {
    return 0;
  }
}
