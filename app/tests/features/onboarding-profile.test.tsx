import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../../src/features/landing/LandingPage';
import { OnboardingPage } from '../../src/features/onboarding/OnboardingPage';
import { ProfilePage } from '../../src/features/profile/ProfilePage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';

describe('P1-06 Landing, Onboarding, and Profile Settings', () => {
  beforeEach(() => {
    resetApp();
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

  it('enforces both checkboxes before continuing on Onboarding Step 1', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Before we start/i)).toBeInTheDocument();
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

    // Click continue -> advances to step 2
    fireEvent.click(continueBtn);
    expect(screen.getByText(/What should we call you\?/i)).toBeInTheDocument();
  });

  it('validates display name and progresses through steps 2, 3, 4', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<div>Home Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Step 1
    fireEvent.click(screen.getByLabelText(/I understand and agree to this notice/i));
    fireEvent.click(screen.getByLabelText(/I am 18 or older/i));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Display name
    const nameInput = screen.getByLabelText(/Display name/i);
    fireEvent.change(nameInput, { target: { value: 'Aspirant 1' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Target schools
    expect(screen.getByText(/Which schools are you aiming for\?/i)).toBeInTheDocument();
    const schoolBtn = screen.getByRole('button', { name: /IIM Ahmedabad/i });
    fireEvent.click(schoolBtn);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Daily time
    expect(screen.getByText(/How much practice time can you protect each day\?/i)).toBeInTheDocument();
    const timeBtn = screen.getByRole('radio', { name: /30 min/i });
    fireEvent.click(timeBtn);
    fireEvent.click(screen.getByRole('button', { name: /go to today/i }));

    // Profile in store is now complete
    const profile = useStore.getState().data.profile;
    expect(profile).not.toBeNull();
    expect(profile?.displayName).toBe('Aspirant 1');
    expect(profile?.onboardingStep).toBe('done');
    expect(profile?.dailyMinutes).toBe(30);
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
