import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, ChevronDown, Compass, Map, MapPin, PlayCircle, Shuffle, SkipBack, SkipForward } from 'lucide-react';
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

function trackNameFromUrl(value) {
  const fallback = 'Open Road track';
  const raw = String(value || '').trim();
  if (!raw) return fallback;

  const fileName = raw
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)
    .pop();

  if (!fileName) return fallback;

  return decodeURIComponent(fileName)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^m-[a-f0-9-]+[-_]?/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || fallback;
}

export default function Hero() {
  const { slides } = useContent();
  const slideshowPhotos = useMemo(() => slides.flatMap(slide => {
    const images = Array.from(new Set([
      ...(Array.isArray(slide.images) ? slide.images : []),
      slide.image,
    ].map(image => String(image || '').trim()).filter(Boolean)));

    return images.map((image, index) => ({
      ...slide,
      image,
      id: `${slide.id || slide.image || image}-${index}`,
      title: index === 0 ? slide.title : slide.title || 'Open Road adventure',
    }));
  }), [slides]);
  const visibleSlides = slideshowPhotos;
  const musicTracks = useMemo(() => {
    const seen = new Set();

    return slides.flatMap(slide => {
      const urls = [
        ...(Array.isArray(slide.musicUrls) ? slide.musicUrls : []),
        slide.musicUrl,
      ].map(url => String(url || '').trim());
      const names = Array.isArray(slide.musicNames) ? slide.musicNames : [];

      return urls.map((url, index) => ({
        url,
        name: String(names[index] || (index === 0 ? slide.musicName : '') || '').trim(),
      }));
    })
      .filter(track => track.url)
      .filter(track => {
        if (seen.has(track.url)) return false;
        seen.add(track.url);
        return true;
      });
  }, [slides]);
  const musicUrls = useMemo(() => musicTracks.map(track => track.url), [musicTracks]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playlistStarted, setPlaylistStarted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [shuffleMusic, setShuffleMusic] = useState(false);
  const audioRef = useRef(null);
  const activeSongIndex = musicUrls.length > 0 ? songIndex % musicUrls.length : 0;
  const currentSlide = visibleSlides[slideIndex % visibleSlides.length];
  const nextSlide = visibleSlides[(slideIndex + 1) % visibleSlides.length];
  const currentTrack = musicTracks[activeSongIndex];
  const currentSong = currentTrack?.url || '';
  const currentTrackName = currentTrack?.name || trackNameFromUrl(currentSong);

  const changeSong = direction => {
    if (musicUrls.length < 2) return;

    setSongIndex(current => {
      if (shuffleMusic) {
        let next = current;

        while (next === current) {
          next = Math.floor(Math.random() * musicUrls.length);
        }

        return next;
      }

      return (current + direction + musicUrls.length) % musicUrls.length;
    });
  };

  useEffect(() => {
    if (visibleSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setSlideIndex(current => (current + 1) % visibleSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [visibleSlides.length]);

  useEffect(() => {
    if (!playlistStarted || !currentSong || !audioRef.current) return;

    audioRef.current.play().catch(() => {
      setPlaylistStarted(false);
    });
  }, [currentSong, playlistStarted]);

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
            <span className="hero-title-glow" aria-hidden="true">
              <span>Come Ride Along</span>
              <em>The Open Road With Us.</em>
            </span>
            <span className="hero-title-copy">
              <span>Come Ride Along</span>
              <em>The Open Road With Us.</em>
            </span>
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
          {currentSlide || currentSong ? (
            <div className="hero-slideshow" aria-label="Adventure photo slideshow">
              {currentSlide ? (
                <figure className="hero-slide hero-slide-active" key={currentSlide.id || currentSlide.image}>
                  <img
                    src={resolveMediaUrl(currentSlide.image)}
                    alt={currentSlide.title || 'Open Road adventure'}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </figure>
              ) : (
                <div className="hero-slide hero-slide-empty">
                  <Compass size={76} strokeWidth={1.1} />
                  <span>Road soundtrack loaded</span>
                </div>
              )}
              {currentSlide && nextSlide && nextSlide !== currentSlide && (
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
              {currentSlide && (currentSlide.title || currentSlide.caption) && (
                <div className="hero-slide-caption">
                  <div className="hero-slide-caption-track">
                    {currentSlide.title && <strong>{currentSlide.title}</strong>}
                    {currentSlide.caption && <span>{currentSlide.caption}</span>}
                  </div>
                </div>
              )}
              {currentSong && (
                <div className="hero-music-player">
                  <div className="hero-music-label">
                    <span>Now playing</span>
                    <strong title={currentTrackName}>{currentTrackName}</strong>
                    <small>Road soundtrack {musicUrls.length > 1 ? `${activeSongIndex + 1}/${musicUrls.length}` : ''}</small>
                    <div className={`hero-vu-meter${musicPlaying ? ' is-playing' : ''}`} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <div className="hero-music-controls" aria-label="Music playlist controls">
                    <button
                      type="button"
                      onClick={() => changeSong(-1)}
                      disabled={musicUrls.length < 2}
                      aria-label="Previous song"
                    >
                      <SkipBack size={15} />
                    </button>
                    <button
                      type="button"
                      className={shuffleMusic ? 'is-active' : ''}
                      onClick={() => setShuffleMusic(current => !current)}
                      disabled={musicUrls.length < 2}
                      aria-label={shuffleMusic ? 'Turn shuffle off' : 'Turn shuffle on'}
                      aria-pressed={shuffleMusic}
                    >
                      <Shuffle size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeSong(1)}
                      disabled={musicUrls.length < 2}
                      aria-label="Next song"
                    >
                      <SkipForward size={15} />
                    </button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={resolveMediaUrl(currentSong)}
                    controls
                    preload="none"
                    onPlay={() => {
                      setPlaylistStarted(true);
                      setMusicPlaying(true);
                    }}
                    onPause={event => {
                      if (!event.currentTarget.ended) {
                        setPlaylistStarted(false);
                        setMusicPlaying(false);
                      }
                    }}
                    onEnded={() => {
                      setMusicPlaying(false);
                      if (musicUrls.length > 1) {
                        setPlaylistStarted(true);
                        changeSong(1);
                      }
                    }}
                  />
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
