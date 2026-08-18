import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: [{ selectedStatus: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(themes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { themeName, description, officialLink, selectedStatus, difficultyNotes, technologies, notes } = body;

    if (!themeName || !themeName.trim()) {
      return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        themeName: themeName.trim(),
        description: description?.trim() || null,
        officialLink: officialLink?.trim() || null,
        selectedStatus: selectedStatus || 'EXPLORING',
        difficultyNotes: difficultyNotes?.trim() || null,
        technologies: technologies?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'THEME',
      entityId: theme.id,
      description: `${user.name} added theme "${theme.themeName}" (${theme.selectedStatus})`,
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create theme' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
