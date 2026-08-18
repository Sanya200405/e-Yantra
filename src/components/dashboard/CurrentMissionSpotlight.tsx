'use client';

import React from 'react';
import Link from 'next/link';
import {
  Target,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Video,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  CheckSquare,
  Radio,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SpotlightProps {
  timeline: any[];
  tasks: any[];
  onTaskCompleted?: (taskId: string) => void;
}

export function CurrentMissionSpotlight({ timeline, tasks, onTaskCompleted }: SpotlightProps) {
  // Find highest priority active task (IN_PROGRESS or NOT_STARTED with earliest due date)
  const activeTasks = (tasks || []).filter((t) => t.status !== 'COMPLETED');
  const spotlightTask = activeTasks.length > 0 ? activeTasks[0] : null;

  // Find next upcoming meeting / class session
  const nextBriefing = (timeline || []).find(
    (item) => item.type === 'MEETING' || item.type === 'CLASS'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. CURRENT ACTIVE MISSION SPOTLIGHT (7 Cols) */}
      <div className="lg:col-span-7 tech-panel p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-blue-500/30">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                ACTIVE MISSION OBJECTIVE
              </span>
            </div>

            {spotlightTask && (
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  spotlightTask.priority === 'HIGH' || spotlightTask.priority === 'URGENT'
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {spotlightTask.priority} PRIORITY
              </span>
            )}
          </div>

          {spotlightTask ? (
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {spotlightTask.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {spotlightTask.description || 'Core technical milestone for current competition deliverable.'}
              </p>

              {/* Mission Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {spotlightTask.category || 'Simulation'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Assigned To</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {spotlightTask.assignedTo?.name || 'Whole Team'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Target Deadline</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 truncate block mt-0.5">
                    {spotlightTask.dueDate ? formatDate(spotlightTask.dueDate) : 'Open Season'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All Active Missions Completed!
              </p>
              <p className="text-xs text-slate-400">
                Create new competition milestones from your Tasks Kanban board.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Open Mission Kanban Board →
          </Link>

          {spotlightTask && (
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-neon-blue transition-all active:scale-95"
            >
              <span>Execute Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. NEXT MISSION BRIEFING / LIVE SYNC (5 Cols) */}
      <div className="lg:col-span-5 tech-panel p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-purple-500/30">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              UPCOMING MISSION BRIEFING
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {nextBriefing?.type || 'TEAM SYNC'}
            </span>
          </div>

          {nextBriefing ? (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {nextBriefing.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {nextBriefing.meta || 'Internal strategy alignment, task distribution, and robotics debugging.'}
              </p>

              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Date
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(nextBriefing.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {nextBriefing.time && (
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Time
                    </span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {nextBriefing.time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Users className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Briefings Scheduled
              </p>
              <p className="text-xs text-slate-400">
                Schedule your next sprint review or mentorship call.
              </p>
            </div>
          )}
        </div>

        {/* Briefing CTA */}
        <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/meetings"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            All Meetings & Minutes →
          </Link>

          <Link
            href="/meetings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Briefing Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
