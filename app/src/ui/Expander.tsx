/**
 * Expander.tsx – Native <details>/<summary> accordion with rotating ChevronDown.
 * design.md 7.18.
 * Used for "Why this?" and solutions.
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ExpanderProps {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Expander({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: ExpanderProps): React.ReactElement {
  return (
    <details
      open={defaultOpen}
      className={`group rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] bg-[var(--lm-surface)] p-4 transition-all ${className}`}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none text-body-strong text-[var(--lm-ink)] focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2">
        <span>{summary}</span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="text-[var(--lm-text-muted)] transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pt-3 mt-3 border-t border-[var(--lm-border)] text-body text-[var(--lm-ink)]">
        {children}
      </div>
    </details>
  );
}
