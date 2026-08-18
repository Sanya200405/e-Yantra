import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');

    const where: any = {};
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;

    const items = await prisma.selfStudy.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch self-study topics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { topic, description, resourceLink, targetDate, status, notes, assignedToId } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const item = await prisma.selfStudy.create({
      data: {
        topic: topic.trim(),
        description: description?.trim() || null,
        resourceLink: resourceLink?.trim() || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || 'NOT_STARTED',
        notes: notes?.trim() || null,
        assignedToId: assignedToId || user.id,
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
      entityType: 'SELF_STUDY',
      entityId: item.id,
      description: `${user.name} added self-study topic "${item.topic}"`,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create self study plan' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
