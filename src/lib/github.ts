export interface GitHubRepoSummary {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
  updatedAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  date: string;
  url: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  author: string;
  state: string;
  createdAt: string;
  url: string;
  comments: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  state: string;
  createdAt: string;
  url: string;
}

export interface GitHubContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  htmlUrl: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\.git$/, '');
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function fetchGitHubData(repoUrl: string, token?: string) {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      success: false,
      error: 'Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repository',
    };
  }

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'e-Yantra-Team-Platform',
  };

  const apiToken = token || process.env.GITHUB_API_TOKEN;
  if (apiToken && apiToken.trim()) {
    headers['Authorization'] = `token ${apiToken.trim()}`;
  }

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Fetch Repository Details
    const repoRes = await fetch(baseUrl, { headers, next: { revalidate: 60 } });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          success: false,
          error: 'Repository not found. If this is a private repository, configure a GitHub Access Token in Settings.',
        };
      }
      if (repoRes.status === 403) {
        return {
          success: false,
          error: 'GitHub API rate limit exceeded. Please configure a GitHub Token in Settings to raise limits.',
        };
      }
      return {
        success: false,
        error: `GitHub API error: ${repoRes.statusText}`,
      };
    }

    const repoData = await repoRes.json();

    // 2. Fetch Commits (last 10)
    let commits: GitHubCommit[] = [];
    try {
      const commitRes = await fetch(`${baseUrl}/commits?per_page=10`, { headers, next: { revalidate: 60 } });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        commits = (Array.isArray(commitData) ? commitData : []).map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split('\n')[0],
          author: c.commit.author.name || c.author?.login || 'Unknown',
          authorAvatar: c.author?.avatar_url,
          date: c.commit.author.date,
          url: c.html_url,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch commits:', e);
    }

    // 3. Fetch Branches
    let branches: GitHubBranch[] = [];
    try {
      const branchRes = await fetch(`${baseUrl}/branches?per_page=10`, { headers, next: { revalidate: 60 } });
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        branches = (Array.isArray(branchData) ? branchData : []).map((b: any) => ({
          name: b.name,
          sha: b.commit.sha.substring(0, 7),
        }));
      }
    } catch (e) {}

    // 4. Fetch Issues
    let issues: GitHubIssue[] = [];
    try {
      const issuesRes = await fetch(`${baseUrl}/issues?state=open&per_page=10`, { headers, next: { revalidate: 60 } });
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        // Filter out pull requests which GitHub returns in /issues endpoint
        issues = (Array.isArray(issuesData) ? issuesData : [])
          .filter((item: any) => !item.pull_request)
          .map((i: any) => ({
            id: i.id,
            number: i.number,
            title: i.title,
            author: i.user?.login || 'Unknown',
            state: i.state,
            createdAt: i.created_at,
            url: i.html_url,
            comments: i.comments,
          }));
      }
    } catch (e) {}

    // 5. Fetch Pull Requests
    let pullRequests: GitHubPullRequest[] = [];
    try {
      const prRes = await fetch(`${baseUrl}/pulls?state=open&per_page=10`, { headers, next: { revalidate: 60 } });
      if (prRes.ok) {
        const prData = await prRes.json();
        pullRequests = (Array.isArray(prData) ? prData : []).map((p: any) => ({
          id: p.id,
          number: p.number,
          title: p.title,
          author: p.user?.login || 'Unknown',
          state: p.state,
          createdAt: p.created_at,
          url: p.html_url,
        }));
      }
    } catch (e) {}

    // 6. Fetch Contributors
    let contributors: GitHubContributor[] = [];
    try {
      const contribRes = await fetch(`${baseUrl}/contributors?per_page=10`, { headers, next: { revalidate: 60 } });
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        contributors = (Array.isArray(contribData) ? contribData : []).map((c: any) => ({
          login: c.login,
          avatarUrl: c.avatar_url,
          contributions: c.contributions,
          htmlUrl: c.html_url,
        }));
      }
    } catch (e) {}

    const summary: GitHubRepoSummary = {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssuesCount: repoData.open_issues_count,
      defaultBranch: repoData.default_branch,
      language: repoData.language,
      htmlUrl: repoData.html_url,
      updatedAt: repoData.updated_at,
    };

    return {
      success: true,
      data: {
        summary,
        commits,
        branches,
        issues,
        pullRequests,
        contributors,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to GitHub API.',
    };
  }
}
