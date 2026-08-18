import { Compass } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import './Footer.css';

const links = {
  Explore: [
    { label: 'Adventures', href: '#adventures' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Videos', href: '#videos' },
  ],
  Read: [
    { label: 'Reviews & Guides', href: '#blog' },
    { label: 'Favorite Campgrounds', href: '#blog' },
    { label: 'Gear We Use', href: '#gear' },
  ],
  Connect: [
    { label: 'Keep in Touch', href: '#newsletter' },
    { label: 'Community Notes', href: '#community' },
    { label: 'Site Manager', href: '#admin' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      {/* Newsletter strip */}
      <div className="footer-nl" id="newsletter">
        <div className="section-wrap footer-nl-inner">
          <div>
            <h3>Don't Miss a Single Adventure</h3>
            <p>New road stories, campground finds, and honest gear notes from us.</p>
          </div>
          <NewsletterForm
            className="footer-nl-form"
            inputClassName="footer-email"
            buttonText="Keep in Touch"
            source="footer"
          />
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
            Real stories from the road. We share the destinations, lessons,
            gear, and everyday moments that shape our RV adventures.
          </p>
        </div>

        {Object.entries(links).map(([col, items]) => (
          <div key={col} className="footer-col">
            <h4 className="footer-col-title">{col}</h4>
            <ul>
              {items.map(item => (
                <li key={item.label}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="section-wrap footer-bottom-inner">
          <span>© {new Date().getFullYear()} Open Road RV Adventures. All rights reserved.</span>
          <span className="footer-disclosure">
            This site contains affiliate links. We may earn a commission at no extra cost to you.
          </span>
        </div>
      </div>
    </footer>
  );
}
