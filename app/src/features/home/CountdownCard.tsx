/**
 * CountdownCard.tsx – Days to CAT countdown card with college photo background.
 *
 * Implements Part C of Dream-college prompt:
 * - Vivid photo with 12% paper-white uniform wash (no dark scrim, no blur)
 * - Solid white top-left panel for COUNTDOWN, big number (ink #2B2B2B), and days to CAT
 * - Solid white bottom pill for college name in deep-sage (#2F4A32)
 * - Full fallback to plain sage card when image is null, missing, or fails to load
 * - Smooth 300ms fade-in, reduced-motion instant swap
 */

import React, { useState } from 'react';
import type { CollegeConfig } from '../../domain/colleges';

export interface CountdownCardProps {
  daysToCAT: number;
  college?: CollegeConfig | null;
  className?: string;
}

export function CountdownCard({
  daysToCAT,
  college,
  className = '',
}: CountdownCardProps): React.ReactElement {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = Boolean(college?.image && !imgError);
  const collegeName = college?.name || 'Dream B-School';

  // Plain sage fallback card (used when image is null or fails to load)
  if (!hasImage) {
    return (
      <div
        data-testid="countdown-card"
        className={[
          'col-span-12 sm:col-span-6 lg:col-span-4 rounded-[var(--lm-radius-card,24px)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)] relative overflow-hidden flex flex-col justify-between p-5',
          className,
        ].join(' ')}
        style={{
          minHeight: '220px',
          background: 'var(--lm-sky-fallback)',
        }}
      >
        <div>
          <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
            Countdown
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-display font-serif text-[var(--lm-ink)] leading-none">
              {daysToCAT}
            </span>
            <span className="text-body font-medium text-[var(--lm-text-muted)]">
              {daysToCAT === 0 ? 'CAT day has passed' : 'days to CAT'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--lm-sage-200)] flex items-center justify-between text-caption text-[var(--lm-text-muted)]">
          <span className="font-semibold text-[var(--lm-sage-700)]">
            {collegeName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="countdown-card"
      className={[
        'col-span-12 sm:col-span-6 lg:col-span-4 rounded-[var(--lm-radius-card,24px)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)] relative overflow-hidden flex flex-col justify-between p-4 sm:p-5',
        className,
      ].join(' ')}
      style={{
        minHeight: '220px',
        backgroundColor: 'var(--lm-surface)',
      }}
    >
      {/* College photo as full-bleed background */}
      <img
        src={college?.image || undefined}
        alt=""
        decoding="async"
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        className={[
          'absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity duration-300 motion-reduce:transition-none',
          imgLoaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          objectPosition: college?.focus || '50% 50%',
        }}
      />

      {/* Uniform wash over photo based on computed college wash and tone */}
      <div
        aria-hidden="true"
        data-testid="countdown-wash"
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundColor:
            college?.textTone === 'light'
              ? `rgba(47, 74, 50, ${(college?.wash ?? 0) / 100})`
              : `rgba(250, 249, 248, ${(college?.wash ?? 0) / 100})`,
        }}
      />

      {/* Top-left countdown text without panel */}
      <div
        data-testid="countdown-text-group"
        className="relative z-[2] flex flex-col gap-1 transition-all"
        style={{
          textShadow:
            college?.textTone === 'light'
              ? '0 1px 3px rgba(0, 0, 0, 0.25)'
              : '0 1px 3px rgba(255, 255, 255, 0.25)',
        }}
      >
        <span
          className={[
            'text-caption font-bold tracking-wider uppercase',
            college?.textTone === 'light' ? 'text-white' : 'text-[var(--lm-ink)]',
          ].join(' ')}
        >
          Countdown
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={[
              'text-display font-serif leading-none',
              college?.textTone === 'light' ? 'text-white' : 'text-[var(--lm-ink)]',
            ].join(' ')}
          >
            {daysToCAT}
          </span>
          <span
            className={[
              'text-body font-medium',
              college?.textTone === 'light' ? 'text-white' : 'text-[var(--lm-ink)]',
            ].join(' ')}
          >
            {daysToCAT === 0 ? 'CAT day has passed' : 'days to CAT'}
          </span>
        </div>
      </div>

      {/* Bottom college name in solid white pill */}
      <div
        data-testid="college-pill"
        className="relative z-[2] mt-4 w-fit max-w-full bg-white rounded-[var(--lm-radius-pill)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)] px-3.5 py-1.5"
      >
        <span className="text-caption font-semibold text-[var(--lm-sage-900)] block line-clamp-2 leading-tight">
          {collegeName}
        </span>
      </div>
    </div>
  );
}
