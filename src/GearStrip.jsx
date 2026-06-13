import { Star, ExternalLink, ArrowRight } from 'lucide-react';
import { useContent } from './contentStore';
import './GearStrip.css';

function productLink(value) {
  const link = String(value || '').trim();
  if (!link || link.startsWith('#')) return '';
  if (link.startsWith('#') || link.startsWith('/') || /^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

export default function GearStrip() {
  const { gear } = useContent();
  const allGear = gear;

  return (
    <section id="gear" className="gear-section">
      <div className="section-wrap">
        <div className="gear-hd">
          <div>
            <span className="eyebrow">Affiliate — We Earn a Commission</span>
            <h2 className="gear-heading">Gear We Actually Use</h2>
            <p className="gear-sub">Everything we recommend we've personally tested on the road — no exceptions.</p>
          </div>
          <a href="#all-gear" className="gear-see-all">All gear picks <ArrowRight size={15} /></a>
        </div>

        <div className="gear-grid">
          {allGear.map(p => {
            const shopLink = productLink(p.link);

            if (!shopLink) {
              return (
                <article key={p.id} className="gear-card gear-card--disabled">
                  {p.image && <img className="gear-photo" src={p.image} alt={p.name} />}
                  <div className="gear-card-top">
                    <span className="gear-emoji">{p.emoji}</span>
                    <span className="gear-badge">{p.badge}</span>
                  </div>
                  <span className="gear-cat">{p.category}</span>
                  <h4 className="gear-name">{p.name}</h4>
                  <p className="gear-desc">{p.desc}</p>
                  <div className="gear-foot">
                    <span className="gear-rating"><Star size={13} fill="currentColor" /> {p.rating}</span>
                    <span className="gear-price">{p.price}</span>
                    <span className="gear-buy gear-buy--disabled">Shop <ExternalLink size={11} /></span>
                  </div>
                </article>
              );
            }

            return (
              <a key={p.id} href={shopLink} className="gear-card" target="_blank" rel="noopener noreferrer sponsored">
                {p.image && <img className="gear-photo" src={p.image} alt={p.name} />}
                <div className="gear-card-top">
                  <span className="gear-emoji">{p.emoji}</span>
                  <span className="gear-badge">{p.badge}</span>
                </div>
                <span className="gear-cat">{p.category}</span>
                <h4 className="gear-name">{p.name}</h4>
                <p className="gear-desc">{p.desc}</p>
                <div className="gear-foot">
                  <span className="gear-rating"><Star size={13} fill="currentColor" /> {p.rating}</span>
                  <span className="gear-price">{p.price}</span>
                  <span className="gear-buy">Shop <ExternalLink size={11} /></span>
                </div>
              </a>
            );
          })}
        </div>
        {allGear.length === 0 && <p className="gear-empty">Add your first gear review from the admin page.</p>}
      </div>
    </section>
  );
}
