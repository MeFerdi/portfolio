import Link from 'next/link';
import { research, articles } from './portfolioData';

export default function ResearchSection() {
  return (
    <section id="research">
      <div className="wrap">
        <h2 className="section-label">Research</h2>
        <p className="projects-note">
          My research concerns the evaluation and security of AI systems that handle financial data. The
          current programme is a series of three studies on a single domain, the financial records of a goods
          distributor, comprising statements, invoices and payments. Each study is published as a technical
          report with its evaluation data, cost per run, latency figures and documented failure modes, together
          with the code required to reproduce the results.
        </p>

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

        <h3 className="section-sublabel">Articles</h3>
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
      </div>
    </section>
  );
}
