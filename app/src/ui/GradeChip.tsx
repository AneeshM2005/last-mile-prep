/**
 * GradeChip.tsx – Calm 4-grade indicator with shape, letter, and label.
 * design.md 7.11.
 * Grade A: Circle, "Your strength"
 * Grade B: Diamond, "Be a better test taker"
 * Grade C: Triangle, "Luck or great decision"
 * Grade D: Square, "Red flag" (muted plum, no red)
 * Variants: 'compact' (shape + letter) and 'full' (shape + letter + label + optional meaning).
 */
import React from 'react';
import { Circle, Diamond, Triangle, Square } from 'lucide-react';

export type GradeType = 'A' | 'B' | 'C' | 'D';

interface GradeChipProps {
  grade?: GradeType | null;
  variant?: 'compact' | 'full';
  showMeaning?: boolean;
  className?: string;
}

export const GRADE_DETAILS: Record<
  GradeType,
  {
    label: string;
    meaning: string;
    Icon: React.ComponentType<{ size?: number; className?: string; fill?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    fg: string;
    bg: string;
  }
> = {
  A: {
    label: 'Your strength',
    meaning: 'Good judgement, good knowledge.',
    Icon: Circle,
    fg: 'var(--grade-a-fg)',
    bg: 'var(--grade-a-bg)',
  },
  B: {
    label: 'Be a better test taker',
    meaning: 'Knowledge was there; the decision was the lever.',
    Icon: Diamond,
    fg: 'var(--grade-b-fg)',
    bg: 'var(--grade-b-bg)',
  },
  C: {
    label: 'Luck or great decision',
    meaning: 'A good decision, or luck, without solid knowledge yet.',
    Icon: Triangle,
    fg: 'var(--grade-c-fg)',
    bg: 'var(--grade-c-bg)',
  },
  D: {
    label: 'Red flag',
    meaning: 'Both judgement and knowledge need work. This is your first thing to look at.',
    Icon: Square,
    fg: 'var(--grade-d-fg)',
    bg: 'var(--grade-d-bg)',
  },
};

export function GradeChip({
  grade,
  variant = 'compact',
  showMeaning = false,
  className = '',
}: GradeChipProps): React.ReactElement {
  if (!grade) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 h-8 rounded-[var(--lm-radius-pill)] border border-dashed border-[var(--lm-border-strong)] text-caption text-[var(--lm-text-muted)] ${className}`}
      >
        <span>Grade appears when you complete the outcome</span>
      </div>
    );
  }

  const details = GRADE_DETAILS[grade];
  const { label, meaning, Icon, fg, bg } = details;
  const fullAccessibleLabel = `Grade ${grade}, ${label}: ${meaning}`;

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        role="status"
        aria-label={fullAccessibleLabel}
        style={{ color: fg, backgroundColor: bg }}
        className="inline-flex items-center gap-2 px-3 py-1 h-8 rounded-[var(--lm-radius-pill)] font-semibold select-none text-caption"
      >
        <Icon size={14} fill="currentColor" aria-hidden="true" className="shrink-0" />
        <span className="font-bold">{grade}</span>
        {variant === 'full' && (
          <>
            <span aria-hidden="true" className="opacity-60">·</span>
            <span>{label}</span>
          </>
        )}
      </span>

      {showMeaning && (
        <span className="text-small text-[var(--lm-text-muted)] italic">
          {meaning}
        </span>
      )}
    </div>
  );
}
