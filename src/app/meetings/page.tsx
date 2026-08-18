'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Users2,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Trash2,
  Edit2,
  Loader2,
  FileCheck2,
  ListTodo,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function MeetingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit meeting modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState('');
  const [decisions, setDecisions] = useState<string[]>([]);
  const [newDecisionInput, setNewDecisionInput] = useState('');
  const [actionItems, setActionItems] = useState<{ actionText: string }[]>([]);
  const [newActionInput, setNewActionInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Converting action item state
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/meetings');
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const openAddModal = () => {
    setEditingMeeting(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('16:00');
    setEndTime('17:00');
    setMeetingLink('');
    setAgenda('');
    setNotes('');
    setAttendees(user?.name || '');
    setDecisions([]);
    setActionItems([]);
    setError('');
    setIsModalOpen(true);
  };

  const handleAddDecision = () => {
    if (!newDecisionInput.trim()) return;
    setDecisions([...decisions, newDecisionInput.trim()]);
    setNewDecisionInput('');
  };

  const handleRemoveDecision = (idx: number) => {
    setDecisions(decisions.filter((_, i) => i !== idx));
  };

  const handleAddActionItem = () => {
    if (!newActionInput.trim()) return;
    setActionItems([...actionItems, { actionText: newActionInput.trim() }]);
    setNewActionInput('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        title,
        date,
        startTime,
        endTime,
        meetingLink,
        agenda,
        notes,
        attendees,
        decisions: decisions.map((d) => ({ decisionText: d })),
        actionItems: actionItems.map((a) => ({ actionText: a.actionText })),
      };

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success('Meeting recorded ✓', `"${title}" logged to workspace.`);
        fetchMeetings();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save meeting');
        toast.error('Save failed', d.error);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Network error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting record?')) return;
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Meeting record deleted');
        fetchMeetings();
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Network error');
    }
  };

  const handleConvertActionItem = async (actionItemId: string) => {
    try {
      setConvertingId(actionItemId);
      const res = await fetch('/api/meetings/convert-action-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionItemId }),
      });
      if (res.ok) {
        toast.success('Action item converted to task ✓', 'Task is now available in your Tasks Kanban board.');
        fetchMeetings();
      } else {
        const d = await res.json();
        toast.error('Conversion failed', d.error);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      toast.error('Network error');
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Team Meetings & Briefings
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Internal meeting agendas, minutes, decisions, and actionable task conversions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Meeting Cards List */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No team meetings recorded yet"
          description="Schedule your team syncs, strategy sessions, and track meeting decisions & action items directly here."
          actionLabel="Schedule First Meeting"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Team Sync
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      By {m.createdBy?.name || 'Team Member'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {m.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-800 dark:text-slate-200 shrink-0">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    {formatDate(m.date)}
                  </span>
                  {(m.startTime || m.endTime) && (
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {m.startTime} {m.endTime && `- ${m.endTime}`}
                    </span>
                  )}
                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Agenda & Attendees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                {m.agenda && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      Agenda:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{m.agenda}</p>
                  </div>
                )}
                {m.attendees && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      Attendees:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{m.attendees}</p>
                  </div>
                )}
              </div>

              {/* Meeting Notes */}
              {m.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Meeting Minutes / Notes:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">{m.notes}</p>
                </div>
              )}

              {/* Decisions & Action Items Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Recorded Decisions */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Decisions Taken
                  </h4>
                  {m.decisions?.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">No decisions recorded</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {m.decisions.map((d: any) => (
                        <li key={d.id} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{d.decisionText}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action Items with Convert to Task */}
                <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                    <ListTodo className="w-4 h-4 text-blue-600" />
                    Action Items
                  </h4>
                  {m.actionItems?.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No action items assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {m.actionItems.map((a: any) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {a.actionText}
                          </span>

                          {a.convertedToTaskId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              ✓ Converted to Task
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConvertActionItem(a.id)}
                              disabled={convertingId === a.id}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                              {convertingId === a.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ArrowRight className="w-3 h-3" />
                              )}
                              Convert to Task
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Team Meeting"
        subtitle="Log internal strategy syncs, notes, decisions and action items"
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FOC Controller & Kinematics Strategy"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="04:00 PM"
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
                placeholder="05:00 PM"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meeting Link (Meet / Zoom)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Attendees
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Akanksha, Rahul, Sameer"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Agenda
            </label>
            <input
              type="text"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Key topics to discuss..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Meeting Notes / Minutes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record summary of discussion..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Decisions Input */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Key Decisions Taken
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDecisionInput}
                onChange={(e) => setNewDecisionInput(e.target.value)}
                placeholder="e.g. Use Moteus controller for prototype"
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDecision();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddDecision}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium"
              >
                Add
              </button>
            </div>
            {decisions.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {decisions.map((d, i) => (
                  <li key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    <span>✓ {d}</span>
                    <button
                      type="button"
                      onClick={() => setDecisions(decisions.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Items Input */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Action Items (Can be converted to tasks)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newActionInput}
                onChange={(e) => setNewActionInput(e.target.value)}
                placeholder="e.g. Study Moteus documentation and order connectors"
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium"
              >
                Add
              </button>
            </div>
            {actionItems.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {actionItems.map((a, i) => (
                  <li key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    <span>• {a.actionText}</span>
                    <button
                      type="button"
                      onClick={() => setActionItems(actionItems.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Meeting Record
          </button>
        </form>
      </Modal>
    </div>
  );
}
