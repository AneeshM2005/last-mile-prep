/**
 * storage.ts – localStorage adapter with in-memory fallback.
 * Only this module touches localStorage directly.
 * Export `storageAvailable` to let UI show the storage banner.
 */

const TEST_KEY = 'lmp.v1.__test__';

function detectStorage(): boolean {
  try {
    localStorage.setItem(TEST_KEY, '1');
    localStorage.removeItem(TEST_KEY);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable: boolean = detectStorage();

// In-memory fallback when localStorage is unavailable
const memStore = new Map<string, string>();

export function storageGet(key: string): string | null {
  if (storageAvailable) {
    return localStorage.getItem(key);
  }
  return memStore.get(key) ?? null;
}

export function storageSet(key: string, value: string): void {
  if (storageAvailable) {
    localStorage.setItem(key, value);
  } else {
    memStore.set(key, value);
  }
}

export function storageRemove(key: string): void {
  if (storageAvailable) {
    localStorage.removeItem(key);
  } else {
    memStore.delete(key);
  }
}

/** Remove all keys starting with `lmp.v1.` */
export function storageRemoveAll(): void {
  if (storageAvailable) {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('lmp.v1.')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } else {
    for (const key of Array.from(memStore.keys())) {
      if (key.startsWith('lmp.v1.')) memStore.delete(key);
    }
  }
}
