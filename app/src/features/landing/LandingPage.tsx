/**
 * LandingPage.tsx – Aesthetic first impression landing screen.
 * Incorporates React Bits GradientWaves, ScrollExpand with custom train-window backdrop, and SpecularButton.
 * design.md 8.0, PRD M1.1.
 * Route: /welcome
 */

import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { GradientWaves } from '../../ui/animations/GradientWaves';
import { ScrollExpand } from '../../ui/animations/ScrollExpand';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import {
  Compass,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

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
    <div className="relative min-h-screen bg-[var(--lm-bg)] dark:bg-zinc-950 text-[var(--lm-ink)] selection:bg-indigo-100 dark:selection:bg-indigo-950 overflow-x-hidden flex flex-col justify-between font-sans">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--lm-ink)] text-white rounded-[var(--lm-radius-pill)] shadow-md"
      >
        Skip to main content
      </a>

      {/* Floating Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-b border-black/[0.06] dark:border-white/[0.08] transition-all">
        <div className="max-w-[1280px] w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--lm-ink)] font-serif">
              {brandName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="prototype" />
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="hidden sm:inline-flex items-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign in / Start <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="landing-main" className="flex-1 flex flex-col items-center">
        {/* Hero Section with ScrollExpand & Ambient GradientWaves */}
        <section className="relative w-full pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto flex flex-col items-center">
          {/* Subtle ambient background canvas */}
          <div className="absolute inset-0 -top-24 h-[580px] pointer-events-none opacity-40 dark:opacity-30 overflow-hidden">
            <GradientWaves
              horizonColor="rgb(67, 56, 202)"
              waveColor="rgb(245, 158, 11)"
              crestColor="rgb(255, 255, 255)"
              speed={0.25}
              amplitude={2.0}
              relief={0.8}
              lightAngle={135}
              mouseInteraction
              swellOnClick={false}
              opacity={0.45}
            />
          </div>

          {/* Top Tag & Editorial Heading */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-black/[0.08] dark:border-white/[0.1] shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                CAT 2026 Preparation Protocol
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--lm-ink)] font-serif leading-[1.12]">
              The last stretch, one steady step at a time.
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[var(--lm-text-muted)] max-w-2xl mx-auto leading-relaxed">
              Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice.
            </p>

            {/* Specular Button CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <SpecularButton
                size="lg"
                radius={24}
                baseColor="rgb(30, 30, 36)"
                lineColor="rgb(255, 255, 255)"
                tint="rgb(129, 140, 248)"
                tintOpacity={0.08}
                intensity={1}
                idleIntensity={0.4}
                shineSize={12}
                shineFade={40}
                glow={1}
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto px-10 py-4 shadow-xl"
              >
                Get started
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </SpecularButton>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero registration required · 100% on-device</span>
              </div>
            </div>
          </div>

          {/* Interactive ScrollExpand with the User's Scenic Train Window Backdrop */}
          <div className="relative z-10 w-full mt-4">
            <ScrollExpand
              src="/images/backdrop.jpg"
              alt="View from train window overlooking mountains during your journey"
              title="Journey to Top B-Schools"
              scrollHint="Scroll to expand view"
              mediaZoom={1.2}
            >
              <div className="max-w-xl bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15 shadow-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Calm Execution
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-serif">
                  A scenic path through test-taking composure.
                </h2>
                <p className="text-sm text-zinc-200 mt-2 leading-relaxed">
                  Every CAT question is a landscape to survey: scan for rapid wins, let go of dead ends gracefully, and bank your potential score.
                </p>
              </div>
            </ScrollExpand>
          </div>
        </section>

        {/* Feature Bento Grid: Classy, calm, and purposeful */}
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Diagnostic Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--lm-ink)] font-serif mt-2">
              Everything built for the decisive last mile.
            </h2>
            <p className="text-sm sm:text-base text-[var(--lm-text-muted)] mt-2">
              Four intentional modules addressing what coaching institutes overlook: decision latency, leakage, and panic recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Baseline & SWOT */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500 bg-white dark:bg-zinc-900">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--lm-ink)] font-serif">
                  15-Min Baseline
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  A balanced 12-question diagnostic across VARC, LRDI, and QA. Automatically constructs your dynamic 4-quadrant SWOT matrix.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Threats & Opportunities</span>
              </div>
            </Card>

            {/* Card 2: Question Selection */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-t-4 border-t-amber-500 bg-white dark:bg-zinc-900">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--lm-ink)] font-serif">
                  Selection Rounds
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Train non-linear scanning. Practice picking the 2-3 most solvable problems from a 5-question grid under a gentle, quiet timer.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Eliminate Question Traps</span>
              </div>
            </Card>

            {/* Card 3: Mock Potential & Leakage */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-t-4 border-t-rose-500 bg-white dark:bg-zinc-900">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--lm-ink)] font-serif">
                  Mock Leakage Analysis
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Classify answers into 9 outcome codes. Calculate your true Potential Score: what you could score if known questions weren't dropped.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Grade A to D Mapping</span>
              </div>
            </Card>

            {/* Card 4: Spaced Revision & Words */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500 bg-white dark:bg-zinc-900">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--lm-ink)] font-serif">
                  Spaced Revision & Words
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Automatic retention intervals at 1, 3, 9, 18 days. Read curated RC passages and tap unfamiliar words to practice 3D flashcards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Active Recall Protocol</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Calm Manifesto Banner */}
        <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>The Anti-Anxiety Guarantee</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
                No streak punishments. No public rankings.
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Most test platforms fuel anxiety to drive artificial engagement. Last Mile is designed for clarity: diagnostic signal, deliberate practice, and zero guilt if life gets busy.
              </p>

              <div className="pt-2">
                <SpecularButton
                  size="md"
                  radius={20}
                  baseColor="rgb(255, 255, 255)"
                  textColor="rgb(15, 23, 42)"
                  lineColor="rgb(99, 102, 241)"
                  tint="rgb(224, 231, 255)"
                  onClick={() => navigate('/onboarding')}
                >
                  Start Your Prep Profile
                </SpecularButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] py-8 px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-sm text-[var(--lm-ink)]">
            <span>{brandName}</span>
            <span className="text-zinc-400">·</span>
            <span className="font-sans font-normal text-xs text-zinc-500">Prototype v1.0</span>
          </div>
          <p className="m-0">
            Local-only data. Never transmitted to external servers. Designed for CAT aspirants.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
