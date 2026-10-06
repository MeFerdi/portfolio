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
];

export default function TrainingSection() {
  return (
    <section id="training">
      <div className="wrap">
        <div className="section-label">Training</div>
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
