import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        decisions: {
          orderBy: { createdAt: 'asc' },
        },
        actionItems: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            convertedToTask: {
              select: { id: true, title: true, status: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(meetings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, date, startTime, endTime, meetingLink, agenda, notes, attendees, decisions, actionItems } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: title.trim(),
        date: new Date(date),
        startTime: startTime?.trim() || null,
        endTime: endTime?.trim() || null,
        meetingLink: meetingLink?.trim() || null,
        agenda: agenda?.trim() || null,
        notes: notes?.trim() || null,
        attendees: attendees?.trim() || null,
        createdById: user.id,
        decisions: {
          create: (decisions || [])
            .filter((d: any) => d.decisionText && d.decisionText.trim())
            .map((d: any) => ({ decisionText: d.decisionText.trim() })),
        },
        actionItems: {
          create: (actionItems || [])
            .filter((a: any) => a.actionText && a.actionText.trim())
            .map((a: any) => ({
              actionText: a.actionText.trim(),
              assignedToId: a.assignedToId || null,
            })),
        },
      },
      include: {
        decisions: true,
        actionItems: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'MEETING',
      entityId: meeting.id,
      description: `${user.name} scheduled meeting "${meeting.title}"`,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
