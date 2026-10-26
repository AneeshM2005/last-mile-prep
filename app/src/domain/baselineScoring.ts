/**
 * baselineScoring.ts – Pure scoring and metrics computation for Baseline.
 * PRD 2.1, Tech_Architecture 7.1.
 * Pure logic returning results and evidence numbers. Imports nothing from React or browser.
 */

import type { BaselineAttempt } from '../data/schemas';
import type { Question } from '../data/configSchemas';

export interface PatternMetric {
  section: 'VARC' | 'LRDI' | 'QA';
  type: string;
  total: number;
  correct: number;
  attempted: number;
  skipped: number;
  totalTimeMs: number;
  avgTimeSec: number;
  expectedTimeSec: number;
  accuracy: number;
  // Specific decision markers
  correctUnderExpectedTime: number;
  correctOverExpectedTime: number;
  lowConfidenceWrongOrSkipped: number;
  highConfidenceWrong: number;
  diff1Skipped: number;
}

export interface SectionSummary {
  section: 'VARC' | 'LRDI' | 'QA';
  totalQuestions: number;
  attempted: number;
  correct: number;
  skipped: number;
  totalTimeMs: number;
  avgTimeSec: number;
  accuracy: number;
}

export interface BaselineScoringResult {
  sectionSummaries: Record<'VARC' | 'LRDI' | 'QA', SectionSummary>;
  patterns: PatternMetric[];
  totalCorrect: number;
  totalAttempted: number;
  totalTimeMs: number;
}

export function computeBaselineScoring(
  attempt: BaselineAttempt,
  questions: Question[]
): BaselineScoringResult {
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const sectionSummaries: Record<'VARC' | 'LRDI' | 'QA', SectionSummary> = {
    VARC: { section: 'VARC', totalQuestions: 0, attempted: 0, correct: 0, skipped: 0, totalTimeMs: 0, avgTimeSec: 0, accuracy: 0 },
    LRDI: { section: 'LRDI', totalQuestions: 0, attempted: 0, correct: 0, skipped: 0, totalTimeMs: 0, avgTimeSec: 0, accuracy: 0 },
    QA:   { section: 'QA',   totalQuestions: 0, attempted: 0, correct: 0, skipped: 0, totalTimeMs: 0, avgTimeSec: 0, accuracy: 0 },
  };

  const patternMap = new Map<string, PatternMetric>();

  let totalCorrect = 0;
  let totalAttempted = 0;
  let totalTimeMs = 0;

  for (const ans of attempt.answers) {
    const q = qMap.get(ans.questionId);
    if (!q) continue;

    const s = sectionSummaries[q.section as 'VARC' | 'LRDI' | 'QA'];
    s.totalQuestions += 1;
    s.totalTimeMs += ans.timeMs;
    totalTimeMs += ans.timeMs;

    const isSkipped = ans.skipped || !ans.response;
    const isCorrect = Boolean(ans.correct);

    if (isSkipped) {
      s.skipped += 1;
    } else {
      s.attempted += 1;
      totalAttempted += 1;
    }

    if (isCorrect) {
      s.correct += 1;
      totalCorrect += 1;
    }

    // Pattern metrics key: section::type
    const pKey = `${q.section}::${q.type}`;
    if (!patternMap.has(pKey)) {
      patternMap.set(pKey, {
        section: q.section,
        type: q.type,
        total: 0,
        correct: 0,
        attempted: 0,
        skipped: 0,
        totalTimeMs: 0,
        avgTimeSec: 0,
        expectedTimeSec: q.expectedTimeSec,
        accuracy: 0,
        correctUnderExpectedTime: 0,
        correctOverExpectedTime: 0,
        lowConfidenceWrongOrSkipped: 0,
        highConfidenceWrong: 0,
        diff1Skipped: 0,
      });
    }

    const pm = patternMap.get(pKey)!;
    pm.total += 1;
    pm.totalTimeMs += ans.timeMs;

    if (isSkipped) {
      pm.skipped += 1;
      if (ans.confidence === 'low') {
        pm.lowConfidenceWrongOrSkipped += 1;
      }
      if (q.difficulty === 1) {
        pm.diff1Skipped += 1;
      }
    } else {
      pm.attempted += 1;
      if (isCorrect) {
        pm.correct += 1;
        const timeSec = Math.round(ans.timeMs / 1000);
        if (timeSec <= q.expectedTimeSec) {
          pm.correctUnderExpectedTime += 1;
        } else {
          pm.correctOverExpectedTime += 1;
        }
      } else {
        if (ans.confidence === 'low') {
          pm.lowConfidenceWrongOrSkipped += 1;
        }
        if (ans.confidence === 'high') {
          pm.highConfidenceWrong += 1;
        }
      }
    }
  }

  // Calculate averages & accuracies
  for (const s of Object.values(sectionSummaries)) {
    s.avgTimeSec = s.totalQuestions > 0 ? Math.round(s.totalTimeMs / s.totalQuestions / 1000) : 0;
    s.accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
  }

  const patterns: PatternMetric[] = [];
  for (const pm of patternMap.values()) {
    pm.avgTimeSec = pm.total > 0 ? Math.round(pm.totalTimeMs / pm.total / 1000) : 0;
    pm.accuracy = pm.attempted > 0 ? Math.round((pm.correct / pm.attempted) * 100) : 0;
    patterns.push(pm);
  }

  return {
    sectionSummaries,
    patterns,
    totalCorrect,
    totalAttempted,
    totalTimeMs,
  };
}
