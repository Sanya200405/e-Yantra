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

    const existing = await prisma.lecture.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (user.role === 'ADMIN') {
      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.description !== undefined) updateData.description = body.description?.trim() || null;
      if (body.source !== undefined) updateData.source = body.source?.trim() || null;
      if (body.lectureLink !== undefined) updateData.lectureLink = body.lectureLink?.trim() || null;
      if (body.recordingLink !== undefined) updateData.recordingLink = body.recordingLink?.trim() || null;
      if (body.slidesLink !== undefined) updateData.slidesLink = body.slidesLink?.trim() || null;
      if (body.date !== undefined) updateData.date = body.date ? new Date(body.date) : null;
    }

    // Both Admin and Team Member can update notes and completion status
    if (body.completionStatus !== undefined) updateData.completionStatus = body.completionStatus;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const updated = await prisma.lecture.update({
      where: { id: params.id },
      data: updateData,
    });

    if (body.completionStatus && body.completionStatus !== existing.completionStatus) {
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: body.completionStatus === 'COMPLETED' ? 'COMPLETED' : 'UPDATED',
        entityType: 'LECTURE',
        entityId: updated.id,
        description: body.completionStatus === 'COMPLETED'
          ? `${user.name} marked lecture "${updated.title}" as Completed`
          : `${user.name} changed status of lecture "${updated.title}" to ${body.completionStatus}`,
      });
    } else {
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'UPDATED',
        entityType: 'LECTURE',
        entityId: updated.id,
        description: `${user.name} updated lecture "${updated.title}"`,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update lecture' },
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
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const existing = await prisma.lecture.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    await prisma.lecture.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'LECTURE',
      entityId: params.id,
      description: `${user.name} deleted lecture "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Lecture deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete lecture' },
      { status: 500 }
    );
  }
}
