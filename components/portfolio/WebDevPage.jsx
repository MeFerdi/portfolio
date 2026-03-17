import PortfolioStyles from './PortfolioStyles';
import PortfolioFooter from './PortfolioFooter';

const webProjects = [
  {
    title: 'Somot\u00e9ch Africa',
    url: 'https://somotechafrica.org',
    displayUrl: 'somotechafrica.org',
    description:
      'Somotéch Africa is a platform dedicated to technology education and innovation across the African continent, connecting learners and builders with resources, opportunities, and community.',
    tags: ['Web', 'Education', 'Africa', 'Tech'],
  },
];

export default function WebDevPage() {
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
              <li><a href="/#projects">projects</a></li>
              <li><a href="/brand">random stuff</a></li>
            </ul>
          </div>
        </nav>

        <section id="hero">
          <div className="wrap">
            <div className="hero-eyebrow fi">Web Development</div>
            <h1 className="name fi">Web Projects</h1>
            <p className="hero-role fi">Sites & web applications I&apos;ve built or contributed to</p>
            <p className="hero-bio fi">
              A collection of web development work — from full-stack platforms to client sites.
              Each project is built with attention to performance, usability, and clean code.
            </p>
          </div>
        </section>

        <section id="web-projects">
          <div className="wrap">
            <div className="section-label">Projects</div>
            <div className="projects-list">
              {webProjects.map((project) => (
                <div key={project.url} className="web-preview-card">
                  <div className="browser-chrome">
                    <div className="browser-dots">
                      <span className="browser-dot" />
                      <span className="browser-dot" />
                      <span className="browser-dot" />
                    </div>
                    <span className="browser-url">{project.displayUrl}</span>
                  </div>

                  <div className="preview-frame-wrap">
                    <iframe
                      src={project.url}
                      className="preview-frame"
                      title={`${project.title} preview`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div className="preview-overlay" />
                  </div>

                  <div className="web-card-body">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="web-card-meta">
                      <div className="tags">
                        {project.tags.map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                      <a
                        href={project.url}
                        className="plink"
                        target="_blank"
                        rel="noreferrer"
                      >
                        ↗ Visit site
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PortfolioFooter />
      </main>
    </>
  );
}
