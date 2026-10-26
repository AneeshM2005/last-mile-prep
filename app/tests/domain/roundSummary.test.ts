import { describe, it, expect } from 'vitest';
import { computeRoundSummary } from '../../src/domain/roundSummary';
import type { RoundAttempt } from '../../src/data/schemas';
import type { RoundDef } from '../../src/data/configSchemas';

describe('roundSummary domain logic', () => {
  const sampleRoundDef: RoundDef = {
    id: 'round-1',
    questionIds: ['rq-1', 'rq-2', 'rq-3', 'rq-4', 'rq-5'],
    durationSec: 300,
    targetSolves: { min: 2, max: 3 },
    recommendedPickIds: ['rq-1', 'rq-2', 'rq-3'],
  };

  it('correctly calculates counts, alignment, and sentence when user attempted recommended questions', () => {
    const attempt: RoundAttempt = {
      id: 'att-1',
      roundId: 'round-1',
      status: 'completed',
      startedAt: '2026-10-26T10:00:00Z',
      endsAt: '2026-10-26T10:05:00Z',
      endedAt: '2026-10-26T10:04:30Z',
      picks: [
        { questionId: 'rq-1', opened: true, attempted: true, response: 'A', correct: true, skipped: false, timeMs: 45000 },
        { questionId: 'rq-2', opened: true, attempted: true, response: 'B', correct: false, skipped: false, timeMs: 55000 },
        { questionId: 'rq-3', opened: false, attempted: false, response: null, correct: null, skipped: false, timeMs: 0 },
        { questionId: 'rq-4', opened: true, attempted: true, response: 'C', correct: true, skipped: false, timeMs: 60000 },
        { questionId: 'rq-5', opened: false, attempted: false, response: null, correct: null, skipped: false, timeMs: 0 },
      ],
    };

    const summary = computeRoundSummary(attempt, sampleRoundDef);

    expect(summary.roundId).toBe('round-1');
    expect(summary.totalQuestions).toBe(5);
    expect(summary.attemptedCount).toBe(3);
    expect(summary.solvedCount).toBe(2);
    expect(summary.totalTimeMs).toBe(160000);
    // avgTimeSec = 160000 / 3 / 1000 = 53.33 -> 53
    expect(summary.avgTimeSec).toBe(53);
    expect(summary.recommendedCount).toBe(3);
    // rq-1 and rq-2 were attempted from recommended set ['rq-1', 'rq-2', 'rq-3']
    expect(summary.attemptedRecommendedCount).toBe(2);
    expect(summary.alignmentRatio).toBeCloseTo(2 / 3);
    expect(summary.alignmentSentence).toBe(
      'You attempted 2 of the 3 questions rated easiest for this set.'
    );
  });

  it('handles zero attempts gracefully without NaN', () => {
    const attempt: RoundAttempt = {
      id: 'att-empty',
      roundId: 'round-1',
      status: 'completed',
      startedAt: '2026-10-26T10:00:00Z',
      endsAt: '2026-10-26T10:05:00Z',
      picks: [
        { questionId: 'rq-1', opened: false, attempted: false, response: null, correct: null, skipped: false, timeMs: 0 },
        { questionId: 'rq-2', opened: false, attempted: false, response: null, correct: null, skipped: false, timeMs: 0 },
      ],
    };

    const summary = computeRoundSummary(attempt, sampleRoundDef);

    expect(summary.attemptedCount).toBe(0);
    expect(summary.solvedCount).toBe(0);
    expect(summary.avgTimeSec).toBe(0);
    expect(summary.attemptedRecommendedCount).toBe(0);
    expect(summary.alignmentSentence).toBe(
      'You attempted 0 of the 3 questions rated easiest for this set.'
    );
  });
});
