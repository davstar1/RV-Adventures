import { useState } from 'react';
import { Play, Eye, X } from 'lucide-react';
import { useContent } from './contentStore';
import { youtubeIdFromUrl } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import './Videos.css';

export default function Videos() {
  const { videos } = useContent();
  const [openVideo, setOpenVideo] = useState(null);
  const featuredVideo = videos[0];
  const featuredYoutubeId = featuredVideo?.youtubeId || youtubeIdFromUrl(featuredVideo?.youtubeUrl || '');
  const openYoutubeId = openVideo?.youtubeId || youtubeIdFromUrl(openVideo?.youtubeUrl || '');
  const featuredEmbed = featuredYoutubeId
    ? `https://www.youtube.com/embed/${featuredYoutubeId}`
    : null;
  const openEmbed = openYoutubeId
    ? `https://www.youtube.com/embed/${openYoutubeId}?autoplay=1`
    : null;

  return (
    <section id="videos" className="vid-section">
      <div className="section-wrap">
        <span className="eyebrow">On the Channel</span>
        <h2 className="vid-heading">Learn with us</h2>
        <p className="vid-sub">
          Full RV tours, build walkthroughs, destination vlogs — everything we film on the road.
        </p>

        <div className="vid-feature">
          <div className="vid-embed-wrap">
            {featuredEmbed ? (
              <iframe
                className="vid-iframe"
                src={featuredEmbed}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="vid-embed-placeholder">
                <Play size={48} />
                <span>YouTube / Video Embed</span>
                <span className="vid-embed-note">Add a YouTube video in Admin</span>
              </div>
            )}
          </div>
          <div className="vid-feature-body">
            <span className="badge badge--cat" style={{display:'inline-flex',marginBottom:12}}>Full Tour</span>
            <h3>{featuredVideo?.title || 'Add your first YouTube video'}</h3>
            <p>{featuredVideo?.channel || 'Use the admin page to feature your latest road video here.'}</p>
            <button
              className="btn-primary"
              style={{marginTop:20,width:'fit-content'}}
              onClick={() => featuredVideo ? setOpenVideo(featuredVideo) : window.location.assign('#admin')}
            >
              <Play size={15} /> Watch Now
            </button>
          </div>
        </div>

        <div className="vid-grid">
          {videos.map(v => (
            <button key={v.id} className="vid-card" onClick={() => setOpenVideo(v)}>
              <div className="vid-thumb-wrap">
                <img src={resolveMediaUrl(v.thumb)} alt={v.title} loading="lazy" decoding="async" />
                <div className="vid-play-btn"><Play size={20} fill="white" /></div>
                <span className="vid-duration">{v.duration}</span>
              </div>
              <div className="vid-info">
                <h4 className="vid-title">{v.title}</h4>
                <div className="vid-meta">
                  <span>{v.channel}</span>
                  <span><Eye size={12} /> {v.views} views</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {videos.length === 0 && <p className="vid-empty">Add your first YouTube video from the admin page.</p>}

        {openVideo && (
          <div className="vid-modal" role="dialog" aria-modal="true" aria-label={openVideo.title}>
            <button className="vid-modal-backdrop" aria-label="Close video" onClick={() => setOpenVideo(null)} />
            <div className="vid-modal-panel">
              <button className="vid-modal-close" aria-label="Close video" onClick={() => setOpenVideo(null)}>
                <X size={20} />
              </button>
              <div className="vid-modal-player">
                {openEmbed ? (
                  <iframe
                    className="vid-iframe"
                    src={openEmbed}
                    title={openVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="vid-embed-placeholder">
                    <Play size={48} />
                    <span>{openVideo.title}</span>
                    <span className="vid-embed-note">Add a YouTube URL in Admin to play this video here</span>
                  </div>
                )}
              </div>
              <div className="vid-modal-info">
                <h3>{openVideo.title}</h3>
                <span>{openVideo.channel} · {openVideo.views} views</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
