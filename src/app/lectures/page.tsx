'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Video,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Loader2,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function LecturesPage() {
  const { isAdmin } = useAuth();
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Official e-Yantra');
  const [lectureLink, setLectureLink] = useState('');
  const [recordingLink, setRecordingLink] = useState('');
  const [slidesLink, setSlidesLink] = useState('');
  const [date, setDate] = useState('');
  const [completionStatus, setCompletionStatus] = useState('NOT_STARTED');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lectures');
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
      }
    } catch (err) {
      console.error('Failed to fetch lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const openAddModal = () => {
    setEditingLecture(null);
    setTitle('');
    setDescription('');
    setSource('Official e-Yantra');
    setLectureLink('');
    setRecordingLink('');
    setSlidesLink('');
    setDate('');
    setCompletionStatus('NOT_STARTED');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (l: any) => {
    setEditingLecture(l);
    setTitle(l.title);
    setDescription(l.description || '');
    setSource(l.source || 'Official e-Yantra');
    setLectureLink(l.lectureLink || '');
    setRecordingLink(l.recordingLink || '');
    setSlidesLink(l.slidesLink || '');
    setDate(l.date ? new Date(l.date).toISOString().split('T')[0] : '');
    setCompletionStatus(l.completionStatus);
    setNotes(l.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        source,
        lectureLink,
        recordingLink,
        slidesLink,
        date: date || null,
        completionStatus,
        notes,
      };

      const url = editingLecture ? `/api/lectures/${editingLecture.id}` : '/api/lectures';
      const method = editingLecture ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLectures();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save lecture');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (lectureId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'COMPLETED'
        ? 'NOT_STARTED'
        : currentStatus === 'NOT_STARTED'
        ? 'IN_PROGRESS'
        : 'COMPLETED';

    try {
      const res = await fetch(`/api/lectures/${lectureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionStatus: nextStatus }),
      });
      if (res.ok) {
        fetchLectures();
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLectures();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredLectures = lectures.filter((l) => {
    if (statusFilter !== 'ALL' && l.completionStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchSource = l.source?.toLowerCase().includes(q);
      const matchNotes = l.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchSource && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            Lectures & Video Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Recorded e-Yantra training sessions, slides, study links, and completion tracking
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lecture
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lectures, sources, notes..."
            className="w-full text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'NOT_STARTED' ? 'Not Started' : st === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Lecture Cards List */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredLectures.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No lectures recorded"
          description="Log competition technical lectures, tutorials, and workshop recordings to track team learning."
          actionLabel={isAdmin ? "Add Lecture" : undefined}
          onAction={isAdmin ? openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLectures.map((l) => (
            <div
              key={l.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {l.source || 'Official'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(l)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {l.title}
                </h3>

                {l.description && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2 font-medium">
                    {l.description}
                  </p>
                )}

                {l.date && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3 font-semibold font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Date: {formatDate(l.date)}
                  </p>
                )}

                {l.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-3 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block mb-1">
                      Notes / Summary
                    </span>
                    {l.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {/* Links Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {l.lectureLink && (
                    <a
                      href={l.lectureLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Session Link
                    </a>
                  )}
                  {l.recordingLink && (
                    <a
                      href={l.recordingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <Video className="w-3 h-3" />
                      Watch Recording
                    </a>
                  )}
                  {l.slidesLink && (
                    <a
                      href={l.slidesLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      Slides
                    </a>
                  )}
                </div>

                {/* Completion Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(l.id, l.completionStatus)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    l.completionStatus === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : l.completionStatus === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Status: {l.completionStatus === 'COMPLETED' ? 'Completed' : l.completionStatus === 'IN_PROGRESS' ? 'In Progress' : 'Mark In Progress'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLecture ? 'Edit Lecture' : 'Add Lecture'}
        subtitle="Save lecture links, slides, and learning progress"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lecture Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Robot Kinematics & Transformation Matrices"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Official e-Yantra / YouTube"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Completion Status
              </label>
              <select
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Video / Recording Link
              </label>
              <input
                type="url"
                value={recordingLink}
                onChange={(e) => setRecordingLink(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Slides Link (PDF / PPT)
              </label>
              <input
                type="url"
                value={slidesLink}
                onChange={(e) => setSlidesLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lecture outline..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Team Notes & Important Formulas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key concepts, equations, takeaways..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Lecture
          </button>
        </form>
      </Modal>
    </div>
  );
}
