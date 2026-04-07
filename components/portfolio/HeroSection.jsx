export default function HeroSection() {
  return (
    <section id="hero">
      <div className="wrap">
        <h1 className="name fi">Ferdynand<br />Odhiambo</h1>
        <p className="hero-role fi">Backend Engineer - Go · Python · PostgreSQL</p>
        <p className="hero-bio fi">
          Backend engineer specializing in APIs, payment systems, and data pipelines. Proven track record delivering reliable, secure solutions for fintech and high-integrity domains.
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
