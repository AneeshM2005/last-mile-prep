/**
 * EvidenceLine.tsx – Non-collapsible evidence citation line under insights.
 * design.md 7.12.
 * Preceded by ListChecks icon, text.small, muted.
 * Appends "Early signal." if sample size n < 3.
 */
import React from 'react';
import { ListChecks } from 'lucide-react';

interface EvidenceLineProps {
  questionCount?: number;
  text: string;
  className?: string;
}

export function EvidenceLine({
  questionCount,
  text,
  className = '',
}: EvidenceLineProps): React.ReactElement {
  const isEarlySignal = questionCount !== undefined && questionCount > 0 && questionCount < 3;
  const fullText = isEarlySignal ? `${text} Early signal.` : text;

  return (
    <div className={`flex items-center gap-2 text-small text-[var(--lm-text-muted)] select-none ${className}`}>
      <ListChecks size={16} aria-hidden="true" className="shrink-0 text-[var(--lm-accent-strong)]" />
      <span>{fullText}</span>
    </div>
  );
}
