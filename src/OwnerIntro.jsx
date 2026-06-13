import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { useContent } from './contentStore';
import './OwnerIntro.css';

export default function OwnerIntro() {
  const { about } = useContent();
  const profile = about[0];
  const photos = useMemo(() => Array.from(new Set([
    profile?.image,
    ...(Array.isArray(profile?.gallery) ? profile.gallery : []),
  ].filter(Boolean))), [profile]);
  const [index, setIndex] = useState(0);
  const current = photos[index] || '';

  const previous = () => setIndex(currentIndex => (currentIndex - 1 + photos.length) % photos.length);
  const next = () => setIndex(currentIndex => (currentIndex + 1) % photos.length);

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
          {current ? (
            <img src={current} alt={profile?.title || 'Open Road RV Adventures'} />
          ) : (
            <div className="owner-gallery-empty">
              <Camera size={34} />
              <span>Add About photos in Admin</span>
            </div>
          )}
          {photos.length > 1 && (
            <div className="owner-gallery-controls">
              <button type="button" onClick={previous} aria-label="Previous about photo"><ArrowLeft size={18} /></button>
              <span>{index + 1} / {photos.length}</span>
              <button type="button" onClick={next} aria-label="Next about photo"><ArrowRight size={18} /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
