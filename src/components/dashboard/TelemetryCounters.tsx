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

  const targetProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Smooth numeric counter animation on mount/update
  useEffect(() => {
    let current = 0;
    const duration = 1000; // ms
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
    <div className="tech-panel p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            TELEMETRY METRICS & VELOCITY
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          LIVE DATABASE FEED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Velocity % */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 tech-panel-hover">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Team Velocity</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {animatedProgress}%
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Overall Completion</span>
        </div>

        {/* 2. Tasks Mastered */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 tech-panel-hover">
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block uppercase">
            Completed
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {completed}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">of {total} total tasks</span>
        </div>

        {/* 3. In Flight (In Progress) */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 tech-panel-hover">
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 block uppercase">
            In Flight
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {inProgress}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Active Engineering</span>
        </div>

        {/* 4. Not Started */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 tech-panel-hover">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">In Queue</span>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 font-mono mt-0.5">
            {taskCounts?.notStarted || 0}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Ready for Assignment</span>
        </div>

        {/* 5. Blocked / Obstacles */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 tech-panel-hover">
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 block uppercase">
            Blocked
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {blocked}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Need Mentorship/Fix</span>
        </div>

        {/* 6. Overdue / Critical */}
        <div className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 tech-panel-hover">
          <span className="text-[10px] font-mono text-red-600 dark:text-red-400 block uppercase">
            Overdue
          </span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-0.5">
            {overdue}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Past Target Date</span>
        </div>
      </div>
    </div>
  );
}
