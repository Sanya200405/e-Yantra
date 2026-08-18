'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  RefreshCw,
  Plus,
  Radio,
  Cpu,
  Target,
  Sparkles,
  Zap,
  Bot,
  Activity,
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
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/25 shadow-2xl p-6 sm:p-8">
      {/* Background Circuit Grid & Glow Accents */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Beacon Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-900/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-[11px] font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse inline-block" />
            TELEMETRY: ON TRACK
          </span>
          <span className="hidden sm:inline font-mono text-slate-400 text-[11px]">
            SYS://EYRC-MISSION-CONTROL • {topSection?.competitionStage || 'STAGE 1: SIMULATION'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Synchronize Live Telemetry"
            aria-label="Refresh telemetry data"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Sync Telemetry</span>
          </button>

          <a
            href="https://portal.e-yantra.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-neon-orange transition-all active:scale-95"
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
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-orange-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>e-Yantra Robotics Competition (eYRC)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Team Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Welcome back, <span className="text-white font-semibold">{user?.name || 'Engineer'}</span>. Real-time telemetry, robotics simulation roadmap, hardware logs, and mission velocity for your eYRC project.
            </p>
          </div>

          {/* Key Mission Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Theme</span>
              <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {topSection?.currentTheme || 'Theme Exploration'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Next Deadline</span>
              <p className="text-xs sm:text-sm font-bold text-amber-300 truncate mt-0.5">
                {topSection?.nextDeadline || 'All tasks cleared'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Next Mission Sync</span>
              <p className="text-xs sm:text-sm font-bold text-cyan-300 truncate mt-0.5">
                {topSection?.nextMeeting || topSection?.nextClass || 'No scheduled sync'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Robotics Telemetry Orb & SVG Autonomous Bot Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 backdrop-blur-md relative overflow-hidden">
          {/* Animated SVG Autonomous Rover / Bot Telemetry Visual */}
          <div className="relative w-full max-w-[280px] h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 300 160"
              className="w-full h-full text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ground Grid lines */}
              <line x1="20" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2="260" y2="150" stroke="#1e293b" strokeWidth="1" />

              {/* Bot Chassis */}
              <rect x="75" y="65" width="150" height="50" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              
              {/* Internal Circuit Lines */}
              <path d="M90 90 H130 V75 H170 V105 H210" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
              
              {/* Wheels */}
              <circle cx="95" cy="120" r="18" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
              <circle cx="95" cy="120" r="6" fill="#38bdf8" />
              <circle cx="205" cy="120" r="18" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
              <circle cx="205" cy="120" r="6" fill="#38bdf8" />

              {/* Lidar / Sensor Mast */}
              <rect x="135" y="38" width="30" height="27" rx="4" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="150" cy="28" r="10" fill="#1e293b" stroke="#fb923c" strokeWidth="2" />
              <circle cx="150" cy="28" r="4" fill="#f97316" className="animate-pulse" />

              {/* Lidar Scan Sweep Cone */}
              <path
                d="M150 28 L270 5 L285 55 Z"
                fill="url(#lidar-gradient)"
                opacity="0.35"
                className="animate-pulse"
              />

              {/* Status LEDs */}
              <circle cx="85" cy="78" r="3" fill="#10b981" className="animate-ping" />
              <circle cx="85" cy="78" r="2.5" fill="#10b981" />
              <circle cx="97" cy="78" r="2.5" fill="#3b82f6" />
              <circle cx="109" cy="78" r="2.5" fill="#f59e0b" />

              <defs>
                <linearGradient id="lidar-gradient" x1="150" y1="28" x2="280" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Velocity Progress Dial Indicator */}
          <div className="w-full pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                MISSION COMPLETION
              </span>
              <span className="text-emerald-400 font-bold">{completionPct}% MASTERED</span>
            </div>
            
            <div className="w-full h-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400 text-center font-mono">
              {total > 0 ? `${completed} of ${total} core competition tasks finalized` : 'Ready to initialize season tasks'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
