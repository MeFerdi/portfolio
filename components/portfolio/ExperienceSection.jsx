import { getExperience, getSections } from '../../lib/content';

export default function ExperienceSection() {
  const experiences = getExperience();
  const { heading } = getSections().byId.work;

  return (
    <section id="work">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        <div>
          {experiences.map((exp) => (
            <div key={`${exp.company}-${exp.period}`} className="exp-item">
              <div>
                <div className="exp-period">{exp.period}</div>
                <div className="exp-company">{exp.company}</div>
                <div className="exp-loc">{exp.location}</div>
              </div>
              <div className="exp-content">
                <h3>{exp.role}</h3>
                <p>{exp.description}</p>
                {exp.tags.length > 0 && (
                  <div className="tags">
                    {exp.tags.map((tag) => (
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
