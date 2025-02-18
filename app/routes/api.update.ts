import { json } from '@remix-run/cloudflare';
import type { ActionFunction } from '@remix-run/cloudflare';

interface UpdateRequestBody {
  branch: string;
  autoUpdate?: boolean;
}

interface UpdateProgress {
  stage: 'fetch' | 'pull' | 'install' | 'build' | 'complete';
  message: string;
  progress?: number;
  error?: string;
  details?: {
    changedFiles?: string[];
    additions?: number;
    deletions?: number;
    commitMessages?: string[];
    totalSize?: string;
    currentCommit?: string;
    remoteCommit?: string;
    updateReady?: boolean;
    changelog?: string;
    compareUrl?: string;
  };
}

interface CommitInfo {
  hash: string;
  subject: string;
  body: string;
}

interface CommitMessage {
  type: string;
  message: string;
}

interface GitCommandResult {
  stdout: string;
  stderr: string;
}

const getCurrentBranch = async (): Promise<string> => {
  return 'unknown';
};

const getCurrentCommit = async (): Promise<string> => {
  return 'unknown';
};

const getRemoteUrl = async (): Promise<string> => {
  return 'unknown';
};

const checkWorkingDirectory = async (): Promise<{ isClean: boolean; changes: string[] }> => {
  return { isClean: true, changes: [] };
};

const fetchRemoteChanges = async (): Promise<{ hasChanges: boolean; remoteCommit: string }> => {
  return { hasChanges: false, remoteCommit: 'unknown' };
};

const getGitDiff = async (from: string, to: string): Promise<GitCommandResult> => {
  return {
    stdout: '',
    stderr: ''
  };
};

const getGitLog = async (from: string, to: string): Promise<GitCommandResult> => {
  return {
    stdout: '',
    stderr: ''
  };
};

const parseCommitLine = (line: string): CommitInfo => {
  const [hash, subject, body] = line.split('|');
  return { hash, subject, body };
};

const parseCommitMessage = (subject: string): CommitMessage => {
  let type = 'other';
  let message = subject;

  if (subject.startsWith('feat:') || subject.startsWith('feature:')) {
    type = 'feature';
    message = subject.replace(/^feat(?:ure)?:/, '').trim();
  } else if (subject.startsWith('fix:')) {
    type = 'fix';
    message = subject.replace(/^fix:/, '').trim();
  } else if (subject.startsWith('docs:')) {
    type = 'docs';
    message = subject.replace(/^docs:/, '').trim();
  } else if (subject.startsWith('style:')) {
    type = 'style';
    message = subject.replace(/^style:/, '').trim();
  } else if (subject.startsWith('refactor:')) {
    type = 'refactor';
    message = subject.replace(/^refactor:/, '').trim();
  } else if (subject.startsWith('perf:')) {
    type = 'perf';
    message = subject.replace(/^perf:/, '').trim();
  } else if (subject.startsWith('test:')) {
    type = 'test';
    message = subject.replace(/^test:/, '').trim();
  } else if (subject.startsWith('build:')) {
    type = 'build';
    message = subject.replace(/^build:/, '').trim();
  } else if (subject.startsWith('ci:')) {
    type = 'ci';
    message = subject.replace(/^ci:/, '').trim();
  }

  return { type, message };
};

const groupCommitsByType = (acc: Record<string, CommitInfo[]>, commit: CommitInfo): Record<string, CommitInfo[]> => {
  const { type = 'other' } = parseCommitMessage(commit.subject);
  acc[type] = acc[type] || [];
  acc[type].push(commit);
  return acc;
};

const processCommits = (logOutput: string): Record<string, CommitInfo[]> => {
  return logOutput
    .split('\n')
    .filter(Boolean)
    .map(parseCommitLine)
    .reduce(groupCommitsByType, {});
};

const processCommit = (c: CommitInfo): string => {
  return `- ${c.subject}`;
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !('branch' in body) || typeof body.branch !== 'string') {
      return json({ error: 'Invalid request body: branch is required and must be a string' }, { status: 400 });
    }

    // Return a simplified response since we can't use git commands in Cloudflare
    return json({
      stage: 'complete' as const,
      message: 'Update functionality is not available in Cloudflare environment',
      error: 'Updates must be performed manually or through CI/CD',
      details: {
        updateReady: false,
        changelog: 'Updates are disabled in Cloudflare environment',
        compareUrl: '',
        currentCommit: '',
        remoteCommit: '',
        changedFiles: [],
        additions: 0,
        deletions: 0,
        commitMessages: [],
        totalSize: '0 B'
      }
    } satisfies UpdateProgress);

  } catch (err) {
    console.error('Update preparation failed:', err);
    return json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred while preparing update'
      },
      { status: 500 }
    );
  }
};

// Add this function to fetch the changelog
async function fetchChangelog(currentCommit: string, remoteCommit: string): Promise<string> {
  try {
    // First try to get the changelog.md content
    const { stdout: changelogContent } = await getGitDiff(remoteCommit.trim(), 'changelog.md');

    // If we have a changelog, return it
    if (changelogContent) {
      return changelogContent;
    }

    // If no changelog.md, generate one in a similar format
    let changelog = '# Changes in this Update\n\n';

    // Get commit messages grouped by type
    const { stdout: commitLog } = await getGitLog(remoteCommit.trim(), remoteCommit.trim());

    const commits = processCommits(commitLog);

    // Format commit messages with emojis and timestamps
    const formattedMessages = Object.entries(commits).map(([type, commits]) => {
      const emoji = {
        feature: '✨',
        fix: '🐛',
        docs: '📚',
        style: '💎',
        refactor: '♻️',
        perf: '⚡',
        test: '🧪',
        build: '🛠️',
        ci: '⚙️',
        other: '🔍',
      }[type];

      const title = {
        feature: 'Features',
        fix: 'Bug Fixes',
        docs: 'Documentation',
        style: 'Styles',
        refactor: 'Code Refactoring',
        perf: 'Performance',
        test: 'Tests',
        build: 'Build',
        ci: 'CI',
        other: 'Other Changes',
      }[type];

      return `### ${emoji} ${title}\n\n${commits.map(processCommit).join('\n')}`;
    });

    // Build changelog content
    for (const message of formattedMessages) {
      changelog += `\n${message}\n`;
    }

    // Add stats
    const { stdout: stats } = await getGitDiff(remoteCommit.trim(), remoteCommit.trim());

    if (stats) {
      changelog += '\n## 📊 Stats\n\n';
      changelog += `${stats.trim()}\n`;
    }

    return changelog;
  } catch (error) {
    console.error('Error fetching changelog:', error);
    return 'Unable to fetch changelog';
  }
}
