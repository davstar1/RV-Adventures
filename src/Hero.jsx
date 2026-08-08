import { ArrowRight, Camera, ChevronDown, Compass, Map, MapPin, PlayCircle, Route } from 'lucide-react';
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
  const visibleSlides = slideshowPhotos.slice(0, 6);
  const scrollingSlides = visibleSlides.length > 0
    ? [...visibleSlides, ...visibleSlides]
    : [];

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
            Come ride along
            <em>with Open Road.</em>
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
          <div className="hero-feature-top">
            <span><Route size={16} /> Start here</span>
            <a href="#admin/slides">Add photos</a>
          </div>
          {slideshowPhotos.length > 0 ? (
            <div className="hero-slideshow" aria-label="Adventure photo slideshow">
              <div
                className="hero-slideshow-track"
                style={{ animationDuration: `${Math.max(visibleSlides.length * 8, 18)}s` }}
              >
                {scrollingSlides.map((slide, index) => (
                  <figure className="hero-slide" key={`${slide.id || slide.image}-${index}`}>
                    <img
                      src={resolveMediaUrl(slide.image)}
                      alt={slide.title || 'Open Road adventure'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      decoding="async"
                    />
                    {(slide.title || slide.caption) && (
                      <figcaption>
                        {slide.title && <strong>{slide.title}</strong>}
                        {slide.caption && <span>{slide.caption}</span>}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
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
