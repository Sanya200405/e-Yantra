'use client';

import React from 'react';
import { Menu, Search, Plus, ExternalLink, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
}

export function Header({
  onToggleSidebar,
  onOpenSearch,
  onOpenQuickAction,
}: HeaderProps) {
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 text-xs transition-colors border border-slate-200/60 dark:border-slate-700/50 w-52 md:w-64 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search workspace...</span>
          <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Official e-Yantra Link Button */}
        <a
          href="https://portal.e-yantra.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-900/50 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Official Portal</span>
        </a>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light and Dark Mode"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-all duration-200 shadow-2xs"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          aria-label="Search Workspace"
          className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-medium shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Create</span>
        </button>

        {/* User initials bubble */}
        <div
          title={user?.name || 'User'}
          className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-default select-none ring-2 ring-white dark:ring-slate-900"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
