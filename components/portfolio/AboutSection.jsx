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
            <p>I went through the ALX Software Engineering Programme and Zone01 Kisumu, an École 42-affiliated school. Both are project-based — you own what you build from end to end, and peer review is the only feedback loop.</p>
            <p>Most of my recent engineering work was at Payd HQ, a Kenyan fintech company, where I worked on Go microservices handling payment event processing. That’s where I developed the habit of thinking carefully about what happens when things fail — partial writes, retry loops, inconsistent state.</p>
            <p>I’m currently working through a set of increasingly complex backend projects covering concurrency, distributed transaction coordination, and high-throughput data ingestion. I write about what I learn along the way.</p>
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
