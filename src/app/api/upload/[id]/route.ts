import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/upload/[id]
 * Serves an uploaded file directly from database storage or redirects to cloud storage
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // If hosted on Vercel Blob, redirect directly to CDN
    if (fileRecord.provider === 'VERCEL_BLOB' && fileRecord.url.startsWith('http')) {
      return NextResponse.redirect(fileRecord.url);
    }

    // If stored in database as base64 payload
    if (fileRecord.dataBase64) {
      const buffer = Buffer.from(fileRecord.dataBase64, 'base64');
      const safeFilename = encodeURIComponent(fileRecord.filename);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': fileRecord.mimeType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return NextResponse.json({ error: 'File payload is unavailable' }, { status: 404 });
  } catch (error: any) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}
