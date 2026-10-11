import { caseStudies } from './portfolioData';

export default function CaseStudiesSection() {
  if (caseStudies.length === 0) return null;

  return (
    <section id="case-studies">
      <div className="wrap">
        <h2 className="section-label">Case studies</h2>
        <div className="projects-grid projects-grid-single">
          {caseStudies.map((study) => (
            <article key={study.title} className="project-card ai-card">
              <div className="project-card-head">
                <span className="project-status">{study.organisation}</span>
              </div>
              <h3>{study.title}</h3>
              <dl className="ai-facts">
                <div><dt>Context</dt><dd>{study.context}</dd></div>
                <div><dt>Problem</dt><dd>{study.problem}</dd></div>
                <div><dt>Approach</dt><dd>{study.approach}</dd></div>
                <div><dt>Result</dt><dd>{study.result}</dd></div>
              </dl>
              <div className="tags">
                {study.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              {study.link && (
                <a href={study.link} target="_blank" rel="noreferrer" className="project-link">Read case study</a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
