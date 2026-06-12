import { MapPin, ArrowRight } from 'lucide-react';
import { useContent } from './contentStore';
import './Destinations.css';

export default function Destinations() {
  const { destinations } = useContent();

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
            <a key={d.id} href={`#dest-${d.id}`} className="dest-card">
              <img src={d.image} alt={d.name} loading="lazy" />
              <div className="dest-card-body">
                <MapPin size={14} />
                <span className="dest-name">{d.name}</span>
                <span className="dest-count">{d.count} guides</span>
              </div>
            </a>
          ))}
        </div>

        {/* Inline ad between sections */}
        <div className="ad-slot ad-leader dest-ad">
          <span className="ad-dims">728 × 90</span>
          <span className="ad-note">Between-Sections Ad</span>
        </div>
      </div>
    </section>
  );
}
