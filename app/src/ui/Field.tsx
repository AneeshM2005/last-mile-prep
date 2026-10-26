/**
 * Field.tsx – Accessible text input and textarea form fields.
 * design.md 7.4.
 * 52px high input (min 96px for textarea), 1.5px border-strong, surface fill, 16px text.
 * Label above (text.body-strong), helper below (text.small, muted).
 * Error state: notice-bg fill, notice-text with AlertCircle, aria-invalid, aria-describedby.
 * Optional character counter with maxlength.
 */
import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TextInputProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input';
  maxLength?: number;
  showCharCount?: boolean;
}

interface TextareaProps extends BaseFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export type FieldProps = TextInputProps | TextareaProps;

export function Field(props: FieldProps): React.ReactElement {
  const generatedId = useId();
  const id = props.id || generatedId;
  const helperId = props.helper ? `${id}-helper` : undefined;
  const errorId = props.error ? `${id}-error` : undefined;

  const {
    label,
    helper,
    error,
    required,
    disabled,
    className = '',
    maxLength,
    showCharCount,
    as = 'input',
    value,
    ...rest
  } = props;

  const currentLength = typeof value === 'string' ? value.length : 0;

  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const baseInputStyles = [
    'w-full px-4 text-base rounded-[var(--lm-radius-md)] border-[1.5px] transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[var(--lm-focus)] focus:ring-offset-2',
    error
      ? 'bg-[var(--lm-notice-bg)] text-[var(--lm-notice-text)] border-[var(--lm-notice-text)]'
      : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border-strong)] hover:border-[var(--lm-ink)] focus:border-[var(--lm-ink)]',
    disabled ? 'opacity-45 border-dashed cursor-not-allowed' : '',
  ].join(' ');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-body-strong text-[var(--lm-ink)]">
          {label}
          {required && <span className="ml-1 text-[var(--lm-notice-text)]" aria-hidden="true">*</span>}
        </label>
        {showCharCount && maxLength !== undefined && (
          <span aria-live="off" className="text-small text-[var(--lm-text-muted)] font-mono">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>

      {as === 'textarea' ? (
        <textarea
          id={id}
          rows={(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>).rows || 3}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${baseInputStyles} py-3 min-h-[96px] resize-y`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          type="text"
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${baseInputStyles} h-[52px]`}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
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
