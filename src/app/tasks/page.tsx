'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  List,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Cpu,
  Video,
  FileText,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate, isOverdue } from '@/lib/utils';

export default function TasksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [gitRepos, setGitRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filters
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('NOT_STARTED');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [lectureId, setLectureId] = useState('');
  const [noteId, setNoteId] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [gitRepoId, setGitRepoId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelations = async () => {
    try {
      const [mRes, lRes, nRes, hRes, gRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/lectures'),
        fetch('/api/notes'),
        fetch('/api/hardware'),
        fetch('/api/git'),
      ]);

      if (mRes.ok) {
        const d = await mRes.json();
        setTeamMembers(d.teamMembers || []);
      }
      if (lRes.ok) setLectures(await lRes.json());
      if (nRes.ok) setNotes(await nRes.json());
      if (hRes.ok) setHardware(await hRes.json());
      if (gRes.ok) {
        const gd = await gRes.json();
        setGitRepos(gd.repositories || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchTasks();
    fetchRelations();
  }, []);

  const openAddModal = (defaultStatus?: string | React.MouseEvent) => {
    const statusVal = typeof defaultStatus === 'string' ? defaultStatus : 'NOT_STARTED';
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus(statusVal);
    setCategory('General');
    setDueDate('');
    setAssignedToId('');
    setLectureId('');
    setNoteId('');
    setHardwareId('');
    setGitRepoId('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description || '');
    setPriority(t.priority);
    setStatus(t.status);
    setCategory(t.category || 'General');
    setDueDate(t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '');
    setAssignedToId(t.assignedToId || '');
    setLectureId(t.lectureId || '');
    setNoteId(t.noteId || '');
    setHardwareId(t.hardwareId || '');
    setGitRepoId(t.gitRepoId || '');
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
        priority,
        status,
        category,
        dueDate: dueDate || null,
        assignedToId: assignedToId || null,
        lectureId: lectureId || null,
        noteId: noteId || null,
        hardwareId: hardwareId || null,
        gitRepoId: gitRepoId || null,
      };

      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success(editingTask ? 'Task updated ✓' : 'Task created ✓', `"${title}" saved to workspace.`);
        fetchTasks();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save task');
        toast.error('Save failed', d.error);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Network error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success('Task status updated ✓', `Moved to ${newStatus.replace('_', ' ')}`);
        fetchTasks();
      } else {
        toast.error('Status update failed');
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Network error');
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'ALL' && t.assignedToId !== assigneeFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchDesc = t.description?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const columns = [
    { key: 'NOT_STARTED', label: 'Not Started', color: 'slate' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
    { key: 'BLOCKED', label: 'Blocked', color: 'amber' },
    { key: 'COMPLETED', label: 'Completed', color: 'emerald' },
  ];

  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Task Management Board
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Real task assignments, deadlines, category tags, and relational linkages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'KANBAN'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, category, assignee..."
            className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Members</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Task View */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks added yet"
          description="Create and assign competition tasks to track progress across robotics sub-teams."
          actionLabel="Add First Task"
          onAction={openAddModal}
        />
      ) : viewMode === 'KANBAN' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 flex flex-col min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={openAddModal}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Cards in Column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status);
                    return (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              t.priority === 'URGENT'
                                ? 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                                : t.priority === 'HIGH'
                                ? 'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                                : t.priority === 'MEDIUM'
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>

                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {t.category || 'General'}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {t.title}
                        </h4>

                        {t.description && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                            {t.description}
                          </p>
                        )}

                        {/* Relational Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {t.lecture && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <Video className="w-3 h-3 text-purple-600 dark:text-purple-400" /> {t.lecture.title}
                            </span>
                          )}
                          {t.note && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {t.note.title}
                            </span>
                          )}
                          {t.hardware && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                              <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> {t.hardware.componentName}
                            </span>
                          )}
                          {t.gitRepo && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-300">
                              <Sparkles className="w-3 h-3 text-amber-500" /> {t.gitRepo.name}
                            </span>
                          )}
                        </div>

                        {/* Card Footer: Assignee, Due date & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            {t.assignedTo ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                  {t.assignedTo.name.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                                  {t.assignedTo.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                                Unassigned
                              </span>
                            )}
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Column Shift Selector */}
                        <div className="pt-1">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="w-full text-[10px] font-medium py-1 px-1.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <option value="NOT_STARTED">→ Not Started</option>
                            <option value="IN_PROGRESS">→ In Progress</option>
                            <option value="BLOCKED">→ Blocked</option>
                            <option value="COMPLETED">→ Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5">Task</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                      <div>
                        <p>{t.title}</p>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="text-[11px] font-semibold py-0.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-300"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold uppercase">{t.priority}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">{t.category}</td>
                    <td className="p-3.5">{t.assignedTo?.name || 'Unassigned'}</td>
                    <td className="p-3.5">
                      {t.dueDate ? formatDate(t.dueDate) : '-'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        subtitle="Specify task scope, assignments, and contextual links"
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calibrate MPU6050 IMU sensor offset in ROS"
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
              placeholder="Provide technical requirements, expected deliverables..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Robotics"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigned Member
            </label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Relational Links */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Contextual Links (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Related Lecture</label>
                <select
                  value={lectureId}
                  onChange={(e) => setLectureId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">None</option>
                  {lectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Related Note</label>
                <select
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">None</option>
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Related Hardware</label>
                <select
                  value={hardwareId}
                  onChange={(e) => setHardwareId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">None</option>
                  {hardware.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.componentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Related Git Repo</label>
                <select
                  value={gitRepoId}
                  onChange={(e) => setGitRepoId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">None</option>
                  {gitRepos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.repositoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editingTask ? 'Save Task Changes' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
