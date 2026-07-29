import { useEffect, useState } from 'react';
import {
  deleteRemoteEntry,
  fetchRemoteEntries,
  insertRemoteEntry,
  isSupabaseConfigured,
  updateRemoteEntry,
} from './supabaseApi';

const STORAGE_KEY = 'rv-adventures-admin-content';
const CHANGE_EVENT = 'rv-content-change';

const emptyContent = {
  posts: [],
  videos: [],
  destinations: [],
  gear: [],
  comments: [],
  about: [],
  slides: [],
};

const typeMap = {
  posts: 'story',
  videos: 'video',
  destinations: 'destination',
  gear: 'gear',
  comments: 'community',
  about: 'about',
  slides: 'slide',
};

function readStoredContent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyContent, ...JSON.parse(raw) } : emptyContent;
  } catch {
    return emptyContent;
  }
}

function writeStoredContent(content) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getContent() {
  const stored = readStoredContent();

  return {
    posts: stored.posts,
    videos: stored.videos,
    destinations: stored.destinations,
    gear: stored.gear,
    comments: stored.comments,
    about: stored.about,
    slides: stored.slides,
    stored,
    remoteReady: false,
    storageMode: 'local',
  };
}

export function useContent() {
  const [content, setContent] = useState(getContent);

  useEffect(() => {
    const refresh = () => setContent(getContent());

    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let cancelled = false;

    async function loadRemoteContent() {
      try {
        const rows = await fetchRemoteEntries();
        if (cancelled) return;

        const remote = {
          posts: rows.filter(row => row.remoteType === typeMap.posts),
          videos: rows.filter(row => row.remoteType === typeMap.videos),
          destinations: rows.filter(row => row.remoteType === typeMap.destinations),
          gear: rows.filter(row => row.remoteType === typeMap.gear),
          comments: rows.filter(row => row.remoteType === typeMap.comments),
          about: rows.filter(row => row.remoteType === typeMap.about),
          slides: rows.filter(row => row.remoteType === typeMap.slides),
        };

        setContent({
          posts: remote.posts,
          videos: remote.videos,
          destinations: remote.destinations,
          gear: remote.gear,
          comments: remote.comments,
          about: remote.about,
          slides: remote.slides,
          stored: remote,
          remoteReady: true,
          storageMode: 'supabase',
        });
      } catch {
        if (!cancelled) setContent(current => ({ ...current, remoteReady: false, storageMode: 'supabase-error' }));
      }
    }

    loadRemoteContent();
    window.addEventListener(CHANGE_EVENT, loadRemoteContent);

    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, loadRemoteContent);
    };
  }, []);

  return content;
}

export async function addContentItem(type, item) {
  if (isSupabaseConfigured) {
    await insertRemoteEntry(typeMap[type], item);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return;
  }

  addLocalContentItem(type, item);
}

export function addLocalContentItem(type, item) {
  const stored = readStoredContent();
  const next = {
    ...stored,
    [type]: [{ ...item, id: Date.now() }, ...(stored[type] || [])],
  };

  writeStoredContent(next);
}

export async function updateContentItem(type, id, item) {
  if (isSupabaseConfigured) {
    await updateRemoteEntry(id, item);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return;
  }

  const stored = readStoredContent();
  const next = {
    ...stored,
    [type]: (stored[type] || []).map(entry => (
      entry.id === id ? { ...item, id } : entry
    )),
  };

  writeStoredContent(next);
}

export async function deleteContentItem(type, id) {
  if (isSupabaseConfigured) {
    await deleteRemoteEntry(id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return;
  }

  const stored = readStoredContent();
  const next = {
    ...stored,
    [type]: (stored[type] || []).filter(item => item.id !== id),
  };

  writeStoredContent(next);
}

export function clearAdminContent() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function youtubeIdFromUrl(value) {
  if (!value) return '';

  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return '';
}
