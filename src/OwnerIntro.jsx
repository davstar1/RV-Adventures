import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, ChevronDown, Images, Play, X } from 'lucide-react';
import { useContent } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import PhotoComments from './PhotoComments';
import PhotoLike from './PhotoLike';
import useSwipeCaption from './useSwipeCaption';
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

function AboutTile({ item, title, index, onOpen, remaining = 0 }) {
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
          loading={index < 2 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding="async"
        />
      )}
      <span className="owner-collage-overlay">
        {isVideo ? <Play size={22} /> : <Images size={22} />}
      </span>
      {remaining > 0 && <span className="owner-collage-count">+{remaining} more</span>}
    </button>
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function OwnerIntro() {
  const { about, pageTitles } = useContent();
  const aboutTitle = pageTitles[0]?.aboutTitle || 'About Us';
  const profile = about[0];
  const media = useMemo(() => mediaFromProfile(profile), [profile]);
  const storyBody = profile?.storyBody?.trim();
  const storyTitle = profile?.storyTitle?.trim() || 'Our Story';
  const aboutBody = profile?.body || 'Use the admin page to add your About Us story here. This is where visitors can learn who is behind Open Road RV Adventures, why you travel, and what kind of stories you share from the road.';
  const storyLinkPhrases = storyBody
    ? Array.from(new Set([storyTitle, 'when Dave met Karen'].filter(Boolean)))
    : [];
  const storyLinkPattern = storyLinkPhrases.length > 0
    ? new RegExp(`(${storyLinkPhrases.map(escapeRegExp).join('|')})`, 'i')
    : null;
  const aboutParts = storyLinkPattern ? aboutBody.split(storyLinkPattern) : [aboutBody];
  const hasInlineStoryLink = storyLinkPattern ? storyLinkPattern.test(aboutBody) : false;
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const { captionExpanded, resetCaption, swipeHandlers, toggleCaption } = useSwipeCaption();
  const storyRef = useRef(null);
  const current = media[index];

  const previous = () => setIndex(currentIndex => (currentIndex - 1 + media.length) % media.length);
  const next = () => setIndex(currentIndex => (currentIndex + 1) % media.length);
  const openMedia = mediaIndex => {
    setIndex(mediaIndex);
    resetCaption();
    setModalOpen(true);
  };
  const closeMedia = () => {
    setModalOpen(false);
    resetCaption();
  };
  const openStory = () => {
    setStoryOpen(true);
    window.setTimeout(() => {
      storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
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
    <section id="home" className="owner-section">
      <div className="section-wrap owner-wrap">
        <div className="owner-copy">
          <header className="owner-copy-header">
            <span className="eyebrow">Open Road RV Adventures</span>
            <h1 className="owner-heading">{aboutTitle}</h1>
          </header>

          <div className="owner-editorial">
            {media[0] && (
              <button
                type="button"
                className="owner-lead-media"
                onClick={() => openMedia(0)}
                aria-label={`Open About ${media[0].type === 'video' ? 'video' : 'photo'}`}
              >
                {media[0].type === 'video' ? (
                  <>
                    <video src={resolveMediaUrl(media[0].src)} muted playsInline preload="metadata" />
                    <span className="owner-lead-media-icon"><Play size={24} /></span>
                  </>
                ) : (
                  <img
                    src={resolveMediaUrl(media[0].src)}
                    alt={media[0].description || profile?.title || 'Open Road RV Adventures'}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
              </button>
            )}

            <p>
              {aboutParts.map((part, partIndex) => (
                storyLinkPhrases.some(phrase => part.toLowerCase() === phrase.toLowerCase()) ? (
                  <button
                    key={`${part}-${partIndex}`}
                    type="button"
                    className="owner-story-link owner-story-link--inline"
                    onClick={openStory}
                  >
                    {part}
                  </button>
                ) : (
                  <span key={`${part}-${partIndex}`}>{part}</span>
                )
              ))}
            </p>
            {storyBody && !hasInlineStoryLink && (
              <button type="button" className="owner-story-link" onClick={openStory}>
                {storyTitle}
              </button>
            )}
            <div className="owner-actions">
              <a href="#adventures" className="btn-primary">Latest adventures <ArrowRight size={16} /></a>
              <a href="#destinations" className="owner-explore-link">Places we’ve explored <ArrowRight size={15} /></a>
            </div>
          </div>
        </div>

        {media.length > 1 && (
          <div className="owner-collage" aria-label="More About us photos and videos">
            {media.slice(1, 6).map((item, mediaIndex) => (
              <AboutTile
                key={`${item.src}-${mediaIndex}`}
                item={item}
                title={profile?.title}
                index={mediaIndex + 1}
                onOpen={openMedia}
                remaining={mediaIndex === 4 ? Math.max(0, media.length - 6) : 0}
              />
            ))}
          </div>
        )}

        {media.length === 0 && (
          <div className="owner-gallery-empty">
            <Camera size={34} />
            <span>Add About photos and videos in Admin</span>
          </div>
        )}
      </div>

      {storyBody && storyOpen && (
        <div className="section-wrap owner-story-wrap" ref={storyRef}>
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
          <button className="owner-modal-backdrop" type="button" onClick={closeMedia} aria-label="Close About media" />
          <div className={`owner-modal-panel${captionExpanded ? ' is-caption-expanded' : ''}`}>
            <button className="owner-modal-close" type="button" onClick={closeMedia} aria-label="Close">
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
            <div className="owner-modal-copy" {...swipeHandlers}>
              <button
                type="button"
                className="caption-sheet-handle"
                onClick={toggleCaption}
                aria-label={captionExpanded ? 'Collapse photo description' : 'Expand photo description'}
                aria-expanded={captionExpanded}
              >
                <span />
              </button>
              <span className="eyebrow">About Us</span>
              <div className="owner-modal-text" data-caption-scroll>
                <p>{current.description || 'Add a description for this photo or video in the About Us section of Admin.'}</p>
              </div>
              {current.type !== 'video' && (
                <PhotoComments photoId={current.src} title="Photo comments" />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
