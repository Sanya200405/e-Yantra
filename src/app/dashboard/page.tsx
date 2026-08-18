'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  History,
  RefreshCw,
  ExternalLink,
  Target,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Smooth progress animation calculation
        const total = json.taskCounts?.total || 0;
        const completed = json.taskCounts?.completed || 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        setTimeout(() => setProgressWidth(pct), 150);

        if (silent) {
          toast.success('Workspace updated', 'Dashboard data synchronized with cloud database.');
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const handleUpdate = () => fetchDashboard(true);
    window.addEventListener('workspace-updated', handleUpdate);
    return () => window.removeEventListener('workspace-updated', handleUpdate);
  }, []);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  const topSection = data?.topSection;
  const taskCounts = data?.taskCounts || {
    total: 0,
    notStarted: 0,
    inProgress: 0,
    blocked: 0,
    completed: 0,
    overdue: 0,
  };
  const timeline = data?.timeline || [];
  const recentActivities = data?.recentActivities || [];
  const completionPercentage =
    taskCounts.total > 0
      ? Math.round((taskCounts.completed / taskCounts.total) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Competition Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Welcome back, {user?.name || 'Team Member'}</span>
            <span className="inline-block animate-pulse text-amber-500 text-base">✨</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            e-Yantra Robotics Competition (eYRC) Team Workspace • Project YantraHub
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            title="Refresh overview from cloud"
            aria-label="Refresh Workspace Data"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <a
            href="https://portal.e-yantra.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Official Portal
          </a>
        </div>
      </div>

      {/* Subtle Team Progress & Journey Bar */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Team Velocity & Completion
              </span>
              <span className="text-xs text-slate-300">
                {topSection?.competitionStage || 'eYRC Active Season'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {topSection?.currentTheme !== 'Not configured'
                ? `Active Theme: ${topSection?.currentTheme}`
                : 'e-Yantra Theme Exploration Phase'}
            </h2>
            <p className="text-xs text-slate-300">
              {taskCounts.total > 0
                ? `${taskCounts.completed} of ${taskCounts.total} competition tasks mastered (${completionPercentage}%)`
                : 'No competition tasks assigned yet. Add tasks from meeting action items or lecture milestones.'}
            </p>
          </div>

          <div className="w-full md:w-64 shrink-0 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Milestone Progress</span>
              <span className="text-blue-300 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Status Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="interactive-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Current Theme
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {topSection?.currentTheme || 'Not configured'}
          </p>
          <Link
            href="/themes"
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-0.5"
          >
            Manage themes →
          </Link>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Competition Stage
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {topSection?.competitionStage || 'Not configured'}
          </p>
          <Link
            href="/e-yantra"
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-0.5"
          >
            Stage details →
          </Link>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Next Deadline
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {topSection?.nextDeadline || 'Not configured'}
          </p>
          <Link
            href="/tasks"
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-0.5"
          >
            View tasks →
          </Link>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Next Class
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {topSection?.nextClass || 'Not configured'}
          </p>
          <Link
            href="/classes"
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-0.5"
          >
            Class schedule →
          </Link>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Next Team Meeting
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {topSection?.nextMeeting || 'Not configured'}
          </p>
          <Link
            href="/meetings"
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-0.5"
          >
            Meeting schedule →
          </Link>
        </div>
      </div>

      {/* Task Metrics Row (Calculated Strictly From Database) */}
      <div className="interactive-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Task Breakdown & Health
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live metrics calculated from actual workspace tasks in PostgreSQL
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open Tasks Board <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Tasks</span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {taskCounts.total}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Not Started</span>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {taskCounts.notStarted}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">In Progress</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {taskCounts.inProgress}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Blocked</span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {taskCounts.blocked}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {taskCounts.completed}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Overdue</span>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              {taskCounts.overdue}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Timeline and Recent Real Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Upcoming Timeline */}
        <div className="interactive-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Upcoming Schedule & Deadlines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological list of actual scheduled events
              </p>
            </div>
            <Link
              href="/classes"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Calendar →
            </Link>
          </div>

          {timeline.length === 0 ? (
            <div className="my-auto py-6">
              <EmptyState
                icon={Calendar}
                title="No upcoming events scheduled"
                description="Classes, team meetings, and task deadlines you add will appear here."
              />
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {timeline.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        item.type === 'CLASS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : item.type === 'MEETING'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      {item.meta && (
                        <p className="text-[11px] text-slate-400 truncate">{item.meta}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {item.time && (
                      <span className="text-[11px] text-slate-400">{item.time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Activity Log */}
        <div className="interactive-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Recent Team Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live audit trail of real workspace actions
              </p>
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <div className="my-auto py-6">
              <EmptyState
                icon={History}
                title="No activity recorded yet"
                description="Actions like task completions, meeting notes, and resource uploads will be logged here in real-time."
              />
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {act.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {act.description}
                      </p>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {act.entityType}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
