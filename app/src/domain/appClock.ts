/**
 * appClock.ts – application clock with demo offset.
 * - appClock.now()   : real time + offsetDays (for date logic only)
 * - appClock.today() : LocalDate string in the user's timezone
 * - realNow()        : always real wall-clock time (for countdown timers)
 * - offsetDays is persisted to lmp.v1.clock
 *
 * Two clocks must never be mixed (Tech_Architecture 9).
 */

import { format, addDays } from 'date-fns';
import { storageGet, storageSet } from '../data/storage';

const CLOCK_KEY = 'lmp.v1.clock';

function loadOffset(): number {
  try {
    const raw = storageGet(CLOCK_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { offsetDays?: number };
    return typeof parsed.offsetDays === 'number' ? parsed.offsetDays : 0;
  } catch {
    return 0;
  }
}

let _offsetDays: number = loadOffset();

/** Real wall-clock time. Use ONLY for countdown timers. */
export function realNow(): Date {
  return new Date();
}

/** Simulated time (real + offset). Use for date logic only. */
export const appClock = {
  now(): Date {
    if (_offsetDays === 0) return new Date();
    return addDays(new Date(), _offsetDays);
  },

  today(): string {
    return format(appClock.now(), 'yyyy-MM-dd');
  },

  isSimulated(): boolean {
    return _offsetDays !== 0;
  },

  setOffsetDays(days: number): void {
    _offsetDays = days;
    storageSet(CLOCK_KEY, JSON.stringify({ offsetDays: days }));
  },

  resetOffset(): void {
    _offsetDays = 0;
    storageSet(CLOCK_KEY, JSON.stringify({ offsetDays: 0 }));
  },
};
