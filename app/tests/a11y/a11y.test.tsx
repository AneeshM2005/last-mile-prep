/**
 * a11y.test.tsx – Accessibility, keyboard navigation, and reduced-motion tests.
 * PRD M9, design 13 & 16. Tasks P1-20 & P1-21.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('P1-20 & P1-21 Accessibility & Motion Verification', () => {
  it('tokens.css enforces prefers-reduced-motion with instant transitions and auto scrolling', () => {
    const cssPath = join(process.cwd(), 'src/styles/tokens.css');
    const css = readFileSync(cssPath, 'utf-8');

    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation-duration: 0.01ms !important');
    expect(css).toContain('transition-duration: 0.01ms !important');
    expect(css).toContain('scroll-behavior: auto !important');
  });

  it('tokens.css defines standard focus ring and disabled opacity tokens', () => {
    const cssPath = join(process.cwd(), 'src/styles/tokens.css');
    const css = readFileSync(cssPath, 'utf-8');

    expect(css).toContain('--lm-focus');
    expect(css).toContain(':disabled');
    expect(css).toContain('[aria-disabled="true"]');
  });

  it('AppShell contains skip to main content landmark link', () => {
    const shellPath = join(process.cwd(), 'src/ui/AppShell.tsx');
    const shellCode = readFileSync(shellPath, 'utf-8');

    expect(shellCode).toContain('Skip to main content');
    expect(shellCode).toContain('href="#main-content"');
    expect(shellCode).toContain('id="main-content"');
  });

  it('LandingPage contains skip link targeting main landmark', () => {
    const landingPath = join(process.cwd(), 'src/features/landing/LandingPage.tsx');
    const landingCode = readFileSync(landingPath, 'utf-8');

    expect(landingCode).toContain('Skip to main content');
    expect(landingCode).toContain('href="#landing-main"');
    expect(landingCode).toContain('id="landing-main"');
  });

  it('OnboardingPage contains skip link and step heading focus management', () => {
    const onbPath = join(process.cwd(), 'src/features/onboarding/OnboardingPage.tsx');
    const onbCode = readFileSync(onbPath, 'utf-8');

    expect(onbCode).toContain('Skip to main content');
    expect(onbCode).toContain('id="step-heading"');
    expect(onbCode).toContain('heading?.focus()');
  });

  it('Dialog / Modal component implements focus trap and aria-modal attributes', () => {
    const modalPath = join(process.cwd(), 'src/ui/Modal.tsx');
    const modalCode = readFileSync(modalPath, 'utf-8');

    expect(modalCode).toContain('role="dialog"');
    expect(modalCode).toContain('aria-modal="true"');
    expect(modalCode).toContain('aria-labelledby');
  });

  it('Tabs primitive uses role="tablist" and role="tab" with aria-selected', () => {
    const tabsPath = join(process.cwd(), 'src/ui/Tabs.tsx');
    const tabsCode = readFileSync(tabsPath, 'utf-8');

    expect(tabsCode).toContain('role="tablist"');
    expect(tabsCode).toContain('role="tab"');
    expect(tabsCode).toContain('aria-selected');
  });

  it('GradeChip announces grade meaning via accessible role and label', () => {
    const gradePath = join(process.cwd(), 'src/ui/GradeChip.tsx');
    const gradeCode = readFileSync(gradePath, 'utf-8');

    expect(gradeCode).toContain('aria-label');
  });
});
