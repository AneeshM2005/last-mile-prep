/**
 * Card.tsx – Base card and variant containers.
 * design.md 7.7.
 * Flat cards with 1px border, surface fill, --radius-lg (20px) or --radius-xl (24px).
 * No elevation shadow by default.
 */
import React from 'react';

export type CardVariant = 'base' | 'tile' | 'question' | 'entry' | 'swot' | 'summary' | 'stat';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  clickable?: boolean;
  selected?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'base',
  clickable = false,
  selected = false,
  className = '',
  children,
  ...rest
}: CardProps): React.ReactElement {
  const radiusClass = variant === 'tile' || variant === 'base'
    ? 'rounded-[var(--lm-radius-xl)]'
    : 'rounded-[var(--lm-radius-lg)]';

  const baseClasses = [
    'bg-[var(--lm-surface)] border transition-all text-[var(--lm-ink)]',
    radiusClass,
    selected
      ? 'border-[2px] border-[var(--lm-ink)] bg-[var(--lm-accent-soft)]'
      : 'border-[var(--lm-border)]',
    clickable
      ? 'cursor-pointer hover:border-[var(--lm-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2'
      : '',
    className,
  ].join(' ');

  return (
    <div className={baseClasses} {...rest}>
      {children}
    </div>
  );
}
