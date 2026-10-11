const principles = [
  {
    title: 'Validated model output',
    body: 'All model responses are validated against a defined schema before use. Decisions that move or reconcile money are made by deterministic rules, and the model supplies inputs to those rules only.',
  },
  {
    title: 'Controlled actions',
    body: 'Agents have read access to the data they require. Any action that modifies data passes through a permission layer outside the model, which enforces confirmation, customer scoping and rate limits.',
  },
  {
    title: 'Continuous evaluation',
    body: 'Quality is measured against a labelled reference set in the CI pipeline, covering extraction accuracy, retrieval quality, faithfulness and resistance to prompt injection.',
  },
  {
    title: 'Reported cost and failure data',
    body: 'Each system is published with its cost per run, p95 latency, pinned model versions and documented failure modes, with a test for each documented failure.',
  },
];

export default function ApproachSection() {
  return (
    <section id="approach">
      <div className="wrap">
        <h2 className="section-label">Engineering standards</h2>
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
