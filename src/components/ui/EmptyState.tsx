import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md relative overflow-hidden shadow-2xs ${className}`}
    >
      {/* Subtle Background Blueprint Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      <div className="relative z-10 w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 shadow-xs">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h3 className="relative z-10 text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="relative z-10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-md mb-4 leading-relaxed font-medium">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-neon-blue transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
