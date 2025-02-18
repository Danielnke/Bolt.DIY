import type { AppLoadContext } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

interface GitHubRepoInfo {
  name: string;
  full_name: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  parent?: {
    full_name: string;
    default_branch: string;
    stargazers_count: number;
    forks_count: number;
  };
}

const getGitHubInfo = async (repoFullName: string) => {
  try {
    // Add GitHub token if available
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    const githubToken = process.env.GITHUB_TOKEN;

    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    console.log('Fetching GitHub info for:', repoFullName); // Debug log

    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers,
    });

    if (!response.ok) {
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        repoFullName,
      });

      // If we get a 404, try the main repo as fallback
      if (response.status === 404 && repoFullName !== 'stackblitz-labs/bolt.diy') {
        return getGitHubInfo('stackblitz-labs/bolt.diy');
      }

      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GitHub API response:', data); // Debug log

    return data as GitHubRepoInfo;
  } catch (error) {
    console.error('Failed to get GitHub info:', error);
    return null;
  }
};

export const loader = async (_: Request, _loadContext: AppLoadContext) => {
  const githubInfo = await getGitHubInfo('stackblitz-labs/bolt.diy');

  const response = {
    local: {
      commitHash: 'no-git-info',
      branch: 'unknown',
      commitTime: 'unknown',
      author: 'unknown',
      email: 'unknown',
      remoteUrl: 'unknown',
      repoName: 'unknown',
    },
    github: githubInfo
      ? {
          currentRepo: {
            fullName: githubInfo.full_name,
            defaultBranch: githubInfo.default_branch,
            stars: githubInfo.stargazers_count,
            forks: githubInfo.forks_count,
            openIssues: githubInfo.open_issues_count,
          },
          upstream: githubInfo.parent
            ? {
                fullName: githubInfo.parent.full_name,
                defaultBranch: githubInfo.parent.default_branch,
                stars: githubInfo.parent.stargazers_count,
                forks: githubInfo.parent.forks_count,
              }
            : null,
        }
      : null,
    isForked: Boolean(githubInfo?.parent),
    timestamp: new Date().toISOString(),
  };

  console.log('Final response:', response);

  return json(response);
};
