import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Images, MapPin, X } from 'lucide-react';
import { useContent, youtubeIdFromUrl } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import PhotoComments from './PhotoComments';
import PhotoLike from './PhotoLike';
import './Destinations.css';

function DestinationMedia({ item, name }) {
  if (!item) return <div className="dest-gallery-empty">Add destination photos or videos in Admin</div>;
  if (item.type === 'image') return <img src={resolveMediaUrl(item.src)} alt={name} loading="lazy" decoding="async" />;

  const youtubeId = youtubeIdFromUrl(item.src);
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return <video src={item.src} controls playsInline />;
}

export default function Destinations() {
  const { destinations, pageTitles } = useContent();
  const destinationsTitle = pageTitles[0]?.destinationsTitle || 'Places We’ve Explored';
  const [openDestination, setOpenDestination] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const media = useMemo(() => {
    if (!openDestination) return [];
    return [
      ...Array.from(new Set([
        openDestination.image,
        ...(Array.isArray(openDestination.gallery) ? openDestination.gallery : []),
      ].filter(Boolean))).map(src => ({ type: 'image', src })),
      ...Array.from(new Set(
        (Array.isArray(openDestination.videoUrls) ? openDestination.videoUrls : []).filter(Boolean),
      )).map(src => ({ type: 'video', src })),
    ];
  }, [openDestination]);

  const openGallery = destination => {
    setOpenDestination(destination);
    setPhotoIndex(0);
  };

  const closeGallery = () => setOpenDestination(null);
  const showPrevious = () => setPhotoIndex(current => (current - 1 + media.length) % media.length);
  const showNext = () => setPhotoIndex(current => (current + 1) % media.length);

  useEffect(() => {
    if (!openDestination) return undefined;

    const handleKeyDown = event => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO'].includes(event.target?.tagName)) return;
      if (event.key === 'Escape') setOpenDestination(null);
      if (media.length < 2) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPhotoIndex(current => (current - 1 + media.length) % media.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPhotoIndex(current => (current + 1) % media.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDestination, media.length]);

  return (
    <section id="destinations" className="dest-section">
      <div className="section-wrap">
        <div className="dest-hd">
          <div>
            <span className="eyebrow">Where the Road Takes Us</span>
            <h2 className="dest-heading">{destinationsTitle}</h2>
            <p className="dest-intro">Campgrounds, towns, trails, and the places we would gladly return to.</p>
          </div>
        </div>

        <div className="dest-grid">
          {destinations.map(d => (
            <button key={d.id} type="button" className="dest-card" onClick={() => openGallery(d)}>
              {d.image ? (
                <img src={resolveMediaUrl(d.image)} alt={d.name} loading="lazy" decoding="async" />
              ) : (
                <div className="dest-card-empty">{d.name}</div>
              )}
              <div className="dest-card-body">
                <div className="dest-card-title">
                  <MapPin size={14} />
                  <span className="dest-name">{d.name}</span>
                  <span className="dest-count">{d.count} guides</span>
                </div>
                {d.description && (
                  <p className="dest-card-description">{d.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {destinations.length === 0 && (
          <p className="dest-empty">Add your first destination from the admin page.</p>
        )}
      </div>

      {openDestination && (
        <div className="dest-modal" role="dialog" aria-modal="true" aria-label={`${openDestination.name} photos`}>
          <button className="dest-modal-backdrop" type="button" onClick={closeGallery} aria-label="Close destination gallery" />
          <div className="dest-modal-panel">
            <button className="dest-modal-close" type="button" onClick={closeGallery} aria-label="Close">
              <X size={20} />
            </button>
            <div className="dest-gallery-stage">
              {media.length > 1 && (
                <button className="dest-gallery-arrow dest-gallery-arrow--left" type="button" onClick={showPrevious} aria-label="Previous photo">
                  <ArrowLeft size={22} />
                </button>
              )}
              <DestinationMedia item={media[photoIndex]} name={openDestination.name} />
              {media[photoIndex]?.type === 'image' && (
                <PhotoLike id={media[photoIndex].src} className="photo-like--floating" />
              )}
              {media.length > 1 && (
                <button className="dest-gallery-arrow dest-gallery-arrow--right" type="button" onClick={showNext} aria-label="Next photo">
                  <ArrowRight size={22} />
                </button>
              )}
            </div>
            <div className="dest-modal-copy">
              <span><Images size={15} /> {photoIndex + 1} of {media.length || 1}</span>
              <h3>{openDestination.name}</h3>
              <div className="dest-modal-text">
                {openDestination.description ? (
                  <p>{openDestination.description}</p>
                ) : (
                  <p>Add a destination description in Admin to tell visitors what you saw, where you stayed, and what you would do again.</p>
                )}
              </div>
              {media[photoIndex]?.type === 'image' && (
                <PhotoComments photoId={media[photoIndex].src} title="Photo comments" />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
