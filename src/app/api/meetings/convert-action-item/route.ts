import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { actionItemId, priority, dueDate } = await req.json();

    if (!actionItemId) {
      return NextResponse.json({ error: 'Action item ID is required' }, { status: 400 });
    }

    const actionItem = await prisma.meetingActionItem.findUnique({
      where: { id: actionItemId },
      include: {
        meeting: true,
      },
    });

    if (!actionItem) {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
    }

    if (actionItem.convertedToTaskId) {
      return NextResponse.json(
        { error: 'Action item is already converted to a task.' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: actionItem.actionText,
        description: `Action item originated from team meeting: "${actionItem.meeting.title}"`,
        priority: priority || 'MEDIUM',
        status: 'NOT_STARTED',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: actionItem.assignedToId || null,
        createdById: user.id,
        category: 'General',
      },
    });

    // Link back to action item
    await prisma.meetingActionItem.update({
      where: { id: actionItemId },
      data: {
        convertedToTaskId: task.id,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CONVERTED',
      entityType: 'TASK',
      entityId: task.id,
      description: `${user.name} converted action item "${actionItem.actionText}" from meeting "${actionItem.meeting.title}" to Task`,
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert action item' },
      { status: 500 }
    );
  }
}
