import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [
      users,
      tasks,
      classes,
      meetings,
      lectures,
      notes,
      selfStudy,
      gitRepos,
      techStack,
      hardware,
      themes,
      resources,
      activityLogs,
      settings,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.task.findMany(),
      prisma.classSession.findMany(),
      prisma.meeting.findMany({ include: { decisions: true, actionItems: true } }),
      prisma.lecture.findMany(),
      prisma.note.findMany(),
      prisma.selfStudy.findMany(),
      prisma.gitRepository.findMany(),
      prisma.techStackItem.findMany(),
      prisma.hardwareItem.findMany(),
      prisma.theme.findMany(),
      prisma.resource.findMany(),
      prisma.activityLog.findMany(),
      prisma.systemSetting.findMany(),
    ]);

    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        system: 'e-Yantra Team Platform',
      },
      data: {
        users,
        tasks,
        classes,
        meetings,
        lectures,
        notes,
        selfStudy,
        gitRepos,
        techStack,
        hardware,
        themes,
        resources,
        activityLogs,
        settings,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="eyantra_backup_${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export backup' },
      { status: error.message?.includes('FORBIDDEN') ? 403 : 500 }
    );
  }
}
