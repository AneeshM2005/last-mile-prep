/**
 * swot.ts – Pure SWOT profile builder from baseline, rounds, and mock entries.
 * PRD 2.2, 2.3.
 * Pure logic returning quadrants and evidence lines.
 */

import type { PatternMetric } from './baselineScoring';
import type { MockEntry, OutcomeCode } from '../data/schemas';

export type SwotQuadrant = 'strength' | 'weakness' | 'opportunity' | 'threat';

export interface SwotItem {
  id: string;
  section: 'VARC' | 'LRDI' | 'QA';
  type: string;
  quadrant: SwotQuadrant;
  questionCount: number;
  correctCount: number;
  avgTimeSec: number;
  evidence: string;
}

export interface SwotProfileResult {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  totalPatterns: number;
}

export function outcomeCodeToGrade(code: OutcomeCode): 'A' | 'B' | 'C' | 'D' {
  switch (code) {
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
  }
}

export function buildSwotProfile(
  baselinePatterns: PatternMetric[],
  mocks: MockEntry[] = []
): SwotProfileResult {
  // Aggregate mock evidence by section::type
  const mockGradeCounts = new Map<string, { A: number; B: number; C: number; D: number; total: number }>();
  for (const mock of mocks) {
    for (const section of mock.sections) {
      for (const r of section.records) {
        const grade = outcomeCodeToGrade(r.outcomeCode);
        const key = `${section.section}::${r.type}`;
        if (!mockGradeCounts.has(key)) {
          mockGradeCounts.set(key, { A: 0, B: 0, C: 0, D: 0, total: 0 });
        }
        const counts = mockGradeCounts.get(key)!;
        counts[grade] += 1;
        counts.total += 1;
      }
    }
  }

  // Combine patterns
  const allKeys = new Set<string>();
  for (const bp of baselinePatterns) {
    allKeys.add(`${bp.section}::${bp.type}`);
  }
  for (const mKey of mockGradeCounts.keys()) {
    allKeys.add(mKey);
  }

  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];

  for (const key of allKeys) {
    const [section, type] = key.split('::') as ['VARC' | 'LRDI' | 'QA', string];
    const bp = baselinePatterns.find((p) => p.section === section && p.type === type);
    const mg = mockGradeCounts.get(key);

    // Votes for each quadrant
    const strengthVotes = (bp?.correctUnderExpectedTime || 0) + (mg?.A || 0);
    const opportunityVotes = (bp?.correctOverExpectedTime || 0) + (mg?.B || 0);
    const threatVotes = (bp?.highConfidenceWrong || 0) + (bp?.diff1Skipped || 0) + (mg?.C || 0);
    let weaknessVotes = (bp?.lowConfidenceWrongOrSkipped || 0) + (mg?.D || 0);

    // If wrong without tags, assign to weakness
    const otherWrong = (bp?.total || 0) - (bp?.correct || 0) - (bp?.lowConfidenceWrongOrSkipped || 0) - (bp?.highConfidenceWrong || 0) - (bp?.diff1Skipped || 0);
    if (otherWrong > 0) {
      weaknessVotes += otherWrong;
    }

    const questionCount = (bp?.total || 0) + (mg?.total || 0);
    const correctCount = (bp?.correct || 0) + (mg?.A || 0); // Grade A is correct
    const avgTimeSec = bp?.avgTimeSec || 0;

    // Tie-breaker order: Threat > Weakness > Opportunity > Strength (most cautious)
    let assignedQuadrant: SwotQuadrant = 'strength';
    let maxVotes = -1;

    // Check in reverse precedence
    if (strengthVotes >= maxVotes && strengthVotes > 0) {
      maxVotes = strengthVotes;
      assignedQuadrant = 'strength';
    }
    if (opportunityVotes >= maxVotes && opportunityVotes > 0) {
      maxVotes = opportunityVotes;
      assignedQuadrant = 'opportunity';
    }
    if (weaknessVotes >= maxVotes && weaknessVotes > 0) {
      maxVotes = weaknessVotes;
      assignedQuadrant = 'weakness';
    }
    if (threatVotes >= maxVotes && threatVotes > 0) {
      maxVotes = threatVotes;
      assignedQuadrant = 'threat';
    }

    if (maxVotes <= 0) {
      assignedQuadrant = 'weakness';
    }

    const evidence = `Based on ${questionCount} question${questionCount === 1 ? '' : 's'}: ${correctCount} correct, average ${avgTimeSec} s.`;

    const item: SwotItem = {
      id: key,
      section,
      type,
      quadrant: assignedQuadrant,
      questionCount,
      correctCount,
      avgTimeSec,
      evidence,
    };

    switch (assignedQuadrant) {
      case 'strength':
        strengths.push(item);
        break;
      case 'weakness':
        weaknesses.push(item);
        break;
      case 'opportunity':
        opportunities.push(item);
        break;
      case 'threat':
        threats.push(item);
        break;
    }
  }

  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    totalPatterns: allKeys.size,
  };
}
