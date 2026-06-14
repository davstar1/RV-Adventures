import { useState } from 'react';
import { Heart, MessageCircle, Clock, Star, ExternalLink, ArrowRight, X } from 'lucide-react';
import { categories } from './data';
import { useContent } from './contentStore';
import NewsletterForm from './NewsletterForm';
import './Blog.css';

/* ── Post Card ── */
function PostCard({ post, big = false, onOpen }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes);

  return (
    <article className={`card ${big ? 'card--big' : ''}`}>
      <button type="button" className="card-img-link" onClick={() => onOpen(post)}>
        <div className="card-img-wrap">
          {post.image ? (
            <img src={post.image} alt={post.title} loading="lazy" />
          ) : (
            <div className="card-img-empty">{post.category}</div>
          )}
          <div className="card-img-badges">
            <span className="badge badge--cat">{post.category}</span>
            {post.tag && (
              <span className={`badge badge--tag badge--${post.tag.toLowerCase()}`}>{post.tag}</span>
            )}
          </div>
        </div>
      </button>
      <div className="card-body">
        <button type="button" className="card-title-button" onClick={() => onOpen(post)}>
          <h3 className="card-title">{post.title}</h3>
        </button>
        <p className="card-excerpt">{post.excerpt}</p>
        <div className="card-footer">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.author} className="card-avatar" />
          ) : (
            <span className="card-avatar card-avatar--initial">{String(post.author || 'O').slice(0, 1)}</span>
          )}
          <div className="card-meta">
            <span className="card-author">{post.author}</span>
            <span className="card-secondary">
              {post.date}&ensp;<Clock size={11} />&thinsp;{post.readTime}
            </span>
          </div>
          <div className="card-reactions">
            <button
              className={`react-btn ${liked ? 'react-btn--active' : ''}`}
              onClick={() => { setLiked(l => !l); setCount(c => liked ? c - 1 : c + 1); }}
              aria-label="Like"
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {count}
            </button>
            <button type="button" className="react-btn" aria-label="Comments" onClick={() => onOpen(post)}>
              <MessageCircle size={14} /> {post.comments}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Affiliate Card ── */
function AffCard({ p }) {
  return (
    <a href={p.link} className="aff-card" target="_blank" rel="noopener noreferrer sponsored">
      <span className="aff-badge">{p.badge}</span>
      <div className="aff-emoji">{p.emoji}</div>
      <div className="aff-info">
        <span className="aff-cat">{p.category}</span>
        <span className="aff-name">{p.name}</span>
        <span className="aff-desc">{p.desc}</span>
        <div className="aff-bottom">
          <span className="aff-rating"><Star size={12} fill="currentColor" />{p.rating} <em>({p.reviews.toLocaleString()})</em></span>
          <span className="aff-buy">{p.price} <ExternalLink size={11} /></span>
        </div>
      </div>
    </a>
  );
}

/* ── Main Blog Section ── */
export default function Blog() {
  const [active, setActive] = useState('All');
  const [openPost, setOpenPost] = useState(null);
  const { posts, gear } = useContent();
  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active);

  return (
    <section id="blog" className="blog-section">
      <div className="section-wrap">

        <header className="blog-header">
          <span className="eyebrow">Fresh from the Road</span>
          <h2 className="blog-heading">Stories, Reviews & Guides</h2>
          <div className="filter-row">
            {categories.filter(c => c !== 'Destinations').map(c => (
              <button
                key={c}
                className={`filter-pill ${active === c ? 'filter-pill--on' : ''}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        <div className="blog-layout">
          {/* ── Main ── */}
          <main className="blog-main">
            {filtered[0] && <PostCard post={filtered[0]} big onOpen={setOpenPost} />}

            <div className="cards-grid">
              {filtered.slice(1).map(p => <PostCard key={p.id} post={p} onOpen={setOpenPost} />)}
            </div>

            {filtered.length === 0 && (
              <p className="blog-empty">Add your first story, review, or guide from the admin page.</p>
            )}

            {filtered.length > 6 && (
              <div style={{textAlign:'center', marginTop:48}}>
                <button className="load-more">Load More Stories <ArrowRight size={15} /></button>
              </div>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="blog-sidebar">
            {/* Newsletter */}
            <div className="sb-widget sb-newsletter" id="newsletter">
              <span className="eyebrow">Free Newsletter</span>
              <h3>Best Routes, Weekly</h3>
              <p>Campground finds, gear deals, and road trip inspo straight to your inbox.</p>
              <NewsletterForm
                className="sb-newsletter-form"
                inputClassName="sb-email"
                buttonText="Subscribe Free"
                source="blog-sidebar"
              />
              <span className="sb-legal">No spam. Cancel anytime.</span>
            </div>

            {/* Gear picks */}
            <div className="sb-widget">
              <div className="sb-widget-hd">
                <h3>Gear We Actually Use</h3>
                <span className="sb-disclosure">Affiliate</span>
              </div>
              {gear.length > 0 ? gear.map(p => <AffCard key={p.id} p={p} />) : (
                <p className="sb-empty">Add gear reviews in Admin to show your own picks here.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {openPost && (
        <div className="story-modal" role="dialog" aria-modal="true" aria-label={openPost.title}>
          <button className="story-modal-backdrop" type="button" onClick={() => setOpenPost(null)} aria-label="Close story" />
          <div className="story-modal-panel">
            <button className="story-modal-close" type="button" onClick={() => setOpenPost(null)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="story-modal-image">
              {openPost.image ? (
                <img src={openPost.image} alt={openPost.title} />
              ) : (
                <div className="card-img-empty">{openPost.category}</div>
              )}
            </div>
            <div className="story-modal-copy">
              <span className="story-modal-kicker">{openPost.category}</span>
              <h3>{openPost.title}</h3>
              <div className="story-modal-meta">
                <span>{openPost.author || 'Open Road RV'}</span>
                <span>{openPost.date}</span>
                <span><Clock size={13} /> {openPost.readTime}</span>
              </div>
              <div className="story-modal-text">
                <p>{openPost.excerpt || 'Add more story text in Admin so visitors can read the full entry here.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
