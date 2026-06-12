import { useState, useEffect } from 'react';
import { Menu, X, Compass, Search } from 'lucide-react';
import './Navbar.css';

const NAV = [
  { label: 'Home',         href: '#home' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Stories',      href: '#blog' },
  { label: 'Videos',       href: '#videos' },
  { label: 'Gear',         href: '#gear' },
  { label: 'Community',    href: '#community' },
  { label: 'Admin',        href: '#admin' },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <a href="#home" className="nav-logo" onClick={() => setOpen(false)}>
          <Compass size={22} strokeWidth={1.6} className="nav-logo-icon" />
          <span>
            <span className="nav-logo-main">Open Road</span>
            <span className="nav-logo-sub">RV Adventures</span>
          </span>
        </a>

        {/* Links */}
        <ul className={`nav-links ${open ? 'is-open' : ''}`}>
          {NAV.map(l => (
            <li key={l.label}>
              <a href={l.href} className="nav-link" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#newsletter" className="nav-cta" onClick={() => setOpen(false)}>
              Subscribe Free
            </a>
          </li>
        </ul>

        <div className="nav-right">
          <button className="nav-icon-btn" aria-label="Search">
            <Search size={18} strokeWidth={2} />
          </button>
          <button
            className="nav-icon-btn nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
