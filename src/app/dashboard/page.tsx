'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HeroMissionControl } from '@/components/dashboard/HeroMissionControl';
import { MissionJourneyRoadmap } from '@/components/dashboard/MissionJourneyRoadmap';
import { CurrentMissionSpotlight } from '@/components/dashboard/CurrentMissionSpotlight';
import { TelemetryCounters } from '@/components/dashboard/TelemetryCounters';
import { SeasonJourneyTimeline } from '@/components/dashboard/SeasonJourneyTimeline';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { History, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [dashRes, taskRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/tasks'),
      ]);

      if (dashRes.ok) {
        const json = await dashRes.json();
        setData(json);
      }

      if (taskRes.ok) {
        const taskJson = await taskRes.json();
        setTasks(taskJson);
      }

      if (silent) {
        toast.success('Telemetry Synced ✓', 'Live database records updated.');
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

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* 1. HERO MISSION CONTROL BANNER */}
      <HeroMissionControl
        user={user}
        topSection={topSection}
        taskCounts={taskCounts}
        loading={loading}
        onRefresh={() => fetchDashboard(true)}
      />

      {/* 2. TELEMETRY STATS STRIP */}
      <TelemetryCounters taskCounts={taskCounts} />

      {/* 3. GAMIFIED 5-STAGE MISSION JOURNEY */}
      <MissionJourneyRoadmap tasks={tasks} competitionStage={topSection?.competitionStage} />

      {/* 4. CURRENT ACTIVE MISSION & NEXT BRIEFING SPOTLIGHT */}
      <CurrentMissionSpotlight timeline={timeline} tasks={tasks} />

      {/* 5. SEASON TIMELINE & LIVE AUDIT TRAIL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Season Roadmap (7 Cols) */}
        <div className="lg:col-span-7">
          <SeasonJourneyTimeline competitionStage={topSection?.competitionStage} />
        </div>

        {/* Real-time Team Activity Log (5 Cols) */}
        <div className="lg:col-span-5 tech-panel p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Audit Feed
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">TELEMETRY STREAM</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recent Team Activity
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Live audit trail of real workspace contributions and milestone completions
            </p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Telemetry feed waiting for actions</p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 max-h-[420px] overflow-y-auto pr-1">
              {recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                      {act.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        {act.entityType}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
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
