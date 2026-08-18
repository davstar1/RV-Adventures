import { useState, useEffect } from 'react';
import { Menu, X, Compass, LockKeyhole } from 'lucide-react';
import './Navbar.css';

const NAV = [
  { label: 'Home',         href: '#home' },
  { label: 'Adventures',   href: '#adventures' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Reviews & Guides', href: '#blog' },
  { label: 'Videos',       href: '#videos' },
  { label: 'Gear',         href: '#gear' },
  { label: 'Community',    href: '#community' },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash || '#home');

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 40);

      const marker = window.scrollY + 120;
      const visibleSection = [...NAV]
        .reverse()
        .find(item => {
          const section = document.querySelector(item.href);
          return section && section.offsetTop <= marker;
        });

      if (visibleSection) setActiveHash(visibleSection.href);
    };

    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || '#home');
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} aria-label="Primary navigation">
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
        <ul id="primary-navigation" className={`nav-links ${open ? 'is-open' : ''}`}>
          {NAV.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className={`nav-link${activeHash === l.href ? ' nav-link--active' : ''}`}
                onClick={() => setOpen(false)}
                aria-current={activeHash === l.href ? 'page' : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#newsletter" className="nav-cta" onClick={() => setOpen(false)}>
              Follow
            </a>
          </li>
          <li>
            <a href="#admin" className="nav-admin" onClick={() => setOpen(false)}>
              <LockKeyhole size={14} /> Admin
            </a>
          </li>
        </ul>

        <div className="nav-right">
          <button
            className="nav-icon-btn nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-controls="primary-navigation"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
