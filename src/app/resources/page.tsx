'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  Loader2,
  Star,
  FileText,
  Upload,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  FolderOpen,
  File,
  Download,
  HardDrive,
  FileCode,
  Image as ImageIcon,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function ResourcesPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'RESOURCES' | 'DOCUMENTS'>('RESOURCES');

  // Resource bookmarks state
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Uploaded files vault state
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isDirectUploading, setIsDirectUploading] = useState(false);
  const [directUploadProgress, setDirectUploadProgress] = useState<number | null>(null);

  // Resource Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DOCUMENTATION');
  const [url, setUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'ALL',
    'DOCUMENTATION',
    'WEBSITE',
    'TUTORIAL',
    'VIDEO',
    'PAPER',
    'DATASHEET',
    'GITHUB_REPO',
    'COURSE',
    'PDF',
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await fetch('/api/upload');
      if (res.ok) {
        const data = await res.json();
        if (data.files) {
          setUploadedFiles(data.files);
        }
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchUploadedFiles();
  }, []);

  const openAddModal = () => {
    setEditingResource(null);
    setTitle('');
    setDescription('');
    setCategory('DOCUMENTATION');
    setUrl('');
    setFileUrl('');
    setFileName('');
    setFileSize(null);
    setIsBookmarked(false);
    setError('');
    setUploadError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditingResource(r);
    setTitle(r.title);
    setDescription(r.description || '');
    setCategory(r.category || 'DOCUMENTATION');
    setUrl(r.url || '');
    setFileUrl(r.fileUrl || '');
    setFileName(r.title || '');
    setFileSize(null);
    setIsBookmarked(r.isBookmarked || false);
    setError('');
    setUploadError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`This file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 50 MB.`);
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);
    setUploadError(null);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'RESOURCE');

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          setFileUrl(data.url);
          setFileName(data.fileName);
          setFileSize(data.size);
          setUploadProgress(100);
          if (!title) setTitle(data.fileName);
          fetchUploadedFiles();
        } else {
          setUploadError(data.error || 'Upload failed. Please try again.');
          setUploadProgress(null);
        }
      } catch {
        setUploadError('Server returned an unexpected response. Please try again.');
        setUploadProgress(null);
      } finally {
        setUploadingFile(false);
      }
    });

    xhr.addEventListener('error', () => {
      setUploadError('Network error during file upload. Please check your connection and retry.');
      setUploadProgress(null);
      setUploadingFile(false);
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large', `File is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Max allowed is 50 MB.`);
      return;
    }

    setIsDirectUploading(true);
    setDirectUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'RESOURCE');

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setDirectUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          toast.success('File uploaded ✓', `${data.fileName} permanently stored.`);
          fetchUploadedFiles();
        } else {
          toast.error('Upload failed', data.error || 'Please try again.');
        }
      } catch {
        toast.error('Upload error', 'Unexpected server response.');
      } finally {
        setIsDirectUploading(false);
        setDirectUploadProgress(null);
        e.target.value = '';
      }
    });

    xhr.addEventListener('error', () => {
      toast.error('Upload failed', 'Network error during upload.');
      setIsDirectUploading(false);
      setDirectUploadProgress(null);
      e.target.value = '';
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const handleDeleteUploadedFile = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/upload?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('File deleted', `"${filename}" removed.`);
        fetchUploadedFiles();
      } else {
        const d = await res.json();
        toast.error('Delete failed', d.error);
      }
    } catch {
      toast.error('Delete error', 'Network failure.');
    }
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
        category,
        url,
        fileUrl,
        isBookmarked,
      };

      const endpoint = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources';
      const method = editingResource ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchResources();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save resource');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleBookmark = async (resourceId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked: !current }),
      });
      if (res.ok) {
        fetchResources();
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchResources();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime?: string, name?: string) => {
    const ext = name?.split('.').pop()?.toLowerCase() || '';
    if (mime?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    }
    if (ext === 'pdf' || mime === 'application/pdf') {
      return <FileText className="w-4 h-4 text-rose-500" />;
    }
    if (['zip', 'tar', 'gz', 'rar'].includes(ext)) {
      return <Archive className="w-4 h-4 text-amber-500" />;
    }
    if (['json', 'csv', 'py', 'cpp', 'h', 'txt', 'md'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (bookmarkedOnly && !r.isBookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const filteredFiles = uploadedFiles.filter((f) => {
    if (!fileSearchQuery.trim()) return true;
    const q = fileSearchQuery.toLowerCase();
    return f.filename.toLowerCase().includes(q) || (f.uploadedBy?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Resource & Document Vault
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Centralized bookmarks for official documentation, papers, datasheets, and permanent team project file storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'DOCUMENTS' ? (
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all">
              <Upload className="w-4 h-4" />
              {isDirectUploading ? `Uploading (${directUploadProgress ?? 0}%)...` : 'Upload New File'}
              <input
                type="file"
                onChange={handleDirectFileUpload}
                disabled={isDirectUploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.txt,.csv,.json,.zip"
              />
            </label>
          ) : (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Resource Link
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'RESOURCES'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Documentation & Bookmarks</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
            {resources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'DOCUMENTS'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Uploaded Files Vault</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
            {uploadedFiles.length}
          </span>
        </button>
      </div>

      {/* TAB 1: RESOURCES & BOOKMARKS */}
      {activeTab === 'RESOURCES' && (
        <div className="space-y-5">
          {/* Filters & Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resource titles, descriptions..."
                className="w-full text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarkedOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  bookmarkedOnly
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-white' : ''}`} />
                <span>Bookmarked Only</span>
              </button>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredResources.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No resources found"
              description="Bookmark important technical documentation, papers, and uploaded files for the competition."
              actionLabel="Add Resource"
              onAction={openAddModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {r.category.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleBookmark(r.id, r.isBookmarked)}
                          className={`p-1 rounded transition-colors ${
                            r.isBookmarked
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title={r.isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                        >
                          <Star className={`w-3.5 h-3.5 ${r.isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {r.title}
                    </h3>

                    {r.description && (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2 font-medium">
                        {r.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          Open Resource
                        </a>
                      ) : r.fileUrl ? (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No link</span>
                      )}

                      {r.addedBy && (
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {r.addedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOADED DOCUMENTS & FILES VAULT (PERMANENT STORAGE) */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-5">
          {/* Direct Drag & Drop Upload Zone */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Permanent Team File Vault
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Upload PDFs, mechanical CAD drawings, schematic images, and code archives (Up to 50 MB per file).
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-neon-blue transition-all">
              <Upload className="w-4 h-4" />
              {isDirectUploading ? `Uploading (${directUploadProgress ?? 0}%)...` : 'Select File to Upload'}
              <input
                type="file"
                onChange={handleDirectFileUpload}
                disabled={isDirectUploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.txt,.csv,.json,.zip"
              />
            </label>

            {isDirectUploading && directUploadProgress !== null && (
              <div className="w-full max-w-md pt-2 space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold text-blue-600">
                  <span>Uploading to Persistent Storage...</span>
                  <span>{directUploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${directUploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Files Search Bar */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="Search uploaded files by name or uploader..."
                className="w-full text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>

            <button
              onClick={fetchUploadedFiles}
              title="Refresh files"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Files Explorer Table */}
          {loadingFiles ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No files in vault"
              description="Upload your team project files to store them permanently across server restarts."
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3 font-bold">File Name</th>
                      <th className="px-4 py-3 font-bold">Type</th>
                      <th className="px-4 py-3 font-bold">Size</th>
                      <th className="px-4 py-3 font-bold">Uploaded Date</th>
                      <th className="px-4 py-3 font-bold">Uploader</th>
                      <th className="px-4 py-3 font-bold">Storage</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredFiles.map((file) => {
                      const canDelete = isAdmin || (file.uploadedById && file.uploadedById === user?.id);
                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* File Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm truncate">
                              {getFileIcon(file.mimeType, file.filename)}
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate" title={file.filename}>
                                {file.filename}
                              </span>
                            </div>
                          </td>

                          {/* MIME Type */}
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </td>

                          {/* File Size */}
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                            {formatFileSize(file.size)}
                          </td>

                          {/* Upload Date */}
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatDateTime(file.createdAt)}
                          </td>

                          {/* Uploader */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {file.uploadedBy?.name || 'Team Member'}
                            </span>
                          </td>

                          {/* Storage Provider */}
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                file.provider === 'VERCEL_BLOB'
                                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                              }`}
                            >
                              {file.provider === 'VERCEL_BLOB' ? 'Cloud CDN' : 'Persistent DB'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={file.filename}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all"
                                title="Download or preview file"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>

                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteUploadedFile(file.id, file.filename)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Delete file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
        subtitle="Save documentation links, research papers, videos, or upload project files"
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official ROS 2 Nav2 Architecture Documentation"
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
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isBookmarked}
                  onChange={(e) => setIsBookmarked(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Bookmark resource
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resource Web URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* File Upload Option */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Or Upload Document (PDF / PPT / DOC / Image / ZIP)
            </label>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{uploadError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {uploadingFile && uploadProgress !== null && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading to persistent storage...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Uploaded File Badge */}
            {fileUrl ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                      {fileName || 'Uploaded Document'}
                    </p>
                    {fileSize && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatFileSize(fileSize)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFileUrl('');
                      setFileName('');
                      setFileSize(null);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-blue-600" />
                  {uploadingFile ? `Uploading (${uploadProgress ?? 0}%)...` : 'Choose File to Upload (Max 50 MB)'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFile}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.txt,.csv,.json,.zip"
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description & Relevance
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this resource is useful for our task..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Resource
          </button>
        </form>
      </Modal>
    </div>
  );
}
