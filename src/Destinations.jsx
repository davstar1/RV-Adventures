import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Images, MapPin, X } from 'lucide-react';
import { useContent } from './contentStore';
import './Destinations.css';

export default function Destinations() {
  const { destinations } = useContent();
  const [openDestination, setOpenDestination] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = useMemo(() => {
    if (!openDestination) return [];
    return Array.from(new Set([
      openDestination.image,
      ...(Array.isArray(openDestination.gallery) ? openDestination.gallery : []),
    ].filter(Boolean)));
  }, [openDestination]);

  const openGallery = destination => {
    setOpenDestination(destination);
    setPhotoIndex(0);
  };

  const closeGallery = () => setOpenDestination(null);
  const showPrevious = () => setPhotoIndex(current => (current - 1 + photos.length) % photos.length);
  const showNext = () => setPhotoIndex(current => (current + 1) % photos.length);

  return (
    <section id="destinations" className="dest-section">
      <div className="section-wrap">
        <div className="dest-hd">
          <div>
            <span className="eyebrow">Where the Road Takes Us</span>
            <h2 className="dest-heading">Places We’ve Explored</h2>
          </div>
          <a href="#all-destinations" className="dest-see-all">
            All destinations <ArrowRight size={15} />
          </a>
        </div>

        <div className="dest-grid">
          {destinations.map(d => (
            <button key={d.id} type="button" className="dest-card" onClick={() => openGallery(d)}>
              {d.image ? (
                <img src={d.image} alt={d.name} loading="lazy" />
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
              {photos.length > 1 && (
                <button className="dest-gallery-arrow dest-gallery-arrow--left" type="button" onClick={showPrevious} aria-label="Previous photo">
                  <ArrowLeft size={22} />
                </button>
              )}
              {photos[photoIndex] || openDestination.image ? (
                <img src={photos[photoIndex] || openDestination.image} alt={openDestination.name} />
              ) : (
                <div className="dest-gallery-empty">Add destination photos in Admin</div>
              )}
              {photos.length > 1 && (
                <button className="dest-gallery-arrow dest-gallery-arrow--right" type="button" onClick={showNext} aria-label="Next photo">
                  <ArrowRight size={22} />
                </button>
              )}
            </div>
            <div className="dest-modal-copy">
              <span><Images size={15} /> {photoIndex + 1} of {photos.length || 1}</span>
              <h3>{openDestination.name}</h3>
              <div className="dest-modal-text">
                {openDestination.description ? (
                  <p>{openDestination.description}</p>
                ) : (
                  <p>Add a destination description in Admin to tell visitors what you saw, where you stayed, and what you would do again.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
