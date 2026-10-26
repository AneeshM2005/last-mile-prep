/**
 * MoreSheet.tsx – Accessible bottom sheet for mobile navigation overflow.
 * design.md 4, 7.8, 7.14.
 * Hosts Words, My profile, OMET, and Feedback.
 */
import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, UserRound, Compass, MessageSquare, X } from 'lucide-react';

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

const MORE_ITEMS = [
  { to: '/words', label: 'My words', Icon: BookOpen },
  { to: '/profile', label: 'My profile', Icon: UserRound },
  { to: '/omet', label: 'OMET', Icon: Compass },
  { to: '/feedback', label: 'Feedback', Icon: MessageSquare },
];

export function MoreSheet({ open, onClose }: MoreSheetProps): React.ReactElement | null {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="More navigation"
      className="fixed inset-0 z-40 lg:hidden flex flex-col justify-end"
    >
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-[var(--lm-scrim)] opacity-45 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className="relative bg-[var(--lm-surface)] rounded-t-[var(--lm-radius-xl)] p-6 shadow-[var(--lm-shadow-2)] z-50 border-t border-[var(--lm-border)]"
      >
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-[var(--lm-border)]">
          <h2 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">More options</h2>
          <button
            type="button"
            aria-label="Close more options"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--lm-inset)] text-[var(--lm-ink)]"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 py-2">
          {MORE_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3.5 px-4 h-12 rounded-[var(--lm-radius-md)] text-base font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--lm-accent-soft)] text-[var(--lm-ink)] font-bold'
                    : 'text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
            >
              <Icon size={20} className="text-[var(--lm-accent-strong)]" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
