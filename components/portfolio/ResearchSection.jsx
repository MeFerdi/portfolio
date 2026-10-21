import Link from 'next/link';
import { getResearch, getArticles, getSections } from '../../lib/content';

export default function ResearchSection() {
  const research = getResearch();
  const articles = getArticles();
  const { heading, intro, articlesHeading } = getSections().byId.research;

  return (
    <section id="research">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        {intro && <p className="projects-note">{intro}</p>}

        <div className="paper-list">
          {research.map((report) => (
            <Link key={report.slug} href={`/research/${report.slug}`} prefetch={false} className="writing-item paper-link">
              <div>
                <span className="paper-index">{report.id}</span>
                <span className="wt">{report.title}</span>
                <span className="wm">{report.type} · {report.status}</span>
              </div>
              <span className="wa">Read paper</span>
            </Link>
          ))}
        </div>

        {articles.length > 0 && (
          <>
            {articlesHeading && <h3 className="section-sublabel">{articlesHeading}</h3>}
            <div>
              {articles.map((post) => (
                <a key={post.href} href={post.href} className="writing-item" target="_blank" rel="noreferrer">
                  <div>
                    <span className="wt">{post.title}</span>
                    <span className="wm">{post.meta}</span>
                  </div>
                  <span className="wa">Read article</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
