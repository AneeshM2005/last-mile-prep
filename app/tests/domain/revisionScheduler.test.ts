import { describe, it, expect } from 'vitest';
import {
  createRevisionItem,
  markItemReviewed,
  postponeItem,
  getDueItems,
  getUpcomingGrouped,
} from '../../src/domain/revisionScheduler';
import { RevisionItemSchema } from '../../src/data/schemas';

describe('revisionScheduler domain logic', () => {
  it('creates an item with exactly 4 scheduled dates matching offsets [1, 3, 9, 18]', () => {
    const item = createRevisionItem('Permutations and Combinations', 'QA', '2026-10-01', [1, 3, 9, 18]);

    expect(item.topic).toBe('Permutations and Combinations');
    expect(item.section).toBe('QA');
    expect(item.createdOn).toBe('2026-10-01');
    expect(item.cycleComplete).toBe(false);
    expect(item.schedule).toHaveLength(4);

    expect(item.schedule[0].dueOn).toBe('2026-10-02');
    expect(item.schedule[0].status).toBe('scheduled');
    expect(item.schedule[1].dueOn).toBe('2026-10-04');
    expect(item.schedule[2].dueOn).toBe('2026-10-10');
    expect(item.schedule[3].dueOn).toBe('2026-10-19');

    // Validates against Zod schema
    const parsed = RevisionItemSchema.safeParse(item);
    expect(parsed.success).toBe(true);
  });

  it('truncates topic to 60 characters max', () => {
    const longTopic = 'A'.repeat(80);
    const item = createRevisionItem(longTopic, 'VARC', '2026-10-01');
    expect(item.topic).toHaveLength(60);
  });

  it('marks items reviewed and completes cycle when all 4 steps are reviewed', () => {
    let item = createRevisionItem('Critical Reasoning', 'VARC', '2026-10-01', [1, 3, 9, 18]);

    item = markItemReviewed(item, '2026-10-02');
    expect(item.schedule[0].status).toBe('reviewed');
    expect(item.cycleComplete).toBe(false);

    item = markItemReviewed(item, '2026-10-04');
    item = markItemReviewed(item, '2026-10-10');
    expect(item.cycleComplete).toBe(false);

    item = markItemReviewed(item, '2026-10-19');
    expect(item.schedule[3].status).toBe('reviewed');
    expect(item.cycleComplete).toBe(true);
  });

  it('postpones item to next day without penalty', () => {
    let item = createRevisionItem('Data Tables', 'LRDI', '2026-10-01', [1, 3, 9, 18]);
    item = postponeItem(item, '2026-10-02', '2026-10-03');

    expect(item.schedule[0].dueOn).toBe('2026-10-03');
    expect(item.schedule[0].status).toBe('scheduled');
  });

  it('filters due items accurately based on simulated date', () => {
    const item = createRevisionItem('Algebra', 'QA', '2026-10-01', [1, 3, 9, 18]);

    // On 2026-10-01: step 1 is not due yet (due on 2026-10-02)
    const dueOn1st = getDueItems([item], '2026-10-01');
    expect(dueOn1st).toHaveLength(0);

    // On 2026-10-02: step 1 is due
    const dueOn2nd = getDueItems([item], '2026-10-02');
    expect(dueOn2nd).toHaveLength(1);
    expect(dueOn2nd[0].stepNumber).toBe(1);
    expect(dueOn2nd[0].totalSteps).toBe(4);
  });

  it('groups upcoming reviews in the next 7 days by date', () => {
    const item1 = createRevisionItem('Topic 1', 'QA', '2026-10-01', [1, 3, 9, 18]);
    const item2 = createRevisionItem('Topic 2', 'LRDI', '2026-10-01', [1, 3, 9, 18]);

    // As of 2026-10-01, next 7 days (2026-10-02 to 2026-10-08) should have:
    // 2026-10-02: item1 step 1, item2 step 1
    // 2026-10-04: item1 step 2, item2 step 2
    const upcoming = getUpcomingGrouped([item1, item2], '2026-10-01', 7);
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].date).toBe('2026-10-02');
    expect(upcoming[0].items).toHaveLength(2);
    expect(upcoming[1].date).toBe('2026-10-04');
    expect(upcoming[1].items).toHaveLength(2);
  });
});
