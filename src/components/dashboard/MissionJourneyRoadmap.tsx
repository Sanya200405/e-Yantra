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
  Layers,
} from 'lucide-react';

interface RoadmapProps {
  tasks?: any[];
  competitionStage?: string;
}

export function MissionJourneyRoadmap({ tasks = [], competitionStage }: RoadmapProps) {
  // Dynamically count tasks matching each stage
  const learnTasks = tasks.filter((t) =>
    (t.category || '').toLowerCase().includes('learn') ||
    (t.category || '').toLowerCase().includes('theory') ||
    (t.category || '').toLowerCase().includes('setup')
  );
  const simTasks = tasks.filter((t) =>
    (t.category || '').toLowerCase().includes('sim') ||
    (t.category || '').toLowerCase().includes('gazebo') ||
    (t.category || '').toLowerCase().includes('ros') ||
    (t.category || '').toLowerCase().includes('perception')
  );
  const buildTasks = tasks.filter((t) =>
    (t.category || '').toLowerCase().includes('build') ||
    (t.category || '').toLowerCase().includes('hardware') ||
    (t.category || '').toLowerCase().includes('circuit')
  );
  const testTasks = tasks.filter((t) =>
    (t.category || '').toLowerCase().includes('test') ||
    (t.category || '').toLowerCase().includes('tuning') ||
    (t.category || '').toLowerCase().includes('benchmark')
  );
  const finaleTasks = tasks.filter((t) =>
    (t.category || '').toLowerCase().includes('finale') ||
    (t.category || '').toLowerCase().includes('presentation')
  );

  const stages = [
    {
      id: 'learn',
      step: '01',
      title: 'LEARN & FOUNDATIONS',
      shortDesc: 'ROS 2, Linux environment, Python & C++ kinematics',
      icon: BookOpen,
      taskCount: learnTasks.length,
      completedCount: learnTasks.filter((t) => t.status === 'COMPLETED').length,
      targetDate: 'Aug - Sep',
      link: '/lectures',
    },
    {
      id: 'simulate',
      step: '02',
      title: 'SIMULATE & PERCEIVE',
      shortDesc: 'Gazebo simulation world, URDF modeling, OpenCV vision',
      icon: Laptop,
      taskCount: simTasks.length,
      completedCount: simTasks.filter((t) => t.status === 'COMPLETED').length,
      targetDate: 'Oct - Nov',
      link: '/tasks',
    },
    {
      id: 'build',
      step: '03',
      title: 'BUILD & INTEGRATE',
      shortDesc: 'Microcontroller firmware, motor drivers, PCB & actuators',
      icon: Wrench,
      taskCount: buildTasks.length,
      completedCount: buildTasks.filter((t) => t.status === 'COMPLETED').length,
      targetDate: 'Nov - Dec',
      link: '/hardware',
    },
    {
      id: 'test',
      step: '04',
      title: 'TEST & ARENA TUNING',
      shortDesc: 'Real-world arena obstacle avoidance & autonomy testing',
      icon: FlaskConical,
      taskCount: testTasks.length,
      completedCount: testTasks.filter((t) => t.status === 'COMPLETED').length,
      targetDate: 'Dec - Jan',
      link: '/tasks',
    },
    {
      id: 'compete',
      step: '05',
      title: 'FINALE AT IIT BOMBAY',
      shortDesc: 'Live arena evaluation & national championship demonstration',
      icon: Trophy,
      taskCount: finaleTasks.length,
      completedCount: finaleTasks.filter((t) => t.status === 'COMPLETED').length,
      targetDate: 'Feb - Mar',
      link: '/e-yantra',
    },
  ];

  const [selectedStage, setSelectedStage] = useState(stages[0]);

  return (
    <div className="tech-panel p-6 sm:p-7 space-y-6">
      {/* Header with High-Contrast Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              eYRC Season Roadmap
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              CURRENT STAGE: {competitionStage || 'Registration / Setup'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>Mission Progress Journey</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Multi-stage roadmap reflecting real tasks and deliverables created by your team
          </p>
        </div>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 hover:underline shrink-0"
        >
          View Connected Tasks <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 5-Stage Horizontal Progress Path */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isSelected = selectedStage.id === stage.id;
          const hasTasks = stage.taskCount > 0;
          const isFullyCompleted = hasTasks && stage.completedCount === stage.taskCount;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              {/* Top Node Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isFullyCompleted
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  STAGE {stage.step}
                </span>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isFullyCompleted
                      ? 'bg-emerald-600 text-white'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-neon-blue'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isFullyCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {stage.shortDesc}
                </p>
              </div>

              {/* Bottom Real Task Counter */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono font-semibold">
                <span className="text-slate-600 dark:text-slate-400">{stage.targetDate}</span>
                <span
                  className={
                    isFullyCompleted
                      ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                      : hasTasks
                      ? 'text-blue-700 dark:text-blue-400 font-bold'
                      : 'text-slate-500'
                  }
                >
                  {hasTasks ? `${stage.completedCount}/${stage.taskCount} tasks` : '0 tasks'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Interactive Telemetry Briefing */}
      {selectedStage && (
        <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-scale-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                STAGE {selectedStage.step} DETAILS
              </span>
              <span className="text-sm font-bold text-white">{selectedStage.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">{selectedStage.shortDesc}</p>
            <p className="text-xs font-mono text-cyan-300">
              Database Records: {selectedStage.taskCount} tasks associated ({selectedStage.completedCount} completed)
            </p>
          </div>

          <Link
            href={selectedStage.link}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-neon-blue transition-all shrink-0 active:scale-95"
          >
            <span>Open Stage Workspace</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
