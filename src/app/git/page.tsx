'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Star,
  GitFork,
  Users,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function GitPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [gitData, setGitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commits' | 'branches' | 'issues' | 'prs' | 'contributors'>('commits');

  // Connect Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGit = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/git');
      if (res.ok) {
        const data = await res.json();
        setGitData(data);
      }
    } catch (err) {
      console.error('Failed to fetch Git data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGit();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryUrl.trim()) return;
    setFormLoading(true);
    setError('');

    try {
      const res = await fetch('/api/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl,
          repositoryName,
          description,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setRepositoryUrl('');
        setRepositoryName('');
        setDescription('');
        toast.success('Repository connected ✓');
        fetchGit();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to connect repository');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this Git repository from the workspace?')) return;
    try {
      const res = await fetch(`/api/git?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Repository disconnected');
        fetchGit();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const configured = gitData?.configured;
  const live = gitData?.liveData?.data;
  const liveError = gitData?.liveData?.error;
  const repoSummary = live?.summary;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <GitBranch className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Git Repository Integration
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Real live GitHub commits, branches, issues, and pull requests for our eYRC team
          </p>
        </div>

        <div className="flex items-center gap-2">
          {configured && (
            <button
              onClick={fetchGit}
              title="Refresh live GitHub data"
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
            >
              <Plus className="w-4 h-4" />
              {configured ? 'Add Another Repo' : 'Connect GitHub'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : !configured || gitData.repositories?.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="GitHub integration not configured"
          description="Connect your team's real GitHub or GitLab repository to view live commits, branches, issues, and contributor activity."
          actionLabel={isAdmin ? "Connect GitHub" : undefined}
          onAction={isAdmin ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Repository Card */}
          {gitData.repositories.map((repo: any) => (
            <div
              key={repo.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {repo.repositoryName}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {repo.platform}
                      </span>
                    </h3>
                    <a
                      href={repo.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {repo.repositoryUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {repoSummary && (
                    <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-semibold font-mono">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        {repoSummary.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {repoSummary.forks}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                        {repoSummary.openIssuesCount} issues
                      </span>
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => handleDisconnect(repo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Disconnect repository"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub API Live Status / Error Notice */}
              {liveError && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">GitHub Live Notice</p>
                    <p className="mt-0.5">{liveError}</p>
                  </div>
                </div>
              )}

              {/* Live GitHub Data Tabs */}
              {live && (
                <div>
                  <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 mb-4">
                    {(['commits', 'branches', 'issues', 'prs', 'contributors'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2.5 px-3 text-xs font-bold border-b-2 capitalize transition-colors ${
                          activeTab === tab
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                        }`}
                      >
                        {tab === 'prs' ? 'Pull Requests' : tab}
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono">
                          {tab === 'commits'
                            ? live.commits?.length || 0
                            : tab === 'branches'
                            ? live.branches?.length || 0
                            : tab === 'issues'
                            ? live.issues?.length || 0
                            : tab === 'prs'
                            ? live.pullRequests?.length || 0
                            : live.contributors?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Commits Tab */}
                  {activeTab === 'commits' && (
                    <div className="space-y-2">
                      {live.commits?.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4">No recent commits found</p>
                      ) : (
                        live.commits.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GitCommit className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {c.sha}
                              </span>
                              <p className="text-slate-900 dark:text-slate-100 font-bold truncate">
                                {c.message}
                              </p>
                            </div>
                            <div className="text-right shrink-0 ml-3 text-slate-600 dark:text-slate-400 text-[11px] font-medium font-mono">
                              <span>{c.author}</span> • {formatDate(c.date)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Branches Tab */}
                  {activeTab === 'branches' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {live.branches?.map((b: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {b.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{b.sha}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues Tab */}
                  {activeTab === 'issues' && (
                    <div className="space-y-2">
                      {live.issues?.length === 0 ? (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-4 font-medium">No open issues found</p>
                      ) : (
                        live.issues.map((i: any) => (
                          <div
                            key={i.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">#{i.number}</span>
                              <p className="text-slate-900 dark:text-slate-100 font-bold truncate">
                                {i.title}
                              </p>
                            </div>
                            <a
                              href={i.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 dark:text-blue-400 font-bold text-xs hover:underline shrink-0 ml-3"
                            >
                              Open in GitHub →
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Pull Requests Tab */}
                  {activeTab === 'prs' && (
                    <div className="space-y-2">
                      {live.pullRequests?.length === 0 ? (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-4 font-medium">No open pull requests</p>
                      ) : (
                        live.pullRequests.map((p: any) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GitPullRequest className="w-4 h-4 text-purple-600 shrink-0" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">#{p.number}</span>
                              <p className="text-slate-900 dark:text-slate-100 font-bold truncate">
                                {p.title}
                              </p>
                            </div>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 dark:text-blue-400 font-bold text-xs hover:underline shrink-0 ml-3"
                            >
                              View PR →
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Contributors Tab */}
                  {activeTab === 'contributors' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {live.contributors?.map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <img
                            src={c.avatarUrl}
                            alt={c.login}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                              {c.login}
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {c.contributions} commits
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connect GitHub Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Git Repository"
        subtitle="Provide the real repository URL of your team's code repository"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleConnect} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Repository URL *
            </label>
            <input
              type="url"
              required
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/e-Yantra-Team/robotics-workspace"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
              placeholder="eYRC ROS 2 Core Repo"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Codebase for simulation, hardware drivers, and navigation..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Connect Repository
          </button>
        </form>
      </Modal>
    </div>
  );
}
