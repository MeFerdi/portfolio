"use client";

import { useState } from 'react';
import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';
import ThemeToggle from './ThemeToggle';
import { externalProps } from './links';

// Content comes from content/brand.json via app/brand/page.js.
export default function BrandPage({ brand, profile }) {
  const { nav, hero } = brand;
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
              {nav.map((item) => (
                <li key={item.href}><a href={item.href} {...externalProps(item.href)}>{item.label}</a></li>
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
              {nav.map((item) => (
                <li key={item.href}><a href={item.href} {...externalProps(item.href)} onClick={closeMenu}>{item.mobileLabel}</a></li>
              ))}
            </ul>
          </div>
        </nav>

        <section id="hero" aria-labelledby="main-content">
          <div className="wrap">
            <div className="hero-eyebrow fi">{hero.eyebrow}</div>
            <h1 className="name fi" id="main-content">{hero.title}</h1>
            <p className="hero-role fi">{hero.role}</p>
            <p className="hero-bio fi">{hero.bio}</p>
            {hero.actions.length > 0 && (
              <div className="hero-actions fi">
                {hero.actions.map((a) => (
                  <a key={a.href} href={a.href} {...externalProps(a.href)} className={a.primary ? 'btn btn-primary' : 'btn'}>{a.label}</a>
                ))}
              </div>
            )}
          </div>
        </section>



        <PortfolioFooter profile={profile} />
      </main>
    </>
  );
}
