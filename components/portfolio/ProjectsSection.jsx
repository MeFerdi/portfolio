const projects = [
	{
		title: 'PesaFlow',
		status: 'In progress',
		badgeClass: 'badge-wip',
		github: 'https://github.com/MeFerdi',
		paragraphs: [
			'A Go backend integrating with Safaricom’s Daraja API — STK Push initiation, C2B payment callbacks, B2C disbursements, and a PostgreSQL transaction ledger with double-entry accounting.',
			'The main engineering problem was callback idempotency. Safaricom retries callbacks up to three times on timeout. The handler must produce the same result on every invocation — I solved this with Redis-backed idempotency keys and an explicit state machine that rejects invalid transitions.',
		],
		leftBlock: {
			title: 'Hard problems',
			items: [
				'Idempotent callback handling under Safaricom retries',
				'State machine: PENDING → PROCESSING → COMPLETED / FAILED / EXPIRED',
				'Double-entry ledger — every payment creates a debit and a credit',
				'OAuth2 token refresh without race conditions across goroutines',
			],
		},
		arch: `<span class="g">HTTP API</span>  (chi, Go)
  ├─ POST /pay/stk-push
  ├─ POST /pay/callback  <span class="f">← Safaricom</span>
  └─ GET  /pay/:id
  │
  ▼
<span class="g">Payment Service</span>
  ├─ Idempotency  <span class="f">(Redis SetNX)</span>
  ├─ State machine
  └─ Daraja client
  │
  ▼
<span class="g">PostgreSQL</span>
  ├─ payments
  ├─ journal_entries
  └─ idempotency_keys`,
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
		leftBlock: {
			title: 'Hard problems',
			items: [
				'Incremental re-indexing — only crawl documents that changed since last run',
				'Unified search across structurally different sources: files, Docs, Notion blocks',
				'Local OAuth2 flow for Drive and Notion without a callback server',
				'Query ranking — relevance over keyword frequency',
			],
		},
		rightBlock: {
			title: 'What it demonstrates',
			items: [
				'File I/O, filesystem event handling, large-file parsing',
				'Third-party API integration with pagination and rate limits',
				'Embedded search indexing — SQLite FTS5 or BM25',
				'Local-first architecture that works offline entirely',
			],
		},
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
		leftBlock: {
			title: 'Hard problems',
			items: [
				'Rate limiting and backpressure against the Gemini API',
				'Checkpoint-based recovery — resume from last processed tweet after a crash',
				'Concurrent processing without overwhelming the API or losing state',
				'Exponential backoff with jitter on transient failures',
			],
		},
		rightBlock: {
			title: 'What it demonstrates',
			items: [
				'File I/O and parsing at scale (large JSON archives)',
				'Go concurrency — worker pools, channels, graceful shutdown',
				'Resilient HTTP client patterns: timeouts, retries, backoff',
				'Stateful, resumable long-running batch processes',
			],
		},
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
		leftBlock: {
			title: 'Hard problems',
			items: [
				'Idempotency keys — duplicate requests must not create duplicate charges',
				'State machine: authorize → capture → refund with valid transition enforcement',
				'Crash recovery — coordinating state between gateway and bank after failure',
				'Distinguishing transient failures (retry) from permanent ones (fail fast)',
			],
		},
		arch: `<span class="g">Client</span>
  │
  ▼
<span class="g">Gateway API</span>
  ├─ Idempotency check  <span class="f">(Postgres)</span>
  ├─ State machine      <span class="f">(auth→capture)</span>
  └─ Bank client        <span class="f">(mock, fails)</span>
      ├─ timeout? → retry w/ backoff
      ├─ 5xx?    → retry w/ jitter
      └─ 4xx?    → fail, no retry
  │
  ▼
<span class="g">PostgreSQL</span>
  ├─ payments
  ├─ idempotency_keys
  └─ outbox  <span class="f">(pending calls)</span>`,
		tags: ['Go', 'PostgreSQL', 'Idempotency', 'Distributed Transactions', 'State Machines'],
	},
	{
		title: 'Trace Ingestor',
		status: 'Planned',
		badgeClass: 'badge-plan',
		paragraphs: [
			'A high-throughput trace ingestion API that receives spans from a configurable mock service and surfaces them in a dashboard. Must handle massive concurrent writes, manage race conditions under load, and serve queries within a configurable rolling time window.',
		],
		standaloneBlock: {
			title: 'What it covers',
			items: [
				'High-throughput concurrent write ingestion under load',
				'Time-series storage patterns and rolling window queries',
				'Race condition detection and handling at volume',
				'Partitioning strategies for write-heavy workloads',
			],
		},
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

function DetailBlock({ title, items }) {
	return (
		<div className="detail-block">
			<h4>{title}</h4>
			<ul>
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}

export default function ProjectsSection() {
	return (
		<section id="projects">
			<div className="wrap">
				<div className="section-label">Projects</div>
				<div className="projects-list">
					{/* Existing project cards */}
					{projects.map((project) => (
						<div key={project.title} className="project-card">
							<div className="project-header">
								<div className="project-title-row">
									<h3>{project.title}</h3>
									<span className={`project-badge ${project.badgeClass}`}>
										{project.status}
									</span>
								</div>
								{project.github && (
									<div className="project-links-row">
										<a
											href={project.github}
											className="plink"
											target="_blank"
											rel="noreferrer"
										>
											↗ GitHub
										</a>
									</div>
								)}
							</div>

							{project.paragraphs.map((paragraph) => (
								<p key={paragraph}>{paragraph}</p>
							))}

							{project.leftBlock && (
								<div className="two-col">
									<DetailBlock
										title={project.leftBlock.title}
										items={project.leftBlock.items}
									/>
									{project.arch ? (
										<div
											className="arch"
											dangerouslySetInnerHTML={{ __html: project.arch }}
										/>
									) : (
										<DetailBlock
											title={project.rightBlock.title}
											items={project.rightBlock.items}
										/>
									)}
								</div>
							)}

							{project.standaloneBlock && (
								<DetailBlock
									title={project.standaloneBlock.title}
									items={project.standaloneBlock.items}
								/>
							)}

							<div
								className="tags"
								style={
									project.standaloneBlock
										? { marginTop: '12px' }
										: undefined
								}
							>
								{project.tags.map((tag) => (
									<span key={tag} className="tag">
										{tag}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
