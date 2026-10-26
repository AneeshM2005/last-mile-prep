/**
 * ErrorScreen.tsx – shown when required config fails to load.
 */
import React from 'react';
import { Button } from './Button';
import type { ConfigError } from '../data/configLoader';

interface ErrorScreenProps {
  errors: ConfigError[];
  onRetry: () => void;
}

export function ErrorScreen({ errors, onRetry }: ErrorScreenProps): React.ReactElement {
  return (
    <div
      role="alert"
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-[var(--lm-bg)]"
    >
      <h1 className="text-h2 text-[var(--lm-ink)] text-center">Content couldn't load</h1>
      <p className="text-body text-[var(--lm-text-muted)] text-center max-w-[480px]">
        One or more required files couldn't be read. The details are below. Please try refreshing.
      </p>
      <ul className="space-y-2 w-full max-w-[480px]">
        {errors.map((e, i) => (
          <li
            key={i}
            className="p-3 rounded-[var(--lm-radius-md)] bg-[var(--lm-notice-bg)] text-small text-[var(--lm-notice-text)]"
          >
            <strong>{e.file}</strong> → <code>{e.field}</code>: {e.message}
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
