'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  RefreshCw,
  Zap,
  Bot,
  Sparkles,
  Radio,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface HeroProps {
  user: any;
  topSection: any;
  taskCounts: {
    total: number;
    notStarted: number;
    inProgress: number;
    blocked: number;
    completed: number;
    overdue: number;
  };
  loading: boolean;
  onRefresh: () => void;
}

export function HeroMissionControl({
  user,
  topSection,
  taskCounts,
  loading,
  onRefresh,
}: HeroProps) {
  const total = taskCounts?.total || 0;
  const completed = taskCounts?.completed || 0;
  const inProgress = taskCounts?.inProgress || 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasData = total > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800/90 shadow-2xl p-6 sm:p-8">
      {/* Background Circuit Grid & Subtle Ambient Glow */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold tracking-wide border ${
              hasData
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                hasData ? 'bg-emerald-400 beacon-pulse' : 'bg-amber-400'
              }`}
            />
            {hasData ? 'TELEMETRY: ACTIVE' : 'TELEMETRY: AWAITING TASKS'}
          </span>
          <span className="hidden sm:inline font-mono text-slate-300 text-xs">
            SYS://EYRC-COMMAND-HUB • {topSection?.competitionStage || 'Registration Phase'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            title="Synchronize Live Telemetry"
            aria-label="Refresh telemetry data"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Sync Telemetry</span>
          </button>

          <a
            href="https://portal.e-yantra.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-subtle-blue transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>e-Yantra Portal</span>
          </a>
        </div>
      </div>

      {/* Main Hero Split Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        {/* Left Column: Team Mission Statement & Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>e-Yantra Robotics Competition (eYRC)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Team Command Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Welcome back, <span className="text-white font-bold">{user?.name || 'Team Engineer'}</span>. 
              {hasData
                ? ` Real-time telemetry, robotics simulation roadmap, hardware inventory logs, and mission velocity for your eYRC project.`
                : ` Workspace initialized. Add competition tasks, meeting agendas, and hardware components to begin tracking team velocity.`}
            </p>
          </div>

          {/* Key Mission Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase font-medium">
                Active Theme
              </span>
              <p className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                {topSection?.currentTheme || 'Not configured'}
              </p>
              <Link
                href="/themes"
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
              >
                Configure theme →
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase font-medium">
                Next Deadline
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-300 truncate mt-1">
                {topSection?.nextDeadline || 'No active deadlines'}
              </p>
              <Link
                href="/tasks"
                className="text-[11px] font-medium text-amber-400 hover:text-amber-300 underline mt-1 inline-block"
              >
                View tasks →
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono text-slate-400 block uppercase font-medium">
                Next Meeting / Class
              </span>
              <p className="text-xs sm:text-sm font-bold text-cyan-300 truncate mt-1">
                {topSection?.nextMeeting || topSection?.nextClass || 'None scheduled'}
              </p>
              <Link
                href="/meetings"
                className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline mt-1 inline-block"
              >
                Schedule sync →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Robotics Telemetry Dial & SVG Autonomous Bot Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          {/* Animated SVG Autonomous Rover / Bot Telemetry Visual */}
          <div className="relative w-full max-w-[280px] h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 300 160"
              className="w-full h-full text-blue-400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ground Grid lines */}
              <line x1="20" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2="260" y2="150" stroke="#1e293b" strokeWidth="1" />

              {/* Bot Chassis */}
              <rect x="75" y="65" width="150" height="50" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              
              {/* Internal Circuit Lines */}
              <path d="M90 90 H130 V75 H170 V105 H210" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" className="animate-circuit-pulse" />
              
              {/* Wheels */}
              <circle cx="95" cy="120" r="18" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
              <circle cx="95" cy="120" r="6" fill="#38bdf8" />
              <circle cx="205" cy="120" r="18" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
              <circle cx="205" cy="120" r="6" fill="#38bdf8" />

              {/* Lidar Mast */}
              <rect x="135" y="38" width="30" height="27" rx="4" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="150" cy="28" r="10" fill="#1e293b" stroke="#fb923c" strokeWidth="2" />
              <circle cx="150" cy="28" r="4" fill="#f97316" className="animate-beacon-blink" />

              {/* Lidar Scan Sweep Cone */}
              <path
                d="M150 28 L270 5 L285 55 Z"
                fill="url(#lidar-gradient)"
                opacity="0.35"
              />

              {/* Status LEDs */}
              <circle cx="85" cy="78" r="3" fill="#10b981" className="animate-pulse" />
              <circle cx="85" cy="78" r="2" fill="#10b981" />
              <circle cx="97" cy="78" r="2" fill="#3b82f6" />
              <circle cx="109" cy="78" r="2.5" fill="#f59e0b" />

              <defs>
                <linearGradient id="lidar-gradient" x1="150" y1="28" x2="280" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Velocity Progress Dial Indicator (Real Data Only) */}
          <div className="w-full pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Bot className="w-4 h-4 text-blue-400" />
                TEAM PROGRESS
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                {hasData ? `${completionPct}% COMPLETED` : 'NOT STARTED (0%)'}
              </span>
            </div>
            
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-400 text-center font-mono">
              {hasData
                ? `${completed} of ${total} tasks completed (${inProgress} in progress)`
                : 'No tasks logged yet. Create your first task to start tracking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
