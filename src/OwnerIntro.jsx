import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Play, X } from 'lucide-react';
import { useContent } from './contentStore';
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
        <video src={item.src} controls={compact} playsInline />
        {!compact && (
          <span className="owner-video-play">
            <Play size={34} />
          </span>
        )}
      </div>
    );
  }

  return <img src={item.src} alt={title || 'Open Road RV Adventures'} />;
}

export default function OwnerIntro() {
  const { about } = useContent();
  const profile = about[0];
  const media = useMemo(() => mediaFromProfile(profile), [profile]);
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const current = media[index];

  const previous = () => setIndex(currentIndex => (currentIndex - 1 + media.length) % media.length);
  const next = () => setIndex(currentIndex => (currentIndex + 1) % media.length);

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

        <div className="owner-gallery" aria-label="About us photo viewer">
          <button
            type="button"
            className="owner-gallery-stage"
            onClick={() => current && setModalOpen(true)}
            disabled={!current}
            aria-label="Open About media"
          >
            <MediaDisplay item={current} title={profile?.title} />
          </button>
          {media.length > 1 && (
            <div className="owner-gallery-controls">
              <button type="button" onClick={previous} aria-label="Previous about photo"><ArrowLeft size={18} /></button>
              <span>{index + 1} / {media.length}</span>
              <button type="button" onClick={next} aria-label="Next about photo"><ArrowRight size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && current && (
        <div className="owner-modal" role="dialog" aria-modal="true" aria-label="About media viewer">
          <button className="owner-modal-backdrop" type="button" onClick={() => setModalOpen(false)} aria-label="Close About media" />
          <div className="owner-modal-panel">
            <button className="owner-modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="owner-modal-media">
              <MediaDisplay item={current} title={profile?.title} compact />
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
