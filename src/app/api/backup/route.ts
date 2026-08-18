import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

// Helper to serialize all database models
async function captureFullDatabaseSnapshot() {
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
    uploadedFiles,
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
    prisma.uploadedFile.findMany(),
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
    settings.length +
    uploadedFiles.length;

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
      uploadedFiles,
    },
  };

  const dataJson = JSON.stringify(snapshotData);
  const sizeBytes = Buffer.byteLength(dataJson, 'utf8');

  return { snapshotData, dataJson, sizeBytes, totalRecords };
}

// GET: Fetch backup history
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const backups = await prisma.backupRecord.findMany({
      select: {
        id: true,
        backupType: true,
        status: true,
        sizeBytes: true,
        recordCount: true,
        createdBy: true,
        notes: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ backups });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.status || 500 }
    );
  }
}

// POST: Create or Restore backup
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();
    const { action, notes, backupId } = body;

    // 1. CREATE BACKUP
    if (action === 'CREATE') {
      const { dataJson, sizeBytes, totalRecords } = await captureFullDatabaseSnapshot();

      const backup = await prisma.backupRecord.create({
        data: {
          backupType: body.backupType || 'MANUAL',
          status: 'SUCCESS',
          sizeBytes,
          recordCount: totalRecords,
          dataJson,
          createdBy: user.name,
          notes: notes || 'Manual cloud database backup',
        },
        select: {
          id: true,
          backupType: true,
          status: true,
          sizeBytes: true,
          recordCount: true,
          createdBy: true,
          notes: true,
          createdAt: true,
        },
      });

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'BACKUP',
        entityType: 'BACKUP',
        entityId: backup.id,
        description: `${user.name} created a cloud database backup (${totalRecords} records, ${Math.round(sizeBytes / 1024)} KB)`,
      });

      return NextResponse.json({ success: true, backup });
    }

    // 2. RESTORE BACKUP
    if (action === 'RESTORE') {
      if (!backupId) {
        return NextResponse.json({ error: 'Missing backupId for restore' }, { status: 400 });
      }

      const targetBackup = await prisma.backupRecord.findUnique({
        where: { id: backupId },
      });

      if (!targetBackup || !targetBackup.dataJson) {
        return NextResponse.json({ error: 'Backup not found or corrupted' }, { status: 404 });
      }

      // Step A: Validate JSON parse
      let parsed: any;
      try {
        parsed = JSON.parse(targetBackup.dataJson);
        if (!parsed.models) {
          throw new Error('Invalid backup schema');
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Backup validation failed: ${err.message}` },
          { status: 400 }
        );
      }

      // Step B: Take automated safety backup of current state
      const current = await captureFullDatabaseSnapshot();
      await prisma.backupRecord.create({
        data: {
          backupType: 'SAFETY_PRE_RESTORE',
          status: 'SUCCESS',
          sizeBytes: current.sizeBytes,
          recordCount: current.totalRecords,
          dataJson: current.dataJson,
          createdBy: 'System (Auto Safety)',
          notes: `Safety backup created before restoring backup ${targetBackup.id}`,
        },
      });

      // Step C: Restore data in transaction
      const m = parsed.models;

      await prisma.$transaction(async (tx) => {
        // Clear dependent tables first
        await tx.meetingActionItem.deleteMany();
        await tx.meetingDecision.deleteMany();
        await tx.task.deleteMany();
        await tx.note.deleteMany();
        await tx.selfStudy.deleteMany();
        await tx.hardwareItem.deleteMany();
        await tx.resource.deleteMany();
        await tx.theme.deleteMany();
        await tx.gitRepository.deleteMany();
        await tx.classSession.deleteMany();
        await tx.meeting.deleteMany();
        await tx.lecture.deleteMany();
        await tx.techStackItem.deleteMany();
        await tx.uploadedFile.deleteMany();

        // Restore independent models
        for (const item of m.uploadedFiles || []) {
          await tx.uploadedFile.create({
            data: {
              ...item,
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            },
          });
        }
        for (const item of m.techStack || []) {
          await tx.techStackItem.create({ data: item });
        }
        for (const item of m.classes || []) {
          await tx.classSession.create({ data: { ...item, date: new Date(item.date) } });
        }
        for (const item of m.lectures || []) {
          await tx.lecture.create({
            data: { ...item, date: item.date ? new Date(item.date) : null },
          });
        }
        for (const item of m.themes || []) {
          await tx.theme.create({ data: item });
        }
        for (const item of m.meetings || []) {
          await tx.meeting.create({ data: { ...item, date: new Date(item.date) } });
        }
        for (const item of m.decisions || []) {
          await tx.meetingDecision.create({ data: item });
        }
        for (const item of m.gitRepos || []) {
          await tx.gitRepository.create({ data: item });
        }
        for (const item of m.hardware || []) {
          await tx.hardwareItem.create({ data: item });
        }
        for (const item of m.notes || []) {
          await tx.note.create({ data: item });
        }
        for (const item of m.selfStudies || []) {
          await tx.selfStudy.create({
            data: { ...item, targetDate: item.targetDate ? new Date(item.targetDate) : null },
          });
        }
        for (const item of m.resources || []) {
          await tx.resource.create({ data: item });
        }
        for (const item of m.tasks || []) {
          await tx.task.create({
            data: {
              ...item,
              startDate: item.startDate ? new Date(item.startDate) : null,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
        }
        for (const item of m.actionItems || []) {
          await tx.meetingActionItem.create({ data: item });
        }
      });

      await logActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'RESTORE',
        entityType: 'BACKUP',
        entityId: targetBackup.id,
        description: `${user.name} restored cloud database from backup (${targetBackup.recordCount} records)`,
      });

      return NextResponse.json({
        success: true,
        message: 'Database successfully restored from backup',
        restoredRecords: targetBackup.recordCount,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}

// DELETE: Remove old backup record
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing backup id' }, { status: 400 });
    }

    await prisma.backupRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete backup' },
      { status: error.status || 500 }
    );
  }
}
