'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  UserPlus,
  Trash2,
  Key,
  Download,
  Loader2,
  Save,
  CheckCircle2,
  Database,
  Compass,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.teamMembers || []);
        setSettings(data.settings || {});
        setPortalUrl(data.settings?.eyantra_portal_url || 'https://portal.e-yantra.org');
        setCompetitionStage(data.settings?.competition_stage || 'Registration / Theme Selection');
        setTeamName(data.settings?.team_name || 'e-Yantra Robotics Team');
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

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ROLE',
          userId,
          role,
        }),
      });
      if (res.ok) {
        fetchSettingsData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update role');
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_MEMBER',
          userId,
        }),
      });
      if (res.ok) {
        fetchSettingsData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMessage(false);

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
        setSettingsSavedMessage(true);
        setTimeout(() => setSettingsSavedMessage(false), 3000);
        fetchSettingsData();
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/export';
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Workspace Settings & Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Team member roster, role permissions, GitHub credentials, competition stage configuration, and backups
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors dark:bg-slate-100 dark:text-slate-900"
          >
            <Download className="w-4 h-4" />
            Export Database Backup (JSON)
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Team Member Roster */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Team Members ({teamMembers.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Manage accounts and permissions for your e-Yantra team
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Member
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Member</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined Date</th>
                    {isAdmin && <th className="p-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {m.name.charAt(0)}
                        </div>
                        <span>{m.name}</span>
                        {m.id === user?.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">{m.email}</td>
                      <td className="p-3">
                        {isAdmin && m.id !== user?.id ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                            className="text-xs font-semibold py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-300"
                          >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              m.role === 'ADMIN'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {m.role === 'ADMIN' && <Shield className="w-2.5 h-2.5" />}
                            {m.role === 'ADMIN' ? 'Admin' : 'Team Member'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{formatDate(m.createdAt)}</td>
                      {isAdmin && (
                        <td className="p-3 text-right">
                          {m.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Global Configuration */}
          {isAdmin && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  System & Competition Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Update team metadata, official links, and GitHub API credentials
                </p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings updated successfully.
                </div>
              )}

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
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
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
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="TEAM_MEMBER">Team Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={memberLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {memberLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add Team Member
          </button>
        </form>
      </Modal>
    </div>
  );
}
