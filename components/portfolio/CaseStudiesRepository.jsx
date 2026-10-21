import Link from "next/link";
import "./site.css";
import ThemeToggle from "./ThemeToggle";
import PortfolioFooter from "./PortfolioFooter";
import { getCaseStudies, getProfile, getResearch } from "../../lib/content";

function RepositoryEntry({ item }) {
  const isReport = item.kind === "report";
  const result = !isReport && item.outcomes[0];

  return (
    <article className="repository-item">
      <div className="repository-item-meta">
        <span>{isReport ? item.type : item.client}</span>
        <span>
          {isReport
            ? item.status
            : `${item.period.start} – ${item.period.end || "Present"}`}
        </span>
      </div>
      <h3>
        <Link href={item.href}>{item.title}</Link>
      </h3>
      <p>{isReport ? item.abstract : item.summary}</p>
      {result && (
        <p className="repository-result">
          <strong>{result.label}:</strong> {result.value}
          {result.evidence && (
            <>
              {" "}
              <a href={result.evidence} target="_blank" rel="noreferrer">
                Evidence
              </a>
            </>
          )}
        </p>
      )}
      <Link href={item.href} className="repository-read">
        {isReport ? "Read technical report" : "Read case study"}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default function CaseStudiesRepository() {
  const profile = getProfile();
  const caseStudies = getCaseStudies();
  const research = getResearch();
  const items = [
    ...caseStudies.map((study) => ({
      ...study,
      kind: "case-study",
      href: `/case-studies/${study.slug}`,
    })),
    ...research.map((report) => ({
      ...report,
      kind: "report",
      href: `/research/${report.slug}`,
    })),
  ];
  const active = items.filter((item) => item.lifecycle === "active");
  const archived = items.filter((item) => item.lifecycle === "archived");

  return (
    <>
      <a href="#repository" className="skip-link">
        Skip to repository
      </a>
      <main className="portfolio-page paper-page repository-page">
        <nav aria-label="Repository" className="site-nav">
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
              <Link href="/" className="paper-back">
                Portfolio
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="repository-content" id="repository">
          <header className="repository-header">
            <p className="repository-eyebrow">
              Work record /{" "}
              {String(active.length + archived.length).padStart(2, "0")} entries
            </p>
            <h1>Case studies &amp; technical reports</h1>
            <p>
              Work documented with its context, method and evidence. Results are
              reported only where they have been measured.
            </p>
          </header>

          <nav className="repository-tabs" aria-label="Work status">
            <a href="#active">
              Active <span>{active.length}</span>
            </a>
            <a href="#archived">
              Archived <span>{archived.length}</span>
            </a>
          </nav>

          <section
            className="repository-section"
            id="active"
            aria-labelledby="active-heading"
          >
            <div className="repository-section-heading">
              <h2 id="active-heading">Active</h2>
              <span>{String(active.length).padStart(2, "0")}</span>
            </div>
            {active.length > 0 ? (
              active.map((item) => (
                <RepositoryEntry
                  key={`${item.kind}-${item.slug}`}
                  item={item}
                />
              ))
            ) : (
              <p className="repository-empty">No active work is listed.</p>
            )}
          </section>

          <section
            className="repository-section"
            id="archived"
            aria-labelledby="archived-heading"
          >
            <div className="repository-section-heading">
              <h2 id="archived-heading">Archived</h2>
              <span>{String(archived.length).padStart(2, "0")}</span>
            </div>
            {archived.length > 0 ? (
              archived.map((item) => (
                <RepositoryEntry
                  key={`${item.kind}-${item.slug}`}
                  item={item}
                />
              ))
            ) : (
              <p className="repository-empty">No archived work is listed.</p>
            )}
          </section>
        </div>

        <PortfolioFooter profile={profile} />
      </main>
    </>
  );
}
