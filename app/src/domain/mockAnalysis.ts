/**
 * mockAnalysis.ts – Outcome classification, grading, potential score, and mock summary calculations.
 * PRD 4.3, 4.5, BR-14, BRD Appendix A.
 */

import type { MockRecord, MockSection, MockEntry, OutcomeCode, Step2 } from '../data/schemas';

export type GradeLetter = 'A' | 'B' | 'C' | 'D';

export interface GradeCounts {
  A: number;
  B: number;
  C: number;
  D: number;
  total: number;
}

export interface SectionAnalysisResult {
  section: 'VARC' | 'LRDI' | 'QA';
  counts: GradeCounts;
  potentialScore: number;
  actualScore: number;
  leakage: number;
}

export interface MockSummaryResult {
  totalCounts: GradeCounts;
  totalPotentialScore: number;
  totalActualScore: number;
  totalLeakage: number;
  sections: SectionAnalysisResult[];
  leakageSentence: string;
}

/**
 * Maps two-step mock input to one of nine outcome codes.
 */
export function deriveOutcomeCode(
  step1: 'correct' | 'wrong' | 'left' | 'unseen',
  step2: Step2
): OutcomeCode {
  if (step1 === 'correct') {
    if (step2 === 'fast') return 'CORRECT_FAST';
    if (step2 === 'slow') return 'CORRECT_SLOW';
    return 'CORRECT_GUESSED';
  }
  if (step1 === 'wrong') {
    return step2 === 'can_solve' ? 'WRONG_CAN' : 'WRONG_CANNOT';
  }
  if (step1 === 'left') {
    return step2 === 'can_solve' ? 'LEFT_CAN' : 'LEFT_CANNOT';
  }
  // unseen
  return step2 === 'can_solve' ? 'UNSEEN_CAN' : 'UNSEEN_CANNOT';
}

/**
 * Maps outcome code to letter grade A, B, C, or D.
 */
export function gradeForOutcome(outcomeCode: OutcomeCode): GradeLetter {
  switch (outcomeCode) {
    case 'CORRECT_FAST':
      return 'A';
    case 'CORRECT_SLOW':
    case 'WRONG_CAN':
    case 'LEFT_CAN':
    case 'UNSEEN_CAN':
      return 'B';
    case 'CORRECT_GUESSED':
    case 'LEFT_CANNOT':
    case 'UNSEEN_CANNOT':
      return 'C';
    case 'WRONG_CANNOT':
      return 'D';
    default:
      return 'C';
  }
}

/**
 * Counts grades across a list of mock records.
 */
export function calculateGradeCounts(records: MockRecord[]): GradeCounts {
  const counts: GradeCounts = { A: 0, B: 0, C: 0, D: 0, total: records.length };
  for (const r of records) {
    const g = gradeForOutcome(r.outcomeCode);
    counts[g] += 1;
  }
  return counts;
}

/**
 * Potential score formula: 3 * (A + B).
 * PRD 4.5: The score if every question you could solve were answered correctly.
 */
export function calculatePotentialScore(counts: { A: number; B: number }): number {
  return 3 * (counts.A + counts.B);
}

/**
 * Leakage: marks left on the table across B questions.
 */
export function calculateLeakage(potentialScore: number, actualScore: number): number {
  return Math.max(0, potentialScore - actualScore);
}

/**
 * Formats verbatim leakage explanation.
 */
export function formatLeakageSentence(leakage: number, bCount: number): string {
  return `Leakage: +${leakage} marks left on the table across ${bCount} questions you could solve.`;
}

/**
 * Evaluates a single mock section.
 */
export function analyzeMockSection(section: MockSection): SectionAnalysisResult {
  const counts = calculateGradeCounts(section.records);
  const potentialScore = calculatePotentialScore(counts);
  const actualScore = section.actualScore ?? 0;
  const leakage = calculateLeakage(potentialScore, actualScore);

  return {
    section: section.section,
    counts,
    potentialScore,
    actualScore,
    leakage,
  };
}

/**
 * Evaluates an entire mock entry across all completed sections.
 */
export function analyzeMockEntry(entry: MockEntry): MockSummaryResult {
  const sections = entry.sections.map(analyzeMockSection);

  const totalCounts: GradeCounts = { A: 0, B: 0, C: 0, D: 0, total: 0 };
  let totalPotentialScore = 0;
  let totalActualScore = 0;

  for (const s of sections) {
    totalCounts.A += s.counts.A;
    totalCounts.B += s.counts.B;
    totalCounts.C += s.counts.C;
    totalCounts.D += s.counts.D;
    totalCounts.total += s.counts.total;
    totalPotentialScore += s.potentialScore;
    totalActualScore += s.actualScore;
  }

  const totalLeakage = calculateLeakage(totalPotentialScore, totalActualScore);
  const leakageSentence = formatLeakageSentence(totalLeakage, totalCounts.B);

  return {
    totalCounts,
    totalPotentialScore,
    totalActualScore,
    totalLeakage,
    sections,
    leakageSentence,
  };
}
