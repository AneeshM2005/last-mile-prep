/**
 * OnboardingPage.tsx – 4-step onboarding flow.
 * design.md 8.1, PRD M1.2.
 * Route: /onboarding
 * Step 1: Consent (2 required checkboxes, logs consent_given)
 * Step 2: Display name (1-30 chars, local only)
 * Step 3: Target schools (1 to 3 choices from config)
 * Step 4: Daily time (15, 30, 45, 60, 90 min) -> sets profile, logs onboarding_complete, routes to /
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { StepDots } from '../../ui/ProgressBar';
import { Banner } from '../../ui/Banner';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import { getConfig } from '../../data/configLoader';

type DailyMinutes = 15 | 30 | 45 | 60 | 90;

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { storageAvailable } = useAppContext();
  const { data, createProfile, updateProfile, setOnboardingStep } = useStore();
  const profile = data.profile;

  // Current step calculation (1, 2, 3, 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(() => {
    if (typeof profile?.onboardingStep === 'number') {
      return profile.onboardingStep;
    }
    return 1;
  });

  // Step 1 state
  const [agreedNotice, setAgreedNotice] = useState(false);
  const [isAdult, setIsAdult] = useState(false);

  // Step 2 state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [nameError, setNameError] = useState('');

  // Step 3 state
  const [selectedSchools, setSelectedSchools] = useState<string[]>(profile?.targetSchoolIds || []);
  const [schoolError, setSchoolError] = useState('');

  // Step 4 state
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes | null>(profile?.dailyMinutes || null);

  // Focus management on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const heading = document.getElementById('step-heading');
    heading?.focus();
  }, [currentStep]);

  // If already complete, redirect to /
  if (profile?.onboardingStep === 'done') {
    return <Navigate to="/" replace />;
  }

  // Loaded schools
  const config = getConfig();
  const loadedSchools = config?.schools?.schools || [];
  const schoolOptions = loadedSchools.length > 0
    ? loadedSchools.map((s: { id: string; name: string }) => ({ id: s.id, label: s.name }))
    : [
        { id: 'iima', label: 'IIM Ahmedabad' },
        { id: 'iimb', label: 'IIM Bangalore' },
        { id: 'iimc', label: 'IIM Calcutta' },
        { id: 'iiml', label: 'IIM Lucknow' },
        { id: 'fms', label: 'FMS Delhi' },
        { id: 'xlri', label: 'XLRI Jamshedpur' },
      ];


  // Handlers
  const handleStep1Submit = () => {
    if (!agreedNotice || !isAdult) return;
    logEvent('consent_given', 'onboarding');

    const now = new Date().toISOString();
    const profileId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-0000-0000-000000000001';

    if (!profile) {
      createProfile({
        id: profileId,
        displayName: 'Aspirant',
        targetSchoolIds: ['iima'],
        dailyMinutes: 30,
        consentAt: now,
        age18Declared: true,
        createdAt: now,
        onboardingStep: 2,
      });
    } else {
      setOnboardingStep(2);
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('Please enter a display name or nickname.');
      return;
    }
    if (trimmed.length > 30) {
      setNameError('Display name must be 30 characters or fewer.');
      return;
    }
    setNameError('');
    updateProfile({ displayName: trimmed, onboardingStep: 3 });
    setCurrentStep(3);
  };

  const handleSchoolToggle = (id: string) => {
    setSchoolError('');
    setSelectedSchools((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 3) {
        setSchoolError('You can choose up to 3.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleStep3Submit = () => {
    if (selectedSchools.length === 0) {
      setSchoolError('Please choose at least 1 target school.');
      return;
    }
    setSchoolError('');
    updateProfile({ targetSchoolIds: selectedSchools, onboardingStep: 4 });
    setCurrentStep(4);
  };

  const handleStep4Submit = () => {
    if (!dailyMinutes) return;
    updateProfile({
      dailyMinutes,
      onboardingStep: 'done',
    });
    logEvent('onboarding_complete', 'onboarding');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--lm-bg)] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12">
      {/* Container */}
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        {/* Storage notice banner if unavailable */}
        {!storageAvailable && (
          <Banner
            id="onboarding-storage"
            type="storage"
            message="Progress cannot be saved in this browser mode."
          />
        )}

        {/* Step dots & step header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--lm-border)]">
          <StepDots currentStep={currentStep} totalSteps={4} />
          <span className="text-caption font-semibold text-[var(--lm-text-muted)]">
            Last Mile CAT
          </span>
        </div>

        {/* Paper card for the current step */}
        <div className="bg-[var(--lm-surface)] border border-[var(--lm-border)] rounded-[var(--lm-radius-xl)] p-6 sm:p-8 lg:p-10 shadow-sm animate-fade-in">
          {/* STEP 1: Consent */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <h1 id="step-heading" tabIndex={-1} className="text-h1 text-[var(--lm-ink)] outline-none m-0">
                Before we start
              </h1>

              <div className="bg-[var(--lm-inset)] p-5 rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] text-body text-[var(--lm-ink)] leading-relaxed flex flex-col gap-3">
                <p className="m-0">
                  Everything you do stays on this device and nothing is sent automatically.
                </p>
                <p className="m-0">
                  If you choose to share feedback, you will see exactly what will be shared first, and it will not include your name. Please do not type personal details in feedback boxes.
                </p>
                <p className="m-0">
                  You can delete everything on this device at any time with <strong>Reset my data</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedNotice}
                    onChange={(e) => setAgreedNotice(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-[1.5px] border-[var(--lm-border-strong)] accent-[var(--lm-ink)] cursor-pointer"
                  />
                  <span className="text-body font-medium text-[var(--lm-ink)]">
                    I understand and agree to this notice.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-[1.5px] border-[var(--lm-border-strong)] accent-[var(--lm-ink)] cursor-pointer"
                  />
                  <span className="text-body font-medium text-[var(--lm-ink)]">
                    I am 18 or older.
                  </span>
                </label>
              </div>

              {!agreedNotice || !isAdult ? (
                <p className="text-small text-[var(--lm-text-muted)] m-0">
                  Tick both boxes to continue.
                </p>
              ) : null}

              <div className="pt-2">
                <Button
                  variant="primary-arrow"
                  disabled={!agreedNotice || !isAdult}
                  onClick={handleStep1Submit}
                  className="w-full sm:w-auto"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Display name */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <h1 id="step-heading" tabIndex={-1} className="text-h1 text-[var(--lm-ink)] outline-none m-0">
                What should we call you?
              </h1>

              <Field
                label="Display name"
                helper="Any name or nickname. It stays on this device."
                value={displayName}
                error={nameError}
                maxLength={30}
                showCharCount
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="e.g. Maya"
                autoFocus
              />

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button variant="primary-arrow" onClick={handleStep2Submit}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Target schools */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 id="step-heading" tabIndex={-1} className="text-h1 text-[var(--lm-ink)] outline-none m-0 mb-1">
                  Which schools are you aiming for?
                </h1>
                <p className="text-small text-[var(--lm-text-muted)] m-0">
                  {selectedSchools.length} of 3 chosen
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {schoolOptions.map((school: { id: string; label: string }) => {
                  const isSelected = selectedSchools.includes(school.id);
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => handleSchoolToggle(school.id)}
                      className={[
                        'px-4 py-2.5 rounded-[var(--lm-radius-pill)] text-body-strong transition-all cursor-pointer border-[1.5px]',
                        'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                        isSelected
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)] font-bold'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {school.label}
                    </button>
                  );
                })}
              </div>

              {schoolError && (
                <p role="alert" className="text-small text-[var(--lm-notice-text)] m-0">
                  {schoolError}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary-arrow"
                  disabled={selectedSchools.length === 0}
                  onClick={handleStep3Submit}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Daily time */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 id="step-heading" tabIndex={-1} className="text-h1 text-[var(--lm-ink)] outline-none m-0 mb-1">
                  How much practice time can you protect each day?
                </h1>
                <p className="text-small text-[var(--lm-text-muted)] m-0">
                  This sets your daily task length. You can change it anytime.
                </p>
              </div>

              <div
                role="radiogroup"
                aria-label="Daily practice duration"
                className="flex flex-wrap gap-3"
              >
                {([15, 30, 45, 60, 90] as DailyMinutes[]).map((mins) => {
                  const isSelected = dailyMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDailyMinutes(mins)}
                      className={[
                        'px-5 py-3 rounded-[var(--lm-radius-pill)] text-body-strong transition-all cursor-pointer border-[1.5px]',
                        'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                        isSelected
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)] font-bold'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {mins} min
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button
                  variant="primary-arrow"
                  disabled={!dailyMinutes}
                  onClick={handleStep4Submit}
                >
                  Go to Today
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
