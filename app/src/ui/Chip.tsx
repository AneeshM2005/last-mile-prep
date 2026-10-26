/**
 * Chip.tsx – choice (single), filter (multi), school variants.
 * Keyboard: arrow keys within a radiogroup. design.md 7.2.
 */
import React, { useRef, useCallback } from 'react';
import { Check } from 'lucide-react';

interface ChipOption {
  id: string;
  label: string;
  thumbnail?: string; // optional 40px image URL for school chips
}

interface ChipGroupProps {
  options: ChipOption[];
  value: string | string[];           // string for choice, string[] for multi
  onChange: (value: string | string[]) => void;
  variant?: 'choice' | 'filter' | 'school';
  label: string;                      // group label for aria
  disabled?: boolean;
  maxSelect?: number;                 // for school: max 3
}

export function ChipGroup({
  options,
  value,
  onChange,
  variant = 'choice',
  label,
  disabled = false,
  maxSelect,
}: ChipGroupProps): React.ReactElement {
  const isMulti = variant === 'filter' || variant === 'school';
  const selected = isMulti ? (value as string[]) : [];
  const singleSelected = !isMulti ? (value as string) : '';

  const containerRef = useRef<HTMLDivElement>(null);

  const isSelected = useCallback(
    (id: string) => (isMulti ? selected.includes(id) : singleSelected === id),
    [isMulti, selected, singleSelected]
  );

  function toggle(id: string) {
    if (disabled) return;
    if (!isMulti) {
      onChange(id);
      return;
    }
    const cur = selected as string[];
    if (cur.includes(id)) {
      onChange(cur.filter((v) => v !== id));
    } else {
      if (maxSelect && cur.length >= maxSelect) return;
      onChange([...cur, id]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!isMulti) {
      // Arrow key navigation for radiogroup
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % options.length;
        const btn = containerRef.current?.querySelectorAll<HTMLButtonElement>('button')[next];
        btn?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + options.length) % options.length;
        const btn = containerRef.current?.querySelectorAll<HTMLButtonElement>('button')[prev];
        btn?.focus();
      }
    }
  }

  return (
    <div
      ref={containerRef}
      role={isMulti ? 'group' : 'radiogroup'}
      aria-label={label}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt, index) => {
        const sel = isSelected(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            role={isMulti ? 'checkbox' : 'radio'}
            aria-checked={sel}
            disabled={disabled}
            tabIndex={isMulti ? 0 : sel ? 0 : -1}
            onClick={() => toggle(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              'inline-flex items-center gap-1.5 h-10 px-3 rounded-[var(--lm-radius-pill)]',
              'text-body-strong cursor-pointer min-h-[44px] min-w-[44px]',
              'transition-colors duration-[var(--lm-dur-fast)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
              sel
                ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)]'
                : 'bg-[var(--lm-surface)] border-[1.5px] border-[var(--lm-border-strong)]',
              !sel && !disabled ? 'hover:bg-[var(--lm-inset)]' : '',
              disabled ? 'opacity-45 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {sel && <Check size={16} aria-hidden="true" />}
            {variant === 'school' && opt.thumbnail && (
              <img
                src={opt.thumbnail}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
                aria-hidden="true"
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
