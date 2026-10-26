/**
 * sessionSummary.ts – Privacy-preserving session summary for feedback.
 * PRD BR-13: Display name stripped; nothing personal included.
 */

import type { AppData, FeedbackRecord } from '../data/schemas';

export interface AnonymousFeedbackPayload {
  version: '1.0.0-prototype';
  exportedAt: string;
  ratings: FeedbackRecord['ratings'];
  answers: FeedbackRecord['answers'];
  wouldUseAgain: FeedbackRecord['wouldUseAgain'];
  metrics: {
    daysPractised: number;
    baselineDone: boolean;
    roundsCompleted: number;
    mocksRecorded: number;
    revisionItemsCount: number;
    wordCardsCount: number;
  };
}

export function buildAnonymousFeedbackPayload(
  data: AppData,
  feedback: FeedbackRecord
): AnonymousFeedbackPayload {
  const uniquePractisedDays = new Set(data.activity.map((a) => a.date)).size;

  return {
    version: '1.0.0-prototype',
    exportedAt: new Date().toISOString(),
    ratings: feedback.ratings,
    answers: feedback.answers,
    wouldUseAgain: feedback.wouldUseAgain,
    metrics: {
      daysPractised: uniquePractisedDays,
      baselineDone: Boolean(data.baseline && data.baseline.status === 'completed'),
      roundsCompleted: data.rounds.filter((r) => r.status === 'completed').length,
      mocksRecorded: data.mocks.length,
      revisionItemsCount: data.revisionItems.length,
      wordCardsCount: data.wordCards.length,
    },
  };
}
