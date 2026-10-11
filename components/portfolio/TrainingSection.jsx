const training = [
  {
    period: 'Current',
    institution: 'Kood/Nairobi',
    location: 'Nairobi, Kenya',
    programme: 'Product Engineering',
    description:
      'Training in end-to-end product engineering, covering product design, backend development in Java and frontend development in TypeScript.',
    tags: ['Java', 'TypeScript', 'Product engineering'],
  },
  {
    period: 'Apr 2024 - Feb 2026',
    institution: 'Zone01 Kisumu',
    location: 'Kisumu, Kenya',
    programme: 'Software Development Apprenticeship',
    description:
      'Built backend systems for a talent management platform, including REST APIs, candidate management and evaluation workflows. Reduced PostgreSQL query latency by 20 per cent on a high-row-count table by identifying sequential scans with EXPLAIN ANALYZE and adding targeted indexes.',
    tags: ['Python', 'Go', 'PostgreSQL', 'Docker', 'Django REST'],
  },
];

export default function TrainingSection() {
  return (
    <section id="training">
      <div className="wrap">
        <h2 className="section-label">Training and apprenticeship</h2>
        <div>
          {training.map((item) => (
            <div key={item.institution} className="exp-item">
              <div>
                <div className="exp-period">{item.period}</div>
                <div className="exp-company">{item.institution}</div>
                <div className="exp-loc">{item.location}</div>
              </div>
              <div className="exp-content">
                <h3>{item.programme}</h3>
                <p>{item.description}</p>
                <div className="tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
