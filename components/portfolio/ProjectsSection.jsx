'use client';

import { useState } from 'react';

const projects = [
	{
		title: 'PesaFlow',
		status: 'In progress',
		badgeClass: 'badge-wip',
		github: 'https://github.com/MeFerdi',
		paragraphs: [
			'A Go backend integrating with Safaricom’s Daraja API - STK Push initiation, C2B payment callbacks, B2C disbursements, and a PostgreSQL transaction ledger with double-entry accounting.',
			'The main engineering problem was callback idempotency. Safaricom retries callbacks up to three times on timeout. The handler must produce the same result on every invocation - I solved this with Redis-backed idempotency keys and an explicit state machine that rejects invalid transitions.',
		],
		tags: ['Go', 'PostgreSQL', 'Redis', 'Daraja API', 'Docker'],
	},
	{
		title: 'Monolith',
		status: 'In progress',
		badgeClass: 'badge-wip',
		github: 'https://github.com/MeFerdi/monolith.git',
		paragraphs: [
			'A local-first personal documentation indexer. Search across local files, Google Drive, Google Docs, and Notion from a single interface — read-only, fast, and entirely on your machine. No cloud sync, no external database, no vendor lock-in.',
			'The interesting problems are in the indexing pipeline: efficiently crawling and re-indexing only changed documents, handling OAuth flows for Drive and Notion without a server, and serving low-latency full-text search from a local embedded index.',
		],
		tags: ['Go', 'SQLite', 'Google APIs', 'Notion API', 'Full-text Search'],
	},
	{
		title: 'Tweet Audit',
		status: 'In progress',
		badgeClass: 'badge-wip',
		github: 'https://github.com/MeFerdi',
		paragraphs: [
			'A pipeline that processes a full X (Twitter) archive, evaluates each tweet against alignment criteria using the Gemini API, and outputs a CSV of flagged tweets for deletion. The real engineering work is not the AI call — it is building a pipeline that handles 10,000+ tweets without failing on rate limits, partial failures, or crashes mid-run.',
		],
		tags: ['Go', 'Gemini API', 'Concurrency', 'Rate Limiting', 'File I/O'],
	},
	{
		title: 'Payment Gateway',
		status: 'Up next',
		badgeClass: 'badge-next',
		github: 'https://github.com/MeFerdi',
		paragraphs: [
			'A payment gateway for a fictional e-commerce platform, integrating with a mock bank API that randomly fails, adds latency, and enforces strict state rules. The bank will fail — the gateway must not.',
			'The core engineering challenge is distributed transaction coordination: what is the gateway’s state when it processes a bank charge but crashes before recording the result? How do you recover without double-charging or losing the money?',
		],
		tags: ['Go', 'PostgreSQL', 'Idempotency', 'Distributed Transactions', 'State Machines'],
	},
	{
		title: 'Trace Ingestor',
		status: 'Planned',
		badgeClass: 'badge-plan',
		paragraphs: [
			'A high-throughput trace ingestion API that receives spans from a configurable mock service and surfaces them in a dashboard. Must handle massive concurrent writes, manage race conditions under load, and serve queries within a configurable rolling time window.',
		],
		tags: ['Go', 'PostgreSQL', 'Concurrency', 'Time-series', 'Partitioning'],
	},
	{
		title: 'AI Talent Match',
		status: 'Completed',
		badgeClass: 'badge-done',
		github: 'https://github.com/MeFerdi/talent-match',
		paragraphs: [
			'An automated task assignment system that pairs talent to tasks based on skill rating and availability. Built async task processing with Celery and Redis, and integrated the OpenAI API for matching logic. The interesting design decision was the scoring model — a weighted combination of skill match, availability window, and historical task completion rate.',
		],
		tags: ['Python', 'Celery', 'Redis', 'OpenAI', 'PostgreSQL'],
	},
];




