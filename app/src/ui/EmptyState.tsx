/**
 * EmptyState.tsx – Quiet inset panel for empty sections.
 * design.md 7.19.
 * Inset panel, radius-md, text.body, optional secondary button, simple line icon.
 */
import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  message: string;
  icon?: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  message,
  icon: IconComponent,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-3 p-8 text-center rounded-[var(--lm-radius-md)]',
        'bg-[var(--lm-inset)] border border-[var(--lm-border)] text-[var(--lm-text-muted)]',
        className,
      ].join(' ')}
    >
      {IconComponent && (
        <IconComponent size={36} aria-hidden="true" className="text-[var(--lm-accent-strong)] opacity-80" />
      )}
      <p className="text-body max-w-[440px] m-0 text-[var(--lm-ink)] font-medium">
        {message}
      </p>
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
