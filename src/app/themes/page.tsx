'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  Shield,
  FileText,
  Layers,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function ThemesPage() {
  const { isAdmin } = useAuth();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [officialLink, setOfficialLink] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('EXPLORING');
  const [difficultyNotes, setDifficultyNotes] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/themes');
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (err) {
      console.error('Failed to fetch themes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const openAddModal = () => {
    setEditingTheme(null);
    setThemeName('');
    setDescription('');
    setOfficialLink('https://portal.e-yantra.org');
    setSelectedStatus('EXPLORING');
    setDifficultyNotes('');
    setTechnologies('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (th: any) => {
    setEditingTheme(th);
    setThemeName(th.themeName);
    setDescription(th.description || '');
    setOfficialLink(th.officialLink || '');
    setSelectedStatus(th.selectedStatus);
    setDifficultyNotes(th.difficultyNotes || '');
    setTechnologies(th.technologies || '');
    setNotes(th.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        themeName,
        description,
        officialLink,
        selectedStatus,
        difficultyNotes,
        technologies,
        notes,
      };

      const url = editingTheme ? `/api/themes/${editingTheme.id}` : '/api/themes';
      const method = editingTheme ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchThemes();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save theme');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      const res = await fetch(`/api/themes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchThemes();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredThemes = themes.filter((th) => {
    if (statusFilter !== 'ALL' && th.selectedStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            e-Yantra Competition Themes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Theme exploration, official rules, difficulty assessment, and final team selection
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Theme
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['ALL', 'SELECTED', 'SHORTLISTED', 'EXPLORING', 'REJECTED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {st === 'ALL' ? 'All Themes' : st}
          </button>
        ))}
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredThemes.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No themes added yet"
          description="Enter official e-Yantra themes and track your team's feasibility study, strategy, and selection."
          actionLabel={isAdmin ? "Add Theme" : undefined}
          onAction={isAdmin ? openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredThemes.map((th) => (
            <div
              key={th.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-4 ${
                th.selectedStatus === 'SELECTED'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        th.selectedStatus === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold'
                          : th.selectedStatus === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                          : th.selectedStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {th.selectedStatus === 'SELECTED' ? '★ Selected Theme' : th.selectedStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {th.themeName}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(th)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(th.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Official Information Box */}
              <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Official e-Yantra Theme Info
                  </span>
                  {th.officialLink && (
                    <a
                      href={th.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                    >
                      Portal Link <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {th.description || 'No official description entered yet.'}
                </p>
              </div>

              {/* Team Notes & Assessment Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Our Team Evaluation & Strategy
                </span>

                {th.technologies && (
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Technologies Involved:{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{th.technologies}</span>
                  </div>
                )}

                {th.difficultyNotes && (
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Difficulty & Feasibility:{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{th.difficultyNotes}</span>
                  </div>
                )}

                {th.notes && (
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Team Strategy Notes:{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{th.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTheme ? 'Edit Theme Evaluation' : 'Add e-Yantra Theme'}
        subtitle="Catalog verified competition theme requirements and team strategy"
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Theme Name *
              </label>
              <input
                type="text"
                required
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. Holonomic Drive Warehouse Bot"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Decision Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="EXPLORING">Exploring</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Official Theme Description (from e-Yantra portal)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste official theme description..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Official Source URL
            </label>
            <input
              type="url"
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
              placeholder="https://portal.e-yantra.org/..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Technologies Involved
            </label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="ROS 2, OpenCV, Gazebo, Mecanum Drive, ESP32"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Difficulty & Feasibility Notes (Entered by Team)
            </label>
            <textarea
              rows={2}
              value={difficultyNotes}
              onChange={(e) => setDifficultyNotes(e.target.value)}
              placeholder="Assess learning curve, hardware availability, simulation complexity..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Team Strategy Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Our strategic approach, preliminary design ideas..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Theme
          </button>
        </form>
      </Modal>
    </div>
  );
}
