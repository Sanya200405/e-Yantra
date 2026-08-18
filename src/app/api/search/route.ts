import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const [tasks, notes, lectures, meetings, resources, hardware, techStack, themes] =
      await Promise.all([
        prisma.task.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
          },
          take: 5,
          select: { id: true, title: true, status: true, priority: true },
        }),
        prisma.note.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
              { category: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, category: true },
        }),
        prisma.lecture.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
          },
          take: 5,
          select: { id: true, title: true, source: true },
        }),
        prisma.meeting.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { agenda: { contains: query } },
              { notes: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, title: true, date: true },
        }),
        prisma.resource.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
          },
          take: 5,
          select: { id: true, title: true, category: true, url: true },
        }),
        prisma.hardwareItem.findMany({
          where: {
            OR: [
              { componentName: { contains: query } },
              { category: { contains: query } },
              { location: { contains: query } },
            ],
          },
          take: 5,
          select: { id: true, componentName: true, status: true, quantity: true },
        }),
        prisma.techStackItem.findMany({
          where: {
            OR: [{ technology: { contains: query } }, { category: { contains: query } }],
          },
          take: 5,
          select: { id: true, technology: true, category: true, status: true },
        }),
        prisma.theme.findMany({
          where: {
            OR: [{ themeName: { contains: query } }, { description: { contains: query } }],
          },
          take: 5,
          select: { id: true, themeName: true, selectedStatus: true },
        }),
      ]);

    const results = [
      ...tasks.map((t) => ({
        type: 'Task',
        title: t.title,
        subtitle: `Status: ${t.status} | Priority: ${t.priority}`,
        url: '/tasks',
      })),
      ...notes.map((n) => ({
        type: 'Note',
        title: n.title,
        subtitle: `Category: ${n.category}`,
        url: '/notes',
      })),
      ...lectures.map((l) => ({
        type: 'Lecture',
        title: l.title,
        subtitle: l.source || 'Lecture',
        url: '/lectures',
      })),
      ...meetings.map((m) => ({
        type: 'Meeting',
        title: m.title,
        subtitle: new Date(m.date).toLocaleDateString(),
        url: '/meetings',
      })),
      ...resources.map((r) => ({
        type: 'Resource',
        title: r.title,
        subtitle: `Category: ${r.category}`,
        url: '/resources',
      })),
      ...hardware.map((h) => ({
        type: 'Hardware',
        title: h.componentName,
        subtitle: `${h.quantity}x (${h.status})`,
        url: '/hardware',
      })),
      ...techStack.map((ts) => ({
        type: 'Tech Stack',
        title: ts.technology,
        subtitle: `${ts.category} (${ts.status})`,
        url: '/tech-stack',
      })),
      ...themes.map((th) => ({
        type: 'Theme',
        title: th.themeName,
        subtitle: `Decision: ${th.selectedStatus}`,
        url: '/themes',
      })),
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
