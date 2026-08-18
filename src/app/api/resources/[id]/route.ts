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

    const existing = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.url !== undefined) updateData.url = body.url?.trim() || null;
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl?.trim() || null;
    if (body.isBookmarked !== undefined) updateData.isBookmarked = Boolean(body.isBookmarked);

    const updated = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
      include: {
        addedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (body.isBookmarked !== undefined && body.isBookmarked !== existing.isBookmarked) {
      // Just bookmark toggle, no heavy log needed
    } else {
      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'UPDATED',
        entityType: 'RESOURCE',
        entityId: updated.id,
        description: `${user.name} updated resource "${updated.title}"`,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update resource' },
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

    const existing = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existing.addedById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.resource.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'RESOURCE',
      entityId: params.id,
      description: `${user.name} deleted resource "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Resource deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
