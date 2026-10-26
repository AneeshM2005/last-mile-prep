/**
 * reset.ts – one function that resets all app state.
 * Removes every lmp.v1.* key, issues a new session ID, resets the store.
 */

import { storageRemoveAll } from './storage';
import { regenerateSessionId } from './session';
import { useStore } from './store';
import { appClock } from '../domain/appClock';

export function resetApp(): void {
  // 1. Wipe all prefixed keys (including store, clock, events, sid)
  storageRemoveAll();
  // 2. New session ID
  regenerateSessionId();
  // 3. Reset clock offset
  appClock.resetOffset();
  // 4. Reset Zustand state in memory
  useStore.getState().resetAllData();
}
