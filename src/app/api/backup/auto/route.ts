import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.JWT_SECRET;

    // Validate cron secret if provided
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized CRON trigger' }, { status: 401 });
    }

    const [
      users,
      tasks,
      classes,
      meetings,
      decisions,
      actionItems,
      lectures,
      notes,
      selfStudies,
      gitRepos,
      techStack,
      hardware,
      themes,
      resources,
      settings,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.task.findMany(),
      prisma.classSession.findMany(),
      prisma.meeting.findMany(),
      prisma.meetingDecision.findMany(),
      prisma.meetingActionItem.findMany(),
      prisma.lecture.findMany(),
      prisma.note.findMany(),
      prisma.selfStudy.findMany(),
      prisma.gitRepository.findMany(),
      prisma.techStackItem.findMany(),
      prisma.hardwareItem.findMany(),
      prisma.theme.findMany(),
      prisma.resource.findMany(),
      prisma.systemSetting.findMany(),
    ]);

    const totalRecords =
      users.length +
      tasks.length +
      classes.length +
      meetings.length +
      decisions.length +
      actionItems.length +
      lectures.length +
      notes.length +
      selfStudies.length +
      gitRepos.length +
      techStack.length +
      hardware.length +
      themes.length +
      resources.length +
      settings.length;

    const snapshotData = {
      version: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      totalRecords,
      models: {
        users,
        tasks,
        classes,
        meetings,
        decisions,
        actionItems,
        lectures,
        notes,
        selfStudies,
        gitRepos,
        techStack,
        hardware,
        themes,
        resources,
        settings,
      },
    };

    const dataJson = JSON.stringify(snapshotData);
    const sizeBytes = Buffer.byteLength(dataJson, 'utf8');

    const backup = await prisma.backupRecord.create({
      data: {
        backupType: 'AUTOMATIC',
        status: 'SUCCESS',
        sizeBytes,
        recordCount: totalRecords,
        dataJson,
        createdBy: 'System (Auto Scheduled)',
        notes: 'Scheduled cloud database backup',
      },
    });

    await logActivity({
      userName: 'System',
      actionType: 'BACKUP',
      entityType: 'BACKUP',
      entityId: backup.id,
      description: `Automated scheduled backup created (${totalRecords} records, ${Math.round(sizeBytes / 1024)} KB)`,
    });

    return NextResponse.json({ success: true, backupId: backup.id, records: totalRecords });
  } catch (error: any) {
    console.error('Auto backup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
