'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Cpu,
  TrendingUp,
  Target,
  AlertTriangle,
  Flame,
  Layers,
} from 'lucide-react';

interface TelemetryProps {
  taskCounts: {
    total: number;
    notStarted: number;
    inProgress: number;
    blocked: number;
    completed: number;
    overdue: number;
  };
}

export function TelemetryCounters({ taskCounts }: TelemetryProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const total = taskCounts?.total || 0;
  const completed = taskCounts?.completed || 0;
  const inProgress = taskCounts?.inProgress || 0;
  const blocked = taskCounts?.blocked || 0;
  const overdue = taskCounts?.overdue || 0;
  const notStarted = taskCounts?.notStarted || 0;

  const targetProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Smooth numeric counter animation on mount/update
  useEffect(() => {
    if (targetProgress === 0) {
      setAnimatedProgress(0);
      return;
    }
    let current = 0;
    const duration = 800; // ms
    const stepTime = 20; // ms
    const totalSteps = duration / stepTime;
    const increment = targetProgress / totalSteps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetProgress) {
        setAnimatedProgress(targetProgress);
        clearInterval(timer);
      } else {
        setAnimatedProgress(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetProgress]);

  return (
    <div className="tech-panel p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            TELEMETRY METRICS & VELOCITY
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          LIVE DATABASE STATS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Velocity % */}
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-blue-800 dark:text-blue-300 block uppercase">
            Team Velocity
          </span>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono mt-1">
            {animatedProgress}%
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            Overall Completion
          </span>
        </div>

        {/* 2. Tasks Mastered */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
            Completed
          </span>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            {completed}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            of {total} total tasks
          </span>
        </div>

        {/* 3. In Flight (In Progress) */}
        <div className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-cyan-800 dark:text-cyan-300 block uppercase">
            In Flight
          </span>
          <p className="text-3xl font-black text-cyan-700 dark:text-cyan-400 font-mono mt-1">
            {inProgress}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            Active Tasks
          </span>
        </div>

        {/* 4. Not Started */}
        <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block uppercase">
            In Queue
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
            {notStarted}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            Not Started
          </span>
        </div>

        {/* 5. Blocked / Obstacles */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 block uppercase">
            Blocked
          </span>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
            {blocked}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            Need Resolution
          </span>
        </div>

        {/* 6. Overdue / Critical */}
        <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 tech-panel-hover">
          <span className="text-[11px] font-mono font-bold text-red-800 dark:text-red-300 block uppercase">
            Overdue
          </span>
          <p className="text-3xl font-black text-red-700 dark:text-red-400 font-mono mt-1">
            {overdue}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 block mt-1 font-medium">
            Past Due Date
          </span>
        </div>
      </div>
    </div>
  );
}
