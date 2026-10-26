/**
 * TopBar.tsx – Mobile top header bar.
 * design.md 4, 6.
 * 56px high, wordmark at left, Demo-date / SAMPLE tags at right.
 */
import React from 'react';
import { Badge } from './Badge';
import { useAppContext } from '../app/providers';
import { appClock } from '../domain/appClock';

export function TopBar(): React.ReactElement {
  const { config } = useAppContext();
  const brandName = config?.app.brand.name || 'Last Mile';
  const isDemo = appClock.isSimulated();

  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-[var(--lm-surface)] border-b border-[var(--lm-border)] sticky top-0 z-10">
      <span className="font-bold text-lg tracking-tight text-[var(--lm-ink)] font-sans">
        {brandName}
      </span>
      <div className="flex items-center gap-2">
        {isDemo && (
          <Badge variant="simulation" label={`Demo: ${appClock.today()}`} />
        )}
        <Badge variant="prototype" label="Prototype" />
      </div>
    </header>
  );
}
