import Link from "next/link";
import "./site.css";
import ThemeToggle from "./ThemeToggle";
import PortfolioFooter from "./PortfolioFooter";
import { getProfile } from "../../lib/content";

function formatPeriod(period) {
  const formatMonth = (value) =>
    new Date(`${value}-01T00:00:00Z`).toLocaleDateString("en", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${formatMonth(period.start)} – ${period.end ? formatMonth(period.end) : "Present"}`;
}

function Points({ items }) {
  if (items.length === 1) return <p>{items[0]}</p>;
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function CaseStudyPage({ study }) {
  const profile = getProfile();
  const links = study.confidential
    ? { repo: null, live: study.links.live, commits: [] }
    : study.links;

  return (
    <>
      <a href="#case-study" className="skip-link">
        Skip to case study
      </a>
      <main className="portfolio-page paper-page case-study-page">
        <nav aria-label="Case study" className="site-nav">
          <div className="wrap nav-shell">
            <Link
              href="/"
              className="nav-logo"
              aria-label="Ferdynand Odhiambo, home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ferdynand-80.jpg"
                alt=""
                width="40"
                height="40"
                decoding="async"
                className="nav-portrait"
              />
            </Link>
            <div className="nav-actions">
              <Link href="/case-studies" className="paper-back">
                All work
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="paper-desk">
          <article className="paper case-study-paper" id="case-study">
            <p className="paper-kicker">Case study · {study.lifecycle}</p>
            <h1>{study.title}</h1>
            <p className="paper-byline">
              {study.client} · {study.role} · {formatPeriod(study.period)}
            </p>

            <div className="paper-abstract">
              <h2>Context</h2>
              <p>{study.summary}</p>
            </div>

            <section className="paper-section">
              <h2>Problem</h2>
              <p>{study.problem}</p>
            </section>

            {study.approach.length > 0 && (
              <section className="paper-section">
                <h2>Approach</h2>
                <Points items={study.approach} />
              </section>
            )}

            <section className="paper-section case-study-outcomes">
              <h2>Measured outcomes</h2>
              {study.outcomes.length > 0 ? (
                study.outcomes.map((outcome) => (
                  <div key={outcome.label} className="case-study-outcome">
                    <h3>{outcome.label}</h3>
                    <p>{outcome.value}</p>
                    {outcome.evidence && (
                      <a
                        href={outcome.evidence}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View evidence
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p>No measured outcomes are published for this work yet.</p>
              )}
            </section>

            {study.security_and_data.length > 0 && (
              <section className="paper-section">
                <h2>Security and data</h2>
                <Points items={study.security_and_data} />
              </section>
            )}

            <section className="paper-section">
              <h2>Tools and methods</h2>
              <p>{[...new Set([...study.stack, ...study.tags])].join(" · ")}</p>
            </section>

            {(links.repo || links.live || links.commits.length > 0) && (
              <aside className="paper-status">
                <h2>Sources</h2>
                {links.repo && (
                  <p>
                    <a
                      href={links.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link"
                    >
                      View repository
                    </a>
                  </p>
                )}
                {links.live && (
                  <p>
                    <a
                      href={links.live}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link"
                    >
                      View live project
                    </a>
                  </p>
                )}
                {links.commits.length > 0 && (
                  <ul>
                    {links.commits.map((commit) => (
                      <li key={commit.url}>
                        <a href={commit.url} target="_blank" rel="noreferrer">
                          {commit.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}
          </article>
        </div>
        <PortfolioFooter profile={profile} />
      </main>
    </>
  );
}
