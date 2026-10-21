import { getApproach, getSections } from '../../lib/content';

export default function ApproachSection() {
  const principles = getApproach();
  const { heading } = getSections().byId.approach;
  if (principles.length === 0) return null;

  return (
    <section id="approach">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
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
