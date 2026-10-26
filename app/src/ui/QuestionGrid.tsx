/**
 * QuestionGrid.tsx – Grid of 44x44px question jump targets.
 * design.md 7.17.
 * States conveyed by content & shape, not colour alone:
 * - unvisited: hollow, number only
 * - current: 2px ink ring + aria-current="step"
 * - answered: filled ink with white number + check
 * - skipped: hollow with minus/strike icon
 * - mock recorded: filled with grade shape
 */
import React from 'react';
import { Check, Minus } from 'lucide-react';
import { GRADE_DETAILS, type GradeType } from './GradeChip';

export interface QuestionGridItem {
  index: number;
  label?: string;
  status: 'unvisited' | 'current' | 'answered' | 'skipped' | 'recorded';
  grade?: GradeType | null;
}

interface QuestionGridProps {
  items: QuestionGridItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function QuestionGrid({
  items,
  currentIndex,
  onSelect,
  className = '',
}: QuestionGridProps): React.ReactElement {
  return (
    <nav aria-label="Question navigation" className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const isCurrent = item.index === currentIndex;
        let styleClass = 'bg-[var(--lm-surface)] border-[1.5px] border-[var(--lm-border-strong)] text-[var(--lm-ink)]';
        let iconNode: React.ReactNode = null;

        if (item.status === 'answered') {
          styleClass = 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)]';
          iconNode = <Check size={12} strokeWidth={3} aria-hidden="true" className="absolute top-1 right-1" />;
        } else if (item.status === 'skipped') {
          styleClass = 'bg-[var(--lm-inset)] border-[1.5px] border-[var(--lm-border-strong)] text-[var(--lm-text-muted)]';
          iconNode = <Minus size={14} aria-hidden="true" className="absolute top-1 right-1" />;
        } else if (item.status === 'recorded' && item.grade) {
          const details = GRADE_DETAILS[item.grade];
          const Icon = details.Icon;
          styleClass = 'text-[var(--lm-ink)] border-[1.5px] border-[var(--lm-border-strong)]';
          iconNode = (
            <span style={{ color: details.fg }} className="absolute top-1 right-1">
              <Icon size={12} fill="currentColor" aria-hidden="true" />
            </span>
          );
        }

        if (isCurrent) {
          styleClass += ' ring-2 ring-offset-2 ring-[var(--lm-ink)] font-bold';
        }

        return (
          <button
            key={item.index}
            type="button"
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`Question ${item.index + 1}, ${item.status}`}
            onClick={() => onSelect(item.index)}
            className={[
              'relative w-11 h-11 rounded-[var(--lm-radius-sm)] flex items-center justify-center font-mono text-sm transition-all cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
              styleClass,
            ].join(' ')}
          >
            <span>{item.index + 1}</span>
            {iconNode}
          </button>
        );
      })}
    </nav>
  );
}
