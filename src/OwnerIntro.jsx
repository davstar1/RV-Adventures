import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, ChevronDown, Images, Play, X } from 'lucide-react';
import { useContent } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import PhotoLike from './PhotoLike';
import './OwnerIntro.css';

function mediaFromProfile(profile) {
  if (Array.isArray(profile?.media) && profile.media.length > 0) {
    return profile.media.map(item => (
      typeof item === 'string'
        ? { type: 'image', src: item, description: '' }
        : { type: item.type || 'image', src: item.src || item.url || '', description: item.description || '' }
    )).filter(item => item.src);
  }

  return Array.from(new Set([
    profile?.image,
    ...(Array.isArray(profile?.gallery) ? profile.gallery : []),
  ].filter(Boolean))).map(src => ({ type: 'image', src, description: '' }));
}

function MediaDisplay({ item, title, compact = false }) {
  if (!item) {
    return (
      <div className="owner-gallery-empty">
        <Camera size={34} />
        <span>Add About photos in Admin</span>
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className="owner-video-wrap">
        <video src={resolveMediaUrl(item.src)} controls={compact} playsInline />
        {!compact && (
          <span className="owner-video-play">
            <Play size={34} />
          </span>
        )}
      </div>
    );
  }

  return <img src={resolveMediaUrl(item.src)} alt={title || 'Open Road RV Adventures'} loading="lazy" decoding="async" />;
}

function AboutTile({ item, title, index, onOpen }) {
  const isVideo = item.type === 'video';

  return (
    <button
      type="button"
      className={`owner-collage-tile owner-collage-tile--${(index % 6) + 1}`}
      onClick={() => onOpen(index)}
      aria-label={`Open About ${isVideo ? 'video' : 'photo'} ${index + 1}`}
    >
      {isVideo ? (
        <video src={resolveMediaUrl(item.src)} muted playsInline preload="metadata" />
      ) : (
        <img
          src={resolveMediaUrl(item.src)}
          alt={item.description || title || 'Open Road RV Adventures'}
          loading="lazy"
          decoding="async"
        />
      )}
      <span className="owner-collage-overlay">
        {isVideo ? <Play size={22} /> : <Images size={22} />}
      </span>
    </button>
  );
}

export default function OwnerIntro() {
  const { about } = useContent();
  const profile = about[0];
  const media = useMemo(() => mediaFromProfile(profile), [profile]);
  const storyBody = profile?.storyBody?.trim();
  const storyTitle = profile?.storyTitle?.trim() || 'Our Story';
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const current = media[index];

  const previous = () => setIndex(currentIndex => (currentIndex - 1 + media.length) % media.length);
  const next = () => setIndex(currentIndex => (currentIndex + 1) % media.length);
  const openMedia = mediaIndex => {
    setIndex(mediaIndex);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return undefined;

    const handleKeyDown = event => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO'].includes(event.target?.tagName)) return;
      if (event.key === 'Escape') setModalOpen(false);
      if (media.length < 2) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex(currentIndex => (currentIndex - 1 + media.length) % media.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex(currentIndex => (currentIndex + 1) % media.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, media.length]);

  return (
    <section id="about" className="owner-section">
      <div className="section-wrap owner-wrap">
        <div className="owner-copy">
          <span className="eyebrow">About Us</span>
          <h2>{profile?.title || 'A note from the road'}</h2>
          <p>
            {profile?.body || 'Use the admin page to add your About Us story here. This is where visitors can learn who is behind Open Road RV Adventures, why you travel, and what kind of stories you share from the road.'}
          </p>
        </div>

        <div className="owner-collage" aria-label="About us photo and video collage">
          {media.length > 0 ? (
            media.map((item, mediaIndex) => (
              <AboutTile
                key={`${item.src}-${mediaIndex}`}
                item={item}
                title={profile?.title}
                index={mediaIndex}
                onOpen={openMedia}
              />
            ))
          ) : (
            <div className="owner-gallery-empty">
              <Camera size={34} />
              <span>Add About photos and videos in Admin</span>
            </div>
          )}
        </div>
      </div>

      {storyBody && (
        <div className="section-wrap owner-story-wrap">
          <article className={`owner-story ${storyOpen ? 'owner-story--open' : ''}`}>
            <button
              type="button"
              className="owner-story-toggle"
              onClick={() => setStoryOpen(open => !open)}
              aria-expanded={storyOpen}
            >
              <span>
                <span className="eyebrow">Our Story</span>
                <strong>{storyTitle}</strong>
              </span>
              <ChevronDown size={24} />
            </button>
            {storyOpen && (
              <div className="owner-story-body">
                <p>{storyBody}</p>
              </div>
            )}
          </article>
        </div>
      )}

      {modalOpen && current && (
        <div className="owner-modal" role="dialog" aria-modal="true" aria-label="About media viewer">
          <button className="owner-modal-backdrop" type="button" onClick={() => setModalOpen(false)} aria-label="Close About media" />
          <div className="owner-modal-panel">
            <button className="owner-modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="owner-modal-media">
              <MediaDisplay item={current} title={profile?.title} compact />
              {current.type !== 'video' && (
                <PhotoLike id={current.src} className="photo-like--floating" />
              )}
              {media.length > 1 && (
                <>
                  <button type="button" className="owner-modal-arrow owner-modal-arrow--left" onClick={previous} aria-label="Previous About media">
                    <ArrowLeft size={22} />
                  </button>
                  <button type="button" className="owner-modal-arrow owner-modal-arrow--right" onClick={next} aria-label="Next About media">
                    <ArrowRight size={22} />
                  </button>
                </>
              )}
            </div>
            <div className="owner-modal-copy">
              <span className="eyebrow">About Us</span>
              <h3>{profile?.title || 'A note from the road'}</h3>
              <div className="owner-modal-text">
                <p>{current.description || 'Add a description for this photo or video in the About Us section of Admin.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
