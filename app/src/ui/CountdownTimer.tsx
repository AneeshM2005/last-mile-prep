/**
 * CountdownTimer.tsx – Quiet, non-anxious countdown timer.
 * design.md 7.10.
 * Inset pill, 36px high, Clock icon + numeric time.
 * Screen-reader announcements only at milestone thresholds (5m, 1m, 0s).
 * No red, flashing, or alarm sounds.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Clock, Check } from 'lucide-react';

interface CountdownTimerProps {
  totalSeconds: number;
  initialRemainingSeconds?: number;
  onExpire?: () => void;
  paused?: boolean;
  className?: string;
}

export function CountdownTimer({
  totalSeconds,
  initialRemainingSeconds,
  onExpire,
  paused = false,
  className = '',
}: CountdownTimerProps): React.ReactElement {
  const [remaining, setRemaining] = useState<number>(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : totalSeconds
  );
  const [announcement, setAnnouncement] = useState<string>('');
  const announcedRef = useRef<Set<number>>(new Set());
  const onExpireCalledRef = useRef<boolean>(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!onExpireCalledRef.current) {
            onExpireCalledRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, onExpire]);

  // Screen reader announcements at 5m (300s), 1m (60s), and 0s
  useEffect(() => {
    if (remaining === 300 && !announcedRef.current.has(300)) {
      announcedRef.current.add(300);
      setAnnouncement('5 minutes left');
    } else if (remaining === 60 && !announcedRef.current.has(60)) {
      announcedRef.current.add(60);
      setAnnouncement('1 minute left');
    } else if (remaining === 0 && !announcedRef.current.has(0)) {
      announcedRef.current.add(0);
      setAnnouncement("Time's up. Your answers are saved.");
    }
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const isExpiringSoon = remaining > 0 && remaining <= 60;
  const isEnded = remaining === 0;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Visually hidden polite announcement region */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <div
        className={[
          'inline-flex items-center gap-2 px-3.5 py-1.5 h-9 rounded-[var(--lm-radius-pill)]',
          'bg-[var(--lm-inset)] text-[var(--lm-ink)] border border-[var(--lm-border)] select-none',
        ].join(' ')}
      >
        {isEnded ? (
          <>
            <Check size={16} aria-hidden="true" className="shrink-0" />
            <span className="text-body font-semibold">Time&apos;s up</span>
          </>
        ) : (
          <>
            <Clock size={16} aria-hidden="true" className="shrink-0 text-[var(--lm-text-muted)]" />
            <span
              aria-hidden="true"
              className={`font-mono text-body tracking-wider ${isExpiringSoon ? 'font-bold' : 'font-medium'}`}
            >
              {formattedTime}
            </span>
            {isExpiringSoon && (
              <span className="text-caption text-[var(--lm-text-muted)] font-medium">
                1 min left
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
