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

    const existing = await prisma.hardwareItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Hardware item not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.componentName !== undefined) updateData.componentName = body.componentName.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.quantity !== undefined) updateData.quantity = Number(body.quantity);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.purchaseInfo !== undefined) updateData.purchaseInfo = body.purchaseInfo?.trim() || null;
    if (body.datasheetUrl !== undefined) updateData.datasheetUrl = body.datasheetUrl?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null;

    const updated = await prisma.hardwareItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'UPDATED',
      entityType: 'HARDWARE',
      entityId: updated.id,
      description: `${user.name} updated hardware "${updated.componentName}" status to ${updated.status}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update hardware' },
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

    const existing = await prisma.hardwareItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Hardware item not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.hardwareItem.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'HARDWARE',
      entityId: params.id,
      description: `${user.name} removed hardware item "${existing.componentName}"`,
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete hardware' },
      { status: 500 }
    );
  }
}
