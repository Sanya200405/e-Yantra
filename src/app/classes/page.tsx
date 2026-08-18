'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Video,
  FileText,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Clock,
  User,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function ClassesPage() {
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'UPCOMING' | 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('UPCOMING');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [recordingLink, setRecordingLink] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setTitle('');
    setInstructor('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
    setMeetingLink('');
    setRecordingLink('');
    setDescription('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingClass(c);
    setTitle(c.title);
    setInstructor(c.instructor || '');
    setDate(c.date ? new Date(c.date).toISOString().split('T')[0] : '');
    setStartTime(c.startTime || '');
    setEndTime(c.endTime || '');
    setMeetingLink(c.meetingLink || '');
    setRecordingLink(c.recordingLink || '');
    setDescription(c.description || '');
    setNotes(c.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        title,
        instructor,
        date,
        startTime,
        endTime,
        meetingLink,
        recordingLink,
        description,
        notes,
      };

      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchClasses();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save class session');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClasses();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter classes based on view
  const filteredClasses = classes.filter((c) => {
    const classDate = new Date(c.date);
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    if (activeView === 'TODAY') {
      return classDate >= todayStart && classDate <= todayEnd;
    }
    if (activeView === 'UPCOMING') {
      return classDate >= todayStart;
    }
    if (activeView === 'WEEK') {
      const weekEnd = new Date(todayStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return classDate >= todayStart && classDate <= weekEnd;
    }
    if (activeView === 'MONTH') {
      const monthEnd = new Date(todayStart);
      monthEnd.setDate(monthEnd.getDate() + 30);
      return classDate >= todayStart && classDate <= monthEnd;
    }
    return true; // ALL
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Class & Workshop Schedule
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            e-Yantra official workshops, training sessions, and mentor lectures
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Class Session
          </button>
        )}
      </div>

      {/* View Selector Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {(['UPCOMING', 'TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === view
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {view.charAt(0) + view.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Main Class Cards List */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No class sessions scheduled"
          description="There are no classes scheduled for the selected view. Add your official e-Yantra sessions here."
          actionLabel={isAdmin ? "Add Class" : undefined}
          onAction={isAdmin ? openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Session
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {c.title}
                </h3>

                {c.instructor && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5" />
                    Instructor: {c.instructor}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <span className="flex items-center gap-1 font-medium">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(c.date)}
                  </span>
                  {(c.startTime || c.endTime) && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {c.startTime} {c.endTime && `- ${c.endTime}`}
                    </span>
                  )}
                </div>

                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {c.description}
                  </p>
                )}

                {c.notes && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Notes
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{c.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {c.meetingLink && (
                  <a
                    href={c.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Join Live Session
                  </a>
                )}
                {c.recordingLink && (
                  <a
                    href={c.recordingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 ml-auto"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Recording
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class Session' : 'Add Class Session'}
        subtitle="Record official e-Yantra lectures and workshops"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Class Title / Subject *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ROS 2 Navigation Stack & SLAM"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Instructor / Speaker
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Prof. Kavi Arya / e-Yantra Team"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Live Meeting Link (Zoom / YouTube Live)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recording Link
            </label>
            <input
              type="url"
              value={recordingLink}
              onChange={(e) => setRecordingLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description / Topics
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Session overview..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Key Notes & Takeaways
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important rules, tips from instructor..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editingClass ? 'Save Changes' : 'Add Class Session'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
