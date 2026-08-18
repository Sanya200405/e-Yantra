import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth, hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Fetch team members
    const teamMembers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch system settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      // Don't expose github token completely, mask it
      if (s.key === 'github_token' && s.value) {
        settingsMap[s.key] = s.value.substring(0, 4) + '...' + s.value.substring(s.value.length - 4);
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    // Default fallbacks if not yet in db
    if (!settingsMap['eyantra_portal_url']) {
      settingsMap['eyantra_portal_url'] = 'https://portal.e-yantra.org';
    }
    if (!settingsMap['competition_stage']) {
      settingsMap['competition_stage'] = 'Registration / Theme Selection';
    }
    if (!settingsMap['team_name']) {
      settingsMap['team_name'] = 'e-Yantra Robotics Team';
    }

    return NextResponse.json({
      teamMembers,
      settings: settingsMap,
      currentUserRole: user.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();
    const { action } = body;

    // Action 1: Add new team member
    if (action === 'ADD_MEMBER') {
      const { name, email, password, role } = body;
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existing) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);
      const newMember = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role || 'TEAM_MEMBER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'CREATED',
        entityType: 'USER',
        entityId: newMember.id,
        description: `${user.name} added team member ${newMember.name} as ${newMember.role}`,
      });

      return NextResponse.json({ success: true, user: newMember }, { status: 201 });
    }

    // Action 2: Update member role
    if (action === 'UPDATE_ROLE') {
      const { userId, role } = body;
      if (!userId || !role) {
        return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
      }

      // Prevent demoting last admin
      if (role !== 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (target?.role === 'ADMIN' && adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot remove the only admin in the system.' },
            { status: 400 }
          );
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'UPDATED',
        entityType: 'USER',
        entityId: updated.id,
        description: `${user.name} updated ${updated.name}'s role to ${role}`,
      });

      return NextResponse.json({ success: true, user: updated });
    }

    // Action 3: Remove member
    if (action === 'REMOVE_MEMBER') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      if (userId === user.id) {
        return NextResponse.json({ error: 'You cannot delete yourself.' }, { status: 400 });
      }

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await prisma.user.delete({ where: { id: userId } });

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'DELETED',
        entityType: 'USER',
        entityId: userId,
        description: `${user.name} removed team member ${target.name}`,
      });

      return NextResponse.json({ success: true, message: 'Member removed' });
    }

    // Action 4: Update System Setting
    if (action === 'UPDATE_SETTINGS') {
      const { settings } = body; // Record<string, string>
      if (settings && typeof settings === 'object') {
        for (const [key, value] of Object.entries(settings)) {
          if (typeof value === 'string') {
            await prisma.systemSetting.upsert({
              where: { key },
              update: { value },
              create: { key, value },
            });
          }
        }
      }

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'UPDATED',
        entityType: 'THEME',
        entityId: null,
        description: `${user.name} updated system & competition settings`,
      });

      return NextResponse.json({ success: true, message: 'Settings updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : 500 }
    );
  }
}
