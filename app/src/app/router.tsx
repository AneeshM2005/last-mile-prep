/**
 * router.tsx – App route definitions using HashRouter.
 * design.md 4.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { RouteGuard } from './RouteGuard';
import { NotFound } from '../ui/NotFound';

// Feature screens (lazy or direct imports)
import { LandingPage } from '../features/landing/LandingPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { HomePage } from '../features/home/HomePage';
import { PracticeHubPage } from '../features/practice/PracticeHubPage';
import { BaselinePage } from '../features/baseline/BaselinePage';
import { RoundsPage } from '../features/rounds/RoundsPage';
import { MockPage } from '../features/mock/MockPage';
import { RevisionPage } from '../features/revision/RevisionPage';
import { WordsPage } from '../features/words/WordsPage';
import { PassageSessionPage } from '../features/words/PassageSessionPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { OmetPage } from '../features/omet/OmetPage';
import { FeedbackPage } from '../features/feedback/FeedbackPage';

export function AppRouter(): React.ReactElement {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected interior routes inside AppShell */}
      <Route
        path="/"
        element={
          <RouteGuard>
            <AppShell />
          </RouteGuard>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="practice" element={<PracticeHubPage />} />
        <Route path="practice/baseline" element={<BaselinePage />} />
        <Route path="practice/rounds" element={<RoundsPage />} />
        <Route path="mock" element={<MockPage />} />
        <Route path="revision" element={<RevisionPage />} />
        <Route path="words" element={<WordsPage />} />
        <Route path="words/read" element={<PassageSessionPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="omet" element={<OmetPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
