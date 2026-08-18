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

interface TimelineProps {
  competitionStage?: string;
}

export function SeasonJourneyTimeline({ competitionStage = 'Registration / Theme Selection' }: TimelineProps) {
  const stageLower = competitionStage.toLowerCase();

  const events = [
    {
      month: 'AUG - SEP',
      title: 'Registration & Team Formation',
      stage: 'Phase 1',
      description: 'Official portal registration, team credential setup, and workspace initialization.',
      isActive: stageLower.includes('registration') || stageLower.includes('theme'),
      isCompleted: stageLower.includes('stage 1') || stageLower.includes('stage 2') || stageLower.includes('task'),
    },
    {
      month: 'OCT - NOV',
      title: 'Stage 1: Simulation & Perception',
      stage: 'Phase 2',
      description: 'Gazebo simulation world launch, URDF modeling, and sensor interfacing.',
      isActive: stageLower.includes('stage 1') || stageLower.includes('simulation'),
      isCompleted: stageLower.includes('stage 2') || stageLower.includes('hardware'),
    },
    {
      month: 'NOV - DEC',
      title: 'Stage 2: Navigation & Autonomy',
      stage: 'Phase 3',
      description: 'Autonomous path planning, edge detection, and simulation benchmark runs.',
      isActive: stageLower.includes('stage 2') || stageLower.includes('navigation'),
      isCompleted: stageLower.includes('stage 3') || stageLower.includes('hardware'),
    },
    {
      month: 'DEC - JAN',
      title: 'Stage 3: Hardware Integration & Arena Runs',
      stage: 'Phase 4',
      description: 'Microcontroller flashing, motor driver tuning, and physical arena obstacle testing.',
      isActive: stageLower.includes('stage 3') || stageLower.includes('hardware'),
      isCompleted: stageLower.includes('finale'),
    },
    {
      month: 'FEB - MAR',
      title: 'National Grand Finale at IIT Bombay',
      stage: 'Finale',
      description: 'Live arena demonstration, technical jury review, and national championship awards.',
      isActive: stageLower.includes('finale'),
      isCompleted: false,
      isFinale: true,
    },
  ];

  return (
    <div className="tech-panel p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Competition Milestones
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>e-Yantra Season Timeline</span>
            <Flag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Chronological roadmap tracking your team&apos;s journey through all competition phases
          </p>
        </div>

        <a
          href="https://portal.e-yantra.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1 shrink-0"
        >
          Official Schedule <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Vertical Animated Timeline Flow */}
      <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-blue-500 before:via-purple-500 before:to-amber-500">
        {events.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Marker Beacon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                event.isCompleted
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                  : event.isActive
                  ? 'bg-blue-600 border-blue-400 text-white shadow-neon-blue beacon-pulse'
                  : event.isFinale
                  ? 'bg-amber-400 border-amber-300 text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {event.isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : event.isFinale ? (
                <Trophy className="w-4 h-4 text-slate-900" />
              ) : (
                <span className="text-xs font-mono font-bold">{idx + 1}</span>
              )}
            </div>

            {/* Event Card Content */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                event.isActive
                  ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-800 ring-2 ring-blue-500/20'
                  : event.isCompleted
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {event.month}
                  </span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 uppercase font-bold">
                    {event.stage}
                  </span>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    event.isCompleted
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : event.isActive
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {event.isCompleted ? '✓ COMPLETED' : event.isActive ? '● ACTIVE STAGE' : 'UPCOMING'}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {event.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
