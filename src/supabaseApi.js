const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_KEY = 'rv-adventures-supabase-session';
const AUTH_EVENT = 'rv-supabase-auth-change';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function readSession() {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

function shouldRefreshSession(session) {
  return Boolean(session?.refresh_token && session?.expires_at && session.expires_at - 60 < Date.now() / 1000);
}

async function refreshAdminSession(session) {
  if (!shouldRefreshSession(session)) return session;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  const text = await response.text();
  const nextSession = text ? JSON.parse(text) : null;

  if (!response.ok) {
    writeSession(null);
    throw new Error(nextSession?.msg || nextSession?.message || 'Your admin session expired. Please sign in again.');
  }

  writeSession(nextSession);
  return nextSession;
}

async function authHeaders() {
  const session = await refreshAdminSession(readSession());
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session?.access_token || SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function request(path, options = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...await authHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.msg || body?.message || body?.error_description || 'Supabase request failed.';
    if (message.toLowerCase().includes('duplicate')) {
      throw new Error('This email is already subscribed.');
    }
    throw new Error(message);
  }

  return body;
}

async function publicRequest(path, options = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.msg || body?.message || body?.error_description || 'Supabase request failed.');
  }

  return body;
}

export function getAdminSession() {
  return readSession();
}

export function onAdminAuthChange(callback) {
  const handler = () => callback(readSession());
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export async function signInAdmin(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  writeSession(session);
  return session;
}

export async function signOutAdmin() {
  const session = readSession();

  if (session?.access_token && isSupabaseConfigured) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: await authHeaders(),
      });
    } catch {
      // Local sign-out should still succeed if the network request fails.
    }
  }

  writeSession(null);
}

export async function fetchRemoteEntries() {
  const rows = await request('/rest/v1/content_entries?select=id,type,payload,created_at&order=created_at.desc');
  return rows.map(row => ({
    ...row.payload,
    id: row.id,
    remoteId: row.id,
    remoteType: row.type,
    createdAt: row.created_at,
  }));
}

export async function insertRemoteEntry(type, payload) {
  const rows = await request('/rest/v1/content_entries?select=id,type,payload,created_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ type, payload }),
  });

  const row = rows[0];
  if (!row) {
    throw new Error('Entry was not saved. Make sure Supabase allows signed-in admins to add content entries.');
  }

  return {
    ...row.payload,
    id: row.id,
    remoteId: row.id,
    remoteType: row.type,
    createdAt: row.created_at,
  };
}

export async function updateRemoteEntry(id, payload) {
  const rows = await request(`/rest/v1/content_entries?id=eq.${encodeURIComponent(id)}&select=id,type,payload,created_at`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ payload }),
  });

  const row = rows[0];
  if (!row) {
    throw new Error('Entry was not updated. Make sure Supabase allows signed-in admins to update content entries.');
  }

  return {
    ...row.payload,
    id: row.id,
    remoteId: row.id,
    remoteType: row.type,
    createdAt: row.created_at,
  };
}

export async function deleteRemoteEntry(id) {
  await request(`/rest/v1/content_entries?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadPhotoToGitHub(file, folder = 'uploads') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const session = await refreshAdminSession(readSession());
  if (!session?.access_token) {
    throw new Error('Please sign in before uploading photos.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-github-photo`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.error || body?.message || 'Photo upload failed.');
  }

  return body;
}

export async function subscribeRemoteEmail(email, source = 'website') {
  await publicRequest('/rest/v1/newsletter_subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email: email.toLowerCase(),
      source,
      subscribed_at: new Date().toISOString(),
    }),
  });
}

export async function fetchPhotoComments(photoId) {
  const id = String(photoId || '').trim();
  if (!id) return [];

  return publicRequest(`/rest/v1/photo_comments?select=id,photo_id,name,comment,created_at&photo_id=eq.${encodeURIComponent(id)}&order=created_at.asc`);
}

export async function addPhotoComment({ photoId, name, email, comment }) {
  const id = String(photoId || '').trim();
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanComment = String(comment || '').trim();

  if (!id) throw new Error('Photo was not found.');
  if (!cleanName || !cleanEmail || !cleanComment) {
    throw new Error('Add your name, email, and comment first.');
  }

  const rows = await publicRequest('/rest/v1/photo_comments?select=id,photo_id,name,comment,created_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      photo_id: id,
      name: cleanName,
      email: cleanEmail,
      comment: cleanComment,
    }),
  });

  return rows[0];
}
