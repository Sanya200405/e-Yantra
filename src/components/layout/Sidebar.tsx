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
  Radio,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const navItems = [
  { name: 'Mission Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Class Schedule', href: '/classes', icon: Calendar },
  { name: 'Team Meetings', href: '/meetings', icon: Users2 },
  { name: 'Tasks Board', href: '/tasks', icon: CheckSquare },
  { name: 'Lectures Library', href: '/lectures', icon: Video },
  { name: 'Notes & Specs', href: '/notes', icon: FileText },
  { name: 'Self Study Track', href: '/self-study', icon: GraduationCap },
  { name: 'Git Repository', href: '/git', icon: GitBranch },
  { name: 'Tech Stack', href: '/tech-stack', icon: Layers },
  { name: 'Hardware Lab', href: '/hardware', icon: Cpu },
  { name: 'Themes', href: '/themes', icon: Sparkles },
  { name: 'Resource Vault', href: '/resources', icon: Bookmark },
  { name: 'e-Yantra Hub', href: '/e-yantra', icon: Compass },
  { name: 'Settings & Backups', href: '/settings', icon: Settings },
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-orange-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-neon-orange transition-transform group-hover:scale-105">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 font-mono">
                YantraHub
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  eYRC
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                MISSION CONTROL
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Item Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Workspace Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {/* Active Indicator Pillar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500 shadow-neon-blue" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Identity & System Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Engineer'}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  {isAdmin ? (
                    <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <User className="w-2.5 h-2.5" /> Team Member
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout from session"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
