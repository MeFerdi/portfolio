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

        <section id="products">
          <div className="wrap">
            <div className="section-label">Products</div>
            <div className="projects-list">
              <div className="web-preview-card">
                <div className="browser-chrome">
                  <div className="browser-dots">
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                  </div>
                  <span className="browser-url">depesa.pages.dev</span>
                </div>
                <div className="preview-frame-wrap">
                  <iframe
                    src="https://depesa.pages.dev"
                    className="preview-frame"
                    title="DePesa preview"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                  />
                  <div className="preview-overlay" />
                </div>
                <div className="web-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ margin: 0 }}>DePesa</h3>
                      <span className="project-badge badge-wip">Building</span>
                    </div>
                    <a href="https://depesa.pages.dev" className="plink" target="_blank" rel="noreferrer">↗ Visit site</a>
                  </div>
                  <p>
                    DePesa lets M-Pesa users earn yields on Solana through stablecoin investment —
                    no crypto knowledge required. Users deposit and withdraw directly via M-Pesa,
                    while DePesa handles everything on-chain behind the scenes.
                  </p>
                  <div className="tags">
                    <span className="tag">Solana</span>
                    <span className="tag">Stablecoins</span>
                    <span className="tag">M-Pesa</span>
                    <span className="tag">DeFi Yields</span>
                    <span className="tag">Africa</span>
                  </div>
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
