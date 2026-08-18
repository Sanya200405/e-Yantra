'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
    loading: (title: string, description?: string) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (type !== 'loading' && duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (title: string, description?: string) => addToast('success', title, description),
    error: (title: string, description?: string) => addToast('error', title, description, 5000),
    info: (title: string, description?: string) => addToast('info', title, description),
    loading: (title: string, description?: string) => addToast('loading', title, description, 0),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 flex items-start gap-3 transform translate-y-0 opacity-100 ${
              t.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : t.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                : t.type === 'loading'
                ? 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                : 'bg-slate-50/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
              {t.type === 'loading' && <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{t.title}</p>
              {t.description && (
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
