import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lectures = await prisma.lecture.findMany({
      orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(lectures);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lectures' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();
    const { title, description, source, lectureLink, recordingLink, slidesLink, date, completionStatus, notes } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const lecture = await prisma.lecture.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        source: source?.trim() || 'Official e-Yantra',
        lectureLink: lectureLink?.trim() || null,
        recordingLink: recordingLink?.trim() || null,
        slidesLink: slidesLink?.trim() || null,
        date: date ? new Date(date) : null,
        completionStatus: completionStatus || 'NOT_STARTED',
        notes: notes?.trim() || null,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'LECTURE',
      entityId: lecture.id,
      description: `${user.name} added lecture "${lecture.title}"`,
    });

    return NextResponse.json(lecture, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create lecture' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
