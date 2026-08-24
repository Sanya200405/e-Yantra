import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadToStorage, deleteFromStorage, MAX_FILE_SIZE_MB } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * Handles authenticated file uploads to Cloud Object Storage (Vercel Blob)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as 'RESOURCE' | 'NOTE' | 'GENERAL') || 'GENERAL';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }

    const result = await uploadToStorage(file, {
      userId: user.id,
      userName: user.name,
      category,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      url: result.url,
      storageKey: result.storageKey,
      fileName: result.fileName,
      size: result.size,
      mimeType: result.mimeType,
      provider: result.provider,
      category: result.category,
      uploadedBy: user.name,
      createdAt: result.createdAt,
    });
  } catch (error: any) {
    console.error('File upload API error:', error);

    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again to upload files.' },
        { status: 401 }
      );
    }

    if (error.message?.includes('too large')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message?.includes('not supported') || error.message?.includes('Executable')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message?.includes('Vercel Blob Storage is not configured') || error.message?.includes('STORAGE_NOT_CONFIGURED')) {
      return NextResponse.json(
        {
          error: 'Cloud file storage is temporarily unavailable. Vercel Blob token is required on production deployments.',
          code: 'STORAGE_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong while uploading the file. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Deletes a file from Cloud Storage & PostgreSQL metadata
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    if (!id && !url) {
      return NextResponse.json(
        { error: 'File ID or URL is required for deletion.' },
        { status: 400 }
      );
    }

    const result = await deleteFromStorage(
      { id: id || undefined, url: url || undefined },
      user.id,
      user.role
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('File deletion API error:', error);

    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    if (error.message?.startsWith('UNAUTHORIZED_DELETE')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this file.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete file.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Retrieves recently uploaded files metadata for the team
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const files = await prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Failed to fetch files' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
