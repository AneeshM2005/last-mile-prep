/**
 * Toast.tsx – Lightweight transient notification toast.
 * design.md 7.15.
 * Bottom-centre (above mobile navigation), surface fill, shadow-2, role="status".
 * Auto-dismisses in 4 seconds.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastItem {
  id: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-[360px] px-4 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItemComponent key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto flex items-center justify-between px-4 py-3 rounded-[var(--lm-radius-md)]',
        'bg-[var(--lm-surface)] text-[var(--lm-ink)] border border-[var(--lm-border)]',
        'shadow-[var(--lm-shadow-2)] text-body font-medium',
      ].join(' ')}
    >
      <span>{toast.message}</span>
    </div>
  );
}
