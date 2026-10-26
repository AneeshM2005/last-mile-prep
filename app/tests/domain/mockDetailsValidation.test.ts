import { describe, it, expect } from 'vitest';
import {
  validateMockDetails,
  type MockDetailsForm,
} from '../../src/domain/mockDetailsValidation';

describe('mockDetailsValidation domain logic', () => {
  const baseValidForm: MockDetailsForm = {
    name: 'CL Countdown Mock 3',
    provider: 'Career Launcher',
    dateTaken: '2026-10-25',
    mockType: 'full',
    overallScore: 60,
    varcScore: 25,
    lrdiScore: 15,
    qaScore: 20,
    composure: 4,
  };

  it('passes validation when all required fields and matching scores are given', () => {
    const res = validateMockDetails(baseValidForm);
    expect(res.isValid).toBe(true);
    expect(res.errors).toEqual({});
    expect(res.computedTotal).toBe(60);
  });

  it('fails if provider is missing or left on placeholder', () => {
    const resEmpty = validateMockDetails({ ...baseValidForm, provider: '' });
    expect(resEmpty.isValid).toBe(false);
    expect(resEmpty.errors.provider).toBe('Please choose a provider.');

    const resPlaceholder = validateMockDetails({ ...baseValidForm, provider: 'Choose a provider' });
    expect(resPlaceholder.isValid).toBe(false);
    expect(resPlaceholder.errors.provider).toBe('Please choose a provider.');
  });

  it('requires providerOther if provider is Other', () => {
    const resOtherEmpty = validateMockDetails({ ...baseValidForm, provider: 'Other', providerOther: '' });
    expect(resOtherEmpty.isValid).toBe(false);
    expect(resOtherEmpty.errors.providerOther).toBe('Please enter the provider name.');

    const resOtherFilled = validateMockDetails({ ...baseValidForm, provider: 'Other', providerOther: 'Rodha CAT Mock' });
    expect(resOtherFilled.isValid).toBe(true);
  });

  it('enforces score boundaries on section scores (min -questions, max 3*questions)', () => {
    // VARC: 24 questions -> valid range -24 to 72
    const resTooLow = validateMockDetails({ ...baseValidForm, varcScore: -25 });
    expect(resTooLow.isValid).toBe(false);
    expect(resTooLow.errors.varcScore).toBe('VARC score must be between -24 and 72.');

    const resTooHigh = validateMockDetails({ ...baseValidForm, varcScore: 73 });
    expect(resTooHigh.isValid).toBe(false);
    expect(resTooHigh.errors.varcScore).toBe('VARC score must be between -24 and 72.');

    const resValidMin = validateMockDetails({ ...baseValidForm, varcScore: -24, lrdiScore: 0, qaScore: 0, overallScore: -24 });
    expect(resValidMin.isValid).toBe(true);
  });

  it('checks that overall score equals sum of section scores when all are provided', () => {
    // VARC 25 + LRDI 15 + QA 20 = 60, but overallScore = 65
    const resMismatch = validateMockDetails({ ...baseValidForm, overallScore: 65 });
    expect(resMismatch.isValid).toBe(false);
    expect(resMismatch.errors.overallScore).toBe(
      'Your section scores add up to 60. Please check the total.'
    );
  });

  it('computes total as read-only when only section scores are provided', () => {
    const resNoOverall = validateMockDetails({
      ...baseValidForm,
      overallScore: null,
      varcScore: 30,
      lrdiScore: 18,
      qaScore: 22,
    });
    expect(resNoOverall.isValid).toBe(true);
    expect(resNoOverall.computedTotal).toBe(70);
  });
});
