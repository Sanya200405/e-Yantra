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

    const existing = await prisma.techStackItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.technology !== undefined) updateData.technology = body.technology.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.documentationLink !== undefined)
      updateData.documentationLink = body.documentationLink?.trim() || null;
    if (body.learningResource !== undefined)
      updateData.learningResource = body.learningResource?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const updated = await prisma.techStackItem.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'UPDATED',
      entityType: 'TECH_STACK',
      entityId: updated.id,
      description: `${user.name} updated technology "${updated.technology}" status to ${updated.status}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update technology' },
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

    const existing = await prisma.techStackItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.techStackItem.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'TECH_STACK',
      entityId: params.id,
      description: `${user.name} removed technology "${existing.technology}"`,
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete technology' },
      { status: 500 }
    );
  }
}
