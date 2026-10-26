/**
 * SidebarNav.tsx – Full-height left desktop sidebar navigation.
 * design.md 4, 7.8.
 * 248px wide, paper-toned --color-sidebar.
 * Wordmark at top, centered nav items, Prototype badge & Demo date at bottom.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Target,
  ClipboardList,
  RefreshCw,
  BookOpen,
  UserRound,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { Badge } from './Badge';
import { useAppContext } from '../app/providers';
import { appClock } from '../domain/appClock';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/practice', label: 'Practice', Icon: Target, end: false },
  { to: '/mock', label: 'Mock analysis', Icon: ClipboardList, end: false },
  { to: '/revision', label: 'Revision', Icon: RefreshCw, end: false },
  { to: '/words', label: 'Words', Icon: BookOpen, end: false },
  { to: '/profile', label: 'My profile', Icon: UserRound, end: false },
  { to: '/omet', label: 'OMET', Icon: Compass, end: false },
  { to: '/feedback', label: 'Feedback', Icon: MessageSquare, end: false },
];

export function SidebarNav(): React.ReactElement {
  const { config } = useAppContext();
  const brandName = config?.app.brand.name || 'Last Mile';
  const isDemo = appClock.isSimulated();

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden lg:flex flex-col justify-between w-[248px] h-screen sticky top-0 shrink-0 bg-[var(--lm-sidebar)] border-r border-[var(--lm-border)] px-4 py-6 z-20"
    >
      {/* Top: Wordmark */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="font-bold text-xl tracking-tight text-[var(--lm-ink)] font-sans">
          {brandName}
        </span>
      </div>

      {/* Middle: Centred Nav */}
      <nav aria-label="Main" className="flex flex-col gap-1.5 my-auto">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3.5 px-4 h-12 rounded-[var(--lm-radius-pill)] transition-all font-medium text-base select-none',
                'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
                isActive
                  ? 'bg-[var(--lm-ink)] text-white font-semibold shadow-sm'
                  : 'text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} aria-hidden="true" className={isActive ? 'text-white' : 'text-[var(--lm-accent-strong)]'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Demo chip & Prototype badge */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[var(--lm-border)] px-2">
        {isDemo && (
          <Badge variant="simulation" label={`Demo: ${appClock.today()}`} />
        )}
        <span className="text-caption text-[var(--lm-text-muted)] font-medium">
          Prototype · sample content
        </span>
      </div>
    </aside>
  );
}
