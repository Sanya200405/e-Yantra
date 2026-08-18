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
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { componentName: { contains: search } },
        { location: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const items = await prisma.hardwareItem.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hardware' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { componentName, category, quantity, status, location, purchaseInfo, datasheetUrl, notes, ownerId } = body;

    if (!componentName || !componentName.trim()) {
      return NextResponse.json({ error: 'Component name is required' }, { status: 400 });
    }

    const item = await prisma.hardwareItem.create({
      data: {
        componentName: componentName.trim(),
        category: category || 'Sensors',
        quantity: Number(quantity) || 1,
        status: status || 'AVAILABLE',
        location: location?.trim() || null,
        purchaseInfo: purchaseInfo?.trim() || null,
        datasheetUrl: datasheetUrl?.trim() || null,
        notes: notes?.trim() || null,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CREATED',
      entityType: 'HARDWARE',
      entityId: item.id,
      description: `${user.name} added hardware "${item.componentName}" (${item.quantity}x)`,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add hardware' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
