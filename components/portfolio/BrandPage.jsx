import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';

export default function BrandPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Special+Elite&display=swap"
        rel="stylesheet"
      />

      <main className="portfolio-page">
        <PortfolioStyles />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />

        <nav>
          <div className="wrap">
            <a href="/" className="nav-logo">FO</a>
            <ul className="nav-links">
              <li><a href="/">portfolio</a></li>
              <li><a href="https://kynaralabs.com" target="_blank" rel="noreferrer">kynaralabs.com</a></li>
            </ul>
          </div>
        </nav>

        <section id="hero">
          <div className="wrap">
            <div className="hero-eyebrow fi">Brand</div>
            <h1 className="name fi">Kynara Labs</h1>
            <p className="hero-role fi">Niche products · Energy-focused experimentation</p>
            <p className="hero-bio fi">
              By the side, I like exploring and building products that solve niche problems,
              especially in energy. Kynara Labs is where I prototype, test, and ship those ideas.
            </p>
            <div className="hero-actions fi">
              <a href="https://kynaralabs.com" target="_blank" rel="noreferrer" className="btn btn-primary">Visit site</a>
              <a href="/" className="btn">Back to portfolio</a>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="wrap">
            <div className="section-label">Products</div>
            <div className="projects-list">
              <div className="project-card">
                <div className="project-header">
                  <div className="project-title-row">
                    <h3>GridPulse</h3>
                    <span className="project-badge badge-wip">Building</span>
                  </div>
                  <div className="project-links-row">
                    <a href="https://gridpulse-sand.vercel.app/" className="plink" target="_blank" rel="noreferrer">↗ Visit site</a>
                  </div>
                </div>
                <p>
                  GridPulse is an energy intelligence platform built for solar financiers,
                  insurers, and carbon verifiers. It provides real-time grid data,
                  emissions tracking, and portfolio monitoring through a unified API.
                </p>
                <div className="tags">
                  <span className="tag">Energy Data API</span>
                  <span className="tag">Grid Intelligence</span>
                  <span className="tag">Carbon Signals</span>
                  <span className="tag">Portfolio Monitor</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PortfolioFooter />
      </main>
    </>
  );
}
