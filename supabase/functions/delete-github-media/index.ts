const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supportedExtensions = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp3',
  'm4a',
  'aac',
  'wav',
  'ogg',
  'webm',
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function decodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function safeRepoPath(value: string, owner: string, repo: string, branch: string) {
  const input = String(value || '').trim();
  if (!input) return '';

  let path = input.split(/[?#]/, 1)[0];

  if (/^https?:\/\//i.test(input)) {
    const url = new URL(input);
    const segments = url.pathname.split('/').filter(Boolean).map(decodePath);
    const host = url.hostname.toLowerCase();

    if (host === 'raw.githubusercontent.com') {
      if (segments[0] !== owner || segments[1] !== repo || segments[2] !== branch) return '';
      path = segments.slice(3).join('/');
    } else if (host === 'github.com') {
      if (segments[0] !== owner || segments[1] !== repo || !['blob', 'raw'].includes(segments[2]) || segments[3] !== branch) return '';
      path = segments.slice(4).join('/');
    } else if (host === `${owner.toLowerCase()}.github.io`) {
      if (segments[0]?.toLowerCase() !== repo.toLowerCase()) return '';
      path = segments.slice(1).join('/');
    } else {
      return '';
    }
  }

  path = decodePath(path).replace(/^\/+/, '');
  if (path.startsWith('photos/')) path = `public/${path}`;

  const segments = path.split('/');
  if (
    !path.startsWith('public/photos/')
    || segments.some(segment => !segment || segment === '.' || segment === '..')
  ) {
    return '';
  }

  const extension = path.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || '';
  return supportedExtensions.has(extension) ? path : '';
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  if (!authorization.startsWith('Bearer ') || !supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authorization,
    },
  });

  if (!response.ok) return null;
  return response.json();
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const user = await authenticatedUser(request);
  if (!user?.id) {
    return jsonResponse({ error: 'Sign in to the Site Manager before deleting files.' }, 401);
  }

  const githubToken = Deno.env.get('GITHUB_TOKEN');
  const owner = Deno.env.get('GITHUB_OWNER') || 'davstar1';
  const repo = Deno.env.get('GITHUB_REPO') || 'rv-adventures';
  const branch = Deno.env.get('GITHUB_BRANCH') || 'main';

  if (!githubToken) {
    return jsonResponse({ error: 'GitHub deletion is not configured in Supabase secrets.' }, 500);
  }

  try {
    const body = await request.json();
    const repoPath = safeRepoPath(body?.url || body?.path || '', owner, repo, branch);

    if (!repoPath) {
      return jsonResponse({
        error: 'Only uploaded image and audio files in this website repository can be deleted permanently.',
      }, 400);
    }

    const encodedPath = repoPath.split('/').map(encodeURIComponent).join('/');
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
    const fileResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, {
      headers: githubHeaders(githubToken),
    });
    const file = await fileResponse.json();

    if (!fileResponse.ok) {
      const message = fileResponse.status === 404
        ? 'This file is no longer present in the GitHub repository.'
        : file?.message || 'GitHub could not find the file.';
      return jsonResponse({ error: message }, fileResponse.status);
    }

    if (!file?.sha || file?.type !== 'file') {
      return jsonResponse({ error: 'The selected path is not a deletable media file.' }, 400);
    }

    const deleteResponse = await fetch(endpoint, {
      method: 'DELETE',
      headers: githubHeaders(githubToken),
      body: JSON.stringify({
        message: `Delete website media ${repoPath.split('/').pop()}`,
        sha: file.sha,
        branch,
      }),
    });
    const result = await deleteResponse.json();

    if (!deleteResponse.ok) {
      return jsonResponse({ error: result?.message || 'GitHub deletion failed.' }, deleteResponse.status);
    }

    return jsonResponse({
      deleted: true,
      path: repoPath,
      commitUrl: result?.commit?.html_url || '',
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'File deletion failed.',
    }, 500);
  }
});
