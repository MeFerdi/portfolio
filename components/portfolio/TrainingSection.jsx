import { getTraining, getSections } from '../../lib/content';

export default function TrainingSection() {
  const training = getTraining();
  const { heading } = getSections().byId.training;

  return (
    <section id="training">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
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
                {item.tags.length > 0 && (
                  <div className="tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
