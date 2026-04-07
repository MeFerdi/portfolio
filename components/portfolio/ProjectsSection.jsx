const projects = [
  {
    title: 'AI Talent Match',
    status: 'Completed',
    github: 'https://github.com/MeFerdi/talent-match',
    summary:
      'An automated assignment system using async workers and an AI scoring model to match talent to tasks.',
    tags: ['Python', 'Celery', 'Redis', 'OpenAI', 'PostgreSQL'],
  },
  {
    title: 'Monolith',
    status: 'In progress',
    github: 'https://github.com/MeFerdi/monolith.git',
    summary:
      'A local-first documentation indexer with connectors for Google Drive, Google Docs, and Notion, optimized for fast local search.',
    tags: ['Go', 'SQLite', 'Google APIs', 'Notion API', 'Full-text Search'],
  },
  {
    title: 'Tweet Audit',
    status: 'In progress',
    github: null,
    summary:
      'A resilient pipeline that processes large tweet archives, scores them with Gemini, and exports flagged items for review.',
    tags: ['Go', 'Gemini API', 'Concurrency', 'Rate Limiting', 'File I/O'],
  },
  {
    title: 'Payment Gateway',
    status: 'In progress',
    github: null,
    summary:
      'A fault-tolerant payment gateway simulation focused on idempotency, state transitions, and recovery after failures.',
    tags: ['Go', 'PostgreSQL', 'Idempotency', 'Distributed Transactions'],
  },
];




export default function ProjectsSection() {
  return (
    <section id="projects">
      <div className="wrap">
        <div className="section-label">Projects</div>
        <p className="projects-note">
          Note for recruiters: These are backend-focused projects, mainly validated through CLI testing and exposed via APIs.
        </p>

        <div className="projects-grid">
          {projects.map((project) => (
            <article key={project.title} className="project-card">
              <div className="project-card-head">
                <h3>{project.title}</h3>
                <span className="project-status">{project.status}</span>
              </div>

              <p className="project-summary">{project.summary}</p>

              <div className="tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              {project.github ? (
                <a href={project.github} target="_blank" rel="noreferrer" className="project-link">
                  View code
                </a>
              ) : (
                <span className="project-link project-link-disabled">Live project link coming up soon</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

