'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 3000,
    }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);

      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toast, removeToast, toasts };
}

/**
 * Simple Toast Provider component
 * Add to root layout if you want to display toasts
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg text-white pointer-events-auto ${
              toast.variant === 'destructive'
                ? 'bg-red-600'
                : toast.variant === 'success'
                  ? 'bg-green-600'
                  : 'bg-slate-900'
            }`}
          >
            <p className="font-semibold">{toast.title}</p>
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
            <button
              onClick={() => removeToast(toast.id)}
              className="mt-2 text-xs hover:underline"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
