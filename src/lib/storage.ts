import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import path from 'path';
import crypto from 'crypto';

// Maximum supported file size: 50 MB
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_FILE_SIZE_MB = 50;

// Whitelist of allowed MIME types & corresponding extensions
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Images
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  
  // Text & Code
  'text/plain': ['.txt', '.log'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
  'application/json': ['.json'],
  
  // Archives & Firmware
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz', '.tar.gz'],
  'application/octet-stream': ['.bin', '.hex', '.elf', '.pdf', '.zip'],
};

export function validateFileType(mimeType: string, filename: string): { valid: boolean; reason?: string } {
  const ext = path.extname(filename).toLowerCase();
  
  // Block dangerous executable extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.sh', '.vbs', '.js', '.ts', '.jsx', '.tsx',
    '.php', '.phtml', '.py', '.rb', '.pl', '.jar', '.msi', '.scr', '.com'
  ];
  if (dangerousExtensions.includes(ext)) {
    return {
      valid: false,
      reason: `Executable or script files (${ext}) are not allowed for security reasons.`,
    };
  }

  // Check MIME whitelist
  const allowedExts = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
  if (allowedExts) return { valid: true };

  // Fallback extension check
  const allAllowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat();
  if (allAllowedExtensions.includes(ext)) return { valid: true };

  return {
    valid: false,
    reason: `File format (${ext || mimeType}) not supported. Please upload PDF, images (PNG, JPG, WEBP), Office docs (DOCX, XLSX, PPTX), data files (CSV, JSON, TXT), or archives (ZIP).`,
  };
}

export function sanitizeFilename(originalName: string): string {
  const baseName = path.basename(originalName);
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const clean = safeName.replace(/^[._-]+|[._-]+$/g, '');
  return clean || 'document';
}

export interface UploadResult {
  id: string;
  url: string;
  storageKey: string;
  fileName: string;
  size: number;
  mimeType: string;
  provider: 'VERCEL_BLOB' | 'DATABASE' | 'LOCAL';
  category?: string;
  uploadedBy?: string;
  createdAt: Date;
}

/**
 * Upload a file to Cloud Storage (Vercel Blob) or Database Blob storage with PostgreSQL metadata tracking.
 * Guarantees zero-loss persistent storage across ephemeral server redeployments.
 */
export async function uploadToStorage(
  file: File,
  options: {
    userId?: string;
    userName?: string;
    category?: 'RESOURCE' | 'NOTE' | 'GENERAL';
  } = {}
): Promise<UploadResult> {
  const { userId, userName, category = 'GENERAL' } = options;

  // 1. Size Validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`This file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty.');
  }

  // 2. Type Validation
  const validation = validateFileType(file.type || 'application/octet-stream', file.name);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Unsupported file type.');
  }

  const cleanName = sanitizeFilename(file.name);
  const uniquePrefix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const storagePath = `yantrahub/${category.toLowerCase()}/${uniquePrefix}_${cleanName}`;

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Cloud Object Storage (Vercel Blob) if token is configured
  if (hasBlobToken) {
    let uploadedBlobUrl: string | null = null;
    try {
      const blob = await put(storagePath, file, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
        addRandomSuffix: false,
      });
      uploadedBlobUrl = blob.url;

      const fileRecord = await prisma.uploadedFile.create({
        data: {
          filename: file.name,
          storageKey: blob.pathname || storagePath,
          url: blob.url,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          provider: 'VERCEL_BLOB',
          category: category,
          uploadedById: userId || null,
        },
      });

      return {
        id: fileRecord.id,
        url: fileRecord.url,
        storageKey: fileRecord.storageKey,
        fileName: fileRecord.filename,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        provider: 'VERCEL_BLOB',
        category: category,
        uploadedBy: userName,
        createdAt: fileRecord.createdAt,
      };
    } catch (blobError: any) {
      console.error('Vercel Blob upload failed, falling back to persistent database storage:', blobError);
      // Clean up orphaned blob if database record creation failed
      if (uploadedBlobUrl) {
        try {
          await del(uploadedBlobUrl);
        } catch {}
      }
    }
  }

  // 4. Instant Zero-Config Database Storage Fallback (Permanent across server restarts and redeployments)
  const base64Data = buffer.toString('base64');
  const tempId = `file_${uniquePrefix}`;

  const fileRecord = await prisma.uploadedFile.create({
    data: {
      filename: file.name,
      storageKey: storagePath,
      url: `/api/upload/${tempId}`,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      dataBase64: base64Data,
      provider: 'DATABASE',
      category: category,
      uploadedById: userId || null,
    },
  });

  // Update URL to point to its permanent retrieval endpoint
  const permanentUrl = `/api/upload/${fileRecord.id}`;
  await prisma.uploadedFile.update({
    where: { id: fileRecord.id },
    data: { url: permanentUrl },
  });

  return {
    id: fileRecord.id,
    url: permanentUrl,
    storageKey: fileRecord.storageKey,
    fileName: fileRecord.filename,
    size: fileRecord.size,
    mimeType: fileRecord.mimeType,
    provider: 'DATABASE',
    category: category,
    uploadedBy: userName,
    createdAt: fileRecord.createdAt,
  };
}

/**
 * Delete a file from Cloud Storage & PostgreSQL metadata.
 */
export async function deleteFromStorage(
  identifier: { id?: string; url?: string; storageKey?: string },
  requestingUserId?: string,
  userRole?: string
): Promise<{ success: boolean; message: string }> {
  let fileRecord = null;
  if (identifier.id) {
    fileRecord = await prisma.uploadedFile.findUnique({ where: { id: identifier.id } });
  } else if (identifier.storageKey) {
    fileRecord = await prisma.uploadedFile.findUnique({ where: { storageKey: identifier.storageKey } });
  } else if (identifier.url) {
    fileRecord = await prisma.uploadedFile.findFirst({ where: { url: identifier.url } });
  }

  // Authorization check
  if (fileRecord && requestingUserId && userRole !== 'ADMIN') {
    if (fileRecord.uploadedById && fileRecord.uploadedById !== requestingUserId) {
      throw new Error('UNAUTHORIZED_DELETE: You do not have permission to delete this file.');
    }
  }

  const targetUrl = fileRecord?.url || identifier.url;
  const isBlobUrl = targetUrl?.includes('public.blob.vercel-storage.com') || (targetUrl?.startsWith('https://') && !targetUrl.includes('/api/upload/'));

  if (isBlobUrl && targetUrl) {
    try {
      await del(targetUrl);
    } catch (delError) {
      console.warn('Vercel blob deletion warning:', delError);
    }
  }

  if (fileRecord) {
    await prisma.uploadedFile.delete({
      where: { id: fileRecord.id },
    });
  }

  return { success: true, message: 'File successfully deleted.' };
}
