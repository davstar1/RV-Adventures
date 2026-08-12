import { useState } from 'react';
import { Heart } from 'lucide-react';
import './PhotoLike.css';

const STORAGE_KEY = 'rv-adventures-photo-likes';

function readLikes() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
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
  const liked = Boolean(likedByKey[key]);

  if (!key) return null;

  const toggleLike = event => {
    event.preventDefault();
    event.stopPropagation();

    const likes = readLikes();
    const nextLiked = !liked;

    if (nextLiked) {
      likes[key] = true;
    } else {
      delete likes[key];
    }

    writeLikes(likes);
    setLikedByKey(likes);
  };

  return (
    <button
      type="button"
      className={`photo-like ${liked ? 'photo-like--active' : ''} ${className}`.trim()}
      onClick={toggleLike}
      aria-label={liked ? 'Unlike this photo' : label}
      aria-pressed={liked}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      <span>{liked ? 'Liked' : 'Like'}</span>
    </button>
  );
}
