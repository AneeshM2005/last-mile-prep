/**
 * BottomBar.tsx – 5-slot mobile bottom navigation bar.
 * design.md 4, 7.8.
 * 64px high + safe-area padding. Slots: Home, Practice, Mock, Revision, More.
 * Active slot: ink icon with 3px accent underline and bold label.
 */
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { House, Target, ClipboardList, RefreshCw, Ellipsis } from 'lucide-react';
import { MoreSheet } from './MoreSheet';

export function BottomBar(): React.ReactElement {
  const [moreOpen, setMoreOpen] = useState(false);

  const mainSlots = [
    { to: '/', label: 'Home', Icon: House, end: true },
    { to: '/practice', label: 'Practice', Icon: Target, end: false },
    { to: '/mock', label: 'Mock', Icon: ClipboardList, end: false },
    { to: '/revision', label: 'Revision', Icon: RefreshCw, end: false },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--lm-sidebar)] border-t border-[var(--lm-border)] px-2 flex items-center justify-around z-20 pb-[env(safe-area-inset-bottom)]"
      >
        {mainSlots.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'relative flex flex-col items-center justify-center min-w-[56px] h-full transition-colors',
                'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                isActive
                  ? 'text-[var(--lm-ink)] font-bold'
                  : 'text-[var(--lm-text-muted)] hover:text-[var(--lm-ink)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} aria-hidden="true" className="shrink-0" />
                <span className="text-caption mt-0.5">{label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 w-6 h-[3px] bg-[var(--lm-accent)] rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* More slot */}
        <button
          type="button"
          aria-label="More navigation links"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] h-full text-[var(--lm-text-muted)] hover:text-[var(--lm-ink)] cursor-pointer"
        >
          <Ellipsis size={20} aria-hidden="true" className="shrink-0" />
          <span className="text-caption mt-0.5">More</span>
        </button>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
