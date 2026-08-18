'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Flag,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface TimelineEvent {
  month: string;
  title: string;
  stage: string;
  description: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  isFinale?: boolean;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    month: 'AUG',
    title: 'Team Formation & Workspace Setup',
    stage: 'Onboarding',
    description: 'Team registration, Git repository initialization, and workspace setup.',
    status: 'COMPLETED',
  },
  {
    month: 'SEP',
    title: 'Learning Phase & ROS 2 Fundamentals',
    stage: 'Foundations',
    description: 'Mastering ROS 2 nodes, topics, Linux scripting, and robot kinematics.',
    status: 'COMPLETED',
  },
  {
    month: 'OCT',
    title: 'Task 1: Simulation & Perception',
    stage: 'Stage 1',
    description: 'Gazebo simulation world launch, URDF modeling, and sensor interfacing.',
    status: 'ACTIVE',
  },
  {
    month: 'NOV',
    title: 'Task 2: Autonomous Navigation',
    stage: 'Stage 2',
    description: 'Trajectory planning, edge detection, and simulation benchmark runs.',
    status: 'UPCOMING',
  },
  {
    month: 'DEC',
    title: 'Hardware Assembly & Firmware',
    stage: 'Stage 3',
    description: 'Microcontroller flashing, motor driver tuning, and hardware integration.',
    status: 'UPCOMING',
  },
  {
    month: 'JAN',
    title: 'Arena Benchmarking & Field Runs',
    stage: 'Stage 4',
    description: 'Live physical arena obstacles, precision docking, and stress testing.',
    status: 'UPCOMING',
  },
  {
    month: 'FEB / MAR',
    title: 'Grand Finale at IIT Bombay',
    stage: 'National Finale',
    description: 'Final live arena demonstration, technical jury review, and national championship awards.',
    status: 'UPCOMING',
    isFinale: true,
  },
];

export function SeasonJourneyTimeline() {
  return (
    <div className="tech-panel p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Competition Milestones
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>e-Yantra Season Timeline</span>
            <Flag className="w-4 h-4 text-purple-600" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological journey through all official competition milestones
          </p>
        </div>

        <a
          href="https://portal.e-yantra.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
        >
          Official Rules & Dates <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Vertical Animated Timeline Flow */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-emerald-500 before:via-orange-500 before:to-purple-500">
        {TIMELINE_EVENTS.map((event, idx) => {
          const isCompleted = event.status === 'COMPLETED';
          const isActive = event.status === 'ACTIVE';

          return (
            <div key={idx} className="relative group">
              {/* Timeline Marker Beacon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-neon-emerald'
                    : isActive
                    ? 'bg-orange-500 border-orange-400 text-white shadow-neon-orange beacon-pulse'
                    : event.isFinale
                    ? 'bg-amber-400 border-amber-300 text-slate-900 shadow-neon-orange'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : event.isFinale ? (
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Event Card Content */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/80 shadow-neon-orange'
                    : isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {event.month}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      {event.stage}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : isActive
                        ? 'bg-orange-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓ COMPLETED' : isActive ? '● CURRENT PHASE' : 'UPCOMING'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
