"use client";

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

// Receives `sections` as a prop so the portfolio data stays on the server.
export default function Navigation({ sections }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav aria-label="Primary" className="site-nav">
      <div className="wrap nav-shell">
        <a href="/" className="nav-logo" aria-label="Ferdynand Odhiambo, home">{/* A pre-sized 80 px file (40 px at 2x); next/image would add client code for no gain. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ferdynand-80.jpg" alt="" width="40" height="40" decoding="async" className="nav-portrait" /></a>

        <ul className="nav-links nav-links-desktop">
          {sections.map((section) => (
            <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <ThemeToggle />
        </div>
      </div>

      {menuOpen && <button type="button" className="mobile-nav-backdrop" onClick={closeMenu} aria-label="Close menu backdrop" />}

      <div className={`mobile-nav-card${menuOpen ? ' open' : ''}`}>
        <ul className="nav-links nav-links-mobile">
          {sections.map((section) => (
            <li key={section.id}><a href={`#${section.id}`} onClick={closeMenu}>{section.label}</a></li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
