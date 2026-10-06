function StackGroup({ title, items }) {
  return (
    <div className="stack-group">
      <h4>{title}</h4>
      <div className="stack-row">
        {items.map((item) => (
          <span key={item} className="stack-chip">{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="section-label">About</div>
        <div className="about-grid">
          <div className="about-text">
            <p>
              I am a product engineer with a background in backend development. I have built and maintained
              Go and Python services for fintech and talent management platforms, including payment event
              processing, transaction workflows and data pipelines.
            </p>
            <p>
              My current focus is the integration of large language models into production software. I apply
              the standards expected of financial systems to this work: validated inputs and outputs,
              controlled access to data and actions, automated testing and measurable results.
            </p>
          </div>
          <div>
            <StackGroup title="AI engineering" items={["LLM integration", "Tool calling", "Structured output", "Retrieval-augmented generation", "pgvector", "Evaluation"]} />
            <StackGroup title="Backend" items={["Java", "Go", "Python", "Node.js", "PostgreSQL", "Redis", "Kafka"]} />
            <StackGroup title="Frontend" items={["TypeScript", "React", "Next.js"]} />
            <StackGroup title="Quality and delivery" items={["Jest", "Playwright", "GitHub Actions", "Docker"]} />
          </div>
        </div>
      </div>
    </section>
  );
}
