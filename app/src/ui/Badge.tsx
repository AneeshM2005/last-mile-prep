/**
 * Badge.tsx – small pill badges.
 * Variants:
 * - sample: --color-sample fill, ink text, FlaskConical icon
 * - memory: surface fill, border-strong, ink text, Brain icon
 * - simulation: sample fill, ink text, FlaskConical icon ("Simulation")
 * - prototype: sample fill, ink text ("Prototype · sample content")
 * Badges are text, never colour-only.
 */
import React from 'react';
import { FlaskConical, Brain } from 'lucide-react';

export type BadgeVariant = 'sample' | 'memory' | 'simulation' | 'prototype';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className = '' }: BadgeProps): React.ReactElement {
  let defaultLabel = '';
  let IconComponent: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> | null = null;
  let bgStyles = '';

  switch (variant) {
    case 'sample':
      defaultLabel = 'SAMPLE';
      IconComponent = FlaskConical;
      bgStyles = 'bg-[var(--lm-sample)] text-[var(--lm-ink)] border border-[var(--lm-border)]';
      break;
    case 'memory':
      defaultLabel = 'Memory-based question';
      IconComponent = Brain;
      bgStyles = 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border border-[var(--lm-border-strong)]';
      break;
    case 'simulation':
      defaultLabel = 'Simulation';
      IconComponent = FlaskConical;
      bgStyles = 'bg-[var(--lm-sample)] text-[var(--lm-ink)] border border-[var(--lm-border)]';
      break;
    case 'prototype':
      defaultLabel = 'Prototype · sample content';
      IconComponent = FlaskConical;
      bgStyles = 'bg-[var(--lm-sample)] text-[var(--lm-ink)] border border-[var(--lm-border)]';
      break;
  }

  const text = label || defaultLabel;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--lm-radius-pill)]',
        'text-caption font-semibold tracking-[0.03em] select-none shrink-0',
        bgStyles,
        className,
      ].join(' ')}
    >
      {IconComponent && <IconComponent size={14} aria-hidden="true" className="shrink-0" />}
      <span>{text}</span>
    </span>
  );
}
