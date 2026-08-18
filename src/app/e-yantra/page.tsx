'use client';

import React, { useEffect, useState } from 'react';
import {
  Compass,
  ExternalLink,
  Shield,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  Award,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function EYantraPortalPage() {
  const [settings, setSettings] = useState<any>({});
  const [selectedTheme, setSelectedTheme] = useState<any>(null);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [settRes, themeRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/themes'),
        ]);
        if (settRes.ok) {
          const d = await settRes.json();
          setSettings(d.settings || {});
        }
        if (themeRes.ok) {
          const themes = await themeRes.json();
          const sel = themes.find((t: any) => t.selectedStatus === 'SELECTED');
          setSelectedTheme(sel || null);
        }
      } catch (err) {
        console.error('Portal data error:', err);
      }
    };
    fetchPortalData();
  }, []);

  const stages = [
    {
      id: 'reg',
      title: 'Registration & Theme Selection',
      description: 'Team formation, portal registration, theme exploration and track allotment.',
      officialStatus: 'Active',
    },
    {
      id: 'stage1',
      title: 'Stage 1: Simulation & Foundation Tasks',
      description: 'Task 0 (Environment Setup), Task 1 (Gazebo/ROS Basics), Task 2 (Perception & Control), Task 3 (Integration).',
      officialStatus: 'Upcoming',
    },
    {
      id: 'stage2',
      title: 'Stage 2: Hardware Prototyping & Field Tasks',
      description: 'Microcontroller firmware, actuator tuning, sensor calibration, real-world robotic arena navigation.',
      officialStatus: 'Upcoming',
    },
    {
      id: 'finals',
      title: 'Grand Finals at IIT Bombay',
      description: 'Live hardware demonstration and evaluation at IIT Bombay campus.',
      officialStatus: 'Final Stage',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Official Portal Launch Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Authoritative Source
              </span>
              <span className="text-xs text-slate-200 font-bold font-mono">IIT Bombay e-Yantra Initiative</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Official e-Yantra Competition Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-1 leading-relaxed">
              The official portal remains the single source of truth for competition rulebooks, task submissions, scoreboards, and official announcements.
            </p>
          </div>

          <a
            href={settings.eyantra_portal_url || 'https://portal.e-yantra.org'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-neon-orange transition-all shrink-0 active:scale-95"
          >
            Launch Official Portal
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Distinction Explanation Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Data Integrity Principle: </span>
          This workspace clearly differentiates between <strong>Official e-Yantra Data</strong> (guidelines, theme specifications) and <strong>Our Team Data</strong> (task breakdowns, meeting logs, internal code).
        </div>
      </div>

      {/* Competition Stage Progression Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              eYRC Competition Stages
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              Current stage configured: <strong className="text-slate-900 dark:text-slate-100">{settings.competition_stage || 'Registration / Theme Selection'}</strong>
            </p>
          </div>
          <Link
            href="/settings"
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
          >
            Configure Stage →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((st, idx) => (
            <div
              key={st.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Stage {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {st.officialStatus}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  {st.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Theme Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Our Selected Theme
            </h2>
            <Link
              href="/themes"
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
            >
              All Themes →
            </Link>
          </div>

          {selectedTheme ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedTheme.themeName}
              </h3>
              {selectedTheme.description && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {selectedTheme.description}
                </p>
              )}
              {selectedTheme.technologies && (
                <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold pt-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Technologies: </span>
                  {selectedTheme.technologies}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              No theme currently marked as &ldquo;Selected&rdquo;.{' '}
              <Link href="/themes" className="text-blue-700 dark:text-blue-400 font-bold hover:underline">
                Explore Themes
              </Link>
            </div>
          )}
        </div>

        {/* Quick Official Links Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Official e-Yantra Links & Portals
          </h2>

          <div className="space-y-2.5">
            <a
              href="https://portal.e-yantra.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm hover:border-blue-400 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                e-Yantra Main Portal
              </span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>

            <a
              href="https://www.e-yantra.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm hover:border-blue-400 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                e-Yantra Official Website & Rulebooks
              </span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>

            <a
              href="https://mooc.e-yantra.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm hover:border-blue-400 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                e-Yantra MOOC Courses & MOODLE
              </span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
