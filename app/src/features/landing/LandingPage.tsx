/**
 * LandingPage.tsx – First impression landing screen.
 * design.md 8.0.
 * Route: /welcome
 * Pure presentation, no data capture.
 */
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';

export function LandingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const profile = useStore((s) => s.data.profile);

  // If user already completed onboarding, redirect directly to /
  if (profile?.onboardingStep === 'done') {
    return <Navigate to="/" replace />;
  }

  const brandName = config?.app.brand.name || 'Last Mile';

  return (
    <div className="relative min-h-screen bg-[var(--lm-bg)] flex flex-col justify-between overflow-x-hidden selection:bg-[var(--lm-accent-soft)]">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--lm-ink)] text-white rounded-[var(--lm-radius-pill)] shadow-md"
      >
        Skip to main content
      </a>

      {/* Top bar with wordmark & prototype badge */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-[1280px] w-full mx-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-surface)] border border-[var(--lm-border)] shadow-sm">
          <span className="font-bold text-lg tracking-tight text-[var(--lm-ink)] font-sans">
            {brandName}
          </span>
        </div>
        <Badge variant="prototype" />
      </header>

      {/* Hero section with backdrop & daylight paper panel */}
      <main
        id="landing-main"
        className="relative flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 max-w-[1280px] w-full mx-auto"
      >
        {/* Daylight Backdrop Background */}
        <div
          aria-hidden="true"
          className="absolute inset-4 lg:inset-8 rounded-[var(--lm-radius-xl)] overflow-hidden bg-[var(--lm-sky-fallback)] -z-0 opacity-90"
        >
          {/* Subtle decorative daylight horizon */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--lm-bg)] via-transparent to-transparent opacity-40" />
        </div>

        {/* Paper Panel */}
        <div className="relative z-10 w-full max-w-[560px] p-6 sm:p-8 lg:p-10 rounded-[var(--lm-radius-xl)] bg-[var(--lm-surface)] border border-[var(--lm-border)] shadow-[var(--lm-shadow-2)] animate-fade-in my-auto">
          {/* Three pills */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="px-3 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] text-caption font-semibold">
              Strategy
            </span>
            <span className="px-3 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] text-caption font-semibold">
              Timing
            </span>
            <span className="px-3 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] text-caption font-semibold">
              Composure
            </span>
          </div>

          <h1 className="text-display text-[var(--lm-ink)] mb-4 tracking-tight">
            The last stretch, one steady step at a time.
          </h1>

          <p className="text-body-lg text-[var(--lm-text-muted)] mb-8 leading-relaxed">
            Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="primary-arrow"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto"
            >
              Get started
            </Button>
            <span className="text-small text-[var(--lm-text-muted)]">
              Everything stays on this device.
            </span>
          </div>
        </div>
      </main>

      {/* Footer attribution */}
      <footer className="relative z-10 py-4 px-6 text-center text-caption text-[var(--lm-text-muted)]">
        <span>Last Mile CAT Preparation · Phase 1 Prototype</span>
      </footer>
    </div>
  );
}
