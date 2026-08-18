import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lecture: true,
        note: true,
        hardware: true,
        gitRepo: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch task' },
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

    const existing = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startDate !== undefined)
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDate !== undefined)
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null;
    if (body.lectureId !== undefined) updateData.lectureId = body.lectureId || null;
    if (body.noteId !== undefined) updateData.noteId = body.noteId || null;
    if (body.hardwareId !== undefined) updateData.hardwareId = body.hardwareId || null;
    if (body.gitRepoId !== undefined) updateData.gitRepoId = body.gitRepoId || null;

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Check if status changed
    if (body.status && body.status !== existing.status) {
      const isCompleted = body.status === 'COMPLETED';
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: isCompleted ? 'COMPLETED' : 'UPDATED',
        entityType: 'TASK',
        entityId: updatedTask.id,
        description: isCompleted
          ? `${user.name} marked task "${updatedTask.title}" as Completed`
          : `${user.name} changed status of "${updatedTask.title}" to ${body.status}`,
      });
    } else {
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'UPDATED',
        entityType: 'TASK',
        entityId: updatedTask.id,
        description: `${user.name} updated task "${updatedTask.title}"`,
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Admins or creator can delete
    if (user.role !== 'ADMIN' && task.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Only admins or task creator can delete this task.' },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'TASK',
      entityId: params.id,
      description: `${user.name} deleted task "${task.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
