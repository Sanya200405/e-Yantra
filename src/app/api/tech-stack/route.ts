import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    const items = await prisma.techStackItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tech stack' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { technology, category, status, documentationLink, learningResource, notes } = body;

    if (!technology || !technology.trim()) {
      return NextResponse.json({ error: 'Technology name is required' }, { status: 400 });
    }

    const item = await prisma.techStackItem.create({
      data: {
        technology: technology.trim(),
        category: category || 'Robotics',
        status: status || 'LEARNING',
        documentationLink: documentationLink?.trim() || null,
        learningResource: learningResource?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'TECH_STACK',
      entityId: item.id,
      description: `${user.name} added technology "${item.technology}" (${item.category})`,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add technology' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
