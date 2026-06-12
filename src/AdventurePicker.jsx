import { useState } from 'react';
import { BatteryCharging, Map, Mountain, Navigation, Play, Tent } from 'lucide-react';
import './AdventurePicker.css';

const adventures = [
  {
    id: 'desert',
    label: 'Desert Roads',
    icon: Navigation,
    kicker: 'Red rock drives, wide-open camping, sunrise coffee.',
    route: 'Sedona → Moab → Big Bend',
    stops: ['Scenic pullouts', 'Dry camping', 'Canyon hikes'],
    links: [
      { label: 'Desert destinations', href: '#destinations' },
      { label: 'Watch route videos', href: '#videos' },
    ],
  },
  {
    id: 'weekend',
    label: 'Weekend Escape',
    icon: Tent,
    kicker: 'Fast setups, close-to-home stops, simple meals.',
    route: 'Friday night → Sunday sunset',
    stops: ['Easy hookups', 'Short hikes', 'Campfire dinners'],
    links: [
      { label: 'Find a quick stop', href: '#destinations' },
      { label: 'Read trip stories', href: '#blog' },
    ],
  },
  {
    id: 'mountain',
    label: 'Mountain Camp',
    icon: Mountain,
    kicker: 'Cooler air, forest roads, quiet sites above the valley.',
    route: 'Smokies → Glacier → Olympic',
    stops: ['Forest roads', 'View camps', 'Weather prep'],
    links: [
      { label: 'Mountain guides', href: '#destinations' },
      { label: 'Join the community', href: '#community' },
    ],
  },
  {
    id: 'gear',
    label: 'Gear Prep',
    icon: BatteryCharging,
    kicker: 'Power, tires, recovery gear, and little fixes that save trips.',
    route: 'Pack smarter before the next mile',
    stops: ['Power setup', 'Connectivity', 'Road tools'],
    links: [
      { label: 'Shop tested gear', href: '#gear' },
      { label: 'Watch installs', href: '#videos' },
    ],
  },
];

export default function AdventurePicker() {
  const [activeId, setActiveId] = useState(adventures[0].id);
  const active = adventures.find(adventure => adventure.id === activeId) || adventures[0];
  const ActiveIcon = active.icon;

  return (
    <section className="adventure-section" aria-label="Choose your adventure">
      <div className="section-wrap adventure-wrap">
        <div className="adventure-copy">
          <span className="eyebrow">Choose Your Adventure</span>
          <h2>Start with the kind of road day you want.</h2>
        </div>

        <div className="adventure-shell">
          <div className="adventure-tabs" role="tablist" aria-label="Adventure types">
            {adventures.map(adventure => {
              const Icon = adventure.icon;
              const selected = activeId === adventure.id;
              return (
                <button
                  key={adventure.id}
                  className={`adventure-tab ${selected ? 'adventure-tab--active' : ''}`}
                  onClick={() => setActiveId(adventure.id)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                >
                  <Icon size={18} />
                  <span>{adventure.label}</span>
                </button>
              );
            })}
          </div>

          <div className="adventure-card">
            <div className="adventure-map">
              <Map size={28} />
              <span className="adventure-map-dot adventure-map-dot--one" />
              <span className="adventure-map-dot adventure-map-dot--two" />
              <span className="adventure-map-dot adventure-map-dot--three" />
              <span className="adventure-map-route" />
            </div>

            <div className="adventure-detail">
              <div className="adventure-detail-head">
                <ActiveIcon size={24} />
                <div>
                  <h3>{active.label}</h3>
                  <p>{active.kicker}</p>
                </div>
              </div>

              <div className="adventure-route">
                <Navigation size={16} />
                <span>{active.route}</span>
              </div>

              <div className="adventure-stops">
                {active.stops.map(stop => <span key={stop}>{stop}</span>)}
              </div>

              <div className="adventure-actions">
                {active.links.map((link, index) => (
                  <a key={link.label} href={link.href} className={index === 0 ? 'btn-primary' : 'adventure-secondary'}>
                    {index === 1 && <Play size={14} />}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
