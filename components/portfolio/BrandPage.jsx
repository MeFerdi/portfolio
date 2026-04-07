import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';
import ThemeToggle from './ThemeToggle';

export default function BrandPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main className="portfolio-page brand-page">
        <PortfolioStyles />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />

        <nav aria-label="Primary">
          <div className="wrap">
            <a href="/" className="nav-logo nav-signature">Ferdynand</a>
            <ul className="nav-links">
              <li><a href="/">portfolio</a></li>
              <li><a href="https://kynaralabs.com" target="_blank" rel="noreferrer">kynaralabs.com</a></li>
            </ul>
            <ThemeToggle />
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
