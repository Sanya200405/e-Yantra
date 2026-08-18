import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
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
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz', '.tar.gz'],
  'application/octet-stream': ['.bin', '.hex', '.elf', '.pdf', '.zip'], // For microcontroller binaries/firmware & fallback
};

// Check if a file is supported based on MIME type and filename extension
export function validateFileType(mimeType: string, filename: string): { valid: boolean; reason?: string } {
  const ext = path.extname(filename).toLowerCase();
  
  // Block explicitly dangerous executable extensions regardless of MIME
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.js', '.ts', '.jsx', '.tsx', '.php', '.phtml', '.py', '.rb', '.pl', '.jar', '.msi', '.scr', '.com'];
  if (dangerousExtensions.includes(ext)) {
    return {
      valid: false,
      reason: `Executable or script files (${ext}) are not allowed for security reasons.`,
    };
  }

  // Check MIME whitelist
  const allowedExts = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
  if (allowedExts) {
    return { valid: true };
  }

  // Fallback: Check extension whitelist if MIME type is generic
  const allAllowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat();
  if (allAllowedExtensions.includes(ext)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `File format not supported. Please upload PDF, images (PNG, JPG, WEBP), Office docs (DOCX, XLSX, PPTX), data files (CSV, JSON, TXT), or archives (ZIP).`,
  };
}

// Sanitize filename to prevent path traversal and weird character injection
export function sanitizeFilename(originalName: string): string {
  // Strip path traversal sequences
  const baseName = path.basename(originalName);
  // Replace non-alphanumeric (except dot, hyphen, underscore) with underscore
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Trim leading/trailing dots/underscores
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
  provider: 'VERCEL_BLOB' | 'LOCAL';
  category?: string;
  uploadedBy?: string;
  createdAt: Date;
}

/**
 * Upload a file to Cloud Storage (Vercel Blob) or local storage with PostgreSQL metadata tracking.
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

  // 1. File Size Validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`This file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty.');
  }

  // 2. File Type & MIME Validation
  const validation = validateFileType(file.type || 'application/octet-stream', file.name);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Unsupported file type.');
  }

  const cleanName = sanitizeFilename(file.name);
  const uniquePrefix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const storagePath = `yantrahub/${category.toLowerCase()}/${uniquePrefix}_${cleanName}`;

  let uploadedUrl: string = '';
  let storageKey: string = storagePath;
  let provider: 'VERCEL_BLOB' | 'LOCAL' = 'VERCEL_BLOB';

  const isVercelEnvironment = process.env.VERCEL === '1';
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  // 3. Upload to Cloud Storage (Vercel Blob)
  if (hasBlobToken) {
    try {
      const blob = await put(storagePath, file, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
        addRandomSuffix: false,
      });

      uploadedUrl = blob.url;
      storageKey = blob.pathname || storagePath;
      provider = 'VERCEL_BLOB';
    } catch (blobError: any) {
      console.error('Vercel Blob upload failed:', blobError);
      throw new Error(`Cloud storage upload failed: ${blobError.message || 'Storage service error'}`);
    }
  } else if (!isVercelEnvironment) {
    // Local development fallback (writes to public/uploads on developer workstation)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localFileName = `${uniquePrefix}_${cleanName}`;
      const localFilePath = path.join(uploadsDir, localFileName);
      fs.writeFileSync(localFilePath, buffer);

      uploadedUrl = `/uploads/${localFileName}`;
      storageKey = localFileName;
      provider = 'LOCAL';
    } catch (localError: any) {
      console.error('Local file write failed:', localError);
      throw new Error(`Local file storage failed: ${localError.message}`);
    }
  } else {
    // On Vercel but BLOB_READ_WRITE_TOKEN is missing
    throw new Error(
      'Vercel Blob Storage is not configured. Please add a Blob store in your Vercel Project Settings to enable persistent file uploads.'
    );
  }

  // 4. Record metadata in PostgreSQL via Prisma
  try {
    const fileRecord = await prisma.uploadedFile.create({
      data: {
        filename: file.name,
        storageKey: storageKey,
        url: uploadedUrl,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        provider: provider,
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
      provider: provider,
      category: category,
      uploadedBy: userName,
      createdAt: fileRecord.createdAt,
    };
  } catch (dbError: any) {
    console.error('Database write failed for uploaded file, cleaning up cloud storage:', dbError);
    // Cleanup orphaned cloud object
    if (provider === 'VERCEL_BLOB' && uploadedUrl) {
      try {
        await del(uploadedUrl);
      } catch (cleanupError) {
        console.error('Failed to cleanup orphaned blob:', cleanupError);
      }
    }
    throw new Error('Failed to record file metadata in the database.');
  }
}

/**
 * Delete a file from Cloud Storage & PostgreSQL metadata.
 */
export async function deleteFromStorage(
  identifier: { id?: string; url?: string; storageKey?: string },
  requestingUserId?: string,
  userRole?: string
): Promise<{ success: boolean; message: string }> {
  // Find record in Prisma
  let fileRecord = null;
  if (identifier.id) {
    fileRecord = await prisma.uploadedFile.findUnique({ where: { id: identifier.id } });
  } else if (identifier.storageKey) {
    fileRecord = await prisma.uploadedFile.findUnique({ where: { storageKey: identifier.storageKey } });
  } else if (identifier.url) {
    fileRecord = await prisma.uploadedFile.findFirst({ where: { url: identifier.url } });
  }

  // Authorization check: only uploader or ADMIN can delete
  if (fileRecord && requestingUserId && userRole !== 'ADMIN') {
    if (fileRecord.uploadedById && fileRecord.uploadedById !== requestingUserId) {
      throw new Error('UNAUTHORIZED_DELETE: You do not have permission to delete this file.');
    }
  }

  const targetUrl = fileRecord?.url || identifier.url;
  const isBlobUrl = targetUrl?.includes('public.blob.vercel-storage.com') || targetUrl?.startsWith('https://');

  // 1. Delete from Cloud Storage
  if (isBlobUrl && targetUrl) {
    try {
      await del(targetUrl);
    } catch (delError) {
      console.warn('Vercel blob deletion warning:', delError);
    }
  } else if (fileRecord?.provider === 'LOCAL' || targetUrl?.startsWith('/uploads/')) {
    try {
      const filename = path.basename(targetUrl || '');
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (localDelError) {
      console.warn('Local file deletion warning:', localDelError);
    }
  }

  // 2. Delete from PostgreSQL
  if (fileRecord) {
    await prisma.uploadedFile.delete({
      where: { id: fileRecord.id },
    });
  }

  return { success: true, message: 'File successfully deleted from storage and database.' };
}
