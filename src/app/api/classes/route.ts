import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const classes = await prisma.classSession.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();
    const { title, instructor, date, startTime, endTime, meetingLink, description, notes, recordingLink } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const classSession = await prisma.classSession.create({
      data: {
        title: title.trim(),
        instructor: instructor?.trim() || null,
        date: new Date(date),
        startTime: startTime?.trim() || null,
        endTime: endTime?.trim() || null,
        meetingLink: meetingLink?.trim() || null,
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        recordingLink: recordingLink?.trim() || null,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'CLASS',
      entityId: classSession.id,
      description: `${user.name} scheduled class session "${classSession.title}"`,
    });

    return NextResponse.json(classSession, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create class' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
