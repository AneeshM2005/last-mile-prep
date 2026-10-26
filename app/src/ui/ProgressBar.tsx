/**
 * ProgressBar.tsx & StepDots.tsx – Accessible progress indicators.
 * design.md 7.9.
 */
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  label,
  className = '',
}: ProgressBarProps): React.ReactElement {
  const safeTotal = Math.max(1, total);
  const clampedCurrent = Math.min(Math.max(0, current), safeTotal);
  const percent = Math.round((clampedCurrent / safeTotal) * 100);
  const textLabel = label || `${clampedCurrent} of ${safeTotal}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex justify-between items-center text-small text-[var(--lm-text-muted)]">
        <span>{textLabel}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuetext={textLabel}
        className="w-full h-2 bg-[var(--lm-inset)] rounded-[var(--lm-radius-pill)] overflow-hidden"
      >
        <div
          className="h-full bg-[var(--lm-accent)] rounded-[var(--lm-radius-pill)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface StepDotsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepDots({
  currentStep,
  totalSteps,
  className = '',
}: StepDotsProps): React.ReactElement {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-small font-medium text-[var(--lm-text-muted)]">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex items-center gap-2" aria-hidden="true">
        {steps.map((step) => {
          if (step === currentStep) {
            return (
              <span
                key={step}
                className="w-6 h-2 bg-[var(--lm-ink)] rounded-[var(--lm-radius-pill)] transition-all"
              />
            );
          }
          if (step < currentStep) {
            return (
              <span
                key={step}
                className="w-2 h-2 bg-[var(--lm-ink)] rounded-full transition-all"
              />
            );
          }
          return (
            <span
              key={step}
              className="w-2 h-2 border border-[var(--lm-border-strong)] rounded-full transition-all"
            />
          );
        })}
      </div>
    </div>
  );
}