export default function ProjectsSection() {
  const [selected, setSelected] = useState(0);
  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelected((prev) => (prev + 1 < projects.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelected((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
    }
  };
  return (
      <section id="projects">
        <div className="wrap">
          <div className="section-label">Projects</div>
          <div className="mb-6 max-w-2xl mx-auto">
            <p className="text-center text-gray-700 dark:text-gray-300 text-base">
              <strong>Note for recruiters:</strong> Most of these projects are backend-focused, tested primarily via the command line and exposed through robust APIs. Please feel free to ask for API documentation, code samples, or test instructions.
            </p>
          </div>
          <div className="projectroadmap-outer centered">
        <div className="projectroadmap-inner-centered">
          <div className="projectroadmap-sidebar" role="listbox" aria-label="Project list">
            {projects.map((project, i) => (
              <button
                key={project.title}
                className={`projectroadmap-item${selected === i ? ' selected' : ''}`}
                tabIndex={0}
                onClick={() => setSelected(i)}
                onKeyDown={handleKeyDown}
              >
                <span className="projectroadmap-title">{project.title}</span>
                {project.github && (
                  <a
                    href={project.github}
                    className="plink compact"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    style={{marginLeft: '0.3em'}}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 21.13V25"/></svg>
                  </a>
                )}
              </button>
            ))}
          </div>
          <div className="projectroadmap-detail compact">
            <div className="projectroadmap-detail-title-row compact">
              <span className="projectroadmap-detail-title compact">{projects[selected].title}</span>
              {projects[selected].github && (
                <a
                  href={projects[selected].github}
                  className="plink compact"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  style={{marginLeft: '0.3em'}}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 21.13V25"/></svg>
                </a>
              )}
            </div>
            <div className="projectroadmap-detail-summary compact">{projects[selected].paragraphs[0]}</div>
            <div className="projectroadmap-detail-tags compact">
              {projects[selected].tags.map((tag) => (
                <span key={tag} className="tag compact">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}




// Centered, compact sidebar roadmap styles (inject into PortfolioStyles.jsx for production)
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .projectroadmap-outer.centered {
      width: 100%;
      display: flex;
      justify-content: center;
      background: none;
      min-height: 220px;
      margin: 32px 0 40px 0;
      font-family: 'Inter', 'IBM Plex Sans', Arial, sans-serif;
    }
    .projectroadmap-inner-centered {
      display: flex;
      max-width: 640px;
      width: 100%;
      background: none;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      border: none;
    }
    .projectroadmap-sidebar {
      min-width: 150px;
      max-width: 180px;
      background: #f6f7fa;
      border-radius: 10px 0 0 10px;
      border: 1.5px solid #e5e7eb;
      border-right: none;
      padding: 10px 0 10px 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
      box-shadow: none;
      height: 100%;
    }
    .projectroadmap-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: none;
      border: none;
      outline: none;
      padding: 7px 14px 7px 14px;
      font-size: 0.98rem;
      color: #23272f;
      cursor: pointer;
      border-left: 3px solid transparent;
      transition: background 0.13s, border-color 0.13s;
      text-align: left;
      gap: 0.5em;
      font-family: inherit;
    }
    .projectroadmap-item.selected, .projectroadmap-item:focus {
      background: #e5e7eb;
      border-left: 3px solid #2563eb;
      color: #2563eb;
      font-weight: 600;
    }
    .projectroadmap-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: inherit;
    }
    .projectroadmap-detail.compact {
      flex: 1 1 0;
      background: #fff;
      border-radius: 0 10px 10px 0;
      border: 1.5px solid #e5e7eb;
      border-left: none;
      padding: 18px 18px 18px 18px;
      min-width: 0;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      font-family: inherit;
      max-width: 420px;
      margin: 0 auto;
    }
    .projectroadmap-detail-title-row.compact {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin-bottom: 0.1em;
      font-family: inherit;
    }
    .projectroadmap-detail-title.compact {
      font-weight: 600;
      font-size: 1.04rem;
      color: #23272f;
      font-family: inherit;
    }
    .project-badge.compact {
      font-size: 0.78em;
      padding: 1.5px 7px;
      border-radius: 7px;
      background: #e0e7ef;
      color: #2563eb;
      margin-left: 0.4em;
      font-family: inherit;
    }
    .badge-wip { background: #e0e7ef !important; color: #b45309 !important; }
    .badge-next { background: #e0e7ef !important; color: #1d4ed8 !important; }
    .badge-plan { background: #e0e7ef !important; color: #7c3aed !important; }
    .badge-done { background: #e0e7ef !important; color: #047857 !important; }
    .projectroadmap-detail-summary.compact {
      font-size: 0.97em;
      color: #374151;
      margin-bottom: 0.1em;
      font-family: inherit;
    }
    .projectroadmap-detail-tags.compact {
      margin-top: 0.1em;
      display: flex;
      flex-wrap: wrap;
      gap: 0.3em;
      font-family: inherit;
    }
    .tag.compact {
      background: #f3f4f6;
      color: #374151;
      border-radius: 5px;
      padding: 1.5px 7px;
      font-size: 0.78em;
      font-family: inherit;
    }
    .plink.compact {
      color: #2563eb;
      font-size: 1em;
      margin-left: 0.2em;
      text-decoration: none;
      font-family: inherit;
    }
    @media (max-width: 900px) {
      .projectroadmap-outer.centered {
        flex-direction: column;
        align-items: center;
      }
      .projectroadmap-inner-centered {
        flex-direction: column;
        max-width: 98vw;
      }
      .projectroadmap-sidebar, .projectroadmap-detail.compact {
        border-radius: 10px 10px 0 0;
        border: 1.5px solid #e5e7eb;
        border-bottom: none;
        max-width: 100vw;
      }
      .projectroadmap-detail.compact {
        padding: 14px 8px 14px 8px;
        margin: 0 auto;
      }
    }
  `;
  document.head.appendChild(style);
}
