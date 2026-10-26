/**
 * revisionScheduler.ts – Spaced revision scheduling logic.
 * PRD M6, design.md 8.8, revision.json.
 */

import { format, addDays, parseISO } from 'date-fns';
import type { RevisionItem, Section } from '../data/schemas';

const DEFAULT_OFFSETS = [1, 3, 9, 18];

/**
 * Creates a new RevisionItem with 4 scheduled review dates.
 */
export function createRevisionItem(
  topic: string,
  section?: Section,
  createdOnStr?: string,
  offsetsDays: number[] = DEFAULT_OFFSETS
): RevisionItem {
  const createdOn = createdOnStr || format(new Date(), 'yyyy-MM-dd');
  const baseDate = parseISO(createdOn);

  const schedule = offsetsDays.map((offset) => ({
    dueOn: format(addDays(baseDate, offset), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
  }));

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-0000-0000-' + Date.now().toString(16).padStart(12, '0');

  return {
    id,
    topic: topic.trim().slice(0, 60),
    section,
    createdOn,
    schedule,
    cycleComplete: false,
  };
}

/**
 * Marks the active scheduled entry as reviewed.
 */
export function markItemReviewed(
  item: RevisionItem,
  scheduleDate: string
): RevisionItem {
  const updatedSchedule = item.schedule.map((entry) => {
    if (entry.dueOn === scheduleDate && entry.status === 'scheduled') {
      return { ...entry, status: 'reviewed' as const };
    }
    return entry;
  });

  const allReviewed = updatedSchedule.every((entry) => entry.status === 'reviewed');

  return {
    ...item,
    schedule: updatedSchedule,
    cycleComplete: allReviewed,
  };
}

/**
 * Postpones an active review to a later date (e.g. tomorrow) without guilt.
 */
export function postponeItem(
  item: RevisionItem,
  currentDueDate: string,
  newDueDate: string
): RevisionItem {
  const updatedSchedule = item.schedule.map((entry) => {
    if (entry.dueOn === currentDueDate && entry.status === 'scheduled') {
      return { ...entry, dueOn: newDueDate };
    }
    return entry;
  });

  return {
    ...item,
    schedule: updatedSchedule,
  };
}

/**
 * Filters items that are due on or before today and still scheduled.
 */
export function getDueItems(
  items: RevisionItem[],
  today: string
): { item: RevisionItem; dueSchedule: { dueOn: string; status: 'scheduled' | 'reviewed' }; stepNumber: number; totalSteps: number }[] {
  const dueList: {
    item: RevisionItem;
    dueSchedule: { dueOn: string; status: 'scheduled' | 'reviewed' };
    stepNumber: number;
    totalSteps: number;
  }[] = [];

  for (const item of items) {
    if (item.cycleComplete) continue;

    // Find first scheduled entry on or before today
    const firstDueIdx = item.schedule.findIndex(
      (s) => s.dueOn <= today && s.status === 'scheduled'
    );

    if (firstDueIdx !== -1) {
      dueList.push({
        item,
        dueSchedule: item.schedule[firstDueIdx],
        stepNumber: firstDueIdx + 1,
        totalSteps: item.schedule.length,
      });
    }
  }

  return dueList;
}

/**
 * Groups upcoming scheduled reviews in the next windowDays days (excluding today).
 */
export function getUpcomingGrouped(
  items: RevisionItem[],
  today: string,
  windowDays = 7
): { date: string; items: { item: RevisionItem; stepNumber: number }[] }[] {
  const todayDate = parseISO(today);
  const maxDate = format(addDays(todayDate, windowDays), 'yyyy-MM-dd');

  const dateMap = new Map<string, { item: RevisionItem; stepNumber: number }[]>();

  for (const item of items) {
    if (item.cycleComplete) continue;

    item.schedule.forEach((s, idx) => {
      if (s.status === 'scheduled' && s.dueOn > today && s.dueOn <= maxDate) {
        const list = dateMap.get(s.dueOn) || [];
        list.push({ item, stepNumber: idx + 1 });
        dateMap.set(s.dueOn, list);
      }
    });
  }

  // Sort by date ascending
  const sortedDates = Array.from(dateMap.keys()).sort();
  return sortedDates.map((date) => ({
    date,
    items: dateMap.get(date) || [],
  }));
}
