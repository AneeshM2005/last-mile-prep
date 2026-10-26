/**
 * LandingPage.tsx – Aesthetic editorial landing screen for Last Mile.
 * Top-to-bottom composition on a fixed GradientWaves veil with ScrollExpand hero.
 * Section 1, 2A, 2B, 3.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { GradientWaves } from '../../ui/animations/GradientWaves';
import { ScrollExpand } from '../../ui/animations/ScrollExpand';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import {
  Compass,
  Target,
  ClipboardList,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function LandingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const profile = useStore((s) => s.data.profile);

  // Lazy-mount waves after first paint & hero load to never delay initial paint
  const [wavesMounted, setWavesMounted] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    // Reset scroll to top on enter
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);

      const timer = setTimeout(() => {
        setWavesMounted(true);
      }, 100);

      const handleScroll = () => {
        const scrolled = Math.max(0, window.scrollY || 0);
        const ratio = Math.min(1, scrolled / 300);
        setScrollProgress(ratio);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // If user already completed onboarding, redirect to /
  if (profile?.onboardingStep === 'done') {
    return <Navigate to="/" replace />;
  }

  const brandName = config?.app.brand.name || 'Last Mile';
  const landingCopy = config?.copy?.landing as Record<string, string> | undefined;
  const headline = landingCopy?.headline || 'The last stretch, one steady step at a time.';
  const sub = landingCopy?.sub || 'Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice.';
  const ctaText = landingCopy?.cta || 'Get started';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="relative min-h-screen bg-[var(--lm-bg)] text-[var(--lm-ink)] overflow-x-hidden font-sans flex flex-col justify-between selection:bg-[var(--lm-sage-100)]">
      {/* Skip to main content */}
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--lm-sage-900)] text-white rounded-full shadow-md text-sm font-semibold"
      >
        Skip to main content
      </a>

      {/* 2B. Fixed Full-Viewport Living Backdrop: GradientWaves */}
      {wavesMounted && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{ opacity: 0.85 }}
        >
          <GradientWaves
            lightMode={true}
            backgroundColor="transparent"
            horizonColor="rgb(181, 205, 176)" // sage-300
            waveColor="rgb(127, 160, 122)"    // sage-500
            crestColor="rgb(255, 255, 255)"
            speed={0.25}
            amplitude={2.0}
            waveScale={0.5}
            relief={0.8}
            sheen={0.15}
            brightness={1.0}
            opacity={0.85}
            grain={0.12}
            intro={true}
            mouseInteraction={true}
            parallaxStrength={0.3}
            mouseStrength={0.5}
            swellOnClick={true}
            quality={isMobile ? 'low' : 'medium'}
            dpr={isMobile ? 1.25 : 1.5}
          />
        </div>
      )}

      {/* Main Content Area sitting above waves */}
      <main id="landing-main" className="relative z-10 flex-1 flex flex-col items-center">
        {/* Top Slim Wordmark: sits in margin above frame, fades out as frame opens */}
        <header
          className="w-full max-w-[1280px] mx-auto px-6 pt-5 pb-3 flex items-center justify-between transition-opacity duration-200"
          style={{ opacity: Math.max(0, 1 - scrollProgress * 1.5) }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center border border-[var(--lm-sage-200)]">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-[var(--lm-ink)]">
              {brandName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center text-xs font-semibold text-[var(--lm-sage-700)] hover:underline cursor-pointer"
          >
            Start profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </header>

        {/* 1. Hero: ScrollExpand picture */}
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-2 pb-12 flex flex-col items-center">
          <ScrollExpand
            src="/images/backdrop.jpg"
            alt="Scenic view from a train window looking out over mountains and green meadows"
            title={headline}
            scrollHint="Scroll"
            useWindowScroll={true}
            mediaZoom={1.15}
          >
            {/* 2. Opening moment revealed inside/under frame once opened */}
            <div
              className="max-w-xl p-6 sm:p-8 rounded-[var(--lm-radius-card)] border border-[var(--lm-sage-200)] shadow-sm"
              style={{
                backgroundColor: 'rgba(251, 252, 249, 0.92)',
              }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--lm-sage-700)] block mb-1">
                A Calmer Approach to CAT
              </span>
              <p className="text-sm sm:text-base text-[var(--lm-ink)] leading-relaxed font-medium mb-5">
                {sub}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <SpecularButton
                  size="lg"
                  radius={9999}
                  onClick={() => navigate('/onboarding')}
                  aria-label="Get started with Last Mile"
                  className="w-full sm:w-auto"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </SpecularButton>

                <span className="text-xs text-[var(--lm-text-muted)] font-medium">
                  Your data stays on this device.
                </span>
              </div>
            </div>
          </ScrollExpand>
        </section>

        {/* 3. Diagnostic Architecture: Editorial two-column layout */}
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold font-mono tracking-widest text-[var(--lm-sage-700)] uppercase">
                01 · Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--lm-ink)] leading-tight">
                Diagnostic architecture for the decisive last weeks.
              </h2>
              <p className="text-base text-[var(--lm-text-muted)] leading-relaxed">
                Most platforms drill questions without addressing why candidates drop marks. Last Mile deconstructs your test-taking behaviour into clear, fixable dimensions: decision speed, selection judgement, and composure recovery.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-[var(--lm-ink)]">
                    Honest Potential
                  </h3>
                  <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                    Identify your true ceiling by separating knowledge errors from pacing leaks. Learn what you can score when solvable questions are not abandoned.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-[var(--lm-ink)]">
                    Non-Linear Scanning
                  </h3>
                  <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                    Train the instinct to triage. Pick the easiest questions first and bypass high-friction traps that sap energy and time.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Quiet Feature Strip: 5 light cards with sage icon chips */}
        <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto bg-[var(--lm-sage-50)] border-y border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] my-8">
          <div className="mb-8">
            <span className="text-xs font-bold font-mono tracking-widest text-[var(--lm-sage-700)] uppercase">
              02 · System Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--lm-ink)] mt-1">
              Five quiet pillars of practice
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-ink)]">
                  Baseline and profile
                </h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Twelve questions across VARC, LRDI, and QA. Maps your starting decision profile and builds an actionable SWOT matrix without pressure.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-ink)]">
                  Question selection
                </h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Five QA questions in five minutes. Practice identifying which questions to solve and which to leave to bank your target score calmly.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-ink)]">
                  Mock analysis
                </h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Classify your mock decisions question by question into grades A through D. Reveal your potential score and diagnose pacing leaks.
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-ink)]">
                  Revision
                </h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Four scheduled intervals (1, 3, 7, 14, 30 days) to keep core formulas, traps, and problem patterns fresh before test day.
                </p>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-ink)]">
                  Personal dictionary
                </h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">
                  Read curated editorial passages and tap unfamiliar words to add them directly to your personal active-recall study flashcards.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. "Calm by design" Section (renamed from Anti-anxiety guarantee) */}
        <section className="w-full py-14 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="p-8 sm:p-12 rounded-[var(--lm-radius-card)] bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)] relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="text-xs font-bold font-mono tracking-widest text-[var(--lm-sage-700)] uppercase">
                03 · Philosophy
              </span>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--lm-sage-700)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--lm-sage-700)]" />
                <span>Calm by design</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--lm-ink)]">
                No streak punishments. No public rankings.
              </h2>
              <p className="text-sm sm:text-base text-[var(--lm-text-muted)] leading-relaxed">
                Most test platforms fuel anxiety to drive artificial engagement. Last Mile is designed for clarity: diagnostic signal, deliberate practice, and zero guilt if life gets busy. A practice aid that keeps practice calm, not a promise to eliminate anxiety.
              </p>

              {/* 6. Closing Call to Action with SpecularButton */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SpecularButton
                  size="md"
                  radius={9999}
                  onClick={() => navigate('/onboarding')}
                  aria-label="Start your prep profile"
                >
                  Start your prep profile
                </SpecularButton>

                <div className="flex items-center gap-2 text-xs text-[var(--lm-text-muted)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--lm-sage-700)] shrink-0" />
                  <span>Private and local on this device</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--lm-sage-200)] py-8 px-6 text-center text-xs text-[var(--lm-text-muted)] bg-[var(--lm-bg)]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-sm text-[var(--lm-ink)]">
            <span>{brandName}</span>
          </div>
          <p className="m-0 text-xs">
            All data stays on this device. Nothing is sent automatically.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
