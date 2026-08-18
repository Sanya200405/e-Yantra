import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();

    // 1. Fetch system settings & selected theme
    const [settings, selectedTheme] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.theme.findFirst({
        where: { selectedStatus: 'SELECTED' },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const competitionStage = settingsMap['competition_stage'] || 'Registration / Theme Selection';
    const currentTheme = selectedTheme?.themeName || null;

    // 2. Fetch tasks for calculation
    const allTasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        category: true,
      },
    });

    const taskCounts = {
      total: allTasks.length,
      notStarted: allTasks.filter((t) => t.status === 'NOT_STARTED').length,
      inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      blocked: allTasks.filter((t) => t.status === 'BLOCKED').length,
      completed: allTasks.filter((t) => t.status === 'COMPLETED').length,
      overdue: allTasks.filter((t) => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        return new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
      }).length,
    };

    // 3. Find next class, next meeting, next task deadline
    const [nextClass, nextMeeting, nextTaskDeadline] = await Promise.all([
      prisma.classSession.findFirst({
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
      }),
      prisma.meeting.findFirst({
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
      }),
      prisma.task.findFirst({
        where: {
          dueDate: { gte: now },
          status: { not: 'COMPLETED' },
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    // 4. Build Upcoming Timeline Items
    const [upcomingClasses, upcomingMeetings, upcomingTasks] = await Promise.all([
      prisma.classSession.findMany({
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      prisma.meeting.findMany({
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          dueDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: { not: 'COMPLETED' },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    const timeline = [
      ...upcomingClasses.map((c) => ({
        id: `class-${c.id}`,
        type: 'CLASS' as const,
        title: c.title,
        date: c.date,
        time: c.startTime || '',
        meta: c.instructor ? `Instructor: ${c.instructor}` : '',
        link: c.meetingLink || '/classes',
      })),
      ...upcomingMeetings.map((m) => ({
        id: `meeting-${m.id}`,
        type: 'MEETING' as const,
        title: m.title,
        date: m.date,
        time: m.startTime || '',
        meta: m.agenda ? `Agenda: ${m.agenda}` : '',
        link: m.meetingLink || '/meetings',
      })),
      ...upcomingTasks.map((t) => ({
        id: `task-${t.id}`,
        type: 'TASK' as const,
        title: `Deadline: ${t.title}`,
        date: t.dueDate!,
        time: '',
        meta: `Priority: ${t.priority}`,
        link: '/tasks',
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 8);

    // 5. Fetch Recent Activities (Actual database events)
    const recentActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      topSection: {
        currentTheme: currentTheme || 'Not configured',
        competitionStage: competitionStage || 'Not configured',
        nextDeadline: nextTaskDeadline
          ? `${nextTaskDeadline.title} (${new Date(nextTaskDeadline.dueDate!).toLocaleDateString()})`
          : 'Not configured',
        nextClass: nextClass
          ? `${nextClass.title} (${new Date(nextClass.date).toLocaleDateString()}${nextClass.startTime ? ' at ' + nextClass.startTime : ''})`
          : 'Not configured',
        nextMeeting: nextMeeting
          ? `${nextMeeting.title} (${new Date(nextMeeting.date).toLocaleDateString()}${nextMeeting.startTime ? ' at ' + nextMeeting.startTime : ''})`
          : 'Not configured',
      },
      taskCounts,
      timeline,
      recentActivities,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
