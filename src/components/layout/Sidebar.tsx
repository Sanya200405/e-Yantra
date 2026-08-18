'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users2,
  CheckSquare,
  Video,
  FileText,
  GraduationCap,
  GitBranch,
  Cpu,
  Layers,
  Sparkles,
  Bookmark,
  Compass,
  Settings,
  Bot,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Class Schedule', href: '/classes', icon: Calendar },
  { name: 'Team Meetings', href: '/meetings', icon: Users2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Lectures', href: '/lectures', icon: Video },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Self Study', href: '/self-study', icon: GraduationCap },
  { name: 'Git Repository', href: '/git', icon: GitBranch },
  { name: 'Tech Stack', href: '/tech-stack', icon: Layers },
  { name: 'Hardware', href: '/hardware', icon: Cpu },
  { name: 'Themes', href: '/themes', icon: Sparkles },
  { name: 'Resources', href: '/resources', icon: Bookmark },
  { name: 'e-Yantra', href: '/e-yantra', icon: Compass },
  { name: 'Settings / Admin', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                e-Yantra <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">eYRC</span>
              </span>
              <p className="text-[11px] text-slate-400">Team Workspace</p>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
                {item.href === '/e-yantra' && (
                  <span className="ml-auto text-[9px] font-bold px-1 py-0.2 rounded bg-orange-500/30 text-orange-300">
                    HUB
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Footer Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Team Member'}</p>
                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Team Member</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
