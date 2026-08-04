const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function cleanSegment(value: string, fallback: string) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || fallback;
}

function extensionFor(file: File) {
  const fromName = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }

  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  if (file.type.includes('gif')) return 'gif';
  return 'jpg';
}

function base64FromBytes(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const githubToken = Deno.env.get('GITHUB_TOKEN');
  const owner = Deno.env.get('GITHUB_OWNER') || 'davstar1';
  const repo = Deno.env.get('GITHUB_REPO') || 'rv-adventures';
  const branch = Deno.env.get('GITHUB_BRANCH') || 'main';

  if (!githubToken) {
    return jsonResponse({ error: 'GitHub upload is not configured in Supabase secrets.' }, 500);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const requestedFolder = String(formData.get('folder') || 'uploads');
    const folder = requestedFolder
      .split('/')
      .map(segment => cleanSegment(segment, 'uploads'))
      .filter(Boolean)
      .join('/');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Choose a photo to upload first.' }, 400);
    }

    if (!file.type.startsWith('image/')) {
      return jsonResponse({ error: 'Only image uploads are supported.' }, 400);
    }

    const extension = extensionFor(file);
    const baseName = cleanSegment(file.name, 'photo');
    const uniqueName = `${Date.now()}-${baseName}.${extension}`;
    const repoPath = `public/photos/${folder || 'uploads'}/${uniqueName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const content = base64FromBytes(bytes);

    const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload website photo ${uniqueName}`,
        content,
        branch,
      }),
    });

    const result = await githubResponse.json();

    if (!githubResponse.ok) {
      return jsonResponse({
        error: result?.message || 'GitHub upload failed.',
      }, githubResponse.status);
    }

    return jsonResponse({
      path: repoPath,
      url: `/photos/${folder || 'uploads'}/${uniqueName}`,
      githubUrl: result?.content?.html_url || '',
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Upload failed.',
    }, 500);
  }
});
