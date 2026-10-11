import { stackIcons } from './stackIcons';

// Each item is a key of `stackIcons`, shown with its logo from the /stack-icons.svg
// sprite, or plain text where no official mark is available.
function StackGroup({ title, items }) {
  return (
    <div className="stack-group">
      <h3>{title}</h3>
      <div className="stack-row">
        {items.map((item) => {
          const icon = stackIcons[item];
          return (
            <span key={item} className="stack-item">
              {icon && (
                <svg aria-hidden="true" focusable="false">
                  <use href={`/stack-icons.svg#${item}`} />
                </svg>
              )}
              {icon ? icon.label : item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CapabilityList({ title, items }) {
  return (
    <div className="stack-group">
      <h3>{title}</h3>
      <ul className="stack-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section id="about">
      <div className="wrap">
        <h2 className="section-label">About</h2>
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
            <CapabilityList title="AI engineering" items={["LLM integration", "Tool calling", "Structured output", "Retrieval-augmented generation", "pgvector", "Evaluation"]} />
            <StackGroup title="Models and validation" items={["claude", "zod"]} />
            <StackGroup title="Backend" items={["java", "go", "python", "node", "postgresql", "redis", "kafka"]} />
            <StackGroup title="Frontend" items={["typescript", "angular"]} />
            <StackGroup title="Quality and delivery" items={["jest", "Playwright", "githubactions", "docker"]} />
          </div>
        </div>
      </div>
    </section>
  );
}
