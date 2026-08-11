import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Camera, ChevronDown, Compass, Map, MapPin, PlayCircle } from 'lucide-react';
import { useContent } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import './Hero.css';

const routeStops = [
  { label: 'Sedona', x: '18%', y: '67%' },
  { label: 'Moab', x: '47%', y: '36%' },
  { label: 'Big Bend', x: '74%', y: '58%' },
  { label: 'Next Stop', x: '86%', y: '28%' },
];

const featuredLinks = [
  {
    href: '#destinations',
    icon: Map,
    title: "Places we've explored",
    text: 'Campgrounds, trail towns, and road notes from real stops.',
  },
  {
    href: '#blog',
    icon: Camera,
    title: 'Reviews & guides',
    text: 'Honest takes on gear, mods, routes, and full-time RV life.',
  },
  {
    href: '#videos',
    icon: PlayCircle,
    title: 'Watch the road',
    text: 'Videos and trip moments without leaving Open Road.',
  },
];

export default function Hero() {
  const { slides } = useContent();
  const slideshowPhotos = slides.filter(slide => slide.image);
  const visibleSlides = useMemo(() => slideshowPhotos.slice(0, 8), [slideshowPhotos]);
  const [slideIndex, setSlideIndex] = useState(0);
  const currentSlide = visibleSlides[slideIndex % visibleSlides.length];
  const nextSlide = visibleSlides[(slideIndex + 1) % visibleSlides.length];
  const musicUrl = currentSlide?.musicUrl || slides.find(slide => slide.musicUrl)?.musicUrl || '';

  useEffect(() => {
    if (visibleSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setSlideIndex(current => (current + 1) % visibleSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [visibleSlides.length]);

  return (
    <section id="home" className="hero">
      <div className="hero-scene" aria-hidden="true">
        <div className="hero-road hero-road-one" />
        <div className="hero-road hero-road-two" />
        <div className="hero-compass">
          <Compass size={138} strokeWidth={1.05} />
        </div>
        <div className="hero-map-line" />
        {routeStops.map(stop => (
          <span
            key={stop.label}
            className="hero-map-pin"
            style={{ top: stop.y, left: stop.x }}
          >
            <span />
            <strong>{stop.label}</strong>
          </span>
        ))}
        <div className="hero-stars">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="hero-body section-wrap">
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow">
            <MapPin size={12} /> Full-time RV life, told from the road
          </span>

          <h1 className="hero-title">
            Come Ride Along
            <em>The Open Road With Us.</em>
          </h1>

          <p className="hero-lead">
            Real destinations, campground notes, RV lessons, videos, photos,
            gear reviews, and the honest little moments that make life on the
            road worth following.
          </p>

          <div className="hero-actions">
            <a href="#destinations" className="btn-primary">
              Start Exploring <ArrowRight size={17} />
            </a>
            <a href="#about" className="btn-ghost">Meet Us</a>
          </div>

          <div className="hero-trust">
            <div className="trust-item"><span className="trust-num">Real</span><span className="trust-label">Road notes</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">Fresh</span><span className="trust-label">Uploads</span></div>
            <div className="trust-sep" />
            <div className="trust-item"><span className="trust-num">Owner</span><span className="trust-label">Point of view</span></div>
          </div>
        </div>

        <div className="hero-feature" aria-label="Featured site sections">
          {currentSlide ? (
            <div className="hero-slideshow" aria-label="Adventure photo slideshow">
              <figure className="hero-slide hero-slide-active" key={currentSlide.id || currentSlide.image}>
                <img
                  src={resolveMediaUrl(currentSlide.image)}
                  alt={currentSlide.title || 'Open Road adventure'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                {(currentSlide.title || currentSlide.caption) && (
                  <figcaption>
                    {currentSlide.title && <strong>{currentSlide.title}</strong>}
                    {currentSlide.caption && <span>{currentSlide.caption}</span>}
                  </figcaption>
                )}
              </figure>
              {nextSlide && nextSlide !== currentSlide && (
                <img
                  className="hero-slide-preload"
                  src={resolveMediaUrl(nextSlide.image)}
                  alt=""
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  aria-hidden="true"
                />
              )}
              {musicUrl && (
                <div className="hero-music-player">
                  <span>Road soundtrack</span>
                  <audio src={resolveMediaUrl(musicUrl)} controls preload="none" />
                </div>
              )}
            </div>
          ) : (
            <div className="hero-feature-map">
              {routeStops.map(stop => (
                <span key={stop.label} style={{ top: stop.y, left: stop.x }} />
              ))}
            </div>
          )}
          <div className="hero-feature-links">
            {featuredLinks.map(item => {
              const Icon = item.icon;
              return (
                <a href={item.href} key={item.title} className="hero-feature-link">
                  <Icon size={20} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                  <ArrowRight size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <a href="#destinations" className="hero-scroll" aria-label="Scroll to destinations">
        <ChevronDown size={24} />
      </a>
    </section>
  );
}
