'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CheckSquare, Calendar, FileText, Bookmark, Loader2 } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickActionModal({ isOpen, onClose, onSuccess }: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState<'task' | 'meeting' | 'note' | 'resource'>('task');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCategory, setTaskCategory] = useState('General');
  const [taskAssignedToId, setTaskAssignedToId] = useState('');

  // Meeting state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('GENERAL');

  // Resource state
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceCategory, setResourceCategory] = useState('DOCUMENTATION');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((d) => setTeamMembers(d.teamMembers || []))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          category: taskCategory,
          assignedToId: taskAssignedToId || null,
        }),
      });
      if (res.ok) {
        setTaskTitle('');
        setTaskDueDate('');
        setTaskAssignedToId('');
        onSuccess?.();
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create task');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetingTitle,
          date: meetingDate,
          startTime: meetingTime || null,
          meetingLink: meetingLink || null,
        }),
      });
      if (res.ok) {
        setMeetingTitle('');
        setMeetingDate('');
        setMeetingTime('');
        setMeetingLink('');
        onSuccess?.();
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to schedule meeting');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
        }),
      });
      if (res.ok) {
        setNoteTitle('');
        setNoteContent('');
        onSuccess?.();
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create note');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resourceTitle,
          url: resourceUrl,
          category: resourceCategory,
        }),
      });
      if (res.ok) {
        setResourceTitle('');
        setResourceUrl('');
        onSuccess?.();
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to add resource');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Workspace Action"
      subtitle="Instantly log a task, meeting, note, or reference resource"
    >
      {/* Action Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'task'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Task
        </button>
        <button
          onClick={() => setActiveTab('meeting')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'meeting'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Meeting
        </button>
        <button
          onClick={() => setActiveTab('note')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'note'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Note
        </button>
        <button
          onClick={() => setActiveTab('resource')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'resource'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Resource
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement PID velocity control"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Assigned Member
            </label>
            <select
              value={taskAssignedToId}
              onChange={(e) => setTaskAssignedToId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">Unassigned</option>
              {teamMembers.length > 0 && (
                <option value="ALL_MEMBERS" className="font-bold text-blue-600 dark:text-blue-400">
                  ⚡ Assign to All Team Members ({teamMembers.length})
                </option>
              )}
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
            {taskAssignedToId === 'ALL_MEMBERS' && (
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1.5">
                ⚡ Will create and assign a copy to all {teamMembers.length} team members at once.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-neon-blue disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {taskAssignedToId === 'ALL_MEMBERS' ? `Assign to All ${teamMembers.length} Members` : 'Create Task'}
          </button>
        </form>
      )}

      {activeTab === 'meeting' && (
        <form onSubmit={handleScheduleMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g. Weekly Progress Sync"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="e.g. 05:00 PM"
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Meeting Link (Google Meet / Zoom)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-neon-blue disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule Meeting
          </button>
        </form>
      )}

      {activeTab === 'note' && (
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Category
              </label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ROBOTICS">Robotics</option>
                <option value="ROS">ROS</option>
                <option value="EMBEDDED">Embedded</option>
                <option value="CONTROL_SYSTEMS">Control</option>
                <option value="COMPUTER_VISION">CV</option>
                <option value="COMPETITION">Competition</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Content (Markdown) *
            </label>
            <textarea
              required
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write Markdown notes here..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-neon-blue disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Note
          </button>
        </form>
      )}

      {activeTab === 'resource' && (
        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              placeholder="e.g. Official ROS 2 Humble Documentation"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                URL *
              </label>
              <input
                type="url"
                required
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Category
              </label>
              <select
                value={resourceCategory}
                onChange={(e) => setResourceCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="DOCUMENTATION">Documentation</option>
                <option value="WEBSITE">Website</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="VIDEO">Video</option>
                <option value="PAPER">Paper</option>
                <option value="DATASHEET">Datasheet</option>
                <option value="GITHUB_REPO">GitHub Repo</option>
                <option value="COURSE">Course</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-neon-blue disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Resource
          </button>
        </form>
      )}
    </Modal>
  );
}
