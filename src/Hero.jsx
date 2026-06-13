import { ChevronDown, MapPin } from 'lucide-react';
import tacomaHero from './assets/tacoma-rv-road-hero.png';
import './Hero.css';

const routeStops = [
  { label: 'Sedona', top: '40%', left: '57%' },
  { label: 'Moab', top: '28%', left: '70%' },
  { label: 'Big Bend', top: '64%', left: '67%' },
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

          <div className="hero-trust">
            <div className="trust-item"><span className="trust-num">Real</span><span className="trust-label">Road stories</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">Owner</span><span className="trust-label">Shared trips</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">Fresh</span><span className="trust-label">Uploaded content</span></div>
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
