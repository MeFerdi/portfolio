import Link from "next/link";
import "./site.css";
import ThemeToggle from "./ThemeToggle";
import PortfolioFooter from "./PortfolioFooter";
import { getResearch, getSections, getProfile } from "../../lib/content";

// A study presented in paper format. The closing notice states what has and has not
// been done; replace it with results once they are measured.
export default function PaperPage({ report }) {
  const research = getResearch();
  const { paper } = getSections();
  const profile = getProfile();
  const position = research.findIndex((item) => item.slug === report.slug);
  const previous = research[position - 1];
  const next = research[position + 1];

  return (
    <>
      <a href="#paper" className="skip-link">
        Skip to technical report
      </a>
      <main className="portfolio-page paper-page">
        <nav aria-label="Technical report" className="site-nav">
          <div className="wrap nav-shell">
            <Link
              href="/"
              className="nav-logo"
              aria-label="Ferdynand Odhiambo, home"
            >
              {/* A pre-sized 80 px file (40 px at 2x); next/image would add client code for no gain. */}
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
              <Link href="/#research" className="paper-back">
                Technical reports
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="paper-desk">
          <article className="paper" id="paper">
            <p className="paper-kicker">
              {report.type} · No. {report.id}
            </p>
            <h1>{report.title}</h1>
            <p className="paper-byline">
              {profile.name} · {profile.location} · {report.date}
            </p>

            <div className="paper-abstract">
              <h2>Overview</h2>
              <p>{report.abstract}</p>
              {report.tags.length > 0 && (
                <p className="paper-keywords">
                  <span>Topics:</span> {report.tags.join(", ")}
                </p>
              )}
            </div>

            {report.sections.map((section, index) => (
              <section key={section.heading} className="paper-section">
                <h2>
                  {index + 1}. {section.heading}
                </h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <aside className="paper-status" aria-label="Status of this study">
              <h2>{paper.statusHeading}</h2>
              <p>{paper.statusBody.replace("{status}", report.status)}</p>
              {report.github ? (
                <p>
                  <a
                    href={report.github}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link"
                  >
                    View repository
                  </a>
                </p>
              ) : (
                paper.repositoryPending && <p>{paper.repositoryPending}</p>
              )}
            </aside>
          </article>

          <div className="paper-pager">
            {previous ? (
              <Link
                href={`/research/${previous.slug}`}
                prefetch={false}
                className="paper-pager-link"
              >
                <span className="wm">Previous report</span>
                <span className="wt">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/research/${next.slug}`}
                prefetch={false}
                className="paper-pager-link paper-pager-next"
              >
                <span className="wm">Next report</span>
                <span className="wt">{next.title}</span>
              </Link>
            )}
          </div>
        </div>

        <PortfolioFooter profile={profile} />
      </main>
    </>
  );
}
