'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Loader2,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function TechStackPage() {
  const { isAdmin } = useAuth();
  const [techItems, setTechItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [technology, setTechnology] = useState('');
  const [category, setCategory] = useState('Robotics');
  const [status, setStatus] = useState('LEARNING');
  const [documentationLink, setDocumentationLink] = useState('');
  const [learningResource, setLearningResource] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'ALL',
    'Robotics',
    'Programming',
    'Embedded',
    'Simulation',
    'Control',
    'Computer Vision',
    'Electronics',
    'Mechanical',
    'DevOps',
  ];

  const fetchTechStack = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tech-stack');
      if (res.ok) {
        const data = await res.json();
        setTechItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch tech stack:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechStack();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTechnology('');
    setCategory('Robotics');
    setStatus('LEARNING');
    setDocumentationLink('');
    setLearningResource('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingItem(t);
    setTechnology(t.technology);
    setCategory(t.category || 'Robotics');
    setStatus(t.status || 'LEARNING');
    setDocumentationLink(t.documentationLink || '');
    setLearningResource(t.learningResource || '');
    setNotes(t.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technology.trim()) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        technology,
        category,
        status,
        documentationLink,
        learningResource,
        notes,
      };

      const url = editingItem ? `/api/tech-stack/${editingItem.id}` : '/api/tech-stack';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTechStack();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save technology');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this technology?')) return;
    try {
      const res = await fetch(`/api/tech-stack/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTechStack();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredItems = techItems.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Technology Stack & Tools
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Hardware frameworks, software libraries, simulation environments, and control stacks
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Technology
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tech Cards Grid */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No technologies added"
          description="Track the real frameworks and tools your team is using for e-Yantra (e.g. ROS 2, Gazebo, ESP-IDF, STM32)."
          actionLabel="Add Technology"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.technology}
                  </h3>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : item.status === 'USING'
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 font-medium leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                {item.documentationLink && (
                  <a
                    href={item.documentationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Documentation
                  </a>
                )}
                {item.learningResource && (
                  <a
                    href={item.learningResource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Learning Guide
                  </a>
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
        title={editingItem ? 'Edit Technology' : 'Add Technology'}
        subtitle="Catalog programming languages, robotics libraries, and embedded stacks"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Technology / Tool Name *
            </label>
            <input
              type="text"
              required
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              placeholder="e.g. ROS 2 Humble / Gazebo Harmonic / FreeRTOS"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {categories.filter((c) => c !== 'ALL').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
                <option value="LEARNING">Learning</option>
                <option value="USING">Using in Project</option>
                <option value="COMPLETED">Completed / Mastered</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Official Documentation URL
            </label>
            <input
              type="url"
              value={documentationLink}
              onChange={(e) => setDocumentationLink(e.target.value)}
              placeholder="https://docs.ros.org/..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Learning Resource / Tutorial URL
            </label>
            <input
              type="url"
              value={learningResource}
              onChange={(e) => setLearningResource(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Team Notes & Usage Guidelines
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific version requirements, build commands..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Technology
          </button>
        </form>
      </Modal>
    </div>
  );
}
