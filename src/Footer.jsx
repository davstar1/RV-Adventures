import { Compass, Play, Camera, Users, MessageCircle } from 'lucide-react';
import './Footer.css';

const links = {
  Explore:   ['Destinations','Campground Reviews','Trip Planners','State Parks'],
  Content:   ['Latest Stories','Gear Reviews','Beginner Guides','Full-Time RV'],
  Connect:   ['Newsletter','Community Forum','Submit a Story','Advertise With Us'],
  Legal:     ['Privacy Policy','Affiliate Disclosure','Terms of Use','Contact'],
};

export default function Footer() {
  return (
    <footer className="footer">
      {/* Newsletter strip */}
      <div className="footer-nl">
        <div className="section-wrap footer-nl-inner">
          <div>
            <h3>Don't Miss a Single Adventure</h3>
            <p>Weekly road reports, campground finds, and gear deals — free.</p>
          </div>
          <div className="footer-nl-form">
            <input type="email" placeholder="your@email.com" className="footer-email" />
            <button className="btn-primary">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="section-wrap footer-body">
        <div className="footer-brand">
          <div className="footer-logo">
            <Compass size={22} strokeWidth={1.5} />
            <div>
              <span className="footer-logo-main">Open Road</span>
              <span className="footer-logo-sub">RV Adventures</span>
            </div>
          </div>
          <p className="footer-tagline">
            Real stories from the road. We live full-time in our RV and
            share everything we learn — the beautiful parts and the hard parts.
          </p>
          <div className="footer-socials">
            <a href="#youtube"   aria-label="YouTube"><Play size={18} /></a>
            <a href="#instagram" aria-label="Instagram"><Camera size={18} /></a>
            <a href="#facebook"  aria-label="Facebook"><Users size={18} /></a>
            <a href="#twitter"   aria-label="Twitter"><MessageCircle size={18} /></a>
          </div>
        </div>

        {Object.entries(links).map(([col, items]) => (
          <div key={col} className="footer-col">
            <h4 className="footer-col-title">{col}</h4>
            <ul>
              {items.map(l => (
                <li key={l}><a href={`#${l.toLowerCase().replace(/\s+/g,'-')}`}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="section-wrap footer-bottom-inner">
          <span>© 2025 Open Road RV Adventures. All rights reserved.</span>
          <span className="footer-disclosure">
            This site contains affiliate links. We may earn a commission at no extra cost to you.
          </span>
        </div>
      </div>
    </footer>
  );
}
