import prisma from './prisma';

interface LogActivityParams {
  userId?: string | null;
  userName: string;
  actionType: 'CREATED' | 'UPDATED' | 'DELETED' | 'COMPLETED' | 'CONVERTED' | 'CONNECTED';
  entityType:
    | 'TASK'
    | 'CLASS'
    | 'MEETING'
    | 'LECTURE'
    | 'NOTE'
    | 'SELF_STUDY'
    | 'HARDWARE'
    | 'TECH_STACK'
    | 'THEME'
    | 'RESOURCE'
    | 'GIT_REPO'
    | 'USER';
  entityId?: string | null;
  description: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        actionType: params.actionType,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    return null;
  }
}
