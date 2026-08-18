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

    const existing = await prisma.theme.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.themeName !== undefined) updateData.themeName = body.themeName.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.officialLink !== undefined) updateData.officialLink = body.officialLink?.trim() || null;
    if (body.selectedStatus !== undefined) updateData.selectedStatus = body.selectedStatus;
    if (body.difficultyNotes !== undefined)
      updateData.difficultyNotes = body.difficultyNotes?.trim() || null;
    if (body.technologies !== undefined)
      updateData.technologies = body.technologies?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const updated = await prisma.theme.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'UPDATED',
      entityType: 'THEME',
      entityId: updated.id,
      description: `${user.name} updated theme "${updated.themeName}" decision to ${updated.selectedStatus}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update theme' },
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

    const existing = await prisma.theme.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    await prisma.theme.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'THEME',
      entityId: params.id,
      description: `${user.name} deleted theme "${existing.themeName}"`,
    });

    return NextResponse.json({ success: true, message: 'Theme deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete theme' },
      { status: 500 }
    );
  }
}
