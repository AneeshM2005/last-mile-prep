/**
 * store.ts – Zustand store with versioned localStorage persistence.
 * Keys: lmp.v1.store
 * Write strategy: debounced 300ms, flushed on visibilitychange/pagehide.
 * Schema mismatch or invalid data → reset with neutral notice flag.
 */

import { create } from 'zustand';
import {
  AppDataSchema,
  PersistedStoreSchema,
  type AppData,
  type Profile,
} from './schemas';
import { storageGet, storageSet } from './storage';
import { appClock } from '../domain/appClock';

const STORE_KEY = 'lmp.v1.store';
const SCHEMA_VERSION = 1;

const defaultData: AppData = {
  profile: null,
  baseline: null,
  rounds: [],
  mocks: [],
  revisionItems: [],
  passageSessions: [],
  wordCards: [],
  activity: [],
  recommendations: [],
  feedback: null,
  ui: { dismissedBanners: [] },
};

function loadFromStorage(): { data: AppData; wasReset: boolean } {
  try {
    const raw = storageGet(STORE_KEY);
    if (!raw) return { data: defaultData, wasReset: false };

    const parsed: unknown = JSON.parse(raw);
    const result = PersistedStoreSchema.safeParse(parsed);

    if (!result.success) {
      return { data: defaultData, wasReset: true };
    }
    return { data: result.data.data, wasReset: false };
  } catch {
    return { data: defaultData, wasReset: true };
  }
}

function persist(data: AppData): void {
  try {
    storageSet(STORE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }));
  } catch {
    // Storage may be full; silently ignore (banner already shown via storageAvailable)
  }
}

// Debounce timer ref
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(data: AppData): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => persist(data), 300);
}

function flushPersist(data: AppData): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  persist(data);
}

// ── Store interface ───────────────────────────────────────────

interface StoreState {
  data: AppData;
  wasReset: boolean;     // shows neutral notice banner if true
  // Actions
  createProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  setOnboardingStep: (step: Profile['onboardingStep']) => void;
  resetAllData: () => void;
  dismissBanner: (id: string) => void;
  // Raw setter for slices (used by future feature slices)
  setData: (updater: (prev: AppData) => AppData) => void;
}

const { data: initialData, wasReset } = loadFromStorage();

export const useStore = create<StoreState>()((set, get) => ({
  data: initialData,
  wasReset,

  setData(updater) {
    set((state) => {
      const next = updater(state.data);
      schedulePersist(next);
      return { data: next };
    });
  },

  createProfile(profile) {
    get().setData((prev) => ({ ...prev, profile }));
  },

  updateProfile(updates) {
    get().setData((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : prev.profile,
    }));
  },

  setOnboardingStep(step) {
    get().setData((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, onboardingStep: step } : prev.profile,
    }));
  },

  dismissBanner(id) {
    get().setData((prev) => ({
      ...prev,
      ui: { ...prev.ui, dismissedBanners: [...prev.ui.dismissedBanners, id] },
    }));
  },

  resetAllData() {
    // Caller should call storageRemoveAll() and regenerateSessionId() first
    const fresh = { ...defaultData };
    persist(fresh);
    set({ data: fresh, wasReset: false });
  },
}));

// Validate the data shape still matches the schema (belt-and-suspenders)
export function validateStoredData(): boolean {
  const raw = storageGet(STORE_KEY);
  if (!raw) return true;
  try {
    const parsed: unknown = JSON.parse(raw);
    return AppDataSchema.safeParse(
      (parsed as { data?: unknown })?.data
    ).success;
  } catch {
    return false;
  }
}

// Flush on visibility hidden and pagehide
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPersist(useStore.getState().data);
    }
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    flushPersist(useStore.getState().data);
  });
}

// Expose today() for convenience in components
export { appClock };
