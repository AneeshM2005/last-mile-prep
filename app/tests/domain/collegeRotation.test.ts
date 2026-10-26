import { describe, it, expect } from 'vitest';
import {
  getNextCollegeIndex,
  clampCollegeIndex,
  resolveSessionCollegeCursor,
  type StorageLike,
} from '../../src/domain/collegeRotation';

describe('collegeRotation domain logic', () => {
  it('returns 0 if colleges count is 0 or 1', () => {
    expect(getNextCollegeIndex(0, 0)).toBe(0);
    expect(getNextCollegeIndex(0, 1)).toBe(0);
    expect(getNextCollegeIndex(5, 1)).toBe(0);
  });

  it('rotates through colleges sequentially and wraps around', () => {
    // 2 colleges: 0 -> 1 -> 0 -> 1
    expect(getNextCollegeIndex(0, 2)).toBe(1);
    expect(getNextCollegeIndex(1, 2)).toBe(0);

    // 3 colleges: 0 -> 1 -> 2 -> 0
    expect(getNextCollegeIndex(0, 3)).toBe(1);
    expect(getNextCollegeIndex(1, 3)).toBe(2);
    expect(getNextCollegeIndex(2, 3)).toBe(0);
  });

  it('clamps invalid cursor when user edits target colleges', () => {
    expect(clampCollegeIndex(5, 2)).toBe(0);
    expect(clampCollegeIndex(-1, 3)).toBe(0);
    expect(clampCollegeIndex(1, 3)).toBe(1);
  });

  it('guards against double-advancing in the same session', () => {
    const localStore = new Map<string, string>();
    const sessionStore = new Map<string, string>();

    const mockLocal: StorageLike = {
      getItem: (k) => localStore.get(k) ?? null,
      setItem: (k, v) => localStore.set(k, v),
    };
    const mockSession: StorageLike = {
      getItem: (k) => sessionStore.get(k) ?? null,
      setItem: (k, v) => sessionStore.set(k, v),
    };

    // First call in fresh session advances from default 0 -> 1
    const first = resolveSessionCollegeCursor(2, mockLocal, mockSession);
    expect(first).toBe(1);

    // Second call in same session does not double-advance
    const second = resolveSessionCollegeCursor(2, mockLocal, mockSession);
    expect(second).toBe(1);

    // New session (sessionStore cleared): advances from 1 -> 0
    sessionStore.clear();
    const third = resolveSessionCollegeCursor(2, mockLocal, mockSession);
    expect(third).toBe(0);
  });
});
