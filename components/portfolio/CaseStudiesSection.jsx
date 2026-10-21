import { getCaseStudies, getSections } from '../../lib/content';

// One item renders as plain text; several render as a list. Empty renders nothing.
function Points({ items }) {
  if (items.length === 1) return items[0];
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CaseStudy({ study }) {
  const chips = [...new Set([...study.stack, ...study.tags])];
  // Repositories and commits of confidential work are not linked.
  const links = study.confidential ? { repo: null, live: study.links.live, commits: [] } : study.links;

  return (
    <article className="project-card ai-card">
      <div className="project-card-head">
        <span className="project-status">{study.client}</span>
      </div>
      <h3>{study.title}</h3>
      <dl className="ai-facts">
        <div><dt>Context</dt><dd>{study.summary}</dd></div>
        <div><dt>Problem</dt><dd>{study.problem}</dd></div>
        {study.approach.length > 0 && <div><dt>Approach</dt><dd><Points items={study.approach} /></dd></div>}
        {study.security_and_data.length > 0 && (
          <div><dt>Security and data</dt><dd><Points items={study.security_and_data} /></dd></div>
        )}
        {study.outcomes.map((outcome) => (
          <div key={outcome.label}>
            <dt>{outcome.label}</dt>
            <dd>
              {outcome.value}
              {outcome.evidence && (
                <> <a href={outcome.evidence} target="_blank" rel="noreferrer">Evidence</a></>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {chips.length > 0 && (
        <div className="tags">
          {chips.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
      {links.repo && (
        <a href={links.repo} target="_blank" rel="noreferrer" className="project-link">View repository</a>
      )}
      {links.live && (
        <a href={links.live} target="_blank" rel="noreferrer" className="project-link">View live</a>
      )}
      {links.commits.length > 0 && (
        <ul className="case-commits">
          {links.commits.map((commit) => (
            <li key={commit.url}>
              <a href={commit.url} target="_blank" rel="noreferrer">{commit.label}</a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function CaseStudiesSection() {
  const caseStudies = getCaseStudies();
  if (caseStudies.length === 0) return null;
  const { heading } = getSections().byId['case-studies'];

  return (
    <section id="case-studies">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        <div className="projects-grid projects-grid-single">
          {caseStudies.map((study) => (
            <CaseStudy key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
