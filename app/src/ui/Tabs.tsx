/**
 * Tabs.tsx – Accessible underline tabs.
 * design.md 7.16.
 * 48px high, active = ink text + 3px accent underline + bold.
 * role="tablist", arrow keys navigate, Home/End jump.
 */
import React, { useRef, useCallback } from 'react';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  ariaLabel = 'Sections',
}: TabsProps): React.ReactElement {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex >= 0) {
        e.preventDefault();
        const target = tabRefs.current[targetIndex];
        target?.focus();
        onChange(tabs[targetIndex].id);
      }
    },
    [tabs, onChange]
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-6 border-b border-[var(--lm-border)] overflow-x-auto ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={[
              'relative h-12 px-1 text-base transition-colors shrink-0 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
              isActive
                ? 'font-bold text-[var(--lm-ink)]'
                : 'font-normal text-[var(--lm-text-muted)] hover:text-[var(--lm-ink)]',
            ].join(' ')}
          >
            {tab.label}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--lm-accent)] rounded-t-sm"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
