import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const existing = await prisma.classSession.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.instructor !== undefined) updateData.instructor = body.instructor?.trim() || null;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime?.trim() || null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime?.trim() || null;
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.recordingLink !== undefined) updateData.recordingLink = body.recordingLink?.trim() || null;

    const updated = await prisma.classSession.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'UPDATED',
      entityType: 'CLASS',
      entityId: updated.id,
      description: `${user.name} updated class "${updated.title}"`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update class' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(req);

    const existing = await prisma.classSession.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    await prisma.classSession.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'CLASS',
      entityId: params.id,
      description: `${user.name} deleted class "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Class deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete class' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : 500 }
    );
  }
}
