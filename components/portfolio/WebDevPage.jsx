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
  {
    title: 'Employa',
    url: 'https://employa.pages.dev',
    displayUrl: 'employa.pages.dev',
    description:
      'WhatsApp-native payout operations for scheduled M-Pesa disbursements. Employa helps finance and operations teams execute M-Pesa disbursements with stronger control, clearer communication, and a more dependable audit trail across every payout cycle.',
    tags: ['M-Pesa', 'Payouts', 'Finance Ops', 'WhatsApp'],
  },
  {
    title: 'DePesa',
    url: 'https://depesa.pages.dev',
    displayUrl: 'depesa.pages.dev',
    description:
      'DePesa automates contribution proof, gives treasurers a real-time record, and helps savings groups protect value. Group funds stay in a licensed Kenyan bank account, M-Pesa pool, or SACCO channel chosen by the group. Timestamped receipts, dispute logs, and payout confirmations are built in.',
    tags: ['Chama', 'M-Pesa', 'Receipts', 'Dispute Resolution', 'Finance'],
  },
  {
    title: 'Provd',
    url: 'https://provd.pages.dev',
    displayUrl: 'provd.pages.dev',
    description:
      'Provd helps African exchanges, wallets, and OTC desks block repeat fraud before funds move. Query one API call and get network-backed counterparty risk, dispute signals, and recommended actions across P2P stablecoin flows.',
    tags: ['Risk', 'Fraud', 'API', 'P2P', 'Africa'],
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
