import { ChevronDown, Compass, MapPin, Mountain, Play, Route, Star } from 'lucide-react';
import tacomaHero from './assets/tacoma-rv-road-hero.png';
import './Hero.css';

const routeStops = [
  { label: 'Sedona', top: '40%', left: '57%' },
  { label: 'Moab', top: '28%', left: '70%' },
  { label: 'Big Bend', top: '64%', left: '67%' },
];

const roadStats = [
  { icon: Route, value: '14', label: 'New routes' },
  { icon: Mountain, value: '8', label: 'Camp guides' },
  { icon: Play, value: '21', label: 'Video stops' },
];

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Background photo */}
      <div className="hero-photo">
        <img
          src={tacomaHero}
          alt="Toyota Tacoma towing a Jayco travel trailer through red rock country"
          className="hero-photo-img"
        />
        <div className="hero-route-line" />
        {routeStops.map(stop => (
          <a
            key={stop.label}
            href="#destinations"
            className="hero-map-pin"
            style={{ top: stop.top, left: stop.left }}
            aria-label={`Explore ${stop.label}`}
          >
            <span />
            <strong>{stop.label}</strong>
          </a>
        ))}
        <div className="hero-photo-scrim" />
      </div>

      {/* Leaderboard ad — sits just under the fold */}
      <div className="hero-ad-bar">
        <div className="ad-slot ad-leader">
          <span className="ad-dims">728 × 90</span>
          <span className="ad-note">Leaderboard — Google AdSense / Direct</span>
        </div>
      </div>

      {/* Content */}
      <div className="hero-body">
        <div className="hero-content section-wrap">
          <span className="eyebrow hero-eyebrow">
            <MapPin size={11} /> Full-Time RV Life &nbsp;·&nbsp; Real Stories &nbsp;·&nbsp; Honest Reviews
          </span>

          <h1 className="hero-title">
            Every Mile a<br />
            <em>New Story</em>
          </h1>

          <p className="hero-lead">
            We live full-time in our RV and write about what we actually find —
            hidden campgrounds, honest gear reviews, real budgets, and the kind
            of adventures that don't make it onto the brochure.
          </p>

          <div className="hero-actions">
            <a href="#destinations" className="btn-primary">Start Exploring</a>
            <a href="#blog" className="btn-ghost">Read Stories</a>
          </div>

          <div className="hero-dashboard" aria-label="Road trip highlights">
            <div className="hero-dashboard-head">
              <Compass size={17} />
              <span>Today’s Road Board</span>
            </div>
            <div className="hero-dashboard-grid">
              {roadStats.map(item => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href="#destinations" className="hero-stat-card">
                    <Icon size={17} />
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
            <a href="#videos" className="hero-feature-link">
              <Star size={14} fill="currentColor" /> Watch the latest campsite walkthrough
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-item"><span className="trust-num">1,200+</span><span className="trust-label">Articles</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">320</span><span className="trust-label">Campgrounds Reviewed</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">40K</span><span className="trust-label">Subscribers</span></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#destinations" className="hero-scroll" aria-label="Scroll to destinations">
        <ChevronDown size={24} />
      </a>
    </section>
  );
}
