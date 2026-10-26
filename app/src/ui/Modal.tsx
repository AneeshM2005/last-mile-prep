/**
 * Modal.tsx – accessible dialog overlay.
 * Traps focus, closes on Escape, uses role=dialog + aria-modal.
 * design.md 7.7.
 */
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  id: string;
}

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({ open, onClose, title, description, children, id }: ModalProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;
  const descId = description ? `${id}-desc` : undefined;

  // Trap focus
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Focus the first element
    first?.focus();

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', trapTab);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', trapTab);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={[
        'fixed inset-0 z-[var(--lm-z-modal)]',
        'flex items-end sm:items-center justify-center p-4',
      ].join(' ')}
      aria-modal="true"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[var(--lm-scrim)] opacity-60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={[
          'relative z-10 w-full max-w-[480px]',
          'bg-[var(--lm-surface)] rounded-[var(--lm-radius-xl)] p-6 shadow-[var(--lm-shadow-2)]',
          'animate-[slideUp_200ms_var(--lm-ease-out)]',
        ].join(' ')}
        style={{ animation: 'slideUp 200ms var(--lm-ease-out)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id={titleId} className="text-h3 text-[var(--lm-ink)]">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={[
              '-mt-1 -mr-2 p-1 rounded-md cursor-pointer',
              'hover:bg-[var(--lm-inset)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] focus-visible:outline-offset-2',
            ].join(' ')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {description && (
          <p id={descId} className="text-body text-[var(--lm-text-muted)] mb-4">{description}</p>
        )}
        {children}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes slideUp { from { opacity:0; } to { opacity:1; } }
        }
      `}</style>
    </div>
  );
}
