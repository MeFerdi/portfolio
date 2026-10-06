const principles = [
  {
    title: 'Validated model output',
    body: 'All model responses are validated against a defined schema before they are used. Responses that do not conform are rejected and retried.',
  },
  {
    title: 'Controlled actions',
    body: 'AI agents have read access to the data they require. Any action that modifies data passes through a permission layer that enforces confirmation, customer scoping and rate limits.',
  },
  {
    title: 'Continuous evaluation',
    body: 'Answer quality is measured against a reference dataset in the CI pipeline, covering retrieval accuracy, factual consistency and resistance to prompt injection.',
  },
  {
    title: 'Measured outcomes',
    body: 'Each system is assessed against a business metric such as time saved, tickets resolved or user retention, using benchmarks and control groups where appropriate.',
  },
];

export default function ApproachSection() {
  return (
    <section id="approach">
      <div className="wrap">
        <div className="section-label">Engineering principles</div>
        <div className="approach-grid">
          {principles.map((p, i) => (
            <div key={p.title} className="approach-item">
              <span className="approach-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
