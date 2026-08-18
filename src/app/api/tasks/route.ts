import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lecture: {
          select: { id: true, title: true },
        },
        note: {
          select: { id: true, title: true },
        },
        hardware: {
          select: { id: true, componentName: true },
        },
        gitRepo: {
          select: { id: true, repositoryName: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const {
      title,
      description,
      priority,
      status,
      startDate,
      dueDate,
      category,
      assignedToId,
      lectureId,
      noteId,
      hardwareId,
      gitRepoId,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || 'General',
        assignedToId: assignedToId || null,
        createdById: user.id,
        lectureId: lectureId || null,
        noteId: noteId || null,
        hardwareId: hardwareId || null,
        gitRepoId: gitRepoId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'TASK',
      entityId: task.id,
      description: `${user.name} created task "${task.title}"`,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
