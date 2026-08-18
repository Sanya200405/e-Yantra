import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const bookmarkedOnly = searchParams.get('bookmarked') === 'true';
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (bookmarkedOnly) where.isBookmarked = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      include: {
        addedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ isBookmarked: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(resources);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, description, category, url, fileUrl, isBookmarked } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'DOCUMENTATION',
        url: url?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        isBookmarked: Boolean(isBookmarked),
        addedById: user.id,
      },
      include: {
        addedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'RESOURCE',
      entityId: resource.id,
      description: `${user.name} added resource "${resource.title}" (${resource.category})`,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add resource' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
