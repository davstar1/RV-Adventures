import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { fetchPhotoLikeCount, isSupabaseConfigured, savePhotoLikeCount } from './supabaseApi';
import './PhotoLike.css';

const STORAGE_KEY = 'rv-adventures-photo-likes';

function readLikes() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};

    return Object.fromEntries(Object.entries(stored).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, Boolean(value.liked ?? value)];
      }

      return [key, Boolean(value)];
    }));
  } catch {
    return {};
  }
}

function writeLikes(likes) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
}

export default function PhotoLike({ id, label = 'Like this photo', className = '' }) {
  const key = String(id || '').trim();
  const [likedByKey, setLikedByKey] = useState(() => readLikes());
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const liked = Boolean(likedByKey[key]);

  useEffect(() => {
    if (!key) return undefined;

    let cancelled = false;

    if (!isSupabaseConfigured) {
      Promise.resolve().then(() => {
        if (!cancelled) setCount(readLikes()[key] ? 1 : 0);
      });
      return undefined;
    }

    fetchPhotoLikeCount(key)
      .then(nextCount => {
        if (!cancelled) setCount(nextCount);
      })
      .catch(() => {
        if (!cancelled) setCount(readLikes()[key] ? 1 : 0);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) return null;

  const toggleLike = async event => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    const likes = readLikes();
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    const previousCount = count;

    if (nextLiked) {
      likes[key] = true;
    } else {
      delete likes[key];
    }

    writeLikes(likes);
    setLikedByKey(likes);
    setCount(current => Math.max(0, current + delta));

    if (!isSupabaseConfigured) return;

    setLoading(true);

    try {
      const nextCount = await savePhotoLikeCount(key, delta);
      setCount(nextCount);
    } catch {
      if (liked) {
        likes[key] = true;
      } else {
        delete likes[key];
      }

      writeLikes(likes);
      setLikedByKey(likes);
      setCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`photo-like ${liked ? 'photo-like--active' : ''} ${className}`.trim()}
      onClick={toggleLike}
      aria-label={liked ? 'Unlike this photo' : label}
      aria-pressed={liked}
      disabled={loading}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      <span>{liked ? 'Liked' : 'Like'}</span>
      <em>{count}</em>
    </button>
  );
}
