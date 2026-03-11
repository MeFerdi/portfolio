export default function HeroSection() {
  return (
    <section id="hero">
      <div className="wrap">
        <div className="hero-eyebrow fi">Nairobi, Kenya</div>
        <h1 className="name fi">Ferdynand<br />Odhiambo</h1>
        <p className="hero-role fi">Backend Engineer — Go · Python · PostgreSQL</p>
        <p className="hero-bio fi">
          I build backend systems — APIs, payment infrastructure, and data pipelines.
          Most of my recent work has been in fintech, where <strong>data integrity and failure handling</strong>
          {' '}matter more than speed of delivery.
        </p>
        <div className="hero-actions fi">
          <a href="#projects" className="btn btn-primary">Projects</a>
          <a href="#work" className="btn">Experience</a>
          <a href="mailto:oferdinaddev112@gmail.com" className="btn">Contact</a>
        </div>
      </div>
    </section>
  );
}
