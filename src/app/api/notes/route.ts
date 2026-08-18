import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const authorId = searchParams.get('authorId');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, content, category, tags, attachments } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content,
        category: category || 'GENERAL',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : tags || null,
        attachments: Array.isArray(attachments) ? JSON.stringify(attachments) : attachments || null,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'NOTE',
      entityId: note.id,
      description: `${user.name} created note "${note.title}" in ${note.category}`,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
