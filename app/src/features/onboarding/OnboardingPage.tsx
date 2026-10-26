/**
 * OnboardingPage.tsx – 5-step data-driven onboarding flow.
 *
 * Steps:
 * 1. Consent (2 required checkboxes, logs consent_given)
 * 2. Account (Create account or Log in; local validation; credentials never stored)
 * 3. Display name (1-30 chars, local device only)
 * 4. Target schools (1 to 3 choices from config in responsive grid)
 * 5. Daily time (15, 30, 45, 60, 90 min) -> sets profile, logs onboarding_complete, routes to /
 *
 * Layout:
 * - Fits within 100dvh without scrolling the page
 * - Fixed SageWavesBackdrop background
 * - Pinned header, scrollable body (safety net only), pinned footer
 * - Enter key advances when step is valid
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { StepDots } from '../../ui/ProgressBar';
import { Banner } from '../../ui/Banner';
import { SageWavesBackdrop } from '../../ui/animations/SageWavesBackdrop';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getAllColleges } from '../../domain/colleges';

type DailyMinutes = 15 | 30 | 45 | 60 | 90;
export type StepId = 'consent' | 'account' | 'name' | 'schools' | 'time';

export interface StepConfig {
  order: number;
  id: StepId;
  title: string;
  subTitle?: string;
  maxWidth: string;
}

export const ONBOARDING_STEPS: StepConfig[] = [
  { order: 1, id: 'consent', title: 'Before we start', maxWidth: '720px' },
  { order: 2, id: 'account', title: 'Create your account', subTitle: 'It takes a few seconds.', maxWidth: '640px' },
  { order: 3, id: 'name', title: 'What should we call you?', maxWidth: '640px' },
  { order: 4, id: 'schools', title: 'Which schools are you aiming for?', maxWidth: '640px' },
  {
    order: 5,
    id: 'time',
    title: 'How much practice time can you protect each day?',
    subTitle: 'This sets your daily task length. You can change it anytime.',
    maxWidth: '640px',
  },
];

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { storageAvailable } = useAppContext();
  const { data, createProfile, updateProfile, setOnboardingStep } = useStore();
  const profile = data.profile;

  // Resolve initial step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const rawStep = profile?.onboardingStep;
    if (typeof rawStep === 'number' && rawStep >= 1 && rawStep <= 5) {
      return rawStep;
    }
    if (rawStep === 'consent') return 1;
    if (rawStep === 'account') return 2;
    if (rawStep === 'name') return 3;
    if (rawStep === 'schools') return 4;
    if (rawStep === 'time') return 5;
    return 1;
  });

  // Step 1: Consent state
  const [agreedNotice, setAgreedNotice] = useState(false);
  const [isAdult, setIsAdult] = useState(false);

  // Step 2: Account state (ephemeral, NEVER persisted)
  const [accountView, setAccountView] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Step 3: Display name state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [nameError, setNameError] = useState('');

  // Step 4: Target schools state (nothing is pre-selected)
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [schoolError, setSchoolError] = useState('');

  // Step 5: Daily time state
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes | null>(profile?.dailyMinutes || null);

  // Step transition animation state
  const [stepVisible, setStepVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Focus management on step change
  useEffect(() => {
    setStepVisible(true);
    const heading = document.getElementById('step-heading');
    heading?.focus();
  }, [currentStep]);

  // Loaded schools from dream-college configuration (Part B)
  const schoolOptions = useMemo(() => {
    return getAllColleges().map((c) => ({ id: c.id, label: c.name }));
  }, []);

  // Current step config
  const currentStepConfig = ONBOARDING_STEPS[currentStep - 1] || ONBOARDING_STEPS[0];

  // ── Step Navigation Handlers ─────────────────────────────────────
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // If already complete, redirect to /
  if (profile?.onboardingStep === 'done') {
    return <Navigate to="/" replace />;
  }

  // Step 1: Consent submit
  const handleStep1Submit = () => {
    if (!agreedNotice || !isAdult) return;
    logEvent('consent_given', 'onboarding');

    const now = new Date().toISOString();
    const profileId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
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
    goToStep(2);
  };

  // Step 2: Account validation & submit
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid =
    accountView === 'register' ? password.length >= 8 : password.length >= 1;
  const isAccountValid = emailValid && passwordValid;

  const handleAccountSubmit = () => {
    setSubmitAttempted(true);
    if (!isAccountValid) return;
    // Privacy: credentials remain in local state and are cleared on unmount.
    setOnboardingStep(3);
    goToStep(3);
  };

  // Step 3: Display name submit
  const handleStep3Submit = () => {
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
    updateProfile({ displayName: trimmed, onboardingStep: 4 });
    goToStep(4);
  };

  // Step 4: Schools toggle & submit
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

  const handleStep4Submit = () => {
    if (selectedSchools.length === 0) {
      setSchoolError('Please choose at least 1 target school.');
      return;
    }
    setSchoolError('');
    updateProfile({ targetSchoolIds: selectedSchools, onboardingStep: 5 });
    goToStep(5);
  };

  // Step 5: Daily time submit
  const handleStep5Submit = () => {
    if (!dailyMinutes) return;
    updateProfile({
      dailyMinutes,
      onboardingStep: 'done',
    });
    logEvent('onboarding_complete', 'onboarding');
    navigate('/', { replace: true });
  };

  // Back handler
  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setOnboardingStep(prevStep as 1 | 2 | 3 | 4 | 5);
      goToStep(prevStep);
    }
  };

  // Global Enter key handler for the active step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentStep === 1 && agreedNotice && isAdult) {
        e.preventDefault();
        handleStep1Submit();
      } else if (currentStep === 2 && isAccountValid) {
        e.preventDefault();
        handleAccountSubmit();
      } else if (currentStep === 3 && displayName.trim().length >= 1 && displayName.trim().length <= 30) {
        e.preventDefault();
        handleStep3Submit();
      } else if (currentStep === 4 && selectedSchools.length >= 1 && selectedSchools.length <= 3) {
        e.preventDefault();
        handleStep4Submit();
      } else if (currentStep === 5 && dailyMinutes) {
        e.preventDefault();
        handleStep5Submit();
      }
    }
  };

  // Titles and subtitles
  const stepTitle =
    currentStep === 2
      ? accountView === 'register'
        ? 'Create your account'
        : 'Welcome back'
      : currentStepConfig.title;

  const stepSubtitle =
    currentStep === 4
      ? `${selectedSchools.length} of 3 chosen`
      : currentStepConfig.subTitle;

  return (
    <div
      onKeyDown={handleKeyDown}
      className="relative min-h-[100dvh] h-[100dvh] max-h-[100dvh] w-full bg-[var(--lm-bg)] text-[var(--lm-ink)] overflow-x-clip overflow-y-hidden flex flex-col justify-between font-sans selection:bg-[var(--lm-sage-100)]"
    >
      {/* Skip to main content link for keyboard users */}
      <a
        href="#step-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--lm-ink)] text-white rounded-[var(--lm-radius-pill)] shadow-md text-sm font-semibold"
      >
        Skip to main content
      </a>

      {/* Living SageWavesBackdrop background (pointer-events none, calm mode for onboarding) */}
      <SageWavesBackdrop mouseInteraction={false} swellOnClick={false} />

      {/* Slim Top Bar: Step indicator + Brand mark */}
      <header className="relative z-10 w-full bg-[var(--lm-bg)]/90 backdrop-blur-sm border-b border-[var(--lm-border)] px-4 sm:px-8 py-3 flex items-center justify-between flex-none">
        <div className="flex items-center gap-3">
          <StepDots currentStep={currentStep} totalSteps={ONBOARDING_STEPS.length} />
        </div>
        <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[var(--lm-ink)]">
          Last Mile CAT
        </span>
      </header>

      {/* Storage notice banner if unavailable */}
      {!storageAvailable && (
        <div className="relative z-10 px-4 pt-2">
          <Banner
            id="onboarding-storage"
            type="storage"
            message="Progress cannot be saved in this browser mode."
          />
        </div>
      )}

      {/* Main Card Area: Centered, fits within remaining viewport height */}
      <main
        id="onboarding-main"
        className="relative z-10 flex-1 w-full flex items-center justify-center p-3 sm:p-6 overflow-hidden min-h-0"
      >
        <div
          ref={cardRef}
          role="region"
          aria-labelledby="step-heading"
          className="bg-[var(--lm-surface)] border border-[var(--lm-border)] rounded-[var(--lm-radius-xl)] shadow-[var(--lm-shadow-card)] flex flex-col w-full transition-opacity duration-150"
          style={{
            maxWidth: currentStepConfig.maxWidth,
            maxHeight: '100%',
            padding: 'clamp(16px, 2.8dvh, 28px) clamp(16px, 3.5vw, 32px)',
            gap: 'clamp(10px, 1.8dvh, 18px)',
            opacity: stepVisible ? 1 : 0,
          }}
        >
          {/* 1. CARD HEADER */}
          <div className="flex-none">
            <h1
              id="step-heading"
              tabIndex={-1}
              className="font-serif font-bold text-[var(--lm-ink)] leading-snug m-0 outline-none"
              style={{ fontSize: 'clamp(1.5rem, 1rem + 1.6vw, 2rem)' }}
            >
              {stepTitle}
            </h1>
            {stepSubtitle && (
              <p className="text-small text-[var(--lm-text-muted)] m-0 mt-1">
                {stepSubtitle}
              </p>
            )}
          </div>

          {/* 2. CARD BODY: Natural height, scrolls only as safety net on very short windows */}
          <div
            className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col"
            style={{ gap: 'clamp(10px, 1.8dvh, 18px)' }}
          >
            {/* STEP 1: Consent */}
            {currentStep === 1 && (
              <>
                <div className="bg-[var(--lm-inset)] p-4 sm:p-5 rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] text-body text-[var(--lm-ink)] leading-relaxed flex flex-col gap-2.5">
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

                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={agreedNotice}
                      onChange={(e) => setAgreedNotice(e.target.checked)}
                      className="w-5 h-5 rounded border-[1.5px] border-[var(--lm-border-strong)] accent-[var(--lm-ink)] cursor-pointer"
                    />
                    <span className="text-body font-medium text-[var(--lm-ink)]">
                      I understand and agree to this notice.
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={isAdult}
                      onChange={(e) => setIsAdult(e.target.checked)}
                      className="w-5 h-5 rounded border-[1.5px] border-[var(--lm-border-strong)] accent-[var(--lm-ink)] cursor-pointer"
                    />
                    <span className="text-body font-medium text-[var(--lm-ink)]">
                      I am 18 or older.
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* STEP 2: Account (New) */}
            {currentStep === 2 && (
              <>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="account-email"
                      className="text-small font-semibold text-[var(--lm-ink)]"
                    >
                      Email
                    </label>
                    <input
                      id="account-email"
                      type="email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailTouched) setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="you@example.com"
                      aria-invalid={(emailTouched || submitAttempted) && !emailValid}
                      aria-describedby={
                        (emailTouched || submitAttempted) && !emailValid
                          ? 'email-error'
                          : undefined
                      }
                      className="w-full h-[52px] px-3.5 text-base rounded-[var(--lm-radius-md)] border border-[var(--lm-border-strong)] bg-[var(--lm-surface)] text-[var(--lm-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lm-focus)]"
                    />
                    {(emailTouched || submitAttempted) && !emailValid && (
                      <div
                        id="email-error"
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-[var(--lm-ink)] mt-0.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-none" />
                        <span>Please enter a valid email address.</span>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="account-password"
                      className="text-small font-semibold text-[var(--lm-ink)]"
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="account-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordTouched) setPasswordTouched(true);
                        }}
                        onBlur={() => setPasswordTouched(true)}
                        aria-invalid={(passwordTouched || submitAttempted) && !passwordValid}
                        aria-describedby="password-helper"
                        className="w-full h-[52px] pl-3.5 pr-20 text-base rounded-[var(--lm-radius-md)] border border-[var(--lm-border-strong)] bg-[var(--lm-surface)] text-[var(--lm-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lm-focus)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-1 top-1 bottom-1 px-3 min-h-[44px] min-w-[44px] flex items-center gap-1 text-xs font-semibold text-[var(--lm-sage-700)] hover:text-[var(--lm-ink)] cursor-pointer select-none"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Helper or error */}
                    {(passwordTouched || submitAttempted) && !passwordValid ? (
                      <div
                        id="password-helper"
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-[var(--lm-ink)] mt-0.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-none" />
                        <span>
                          {accountView === 'register'
                            ? 'Password must be at least 8 characters.'
                            : 'Please enter your password.'}
                        </span>
                      </div>
                    ) : (
                      <span id="password-helper" className="text-xs text-[var(--lm-text-muted)]">
                        {accountView === 'register' ? 'At least 8 characters' : ''}
                      </span>
                    )}
                  </div>

                  {/* Switch between Register and Login */}
                  <div className="pt-1">
                    {accountView === 'register' ? (
                      <p className="text-xs text-[var(--lm-text-muted)] m-0">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAccountView('login');
                            setSubmitAttempted(false);
                          }}
                          className="font-bold text-[var(--lm-ink)] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                        >
                          Log in
                        </button>
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--lm-text-muted)] m-0">
                        New here?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAccountView('register');
                            setSubmitAttempted(false);
                          }}
                          className="font-bold text-[var(--lm-ink)] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                        >
                          Create an account
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Display name */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-4">
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
              </div>
            )}

            {/* STEP 4: Target schools */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {schoolOptions.map((school: { id: string; label: string }) => {
                    const isSelected = selectedSchools.includes(school.id);
                    return (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => handleSchoolToggle(school.id)}
                        className={[
                          'min-h-[44px] px-3.5 py-2.5 rounded-[var(--lm-radius-pill)] text-sm sm:text-base font-semibold transition-all cursor-pointer border-[1.5px] truncate text-center',
                          'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                          isSelected
                            ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)] font-bold shadow-xs'
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
              </div>
            )}

            {/* STEP 5: Daily time */}
            {currentStep === 5 && (
              <div
                role="radiogroup"
                aria-label="Daily practice duration"
                className="flex flex-wrap gap-2.5 sm:gap-3"
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
                        'min-h-[44px] px-5 py-2.5 rounded-[var(--lm-radius-pill)] text-sm sm:text-base font-semibold transition-all cursor-pointer border-[1.5px]',
                        'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                        isSelected
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)] font-bold shadow-xs'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {mins} min
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. CARD FOOTER: Always visible and pinned to bottom of the card */}
          <div className="flex-none pt-2 sm:pt-3 border-t border-[var(--lm-border)]/60 flex items-center justify-between gap-3">
            {/* Helper line on the left side of the same row */}
            <div className="flex-1 min-w-0 pr-2">
              {currentStep === 1 && (!agreedNotice || !isAdult) && (
                <p className="text-xs sm:text-small text-[var(--lm-text-muted)] m-0 truncate">
                  Tick both boxes to continue.
                </p>
              )}
              {currentStep === 2 && (
                <p className="text-xs sm:text-small text-[var(--lm-text-muted)] m-0 truncate">
                  Your details stay on this device.
                </p>
              )}
              {currentStep === 3 && (
                <p className="text-xs sm:text-small text-[var(--lm-text-muted)] m-0 truncate">
                  {displayName.trim().length === 0 ? 'Enter a name between 1 and 30 characters.' : ''}
                </p>
              )}
              {currentStep === 4 && selectedSchools.length === 0 && (
                <p className="text-xs sm:text-small text-[var(--lm-text-muted)] m-0 truncate">
                  Choose 1 to 3 schools.
                </p>
              )}
              {currentStep === 5 && !dailyMinutes && (
                <p className="text-xs sm:text-small text-[var(--lm-text-muted)] m-0 truncate">
                  Please choose a daily time.
                </p>
              )}
            </div>

            {/* Back and Primary Actions on the right side */}
            <div className="flex items-center gap-2.5 flex-none">
              {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} className="min-h-[44px]">
                  Back
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  variant="primary-arrow"
                  disabled={!agreedNotice || !isAdult}
                  onClick={handleStep1Submit}
                  className="min-h-[44px]"
                >
                  Continue
                </Button>
              )}

              {currentStep === 2 && (
                <SpecularButton
                  disabled={!isAccountValid}
                  onClick={handleAccountSubmit}
                  radius={9999}
                  className="min-h-[44px] px-6 text-sm font-semibold"
                >
                  {accountView === 'register' ? 'Create account' : 'Log in'}
                </SpecularButton>
              )}

              {currentStep === 3 && (
                <Button
                  variant="primary-arrow"
                  disabled={displayName.trim().length === 0 || displayName.trim().length > 30}
                  onClick={handleStep3Submit}
                  className="min-h-[44px]"
                >
                  Continue
                </Button>
              )}

              {currentStep === 4 && (
                <Button
                  variant="primary-arrow"
                  disabled={selectedSchools.length === 0}
                  onClick={handleStep4Submit}
                  className="min-h-[44px]"
                >
                  Continue
                </Button>
              )}

              {currentStep === 5 && (
                <Button
                  variant="primary-arrow"
                  disabled={!dailyMinutes}
                  onClick={handleStep5Submit}
                  className="min-h-[44px]"
                >
                  Go to Today
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;
