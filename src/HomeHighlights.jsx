import { ArrowRight, BookOpen, Clock, MapPin, PlayCircle } from 'lucide-react';
import { useContent } from './contentStore';
import { normalizeCategory } from './data';
import { resolveMediaUrl } from './mediaUrls';
import './HomeHighlights.css';

function StoryPreview({ post, compact = false }) {
  if (!post) return null;

  return (
    <a className={compact ? 'home-story home-story--compact' : 'home-story home-story--featured'} href="#blog">
      <div className="home-story-media">
        {post.image ? (
          <img src={resolveMediaUrl(post.image)} alt={post.title} loading="lazy" decoding="async" />
        ) : (
          <div className="home-story-media-empty"><BookOpen size={24} /></div>
        )}
      </div>
      <div className="home-story-copy">
        <span className="home-story-category">{normalizeCategory(post.category) || 'From the road'}</span>
        <h3>{post.title}</h3>
        {!compact && <p>{post.excerpt}</p>}
        <span className="home-story-meta">
          {post.readTime && <><Clock size={13} /> {post.readTime}</>}
          <ArrowRight size={15} />
        </span>
      </div>
    </a>
  );
}

export default function HomeHighlights() {
  const { posts, destinations, videos } = useContent();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 4);
  const latestDestination = destinations[0];
  const latestVideo = videos[0];

  if (!featuredPost && recentPosts.length === 0 && !latestDestination && !latestVideo) return null;

  return (
    <section className="home-journal" aria-labelledby="home-journal-title">
      <div className="section-wrap">
        <header className="home-journal-header">
          <div>
            <span className="eyebrow">Latest from the road</span>
            <h2 id="home-journal-title">Stories worth pulling over for</h2>
          </div>
          <a href="#blog" className="home-journal-all">Browse all stories <ArrowRight size={16} /></a>
        </header>

        {(featuredPost || recentPosts.length > 0) && (
          <div className="home-journal-grid">
            <StoryPreview post={featuredPost || recentPosts[0]} />
            <div className="home-journal-recent" aria-label="Recent stories">
              {recentPosts.map(post => <StoryPreview key={post.id} post={post} compact />)}
            </div>
          </div>
        )}

        <div className="home-route-links">
          <a href="#adventures">
            <BookOpen size={20} />
            <span><strong>Adventure journal</strong><small>Photos, music, and moments from the road</small></span>
            <ArrowRight size={16} />
          </a>
          {latestDestination && (
            <a href="#destinations">
              <MapPin size={20} />
              <span><strong>{latestDestination.name}</strong><small>Our latest place explored</small></span>
              <ArrowRight size={16} />
            </a>
          )}
          {latestVideo && (
            <a href="#videos">
              <PlayCircle size={20} />
              <span><strong>{latestVideo.title}</strong><small>Latest from the channel</small></span>
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
