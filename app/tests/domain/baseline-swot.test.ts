import { describe, it, expect } from 'vitest';
import { computeBaselineScoring } from '../../src/domain/baselineScoring';
import { buildSwotProfile } from '../../src/domain/swot';
import type { BaselineAttempt } from '../../src/data/schemas';
import type { Question } from '../../src/data/configSchemas';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    section: 'QA',
    type: 'Arithmetic',
    difficulty: 1,
    inputType: 'mcq',
    stem: 'Test question 1',
    correctAnswer: 'A',
    expectedTimeSec: 60,
    solution: 'Sol 1',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Tester', recordedDate: '2026-10-26' },
  },
  {
    id: 'q2',
    section: 'QA',
    type: 'Arithmetic',
    difficulty: 2,
    inputType: 'mcq',
    stem: 'Test question 2',
    correctAnswer: 'B',
    expectedTimeSec: 60,
    solution: 'Sol 2',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Tester', recordedDate: '2026-10-26' },
  },
  {
    id: 'q3',
    section: 'VARC',
    type: 'Reading Comprehension',
    difficulty: 2,
    inputType: 'mcq',
    stem: 'Test question 3',
    correctAnswer: 'C',
    expectedTimeSec: 75,
    solution: 'Sol 3',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Tester', recordedDate: '2026-10-26' },
  },
  {
    id: 'q4',
    section: 'LRDI',
    type: 'Seating Arrangement',
    difficulty: 1,
    inputType: 'mcq',
    stem: 'Test question 4',
    correctAnswer: 'D',
    expectedTimeSec: 50,
    solution: 'Sol 4',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Tester', recordedDate: '2026-10-26' },
  },
];

describe('P1-07 Baseline Scoring & P1-08 SWOT Profile', () => {
  it('computes section summaries and pattern metrics accurately', () => {
    const attempt: BaselineAttempt = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'completed',
      startedAt: '2026-10-26T10:00:00Z',
      endsAt: '2026-10-26T10:15:00Z',
      completedAt: '2026-10-26T10:10:00Z',
      currentIndex: 3,
      questionIds: ['q1', 'q2', 'q3', 'q4'],
      answers: [
        { questionId: 'q1', response: 'A', correct: true, skipped: false, timeMs: 40000, confidence: 'high' },
        { questionId: 'q2', response: 'C', correct: false, skipped: false, timeMs: 90000, confidence: 'high' },
        { questionId: 'q3', response: 'C', correct: true, skipped: false, timeMs: 100000, confidence: 'medium' },
        { questionId: 'q4', response: null, correct: null, skipped: true, timeMs: 15000 },
      ],
    };

    const scoring = computeBaselineScoring(attempt, mockQuestions);

    // QA: 2 questions, 1 correct, 1 wrong, 100% attempted
    expect(scoring.sectionSummaries.QA.totalQuestions).toBe(2);
    expect(scoring.sectionSummaries.QA.correct).toBe(1);
    expect(scoring.sectionSummaries.QA.attempted).toBe(2);
    expect(scoring.sectionSummaries.QA.accuracy).toBe(50);

    // LRDI: 1 question, skipped
    expect(scoring.sectionSummaries.LRDI.skipped).toBe(1);
    expect(scoring.sectionSummaries.LRDI.correct).toBe(0);

    // VARC: 1 question, correct
    expect(scoring.sectionSummaries.VARC.correct).toBe(1);
    expect(scoring.sectionSummaries.VARC.attempted).toBe(1);

    // Total counts
    expect(scoring.totalCorrect).toBe(2);
    expect(scoring.totalAttempted).toBe(3);

    // SWOT classification
    const swot = buildSwotProfile(scoring.patterns);
    expect(swot.totalPatterns).toBe(3);

    // q3 (Reading Comprehension) took 100s > 75s expected -> Opportunity
    const oppRc = swot.opportunities.find((o) => o.type === 'Reading Comprehension');
    expect(oppRc).toBeDefined();

    // q4 (Seating Arrangement) difficulty 1 was skipped -> Threat
    const threatLr = swot.threats.find((t) => t.type === 'Seating Arrangement');
    expect(threatLr).toBeDefined();

    // q2 was wrong with high confidence -> Threat
    const threatQa = swot.threats.find((t) => t.type === 'Arithmetic');
    expect(threatQa).toBeDefined();
  });

  it('incorporates mock grades into SWOT quadrants (A->strength, B->opportunity, C->threat, D->weakness)', () => {
    const swot = buildSwotProfile([], [
      {
        id: '00000000-0000-0000-0000-000000000001',
        label: 'Mock 1',
        date: '2026-10-26',
        sections: [
          {
            section: 'QA',
            questionCount: 3,
            records: [
              { n: 1, type: 'Algebra', step1: 'correct', step2: 'fast', outcomeCode: 'CORRECT_FAST' },
              { n: 2, type: 'Geometry', step1: 'wrong', step2: 'can_solve', outcomeCode: 'WRONG_CAN' },
              { n: 3, type: 'Modern Math', step1: 'wrong', step2: 'cannot_solve', outcomeCode: 'WRONG_CANNOT' },
            ],
          },
        ],
      },
    ]);

    expect(swot.strengths.find((s) => s.type === 'Algebra')).toBeDefined();
    expect(swot.opportunities.find((o) => o.type === 'Geometry')).toBeDefined();
    expect(swot.weaknesses.find((w) => w.type === 'Modern Math')).toBeDefined();
  });
});
