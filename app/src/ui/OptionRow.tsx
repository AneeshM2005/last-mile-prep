/**
 * OptionRow.tsx – Full-width row for MCQ options and decision steps.
 * design.md 7.6.
 * 56px min-height, --radius-md, letter marker (A–D) in 32px circle, text at right.
 * Accessible role="radio" with keyboard selection.
 * Solution states: correct / incorrect with text badges and distinct icons (no red/green reliance).
 */
import React from 'react';
import { Check, X } from 'lucide-react';

export interface OptionRowProps {
  id: string;
  letter: string;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  solutionState?: 'correct' | 'incorrect' | null;
  solutionLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function OptionRow({
  id,
  letter,
  text,
  selected = false,
  disabled = false,
  solutionState = null,
  solutionLabel,
  onClick,
  className = '',
}: OptionRowProps): React.ReactElement {
  let borderBgClass = 'bg-[var(--lm-surface)] border-[1.5px] border-[var(--lm-border-strong)] hover:bg-[var(--lm-inset)]';
  if (selected) {
    borderBgClass = 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)]';
  }
  if (solutionState === 'correct') {
    borderBgClass = 'bg-[var(--grade-a-bg)] border-2 border-[var(--grade-a-fg)] text-[var(--grade-a-fg)]';
  } else if (solutionState === 'incorrect') {
    borderBgClass = 'bg-[var(--lm-notice-bg)] border-[1.5px] border-[var(--lm-notice-text)]';
  }

  if (disabled && !solutionState) {
    borderBgClass = 'opacity-45 border-dashed border-[var(--lm-border-strong)] cursor-not-allowed';
  }

  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={[
        'w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-4 text-left rounded-[var(--lm-radius-md)] transition-colors',
        'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
        borderBgClass,
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span
          aria-hidden="true"
          className={[
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border',
            selected
              ? 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)]'
              : 'bg-[var(--lm-inset)] text-[var(--lm-ink)] border-[var(--lm-border)]',
          ].join(' ')}
        >
          {letter}
        </span>
        <span className="text-body text-[var(--lm-ink)] flex-1">{text}</span>
      </div>

      {selected && !solutionState && (
        <span className="shrink-0 text-[var(--lm-ink)]" aria-hidden="true">
          <Check size={18} strokeWidth={2.5} />
        </span>
      )}

      {solutionState === 'correct' && (
        <span className="flex items-center gap-1.5 text-caption font-bold text-[var(--grade-a-fg)] shrink-0">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          <span>{solutionLabel || 'Correct answer'}</span>
        </span>
      )}

      {solutionState === 'incorrect' && (
        <span className="flex items-center gap-1.5 text-caption font-bold text-[var(--lm-notice-text)] shrink-0">
          <X size={16} strokeWidth={2.5} aria-hidden="true" />
          <span>{solutionLabel || 'Your answer'}</span>
        </span>
      )}
    </button>
  );
}
