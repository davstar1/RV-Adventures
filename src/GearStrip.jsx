import { ExternalLink, Star } from 'lucide-react';
import { useContent } from './contentStore';
import { resolveMediaUrl } from './mediaUrls';
import './GearStrip.css';

function productLink(value) {
  const link = String(value || '').trim();
  if (!link || link.startsWith('#')) return '';
  if (link.startsWith('#') || link.startsWith('/') || /^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

function ArticleBody({ text }) {
  const paragraphs = String(text || '')
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="gear-article-body">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function GearStrip() {
  const { gear, pageTitles } = useContent();
  const gearTitle = pageTitles[0]?.gearTitle || 'Gear We Actually Use';
  const allGear = gear;

  return (
    <section id="gear" className="gear-section">
      <div className="section-wrap">
        <div className="gear-hd">
          <div>
            <span className="eyebrow">Road-Tested Essentials</span>
            <h2 className="gear-heading">{gearTitle}</h2>
            <p className="gear-sub">Field notes on the equipment that has earned a place in our RV.</p>
          </div>
        </div>

        <aside className="gear-disclosure" aria-label="Amazon Associates disclosure">
          <strong>Amazon Associates Disclosure</strong>
          <span>As an Amazon Associate I earn from qualifying purchases. Some links in this section are affiliate links, which means we may earn a commission at no additional cost to you.</span>
        </aside>

        <div className="gear-editorial-list">
          {allGear.map(p => {
            const shopLink = productLink(p.link);

            return (
              <article key={p.id} className="gear-article">
                <div className="gear-article-media">
                  {p.image ? (
                    <img src={resolveMediaUrl(p.image)} alt={p.name} loading="lazy" decoding="async" />
                  ) : (
                    <div className="gear-article-media-empty"><span>{p.emoji || '★'}</span></div>
                  )}
                </div>

                <div className="gear-article-copy">
                  <div className="gear-article-kickers">
                    <span className="gear-cat">{p.category || 'Gear'}</span>
                    {p.badge && <span className="gear-badge">{p.badge}</span>}
                  </div>
                  <h3 className="gear-name">{p.name}</h3>
                  <ArticleBody text={p.desc} />
                  <div className="gear-article-footer">
                    <div className="gear-article-meta">
                      {p.rating && <span className="gear-rating"><Star size={14} fill="currentColor" /> {p.rating}</span>}
                      {p.price && <span className="gear-price">{p.price}</span>}
                    </div>
                    {shopLink && (
                      <a href={shopLink} className="gear-amazon-link" target="_blank" rel="noopener noreferrer sponsored">
                        {p.linkLabel || 'View on Amazon'} <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {allGear.length === 0 && <p className="gear-empty">Add your first gear review from the admin page.</p>}
      </div>
    </section>
  );
}
