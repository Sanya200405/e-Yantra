import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const existing = await prisma.selfStudy.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.topic !== undefined) updateData.topic = body.topic.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.resourceLink !== undefined) updateData.resourceLink = body.resourceLink?.trim() || null;
    if (body.targetDate !== undefined)
      updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null;

    const updated = await prisma.selfStudy.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (body.status && body.status !== existing.status) {
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: body.status === 'COMPLETED' ? 'COMPLETED' : 'UPDATED',
        entityType: 'SELF_STUDY',
        entityId: updated.id,
        description: body.status === 'COMPLETED'
          ? `${user.name} completed self-study on "${updated.topic}"`
          : `${user.name} updated self-study progress on "${updated.topic}" to ${body.status}`,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update topic' },
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

    const existing = await prisma.selfStudy.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existing.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.selfStudy.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'SELF_STUDY',
      entityId: params.id,
      description: `${user.name} deleted self-study topic "${existing.topic}"`,
    });

    return NextResponse.json({ success: true, message: 'Topic deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
