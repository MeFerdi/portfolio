// Ordered by build sequence. Only entries with `published: true` are shown; set it
// when a project is in active development or shipped. Set `github` to the repository
// URL once the repository is public. Update `status`, and replace
// `target` with a measured result, only when the work is shipped and measured.
const aiSystems = [
  {
    id: '01',
    title: 'AI Growth Engineer Pipeline',
    pattern: 'LLM agent with automation and CRM data',
    status: 'In progress',
    published: true,
    summary:
      'An automated outbound sales pipeline that imports leads, researches each one, assesses fit against an ideal customer profile and drafts personalised outreach for qualifying leads. Every model assessment is validated against a schema before a lead progresses.',
    proof: 'Contract tests for model output, fixture-based scraper tests and idempotent queue stages.',
    target: 'Research for 100 leads in approximately 20 minutes, compared with an estimated 12 hours of manual work.',
    tags: ['TypeScript', 'BullMQ', 'PostgreSQL', 'pgvector', 'Claude API', 'Zod'],
    github: null,
  },
  {
    id: '02',
    title: 'Customer Support Agent with CRM Integration',
    pattern: 'Tool-calling agent with a permission model',
    status: 'Up next',
    summary:
      'A support agent that resolves customer tickets by calling payment, order and CRM services. Read operations run immediately. Write operations are executed only after explicit confirmation from the customer.',
    proof: 'Adversarial test suite confirming that the policy layer refuses out-of-scope actions independently of model behaviour.',
    target: 'Resolution of a refund status enquiry without human involvement.',
    tags: ['Fastify', 'Tool calling', 'PII redaction', 'Rate limiting', 'Jest'],
    github: null,
  },
  {
    id: '03',
    title: 'Knowledge Assistant with Evaluation Suite',
    pattern: 'Retrieval-augmented generation with continuous evaluation',
    status: 'Planned',
    summary:
      'A question-answering assistant for internal documentation that cites its sources, or states that the documentation does not cover the question. An evaluation suite runs on every commit.',
    proof: 'Automated measurement of retrieval recall, citation accuracy, factual consistency and prompt-injection resistance.',
    target: 'A comparative report quantifying the effect of reranking on retrieval quality.',
    tags: ['Hybrid search', 'Reranking', 'pgvector', 'Model-graded evaluation', 'GitHub Actions'],
    github: null,
  },
  {
    id: '04',
    title: 'Automated QA Agent for E-Commerce',
    pattern: 'End-to-end testing with AI-assisted diagnosis',
    status: 'Planned',
    summary:
      'An automated testing system for an online store. Playwright detects failures, an AI agent analyses logs, screenshots and source code to identify the likely cause, and a structured bug report is posted to the team channel. Pass and fail results are determined by the tests alone.',
    proof: 'Suspected file paths are verified against the repository before a report is filed.',
    target: 'Detection, diagnosis and reporting of an introduced defect within one minute.',
    tags: ['Playwright', 'Image analysis', 'Slack API', 'Flaky test detection'],
    github: null,
  },
  {
    id: '05',
    title: 'Onboarding and Retention Engine',
    pattern: 'Event pipeline with AI-driven intervention',
    status: 'Planned',
    summary:
      'A system that identifies users who stop progressing through onboarding, determines the likely reason from their activity, and sends a tailored follow-up email. A control group is used to measure the effect.',
    proof: 'Tests for event integrity, duplicate prevention and statistical comparison of user cohorts.',
    target: 'Improvement in onboarding completion relative to the control group, measured on synthetic data.',
    tags: ['Event streams', 'BullMQ', 'Experimentation', 'Resend'],
    github: null,
  },
];

const earlierWork = [
  {
    title: 'AI Talent Match',
    status: 'Completed',
    github: 'https://github.com/MeFerdi/talent-match',
    summary: 'An automated assignment system that uses asynchronous workers and an AI scoring model to match talent to tasks.',
    tags: ['Python', 'Celery', 'OpenAI', 'PostgreSQL'],
  },
  {
    title: 'Tweet Audit',
    status: 'In progress',
    github: null,
    summary: 'A rate-limited pipeline that processes large tweet archives, scores them with Gemini and exports flagged items for review.',
    tags: ['Go', 'Gemini API', 'Concurrency'],
  },
  {
    title: 'Monolith',
    status: 'In progress',
    github: 'https://github.com/MeFerdi/monolith.git',
    summary: 'A local-first documentation indexer with connectors for Google Drive, Google Docs and Notion.',
    tags: ['Go', 'SQLite', 'Full-text search'],
  },
  {
    title: 'Payment Gateway',
    status: 'In progress',
    github: null,
    summary: 'A fault-tolerant payment gateway simulation focused on idempotency, state transitions and recovery after failure.',
    tags: ['Go', 'PostgreSQL', 'Idempotency'],
  },
];

function Tags({ items }) {
  return (
    <div className="tags">
      {items.map((tag) => (
        <span key={tag} className="tag">{tag}</span>
      ))}
    </div>
  );
}

function AiSystemCard({ project }) {
  return (
    <article className="project-card ai-card">
      <div className="project-card-head">
        <span className="ai-index">{project.id}</span>
        <span className="project-status">{project.status}</span>
      </div>
      <h3>{project.title}</h3>
      <p className="ai-pattern">{project.pattern}</p>
      <p className="project-summary">{project.summary}</p>
      <dl className="ai-facts">
        <div>
          <dt>Verification</dt>
          <dd>{project.proof}</dd>
        </div>
        <div>
          <dt>Target outcome</dt>
          <dd>{project.target}</dd>
        </div>
      </dl>
      <Tags items={project.tags} />
      {project.github ? (
        <a href={project.github} target="_blank" rel="noreferrer" className="project-link">
          View repository
        </a>
      ) : (
        <span className="project-link project-link-disabled">Repository coming soon</span>
      )}
    </article>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects">
      <div className="wrap">
        <div className="section-label">Projects</div>
        <p className="projects-note">
          My current work focuses on integrating AI into production software. Each repository includes an
          architecture diagram, automated tests and documentation of failure handling. Target outcomes will
          be replaced with measured results when each project is completed.
        </p>

        <div className="projects-grid">
          {aiSystems.filter((project) => project.published).map((project) => (
            <AiSystemCard key={project.id} project={project} />
          ))}
        </div>

        <div className="section-sublabel">Earlier projects</div>
        <div className="projects-grid projects-grid-compact">
          {earlierWork.map((project) => (
            <article key={project.title} className="project-card">
              <div className="project-card-head">
                <h3>{project.title}</h3>
                <span className="project-status">{project.status}</span>
              </div>
              <p className="project-summary">{project.summary}</p>
              <Tags items={project.tags} />
              {project.github ? (
                <a href={project.github} target="_blank" rel="noreferrer" className="project-link">
                  View code
                </a>
              ) : (
                <span className="project-link project-link-disabled">Repository coming soon</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
