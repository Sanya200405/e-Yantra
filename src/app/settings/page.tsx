'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  UserPlus,
  Trash2,
  Download,
  Loader2,
  Save,
  CheckCircle2,
  Database,
  Compass,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  Lock,
  Calendar,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'appearance' | 'data' | 'team' | 'system'>('appearance');

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Backup & Restore states
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<any>(null);
  const [restoreConfirmationText, setRestoreConfirmationText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('TEAM_MEMBER');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  // Settings inputs
  const [portalUrl, setPortalUrl] = useState('');
  const [competitionStage, setCompetitionStage] = useState('');
  const [teamName, setTeamName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const [settRes, bkpRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/backup'),
      ]);

      if (settRes.ok) {
        const data = await settRes.json();
        setTeamMembers(data.teamMembers || []);
        setSettings(data.settings || {});
        setPortalUrl(data.settings?.eyantra_portal_url || 'https://portal.e-yantra.org');
        setCompetitionStage(data.settings?.competition_stage || 'Registration / Theme Selection');
        setTeamName(data.settings?.team_name || 'e-Yantra Robotics Team');
      }

      if (bkpRes.ok) {
        const bkpData = await bkpRes.json();
        setBackups(bkpData.backups || []);
      }
    } catch (err) {
      console.error('Settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  // 1. Manual Backup Handler
  const handleBackupNow = async () => {
    setIsBackingUp(true);
    const toastId = toast.loading('Creating cloud database backup...');

    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          backupType: 'MANUAL',
          notes: 'Manual backup triggered by Admin',
        }),
      });

      toast.dismiss(toastId);

      if (res.ok) {
        const data = await res.json();
        toast.success(
          'Backup successful ✓',
          `Created snapshot with ${data.backup?.recordCount || 0} records (${Math.round((data.backup?.sizeBytes || 0) / 1024)} KB)`
        );
        fetchSettingsData();
      } else {
        const err = await res.json();
        toast.error('Backup failed', err.error || 'Please retry');
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error('Backup failed', err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  // 2. Safe Restore Handler
  const handleOpenRestoreModal = (backup: any) => {
    setSelectedBackupForRestore(backup);
    setRestoreConfirmationText('');
    setRestoreModalOpen(true);
  };

  const handleExecuteRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restoreConfirmationText !== 'RESTORE' || !selectedBackupForRestore) return;

    setIsRestoring(true);
    const toastId = toast.loading('Restoring database from backup snapshot...');

    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTORE',
          backupId: selectedBackupForRestore.id,
        }),
      });

      toast.dismiss(toastId);

      if (res.ok) {
        toast.success('Restore completed successfully ✓', 'Workspace data reverted to selected snapshot.');
        setRestoreModalOpen(false);
        fetchSettingsData();
      } else {
        const err = await res.json();
        toast.error('Restore failed', err.error || 'Validation error');
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error('Restore failed', err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  // 3. Delete Backup Record
  const handleDeleteBackup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backup record?')) return;
    try {
      const res = await fetch(`/api/backup?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Backup record removed');
        fetchSettingsData();
      }
    } catch (err) {
      toast.error('Failed to delete backup');
    }
  };

  // 4. Save Global Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const updateObj: Record<string, string> = {
        eyantra_portal_url: portalUrl,
        competition_stage: competitionStage,
        team_name: teamName,
      };

      if (githubToken.trim()) {
        updateObj.github_token = githubToken.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settings: updateObj,
        }),
      });

      if (res.ok) {
        setGithubToken('');
        toast.success('Settings saved successfully ✓', 'System configurations updated.');
        fetchSettingsData();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      toast.error('Network error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // 5. Add Team Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail || !newMemberPassword) return;
    setMemberLoading(true);
    setMemberError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MEMBER',
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          role: newMemberRole,
        }),
      });

      if (res.ok) {
        setIsAddMemberOpen(false);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPassword('');
        toast.success('Team member added ✓');
        fetchSettingsData();
      } else {
        const d = await res.json();
        setMemberError(d.error || 'Failed to add member');
      }
    } catch (err: any) {
      setMemberError(err.message);
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Workspace Settings & Data Hub
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Appearance themes, cloud database backups, CSV data exports, team permissions, and security
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all disabled:opacity-50"
          >
            {isBackingUp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {isBackingUp ? 'Creating backup...' : 'Backup Now'}
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'appearance'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="w-4 h-4" />
          Appearance & Theme
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'data'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Data Management & Backups
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'team'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Roster & Security
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'system'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Competition Configuration
          </button>
        )}
      </div>

      {/* TAB 1: APPEARANCE & THEME */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Color Theme & Interface Mode
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                Choose your preferred interface style. Theme transitions are smooth and automatically saved.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Light Mode Option */}
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                  theme === 'light'
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === 'light' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Clean, bright workspace style</p>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                  theme === 'dark'
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === 'dark' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sleek dark theme for late nights</p>
                </div>
              </button>

              {/* System Theme Option */}
              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                  theme === 'system'
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  {theme === 'system' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">System Preference</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Matches your OS setting</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA MANAGEMENT & BACKUPS */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Cloud Database Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Cloud Database Storage
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    PostgreSQL Online
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                  All tasks, notes, meetings, and schedules are stored persistently in cloud PostgreSQL with automated backup support.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all shrink-0 disabled:opacity-50"
              >
                {isBackingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                {isBackingUp ? 'Creating backup...' : 'Backup Now'}
              </button>
            )}
          </div>

          {/* Data Export Formats Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Data Export & Portability
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                Download structured data anytime to migrate, share with mentors, or archive locally
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
              <a
                href="/api/export?format=json"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Full JSON Archive</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=tasks"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tasks (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=hardware"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hardware (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=meetings"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Meetings (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=classes"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Classes (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=notes"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notes (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/export?format=csv&type=resources"
                download
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Resources (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  Backup History & Safe Restoration ({backups.length})
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Versioned database snapshots stored securely in PostgreSQL
                </p>
              </div>
            </div>

            {backups.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No backup records found. Click &quot;Backup Now&quot; above to create your first cloud snapshot.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Backup Date & Time</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Records & Size</th>
                      <th className="p-3.5">Created By</th>
                      {isAdmin && <th className="p-3.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {backups.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatDateTime(b.createdAt)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              b.backupType === 'MANUAL'
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : b.backupType === 'SAFETY_PRE_RESTORE'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {b.backupType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Success
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-800 dark:text-slate-200 font-semibold font-mono">
                          {b.recordCount} records ({Math.round(b.sizeBytes / 1024)} KB)
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{b.createdBy || 'System'}</td>
                        {isAdmin && (
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleOpenRestoreModal(b)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-slate-800 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(b.id)}
                              className="p-1.5 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                              title="Delete backup record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM ROSTER & SECURITY */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Team Members Roster ({teamMembers.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Manage accounts and permissions for your e-Yantra robotics team
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Member</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-xs sm:text-sm">{m.name}</span>
                        {m.id === user?.id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">{m.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            m.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {m.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                          {m.role === 'ADMIN' ? 'Admin' : 'Team Member'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security & Authentication Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Authentication & Session Security
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Password Encryption</span>
                Bcrypt password hashing (10 salt rounds) stored securely in cloud database.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Session Cookies</span>
                HTTP-only, SameSite secure JWT session tokens with server-side validation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CONFIGURATION */}
      {activeTab === 'system' && isAdmin && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                Competition & System Configuration
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                Update team metadata, official links, and GitHub API credentials
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Competition Stage
                  </label>
                  <input
                    type="text"
                    value={competitionStage}
                    onChange={(e) => setCompetitionStage(e.target.value)}
                    placeholder="e.g. Stage 1 - Task 1 Simulation"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Official e-Yantra Portal URL
                  </label>
                  <input
                    type="url"
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Personal Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder={settings.github_token ? `Configured (${settings.github_token})` : 'ghp_...'}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-neon-blue transition-all disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      <Modal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        title="Confirm Cloud Database Restoration"
        subtitle="Warning: This is a critical data operation"
      >
        {selectedBackupForRestore && (
          <form onSubmit={handleExecuteRestore} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Safety Guarantee Notice
              </p>
              <p>
                Restoring this backup will replace current tasks, notes, and schedules with the snapshot taken on{' '}
                <strong>{formatDateTime(selectedBackupForRestore.createdAt)}</strong> ({selectedBackupForRestore.recordCount} records).
              </p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ A safety backup of your current database will automatically be taken before restoring.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type <span className="font-mono font-bold text-red-600">RESTORE</span> to confirm:
              </label>
              <input
                type="text"
                required
                value={restoreConfirmationText}
                onChange={(e) => setRestoreConfirmationText(e.target.value)}
                placeholder="RESTORE"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={restoreConfirmationText !== 'RESTORE' || isRestoring}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm & Restore Database
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Team Member"
        subtitle="Create an account for your eYRC robotics team member"
      >
        {memberError && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">
            {memberError}
          </div>
        )}

        <form onSubmit={handleAddMember} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="rahul@eyantra-team.org"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newMemberPassword}
              onChange={(e) => setNewMemberPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="TEAM_MEMBER">Team Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={memberLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {memberLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add Team Member
          </button>
        </form>
      </Modal>
    </div>
  );
}
