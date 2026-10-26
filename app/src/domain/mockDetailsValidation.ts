/**
 * mockDetailsValidation.ts – Pure validation functions for Mock Details page.
 * Validates required provider, score boundaries, and section score summation.
 */

export interface MockDetailsForm {
  name: string;
  provider: string;
  providerOther?: string;
  dateTaken: string;
  mockType: 'full' | 'sectional' | null;
  overallScore?: number | null;
  varcScore?: number | null;
  lrdiScore?: number | null;
  qaScore?: number | null;
  composure?: number | null;
}

export interface SectionQuestionCounts {
  VARC: number;
  LRDI: number;
  QA: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  computedTotal?: number;
}

export const DEFAULT_SECTION_COUNTS: SectionQuestionCounts = {
  VARC: 24,
  LRDI: 22,
  QA: 22,
};

export const MOCK_PROVIDERS = [
  'IMS',
  'TIME',
  'Career Launcher',
  'Cracku',
  'iQuanta',
  'Other',
] as const;

export function validateMockDetails(
  form: MockDetailsForm,
  counts: SectionQuestionCounts = DEFAULT_SECTION_COUNTS,
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Mock Name (required, up to 40 characters)
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    errors.name = 'Mock name is required.';
  } else if (trimmedName.length > 40) {
    errors.name = 'Mock name must be 40 characters or fewer.';
  }

  // 2. Mock Provider (required)
  if (!form.provider || form.provider === 'Choose a provider') {
    errors.provider = 'Please choose a provider.';
  } else if (form.provider === 'Other') {
    const trimmedOther = (form.providerOther || '').trim();
    if (!trimmedOther) {
      errors.providerOther = 'Please enter the provider name.';
    } else if (trimmedOther.length > 40) {
      errors.providerOther = 'Provider name must be 40 characters or fewer.';
    }
  }

  // 3. Date Taken (required)
  if (!form.dateTaken || !form.dateTaken.trim()) {
    errors.dateTaken = 'Date taken is required.';
  }

  // 4. Mock Type (required)
  if (!form.mockType) {
    errors.mockType = 'Please select a mock type.';
  }

  // 5. Section Score Range Validation
  // Valid range: minimum is minus question count, maximum is 3 * question count
  const checkSectionScore = (val: number | null | undefined, count: number, field: string, sectionName: string) => {
    if (val !== null && val !== undefined) {
      const min = -count;
      const max = count * 3;
      if (!Number.isInteger(val)) {
        errors[field] = `${sectionName} score must be an integer.`;
      } else if (val < min || val > max) {
        errors[field] = `${sectionName} score must be between ${min} and ${max}.`;
      }
    }
  };

  checkSectionScore(form.varcScore, counts.VARC, 'varcScore', 'VARC');
  checkSectionScore(form.lrdiScore, counts.LRDI, 'lrdiScore', 'LRDI');
  checkSectionScore(form.qaScore, counts.QA, 'qaScore', 'QA');

  // 6. Section Sum & Overall Score Check
  const hasVarc = form.varcScore !== null && form.varcScore !== undefined;
  const hasLrdi = form.lrdiScore !== null && form.lrdiScore !== undefined;
  const hasQa = form.qaScore !== null && form.qaScore !== undefined;
  const hasAllSectionScores = hasVarc && hasLrdi && hasQa;

  let computedTotal: number | undefined;
  if (hasVarc || hasLrdi || hasQa) {
    computedTotal = (form.varcScore || 0) + (form.lrdiScore || 0) + (form.qaScore || 0);
  }

  if (hasAllSectionScores && computedTotal !== undefined) {
    if (form.overallScore !== null && form.overallScore !== undefined) {
      if (form.overallScore !== computedTotal) {
        errors.overallScore = `Your section scores add up to ${computedTotal}. Please check the total.`;
      }
    }
  }

  // Check overall score range if provided independently
  if (form.overallScore !== null && form.overallScore !== undefined) {
    const totalQuestions = counts.VARC + counts.LRDI + counts.QA;
    const minTotal = -totalQuestions;
    const maxTotal = totalQuestions * 3;
    if (!Number.isInteger(form.overallScore)) {
      errors.overallScore = 'Overall score must be an integer.';
    } else if (form.overallScore < minTotal || form.overallScore > maxTotal) {
      errors.overallScore = `Overall score must be between ${minTotal} and ${maxTotal}.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    computedTotal,
  };
}
