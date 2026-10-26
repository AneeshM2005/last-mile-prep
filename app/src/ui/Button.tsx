/**
 * Button.tsx – primary, primary-arrow, secondary, ghost, quiet-danger
 * One primary button per screen (design 7.1). No red anywhere.
 */
import React from 'react';
import { Loader, ArrowRight } from 'lucide-react';

type ButtonVariant = 'primary' | 'primary-arrow' | 'secondary' | 'ghost' | 'quiet-danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled ?? loading;

  const base = [
    'inline-flex items-center justify-center gap-2',
    'text-body-strong rounded-[var(--lm-radius-pill)]',
    'min-h-[44px] px-5 cursor-pointer',
    'transition-all duration-[var(--lm-dur-fast)]',
    'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
    'active:scale-[0.98]',
    isDisabled ? 'opacity-45 cursor-not-allowed border border-dashed border-[var(--lm-border-strong)]' : '',
  ].join(' ');

  const variants: Record<ButtonVariant, string> = {
    'primary': [
      'bg-[var(--lm-ink)] text-white h-12',
      !isDisabled ? 'hover:bg-black' : '',
    ].join(' '),

    'primary-arrow': [
      'bg-[var(--lm-ink)] text-white h-12 pr-2',
      !isDisabled ? 'hover:bg-black group' : '',
    ].join(' '),

    'secondary': [
      'bg-[var(--lm-btn-secondary)] text-[var(--lm-ink)] h-12',
      !isDisabled ? 'hover:bg-[var(--lm-btn-secondary-hover)]' : '',
    ].join(' '),

    'ghost': [
      'bg-transparent text-[var(--lm-accent-strong)] underline-offset-2 h-12 px-2',
      !isDisabled ? 'hover:underline' : '',
    ].join(' '),

    'quiet-danger': [
      'bg-[var(--lm-btn-secondary)] text-[var(--lm-ink)] h-12',
      !isDisabled ? 'hover:bg-[var(--lm-btn-secondary-hover)]' : '',
    ].join(' '),
  };

  return (
    <button
      type="button"
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          {children}
          <Loader size={16} aria-hidden="true" />
        </>
      ) : variant === 'primary-arrow' ? (
        <>
          {children}
          <span
            className={[
              'ml-1 inline-flex items-center justify-center',
              'w-8 h-8 rounded-full bg-white',
              'transition-transform duration-[var(--lm-dur-fast)]',
              !isDisabled ? 'group-hover:translate-x-0.5' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            <ArrowRight size={16} className="text-[var(--lm-ink)]" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
