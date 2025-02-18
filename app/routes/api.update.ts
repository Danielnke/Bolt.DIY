import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

type UpdateProgress = {
  stage: 'complete';
  message: string;
  error: string;
  details: {
    updateReady: boolean;
    changelog: string;
    compareUrl: string;
    currentCommit: string;
    remoteCommit: string;
    changedFiles: string[];
    additions: number;
    deletions: number;
    commitMessages: string[];
    totalSize: string;
  };
};

export const action = async ({ request: _request }: ActionFunctionArgs) => {
  if (_request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await _request.json();

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
        totalSize: '0 B',
      },
    } satisfies UpdateProgress);
  } catch (err) {
    console.error('Update preparation failed:', err);
    return json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred while preparing update',
      },
      { status: 500 },
    );
  }
};
