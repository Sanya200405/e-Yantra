import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { fetchGitHubData, parseGitHubUrl } from '@/lib/github';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repos = await prisma.gitRepository.findMany({
      include: {
        connectedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (repos.length === 0) {
      return NextResponse.json({
        configured: false,
        repositories: [],
        activeRepoData: null,
      });
    }

    // Get system GitHub token if configured
    const tokenSetting = await prisma.systemSetting.findUnique({
      where: { key: 'github_token' },
    });
    const token = tokenSetting?.value || process.env.GITHUB_API_TOKEN;

    // Fetch live data for the first/primary repository
    const primaryRepo = repos[0];
    const liveData = await fetchGitHubData(primaryRepo.repositoryUrl, token);

    return NextResponse.json({
      configured: true,
      repositories: repos,
      activeRepo: primaryRepo,
      liveData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch git repositories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { repositoryUrl, repositoryName, platform, description } = body;

    if (!repositoryUrl || !repositoryUrl.trim()) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(repositoryUrl);
    const calculatedName = repositoryName?.trim() || (parsed ? `${parsed.owner}/${parsed.repo}` : 'Repository');

    const repo = await prisma.gitRepository.create({
      data: {
        repositoryName: calculatedName,
        repositoryUrl: repositoryUrl.trim(),
        platform: platform || 'GITHUB',
        description: description?.trim() || null,
        githubOwner: parsed?.owner || null,
        githubRepo: parsed?.repo || null,
        connectedById: user.id,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'CONNECTED',
      entityType: 'GIT_REPO',
      entityId: repo.id,
      description: `${user.name} connected repository "${repo.repositoryName}"`,
    });

    return NextResponse.json(repo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to connect repository' },
      { status: error.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    const repo = await prisma.gitRepository.findUnique({
      where: { id },
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && repo.connectedById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.gitRepository.delete({
      where: { id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'DELETED',
      entityType: 'GIT_REPO',
      entityId: id,
      description: `${user.name} disconnected repository "${repo.repositoryName}"`,
    });

    return NextResponse.json({ success: true, message: 'Repository disconnected' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect repository' },
      { status: 500 }
    );
  }
}
