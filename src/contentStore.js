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

let remoteContentCache = null;
let remoteContentRequest = null;

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
  const orderedStored = {
    ...stored,
    slides: sortOrderedEntries(stored.slides || []),
  };

  return {
    posts: orderedStored.posts,
    videos: orderedStored.videos,
    destinations: orderedStored.destinations,
    gear: orderedStored.gear,
    comments: orderedStored.comments,
    about: orderedStored.about,
    slides: orderedStored.slides,
    stored: orderedStored,
    remoteReady: false,
    storageMode: 'local',
  };
}

function contentFromRows(rows) {
  const remote = {
    posts: rows.filter(row => row.remoteType === typeMap.posts),
    videos: rows.filter(row => row.remoteType === typeMap.videos),
    destinations: rows.filter(row => row.remoteType === typeMap.destinations),
    gear: rows.filter(row => row.remoteType === typeMap.gear),
    comments: rows.filter(row => row.remoteType === typeMap.comments),
    about: rows.filter(row => row.remoteType === typeMap.about),
    slides: sortOrderedEntries(rows.filter(row => row.remoteType === typeMap.slides)),
  };

  return {
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
  };
}

function sortOrderedEntries(entries) {
  const hasCustomOrder = entries.some(entry => Number.isFinite(Number(entry.sortOrder)));
  if (!hasCustomOrder) return entries;

  return [...entries].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function payloadForSave(item) {
  const payload = { ...item };

  delete payload.id;
  delete payload.remoteId;
  delete payload.remoteType;
  delete payload.createdAt;

  return payload;
}

async function fetchSharedRemoteContent({ refresh = false } = {}) {
  if (!refresh && remoteContentCache) return remoteContentCache;
  if (!refresh && remoteContentRequest) return remoteContentRequest;

  remoteContentRequest = fetchRemoteEntries()
    .then(rows => {
      remoteContentCache = contentFromRows(rows);
      return remoteContentCache;
    })
    .finally(() => {
      remoteContentRequest = null;
    });

  return remoteContentRequest;
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

    async function loadRemoteContent(refresh = false) {
      try {
        const remoteContent = await fetchSharedRemoteContent({ refresh });
        if (cancelled) return;
        setContent(remoteContent);
      } catch {
        if (!cancelled) setContent(current => ({ ...current, remoteReady: false, storageMode: 'supabase-error' }));
      }
    }

    loadRemoteContent();
    const refreshRemoteContent = () => loadRemoteContent(true);
    window.addEventListener(CHANGE_EVENT, refreshRemoteContent);

    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, refreshRemoteContent);
    };
  }, []);

  return content;
}

export async function addContentItem(type, item) {
  if (isSupabaseConfigured) {
    await insertRemoteEntry(typeMap[type], item);
    remoteContentCache = null;
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
    remoteContentCache = null;
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

export async function reorderContentItems(type, orderedItems) {
  const nextItems = orderedItems.map((item, index) => ({
    ...item,
    sortOrder: index,
  }));

  if (isSupabaseConfigured) {
    await Promise.all(nextItems.map(item => updateRemoteEntry(item.id, payloadForSave(item))));
    remoteContentCache = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return;
  }

  const stored = readStoredContent();
  const nextById = new Map(nextItems.map(item => [item.id, item]));
  const remaining = (stored[type] || []).filter(item => !nextById.has(item.id));

  writeStoredContent({
    ...stored,
    [type]: [...nextItems, ...remaining],
  });
}

export async function deleteContentItem(type, id) {
  if (isSupabaseConfigured) {
    await deleteRemoteEntry(id);
    remoteContentCache = null;
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
