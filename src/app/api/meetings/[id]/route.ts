import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        decisions: true,
        actionItems: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            convertedToTask: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const existing = await prisma.meeting.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime?.trim() || null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime?.trim() || null;
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink?.trim() || null;
    if (body.agenda !== undefined) updateData.agenda = body.agenda?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.attendees !== undefined) updateData.attendees = body.attendees?.trim() || null;

    const updated = await prisma.meeting.update({
      where: { id: params.id },
      data: updateData,
    });

    // If new decisions added
    if (Array.isArray(body.newDecisions) && body.newDecisions.length > 0) {
      for (const dec of body.newDecisions) {
        if (dec.trim()) {
          await prisma.meetingDecision.create({
            data: {
              meetingId: params.id,
              decisionText: dec.trim(),
            },
          });
        }
      }
    }

    // If new action items added
    if (Array.isArray(body.newActionItems) && body.newActionItems.length > 0) {
      for (const item of body.newActionItems) {
        if (item.actionText && item.actionText.trim()) {
          await prisma.meetingActionItem.create({
            data: {
              meetingId: params.id,
              actionText: item.actionText.trim(),
              assignedToId: item.assignedToId || null,
            },
          });
        }
      }
    }

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'UPDATED',
      entityType: 'MEETING',
      entityId: updated.id,
      description: `${user.name} updated meeting "${updated.title}"`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);

    const existing = await prisma.meeting.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existing.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.meeting.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'MEETING',
      entityId: params.id,
      description: `${user.name} deleted meeting "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Meeting deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
