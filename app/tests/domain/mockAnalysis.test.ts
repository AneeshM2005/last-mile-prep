import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  deriveOutcomeCode,
  gradeForOutcome,
  calculatePotentialScore,
  analyzeMockEntry,
  formatLeakageSentence,
} from '../../src/domain/mockAnalysis';
import { MockEntrySchema } from '../../src/data/schemas';
import type { MockEntry } from '../../src/data/schemas';

describe('mockAnalysis domain & worked example verification', () => {
  it('correctly maps all 9 outcome combinations to codes and letter grades', () => {
    // 1. Correct + fast -> CORRECT_FAST -> A
    expect(deriveOutcomeCode('correct', 'fast')).toBe('CORRECT_FAST');
    expect(gradeForOutcome('CORRECT_FAST')).toBe('A');

    // 2. Correct + slow -> CORRECT_SLOW -> B
    expect(deriveOutcomeCode('correct', 'slow')).toBe('CORRECT_SLOW');
    expect(gradeForOutcome('CORRECT_SLOW')).toBe('B');

    // 3. Correct + guessed -> CORRECT_GUESSED -> C
    expect(deriveOutcomeCode('correct', 'guessed')).toBe('CORRECT_GUESSED');
    expect(gradeForOutcome('CORRECT_GUESSED')).toBe('C');

    // 4. Wrong + can_solve -> WRONG_CAN -> B
    expect(deriveOutcomeCode('wrong', 'can_solve')).toBe('WRONG_CAN');
    expect(gradeForOutcome('WRONG_CAN')).toBe('B');

    // 5. Wrong + cannot_solve -> WRONG_CANNOT -> D
    expect(deriveOutcomeCode('wrong', 'cannot_solve')).toBe('WRONG_CANNOT');
    expect(gradeForOutcome('WRONG_CANNOT')).toBe('D');

    // 6. Left + can_solve -> LEFT_CAN -> B
    expect(deriveOutcomeCode('left', 'can_solve')).toBe('LEFT_CAN');
    expect(gradeForOutcome('LEFT_CAN')).toBe('B');

    // 7. Left + cannot_solve -> LEFT_CANNOT -> C
    expect(deriveOutcomeCode('left', 'cannot_solve')).toBe('LEFT_CANNOT');
    expect(gradeForOutcome('LEFT_CANNOT')).toBe('C');

    // 8. Unseen + can_solve -> UNSEEN_CAN -> B
    expect(deriveOutcomeCode('unseen', 'can_solve')).toBe('UNSEEN_CAN');
    expect(gradeForOutcome('UNSEEN_CAN')).toBe('B');

    // 9. Unseen + cannot_solve -> UNSEEN_CANNOT -> C
    expect(deriveOutcomeCode('unseen', 'cannot_solve')).toBe('UNSEEN_CANNOT');
    expect(gradeForOutcome('UNSEEN_CANNOT')).toBe('C');
  });

  it('calculates potential score using 3 * (A + B)', () => {
    expect(calculatePotentialScore({ A: 7, B: 4 })).toBe(33);
    expect(calculatePotentialScore({ A: 4, B: 9 })).toBe(39);
    expect(calculatePotentialScore({ A: 2, B: 3 })).toBe(15);
    expect(calculatePotentialScore({ A: 13, B: 16 })).toBe(87);
  });

  it('formats verbatim leakage sentence', () => {
    expect(formatLeakageSentence(54, 16)).toBe(
      'Leakage: +54 marks left on the table across 16 questions you could solve.'
    );
  });

  it('sampleMock.json matches Schema and reproduces BRD worked example (33, 39, 15, total 87)', () => {
    const filePath = path.resolve(__dirname, '../../public/content/sampleMock.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);

    const parseResult = MockEntrySchema.safeParse(json);
    expect(parseResult.success).toBe(true);

    const mockEntry = parseResult.data as MockEntry;
    expect(mockEntry.sections.length).toBe(3);

    const summary = analyzeMockEntry(mockEntry);

    // Section 1: VARC
    const varc = summary.sections.find((s) => s.section === 'VARC');
    expect(varc).toBeDefined();
    expect(varc?.counts.A).toBe(7);
    expect(varc?.counts.B).toBe(4);
    expect(varc?.counts.C).toBe(8);
    expect(varc?.counts.D).toBe(5);
    expect(varc?.potentialScore).toBe(33);
    expect(varc?.actualScore).toBe(15);
    expect(varc?.leakage).toBe(18);

    // Section 2: LRDI
    const lrdi = summary.sections.find((s) => s.section === 'LRDI');
    expect(lrdi).toBeDefined();
    expect(lrdi?.counts.A).toBe(4);
    expect(lrdi?.counts.B).toBe(9);
    expect(lrdi?.counts.C).toBe(9);
    expect(lrdi?.counts.D).toBe(0);
    expect(lrdi?.potentialScore).toBe(39);
    expect(lrdi?.actualScore).toBe(12);
    expect(lrdi?.leakage).toBe(27);

    // Section 3: QA
    const qa = summary.sections.find((s) => s.section === 'QA');
    expect(qa).toBeDefined();
    expect(qa?.counts.A).toBe(2);
    expect(qa?.counts.B).toBe(3);
    expect(qa?.counts.C).toBe(16);
    expect(qa?.counts.D).toBe(1);
    expect(qa?.potentialScore).toBe(15);
    expect(qa?.actualScore).toBe(6);
    expect(qa?.leakage).toBe(9);

    // Totals
    expect(summary.totalCounts.A).toBe(13);
    expect(summary.totalCounts.B).toBe(16);
    expect(summary.totalCounts.C).toBe(33);
    expect(summary.totalCounts.D).toBe(6);
    expect(summary.totalPotentialScore).toBe(87);
    expect(summary.totalActualScore).toBe(33);
    expect(summary.totalLeakage).toBe(54);
    expect(summary.leakageSentence).toBe(
      'Leakage: +54 marks left on the table across 16 questions you could solve.'
    );
  });
});
