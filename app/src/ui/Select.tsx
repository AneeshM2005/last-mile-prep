/**
 * Select.tsx – Native <select> styled to match inputs with ChevronDown icon.
 * design.md 7.5.
 * If "Other" option is selected, an optional secondary text input appears below (max 40 chars).
 */
import React, { useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: SelectOption[];
  helper?: string;
  error?: string;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
  className?: string;
}

export function Select({
  label,
  options,
  helper,
  error,
  value,
  onChange,
  disabled,
  required,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Please specify (max 40 chars)',
  className = '',
  id: explicitId,
  ...rest
}: SelectProps): React.ReactElement {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const isOtherSelected = value === 'Other' || value === 'other';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-body-strong text-[var(--lm-ink)]">
        {label}
        {required && <span className="ml-1 text-[var(--lm-notice-text)]" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'w-full h-[52px] pl-4 pr-10 text-base appearance-none bg-[var(--lm-surface)]',
            'rounded-[var(--lm-radius-md)] border-[1.5px] transition-colors cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[var(--lm-focus)] focus:ring-offset-2',
            error
              ? 'bg-[var(--lm-notice-bg)] text-[var(--lm-notice-text)] border-[var(--lm-notice-text)]'
              : 'text-[var(--lm-ink)] border-[var(--lm-border-strong)] hover:border-[var(--lm-ink)] focus:border-[var(--lm-ink)]',
            disabled ? 'opacity-45 border-dashed cursor-not-allowed' : '',
          ].join(' ')}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--lm-ink)]"
        >
          <ChevronDown size={20} />
        </span>
      </div>

      {isOtherSelected && onOtherChange && (
        <div className="mt-1">
          <input
            type="text"
            maxLength={40}
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            aria-label={`${label} details`}
            className={[
              'w-full h-[44px] px-3.5 text-base rounded-[var(--lm-radius-md)] border-[1.5px]',
              'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border-strong)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--lm-focus)] focus:ring-offset-2',
            ].join(' ')}
          />
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-small text-[var(--lm-notice-text)] m-0">
          <AlertCircle size={16} aria-hidden="true" className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p id={helperId} className="text-small text-[var(--lm-text-muted)] m-0">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
