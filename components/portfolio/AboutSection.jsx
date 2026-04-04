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
              Backend engineer with strong experience in Go, Python, and distributed systems. Built and shipped payment, data, and automation services for fintech and startups. Skilled in designing resilient systems, troubleshooting failures, and delivering reliable solutions.
            </p>
          </div>
          <div>
            <StackGroup title="Languages" items={["Go", "Python", "SQL", "Bash"]} />
            <StackGroup title="Backend" items={["PostgreSQL", "Redis", "Kafka", "Django", "FastAPI", "gRPC"]} />
            <StackGroup title="Infrastructure" items={["Docker", "Kubernetes", "GitHub Actions"]} />
          </div>
        </div>
      </div>
    </section>
  );
}
