/**
 * LoadingScreen.tsx – full-screen loading state shown on startup.
 * Shows a quiet indicator while config loads.
 */
import React from 'react';

export function LoadingScreen(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--lm-bg)]"
    >
      <div
        aria-hidden="true"
        className="w-8 h-8 rounded-full border-2 border-[var(--lm-border)] border-t-[var(--lm-ink)]"
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
      <p className="text-small text-[var(--lm-text-muted)] sr-only">Loading…</p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes spin { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
