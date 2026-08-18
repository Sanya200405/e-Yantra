import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${str}"`;
}

function arrayToCsv(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvField).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type') || 'tasks';

    // 1. JSON FULL BACKUP EXPORT
    if (format === 'json') {
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
        prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
        prisma.task.findMany({ include: { assignedTo: true, createdBy: true } }),
        prisma.classSession.findMany(),
        prisma.meeting.findMany({ include: { decisions: true, actionItems: true } }),
        prisma.meetingDecision.findMany(),
        prisma.meetingActionItem.findMany(),
        prisma.lecture.findMany(),
        prisma.note.findMany({ include: { author: true } }),
        prisma.selfStudy.findMany({ include: { assignedTo: true } }),
        prisma.gitRepository.findMany(),
        prisma.techStackItem.findMany(),
        prisma.hardwareItem.findMany({ include: { owner: true } }),
        prisma.theme.findMany(),
        prisma.resource.findMany({ include: { addedBy: true } }),
        prisma.systemSetting.findMany(),
      ]);

      const exportData = {
        meta: {
          platform: 'YantraHub e-Yantra Workspace',
          exportedAt: new Date().toISOString(),
          exportedBy: user.name,
          version: '1.0.0',
        },
        data: {
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

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `yantrahub_backup_${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // 2. CSV EXPORTS
    if (format === 'csv') {
      let csvContent = '';
      let filename = `yantrahub_${type}_${new Date().toISOString().split('T')[0]}.csv`;

      switch (type) {
        case 'tasks': {
          const tasks = await prisma.task.findMany({
            include: { assignedTo: true },
            orderBy: { createdAt: 'desc' },
          });
          const headers = ['ID', 'Title', 'Priority', 'Status', 'Category', 'Assignee', 'Due Date', 'Created At'];
          const rows = tasks.map((t) => [
            t.id,
            t.title,
            t.priority,
            t.status,
            t.category,
            t.assignedTo?.name || 'Unassigned',
            t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
            t.createdAt.toISOString().split('T')[0],
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        case 'hardware': {
          const items = await prisma.hardwareItem.findMany({
            include: { owner: true },
            orderBy: { createdAt: 'desc' },
          });
          const headers = ['Component Name', 'Category', 'Quantity', 'Status', 'Location', 'Assigned To', 'Purchase Info', 'Datasheet URL', 'Notes'];
          const rows = items.map((h) => [
            h.componentName,
            h.category,
            h.quantity,
            h.status,
            h.location || '',
            h.owner?.name || '',
            h.purchaseInfo || '',
            h.datasheetUrl || '',
            h.notes || '',
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        case 'meetings': {
          const meetings = await prisma.meeting.findMany({
            include: { decisions: true, actionItems: true },
            orderBy: { date: 'desc' },
          });
          const headers = ['Title', 'Date', 'Time', 'Agenda', 'Decisions', 'Action Items', 'Notes'];
          const rows = meetings.map((m) => [
            m.title,
            m.date.toISOString().split('T')[0],
            `${m.startTime || ''} - ${m.endTime || ''}`,
            m.agenda || '',
            m.decisions.map((d) => d.decisionText).join('; '),
            m.actionItems.map((a) => a.actionText).join('; '),
            m.notes || '',
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        case 'classes': {
          const classes = await prisma.classSession.findMany({ orderBy: { date: 'desc' } });
          const headers = ['Title', 'Instructor', 'Date', 'Start Time', 'End Time', 'Meeting Link', 'Recording Link', 'Description'];
          const rows = classes.map((c) => [
            c.title,
            c.instructor || '',
            c.date.toISOString().split('T')[0],
            c.startTime || '',
            c.endTime || '',
            c.meetingLink || '',
            c.recordingLink || '',
            c.description || '',
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        case 'notes': {
          const notes = await prisma.note.findMany({
            include: { author: true },
            orderBy: { createdAt: 'desc' },
          });
          const headers = ['Title', 'Category', 'Tags', 'Author', 'Created At', 'Content Preview'];
          const rows = notes.map((n) => [
            n.title,
            n.category,
            n.tags || '',
            n.author?.name || '',
            n.createdAt.toISOString().split('T')[0],
            n.content.substring(0, 100),
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        case 'resources': {
          const resources = await prisma.resource.findMany({
            include: { addedBy: true },
            orderBy: { createdAt: 'desc' },
          });
          const headers = ['Title', 'Category', 'URL', 'Bookmarked', 'Added By', 'Description'];
          const rows = resources.map((r) => [
            r.title,
            r.category,
            r.url || r.fileUrl || '',
            r.isBookmarked ? 'Yes' : 'No',
            r.addedBy?.name || '',
            r.description || '',
          ]);
          csvContent = arrayToCsv(headers, rows);
          break;
        }

        default:
          return NextResponse.json({ error: 'Unknown export type' }, { status: 400 });
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: error.status || 500 }
    );
  }
}
