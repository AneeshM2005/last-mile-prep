/**
 * RouteGuard.tsx – Protects interior application routes.
 * Redirects users who haven't completed onboarding to /welcome or /onboarding.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../data/store';

interface RouteGuardProps {
  children: React.ReactElement;
}

export function RouteGuard({ children }: RouteGuardProps): React.ReactElement {
  const profile = useStore((s) => s.data.profile);
  const location = useLocation();

  const isOnboardingComplete = profile?.onboardingStep === 'done';

  if (!isOnboardingComplete) {
    if (profile && profile.onboardingStep !== 1 && profile.onboardingStep !== 'consent' && profile.onboardingStep !== 'done') {
      return <Navigate to="/onboarding" replace state={{ from: location }} />;
    }
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  return children;
}
