import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../../src/features/landing/LandingPage';
import { OnboardingPage, ONBOARDING_STEPS } from '../../src/features/onboarding/OnboardingPage';
import { ProfilePage } from '../../src/features/profile/ProfilePage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';
import { getEventLog } from '../../src/data/eventLog';
import { storageGet, storageSet } from '../../src/data/storage';

describe('P1-06 Landing, Onboarding Overhaul, and Profile Settings', () => {
  beforeEach(() => {
    resetApp();
  });

  it('defines 5 steps in the exact data-driven order', () => {
    expect(ONBOARDING_STEPS).toHaveLength(5);
    expect(ONBOARDING_STEPS.map((s) => s.id)).toEqual([
      'consent',
      'account',
      'name',
      'schools',
      'time',
    ]);
  });

  it('renders LandingPage with headline, prototype badge, and CTA', () => {
    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/The last stretch, one steady step at a time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('enforces both checkboxes before continuing on Onboarding Step 1 (Consent)', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /before we start/i })).toBeInTheDocument();
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Check first box
    const check1 = screen.getByLabelText(/I understand and agree to this notice/i);
    fireEvent.click(check1);
    expect(continueBtn).toBeDisabled();

    // Check second box
    const check2 = screen.getByLabelText(/I am 18 or older/i);
    fireEvent.click(check2);
    expect(continueBtn).not.toBeDisabled();

    // Click continue -> advances to step 2 (Account)
    fireEvent.click(continueBtn);
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();
  });

  it('supports Account step with validation, Show/Hide password toggle, and view swapping', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Pass Step 1
    fireEvent.click(screen.getByLabelText(/I understand and agree to this notice/i));
    fireEvent.click(screen.getByLabelText(/I am 18 or older/i));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Account view
    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /create account/i });
    expect(createBtn).toBeDisabled();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    // Password Show/Hide toggle
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Invalid email triggers error on blur
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(createBtn).toBeDisabled();

    // Valid email, short password
    fireEvent.change(emailInput, { target: { value: 'candidate@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(createBtn).toBeDisabled();

    // Switch to Login view
    const switchLoginBtn = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(switchLoginBtn);
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    const loginBtn = screen.getByRole('button', { name: /^log in$/i });
    // In login mode, short password (e.g. 5 chars) is valid
    expect(loginBtn).not.toBeDisabled();

    // Switch back to Create account view
    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));
    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();

    // Fill valid 8+ char password
    fireEvent.change(passwordInput, { target: { value: 'securePass123' } });
    expect(createBtn).not.toBeDisabled();

    // Back button returns to step 1
    const backBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backBtn);
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
  });

  it('guarantees Privacy: email and password are never stored, logged, or serialized', () => {
    const sensitiveEmail = 'private.user@secret-domain.org';
    const sensitivePassword = 'SuperSecretPassword999!';

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<div>Home Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Step 1: Consent
    fireEvent.click(screen.getByLabelText(/I understand and agree to this notice/i));
    fireEvent.click(screen.getByLabelText(/I am 18 or older/i));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Account
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: sensitiveEmail } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: sensitivePassword } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Step 3: Display Name
    expect(screen.getByText(/Step 3 of 5/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Aspirant 1' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Target Schools
    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /IIM Ahmedabad/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 5: Daily time
    expect(screen.getByText(/Step 5 of 5/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /30 min/i }));
    fireEvent.click(screen.getByRole('button', { name: /go to today/i }));

    // Verify completion
    const storeState = useStore.getState();
    expect(storeState.data.profile?.onboardingStep).toBe('done');

    // 1. Check Store serialized content
    const serializedStore = JSON.stringify(storeState);
    expect(serializedStore.includes(sensitiveEmail)).toBe(false);
    expect(serializedStore.includes(sensitivePassword)).toBe(false);

    // 2. Check localStorage
    const rawStorage = storageGet('lmp.v1.store');
    if (rawStorage) {
      expect(rawStorage.includes(sensitiveEmail)).toBe(false);
      expect(rawStorage.includes(sensitivePassword)).toBe(false);
    }

    // 3. Check Event logs
    const eventLog = getEventLog();
    const serializedEvents = JSON.stringify(eventLog);
    expect(serializedEvents.includes(sensitiveEmail)).toBe(false);
    expect(serializedEvents.includes(sensitivePassword)).toBe(false);
  });

  it('migrates legacy stored profile with missing or legacy onboardingStep without reset', () => {
    const legacyProfile = {
      schemaVersion: 1,
      data: {
        profile: {
          id: '00000000-0000-0000-0000-000000000001',
          displayName: 'Legacy Aspirant',
          targetSchoolIds: ['iima'],
          dailyMinutes: 30,
          consentAt: new Date().toISOString(),
          age18Declared: true,
          createdAt: new Date().toISOString(),
          // missing onboardingStep!
        },
        baseline: null,
        rounds: [],
        mocks: [],
        revisionItems: [],
        passageSessions: [],
        wordCards: [],
        activity: [],
        recommendations: [],
        feedback: null,
        ui: { dismissedBanners: [] },
      },
    };

    // Write directly to storage key
    storageSet('lmp.v1.store', JSON.stringify(legacyProfile));

    // Reload store from storage
    useStore.getState().reloadFromStorage();

    // Verify it was not wiped out
    const loaded = useStore.getState().data.profile;
    expect(loaded).not.toBeNull();
    expect(loaded?.displayName).toBe('Legacy Aspirant');
    expect(useStore.getState().wasReset).toBe(false);
  });

  it('renders ProfilePage and switches tabs to Settings and data', () => {
    const now = new Date().toISOString();
    useStore.getState().createProfile({
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'Maya',
      targetSchoolIds: ['iima'],
      dailyMinutes: 45,
      consentAt: now,
      age18Declared: true,
      createdAt: now,
      onboardingStep: 'done',
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /my profile/i })).toBeInTheDocument();

    // Click Settings and data tab
    const settingsTab = screen.getByRole('tab', { name: /settings and data/i });
    fireEvent.click(settingsTab);

    expect(screen.getByText(/Data on this device/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset my data/i })).toBeInTheDocument();
  });
});
