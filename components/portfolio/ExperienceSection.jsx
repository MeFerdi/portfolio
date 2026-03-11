const experiences = [
  {
    period: 'Oct 2025 — Present',
    company: 'LD Talent',
    location: 'Remote',
    role: 'Freelance Backend Engineer',
    description:
      'Maintaining and extending Python microservices for an internal talent and job management platform. Work covers service reliability, test coverage, and API design.',
    tags: ['Python', 'Microservices', 'Testing'],
  },
  {
    period: 'Jun 2025 — Oct 2025',
    company: 'Payd HQ',
    location: 'Nairobi, Kenya',
    role: 'Backend Software Engineer',
    description:
      'Contributed to Go-based financial microservices at a Kenyan fintech company. Worked on payment event processing, service-to-service communication, and PostgreSQL-backed transaction workflows. Debugged production issues by tracing data flow across distributed services under the guidance of senior engineers.',
    tags: ['Go', 'PostgreSQL', 'System Design', 'Data Modelling'],
  },
  {
    period: 'Apr 2024 — Present',
    company: 'Zone01 Kisumu',
    location: 'Kisumu, Kenya — École 42 affiliate',
    role: 'Software Developer',
    description:
      'Built backend systems for a talent management platform — REST APIs, candidate management, and evaluation workflows. Reduced PostgreSQL query latency by 20% on a high-row-count table by identifying sequential scans with EXPLAIN ANALYZE and adding targeted indexes.',
    tags: ['Python', 'Go', 'PostgreSQL', 'Docker', 'Django REST'],
  },
];

export default function ExperienceSection() {
  return (
    <section id="work">
      <div className="wrap">
        <div className="section-label">Experience</div>
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
                <div className="tags">
                  {exp.tags.map((tag) => (
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
