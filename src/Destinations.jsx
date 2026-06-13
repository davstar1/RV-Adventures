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
            <h2 className="dest-heading">Explore by Destination</h2>
          </div>
          <a href="#all-destinations" className="dest-see-all">
            All destinations <ArrowRight size={15} />
          </a>
        </div>

        <div className="dest-grid">
          {destinations.map(d => (
            <button key={d.id} type="button" className="dest-card" onClick={() => openGallery(d)}>
              <img src={d.image} alt={d.name} loading="lazy" />
              <div className="dest-card-body">
                <MapPin size={14} />
                <span className="dest-name">{d.name}</span>
                <span className="dest-count">{d.count} guides</span>
              </div>
            </button>
          ))}
        </div>

        {/* Inline ad between sections */}
        <div className="ad-slot ad-leader dest-ad">
          <span className="ad-dims">728 × 90</span>
          <span className="ad-note">Between-Sections Ad</span>
        </div>
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
              <img src={photos[photoIndex] || openDestination.image} alt={openDestination.name} />
              {photos.length > 1 && (
                <button className="dest-gallery-arrow dest-gallery-arrow--right" type="button" onClick={showNext} aria-label="Next photo">
                  <ArrowRight size={22} />
                </button>
              )}
            </div>
            <div className="dest-modal-copy">
              <span><Images size={15} /> {photoIndex + 1} of {photos.length || 1}</span>
              <h3>{openDestination.name}</h3>
              {openDestination.description && <p>{openDestination.description}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
