"use client";

import { useState } from 'react';
import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';
import ThemeToggle from './ThemeToggle';

export default function BrandPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main className="portfolio-page brand-page">
        <PortfolioStyles />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />

        <nav aria-label="Primary" className="site-nav">
          <div className="wrap nav-shell">
            <a href="/" className="nav-logo nav-signature">Ferdynand</a>

            <ul className="nav-links nav-links-desktop">
              <li><a href="/">portfolio</a></li>
              <li><a href="https://kynaralabs.com" target="_blank" rel="noreferrer">kynaralabs.com</a></li>
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
              <li><a href="/" onClick={closeMenu}>Portfolio</a></li>
              <li><a href="https://kynaralabs.com" target="_blank" rel="noreferrer" onClick={closeMenu}>kynaralabs.com</a></li>
            </ul>
          </div>
        </nav>

        <section id="hero" aria-labelledby="main-content">
          <div className="wrap">
            <div className="hero-eyebrow fi">Brand</div>
            <h1 className="name fi" id="main-content">Kynara Labs</h1>
            <p className="hero-role fi">Niche products</p>
            <p className="hero-bio fi">
              By the side, I like exploring and building products that solve niche problems. Kynara Labs is where I prototype, test, and ship those ideas.
            </p>
            <div className="hero-actions fi">
              <a href="https://kynaralabs.com" target="_blank" rel="noreferrer" className="btn btn-primary">Visit site</a>
              <a href="/" className="btn">Back to portfolio</a>
            </div>
          </div>
        </section>



        <PortfolioFooter />
      </main>
    </>
  );
}
