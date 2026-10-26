/**
 * Banner.tsx – dismissible notice banner.
 * Types: info, notice, demo, sample, storage, starter-profile, demo-date, content-error, generic.
 * Rendered at top of page. Announced to screen readers.
 */
import React from 'react';
import { X, AlertCircle, Info, FlaskConical } from 'lucide-react';

export type BannerType =
  | 'info'
  | 'notice'
  | 'demo'
  | 'sample'
  | 'storage'
  | 'starter-profile'
  | 'demo-date'
  | 'content-error'
  | 'generic';

interface BannerProps {
  id: string;
  type: BannerType;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function Banner({ id, type, message, onDismiss, className = '' }: BannerProps): React.ReactElement {
  let bgStyles = 'bg-[var(--lm-notice-bg)] text-[var(--lm-notice-text)] border-[var(--lm-border)]';
  let IconComponent = AlertCircle;

  if (type === 'info' || type === 'starter-profile' || type === 'generic') {
    bgStyles = 'bg-[var(--lm-accent-soft)] text-[var(--lm-accent-strong)] border-[var(--lm-border)]';
    IconComponent = Info;
  } else if (type === 'demo' || type === 'demo-date' || type === 'sample') {
    bgStyles = 'bg-[var(--lm-sample)] text-[var(--lm-ink)] border-[var(--lm-border)]';
    IconComponent = FlaskConical;
  }

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      className={[
        'flex items-start justify-between gap-3 px-4 py-3 rounded-[var(--lm-radius-md)] border text-small',
        bgStyles,
        className,
      ].join(' ')}
    >
      <IconComponent size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
      <p className="flex-1 m-0 font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={onDismiss}
          className={[
            'shrink-0 -mt-0.5 -mr-1 p-1 rounded-md cursor-pointer',
            'opacity-70 hover:opacity-100 focus-visible:outline-2',
            'focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
          ].join(' ')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
