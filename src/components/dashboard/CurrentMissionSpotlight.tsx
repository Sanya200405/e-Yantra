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
  Plus,
  Radio,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SpotlightProps {
  timeline: any[];
  tasks: any[];
}

export function CurrentMissionSpotlight({ timeline, tasks }: SpotlightProps) {
  // Find highest priority active task (IN_PROGRESS or NOT_STARTED with earliest due date)
  const activeTasks = (tasks || []).filter((t) => t.status !== 'COMPLETED');
  const spotlightTask = activeTasks.length > 0 ? activeTasks[0] : null;

  // Find next upcoming meeting or class session
  const nextBriefing = (timeline || []).find(
    (item) => item.type === 'MEETING' || item.type === 'CLASS'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. CURRENT ACTIVE MISSION SPOTLIGHT (7 Cols) */}
      <div className="lg:col-span-7 tech-panel p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-blue-200 dark:border-blue-900/50">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 inline-block" />
                ACTIVE MISSION OBJECTIVE
              </span>
            </div>

            {spotlightTask && (
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  spotlightTask.priority === 'HIGH' || spotlightTask.priority === 'URGENT'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
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
              {spotlightTask.description && (
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {spotlightTask.description}
                </p>
              )}

              {/* Mission Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-medium">
                    Category
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate block mt-0.5">
                    {spotlightTask.category || 'General'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-medium">
                    Assigned To
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate block mt-0.5">
                    {spotlightTask.assignedTo?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-medium">
                    Target Deadline
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm truncate block mt-0.5">
                    {spotlightTask.dueDate ? formatDate(spotlightTask.dueDate) : 'No due date'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No active tasks yet
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Your team&apos;s mission board is ready. Add your first competition task to get started.
                </p>
              </div>
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Task
              </Link>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Open Tasks Kanban Board →
          </Link>

          {spotlightTask && (
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>View Task Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. NEXT MISSION BRIEFING / MEETING (5 Cols) */}
      <div className="lg:col-span-5 tech-panel p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-purple-200 dark:border-purple-900/50">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              UPCOMING BRIEFING
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {nextBriefing?.type || 'MEETINGS'}
            </span>
          </div>

          {nextBriefing ? (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {nextBriefing.title}
              </h3>
              {nextBriefing.meta && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {nextBriefing.meta}
                </p>
              )}

              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Date
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {new Date(nextBriefing.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {nextBriefing.time && (
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Time
                    </span>
                    <span className="font-bold text-purple-800 dark:text-purple-300">
                      {nextBriefing.time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No upcoming meetings
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                  Add your team&apos;s first meeting agenda or class session.
                </p>
              </div>
              <Link
                href="/meetings"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Meeting
              </Link>
            </div>
          )}
        </div>

        {/* Briefing CTA */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/meetings"
            className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
          >
            All Meetings & Minutes →
          </Link>

          {nextBriefing && (
            <Link
              href={nextBriefing.link || '/meetings'}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Open Meeting</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
