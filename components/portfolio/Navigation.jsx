"use client";

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav aria-label="Primary" className="site-nav">
      <div className="wrap nav-shell">
        <a href="/" className="nav-logo nav-signature">Ferdynand</a>

        <ul className="nav-links nav-links-desktop">
          <li><a href="#about">About</a></li>
          <li><a href="#work">Experience</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#writing">Writing</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/webdev">Web Dev</a></li>
          <li><a href="/brand">Creative</a></li>
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
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#work" onClick={closeMenu}>Experience</a></li>
          <li><a href="#projects" onClick={closeMenu}>Projects</a></li>
          <li><a href="#writing" onClick={closeMenu}>Writing</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          <li><a href="/webdev" onClick={closeMenu}>Web Dev</a></li>
          <li><a href="/brand" onClick={closeMenu}>Creative</a></li>
        </ul>
      </div>
    </nav>
  );
}
