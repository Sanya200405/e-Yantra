'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Laptop,
  Wrench,
  FlaskConical,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

interface Stage {
  id: string;
  step: string;
  title: string;
  shortDesc: string;
  icon: any;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  targetDate: string;
  highlights: string[];
  link: string;
}

const STAGES: Stage[] = [
  {
    id: 'learn',
    step: '01',
    title: 'LEARN & FOUNDATIONS',
    shortDesc: 'ROS 2, Linux environment, Python & C++ kinematics',
    icon: BookOpen,
    status: 'COMPLETED',
    targetDate: 'Aug - Sep',
    highlights: ['ROS 2 Nodes & Topics', 'Linux Automation', 'Git Team Workflow'],
    link: '/lectures',
  },
  {
    id: 'simulate',
    step: '02',
    title: 'SIMULATE & PERCEIVE',
    shortDesc: 'Gazebo simulation world, URDF modeling, OpenCV vision',
    icon: Laptop,
    status: 'ACTIVE',
    targetDate: 'Oct - Nov',
    highlights: ['Gazebo Arena Simulation', 'Lidar / Depth Perception', 'Task 1 & 2 Deliverables'],
    link: '/tasks',
  },
  {
    id: 'build',
    step: '03',
    title: 'BUILD & INTEGRATE',
    shortDesc: 'Microcontroller firmware, motor drivers, PCB & actuators',
    icon: Wrench,
    status: 'UPCOMING',
    targetDate: 'Nov - Dec',
    highlights: ['Hardware Assembly', 'Motor Driver Calibration', 'Power Distribution'],
    link: '/hardware',
  },
  {
    id: 'test',
    step: '04',
    title: 'TEST & ARENA TUNING',
    shortDesc: 'Real-world arena obstacle avoidance & autonomy testing',
    icon: FlaskConical,
    status: 'UPCOMING',
    targetDate: 'Dec - Jan',
    highlights: ['Nav2 Stack Tuning', 'Arena Obstacle Avoidance', 'Field Run Benchmarking'],
    link: '/tasks',
  },
  {
    id: 'compete',
    step: '05',
    title: 'FINALE AT IIT BOMBAY',
    shortDesc: 'Live arena evaluation & national championship demonstration',
    icon: Trophy,
    status: 'UPCOMING',
    targetDate: 'Feb - Mar',
    highlights: ['Live Run Evaluation', 'Jury Demonstration', 'e-Yantra Championship 🏆'],
    link: '/e-yantra',
  },
];

export function MissionJourneyRoadmap() {
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[1]); // Default active stage

  return (
    <div className="tech-panel p-6 sm:p-7 space-y-6">
      {/* Header with Telemetry Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              eYRC Season Roadmap
            </span>
            <span className="text-xs font-mono text-slate-400">PHASE 2 // IN PROGRESS</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>Mission Progress Journey</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive multi-stage pipeline from simulation to the IIT Bombay National Championship
          </p>
        </div>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          View Connected Tasks <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5-Stage Horizontal Progress Path */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage.id === stage.id;
          const isCompleted = stage.status === 'COMPLETED';
          const isActive = stage.status === 'ACTIVE';

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-neon-blue'
                  : isActive
                  ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-400/80 shadow-neon-orange'
                  : isCompleted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Top Node Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : isActive
                      ? 'bg-orange-500 text-white shadow-xs animate-pulse'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  STAGE {stage.step}
                </span>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-orange-500 text-white shadow-neon-orange'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {stage.shortDesc}
                </p>
              </div>

              {/* Bottom Status Indicator */}
              <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono font-semibold">
                <span className="text-slate-400">{stage.targetDate}</span>
                <span
                  className={
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isActive
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-slate-400'
                  }
                >
                  {isCompleted ? '✓ COMPLETE' : isActive ? '● ACTIVE' : 'LOCKED'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Interactive Telemetry Briefing */}
      {selectedStage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-scale-in">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                STAGE {selectedStage.step} DEEP-DIVE
              </span>
              <span className="text-xs font-bold text-white">{selectedStage.title}</span>
            </div>
            <p className="text-xs text-slate-300">{selectedStage.shortDesc}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedStage.highlights.map((h, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300"
                >
                  • {h}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={selectedStage.link}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-neon-blue transition-all shrink-0 active:scale-95"
          >
            <span>Open Stage Module</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
