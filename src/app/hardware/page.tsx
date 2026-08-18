'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Cpu,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  Loader2,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function HardwarePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [hardware, setHardware] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [componentName, setComponentName] = useState('');
  const [category, setCategory] = useState('Sensors');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('AVAILABLE');
  const [location, setLocation] = useState('');
  const [purchaseInfo, setPurchaseInfo] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'ALL',
    'Microcontroller',
    'Motors',
    'Sensors',
    'Power',
    'Chassis',
    'Communication',
    'Tools',
    'Other',
  ];

  const fetchHardware = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hardware');
      if (res.ok) {
        const data = await res.json();
        setHardware(data);
      }
    } catch (err) {
      console.error('Failed to fetch hardware:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const d = await res.json();
        setTeamMembers(d.teamMembers || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchHardware();
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setComponentName('');
    setCategory('Sensors');
    setQuantity(1);
    setStatus('AVAILABLE');
    setLocation('Robotics Lab Box 1');
    setPurchaseInfo('');
    setDatasheetUrl('');
    setNotes('');
    setOwnerId('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (h: any) => {
    setEditingItem(h);
    setComponentName(h.componentName);
    setCategory(h.category || 'Sensors');
    setQuantity(h.quantity || 1);
    setStatus(h.status || 'AVAILABLE');
    setLocation(h.location || '');
    setPurchaseInfo(h.purchaseInfo || '');
    setDatasheetUrl(h.datasheetUrl || '');
    setNotes(h.notes || '');
    setOwnerId(h.ownerId || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentName.trim()) return;
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        componentName,
        category,
        quantity: Number(quantity),
        status,
        location,
        purchaseInfo,
        datasheetUrl,
        notes,
        ownerId: ownerId || null,
      };

      const url = editingItem ? `/api/hardware/${editingItem.id}` : '/api/hardware';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success(editingItem ? 'Hardware item updated ✓' : 'Hardware item added ✓');
        fetchHardware();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save hardware item');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware component?')) return;
    try {
      const res = await fetch(`/api/hardware/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Component removed');
        fetchHardware();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredHardware = hardware.filter((h) => {
    if (selectedCategory !== 'ALL' && h.category !== selectedCategory) return false;
    if (statusFilter !== 'ALL' && h.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.componentName.toLowerCase().includes(q);
      const matchLoc = h.location?.toLowerCase().includes(q);
      const matchNotes = h.notes?.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Hardware & Lab Inventory
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Track microcontrollers, sensors, motor drivers, batteries, component bins, and datasheets
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Component
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components, pinouts, locations..."
            className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="RESERVED">Reserved</option>
            <option value="DAMAGED">Damaged</option>
            <option value="MISSING">Missing</option>
          </select>
        </div>
      </div>

      {/* Hardware Grid */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredHardware.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No hardware added"
          description="Log your competition hardware components, sensors, quantity counts, and lab storage locations."
          actionLabel="Add Hardware"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHardware.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
                    {item.componentName}
                  </h3>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                      item.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : item.status === 'IN_USE'
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : item.status === 'RESERVED'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-800 dark:text-slate-200 mb-3 font-semibold">
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    Qty: {item.quantity}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {item.location}
                    </span>
                  )}
                </div>

                {item.purchaseInfo && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 font-medium">
                    Source: {item.purchaseInfo}
                  </p>
                )}

                {item.notes && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 line-clamp-2 font-medium">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                {item.datasheetUrl ? (
                  <a
                    href={item.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Datasheet / Pinout
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">No datasheet</span>
                )}

                {item.owner && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {item.owner.name}
                  </span>
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
        title={editingItem ? 'Edit Hardware Item' : 'Add Hardware Component'}
        subtitle="Catalog sensors, motors, microcontrollers, and physical parts"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Component Name *
            </label>
            <input
              type="text"
              required
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g. MPU6050 6-DOF IMU / Raspberry Pi 4 / BLDC Motor"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
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
                <option value="AVAILABLE">Available</option>
                <option value="IN_USE">In Use</option>
                <option value="RESERVED">Reserved</option>
                <option value="DAMAGED">Damaged</option>
                <option value="MISSING">Missing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lab Box #3 / Shelf A"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned Owner / In Charge
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="">None</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Datasheet / Pinout Diagram URL
            </label>
            <input
              type="url"
              value={datasheetUrl}
              onChange={(e) => setDatasheetUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Purchase / Source Information
            </label>
            <input
              type="text"
              value={purchaseInfo}
              onChange={(e) => setPurchaseInfo(e.target.value)}
              placeholder="Robu.in / e-Yantra Kit / College Lab"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes & Pin Configuration
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operating voltage 3.3V, I2C address 0x68..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Hardware Item
          </button>
        </form>
      </Modal>
    </div>
  );
}
