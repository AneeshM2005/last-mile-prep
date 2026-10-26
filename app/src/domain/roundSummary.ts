/**
 * roundSummary.ts – Pure calculations and alignment logic for Question Selection rounds.
 * PRD 3.1, 3.3.
 */

import type { RoundAttempt } from '../data/schemas';
import type { RoundDef } from '../data/configSchemas';

export interface RoundSummaryResult {
  roundId: string;
  totalQuestions: number;
  attemptedCount: number;
  solvedCount: number;
  totalTimeMs: number;
  avgTimeSec: number;
  recommendedCount: number;
  attemptedRecommendedCount: number;
  alignmentRatio: number;
  alignmentSentence: string;
}

export function computeRoundSummary(
  attempt: RoundAttempt,
  roundDef: RoundDef
): RoundSummaryResult {
  const attemptedPicks = attempt.picks.filter((p) => p.attempted);
  const attemptedCount = attemptedPicks.length;
  const solvedCount = attempt.picks.filter((p) => Boolean(p.correct)).length;

  const totalTimeMs = attempt.picks.reduce((sum, p) => sum + (p.timeMs || 0), 0);
  const avgTimeSec = attemptedCount > 0 ? Math.round(totalTimeMs / attemptedCount / 1000) : 0;

  const recommendedSet = new Set(roundDef.recommendedPickIds);
  const attemptedRecommended = attemptedPicks.filter((p) => recommendedSet.has(p.questionId));
  const attemptedRecommendedCount = attemptedRecommended.length;
  const recommendedCount = roundDef.recommendedPickIds.length;

  const alignmentRatio = recommendedCount > 0 ? attemptedRecommendedCount / recommendedCount : 1;
  const alignmentSentence = `You attempted ${attemptedRecommendedCount} of the ${recommendedCount} questions rated easiest for this set.`;

  return {
    roundId: roundDef.id,
    totalQuestions: roundDef.questionIds.length,
    attemptedCount,
    solvedCount,
    totalTimeMs,
    avgTimeSec,
    recommendedCount,
    attemptedRecommendedCount,
    alignmentRatio,
    alignmentSentence,
  };
}
