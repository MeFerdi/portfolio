export default function HeroSection() {
  return (
    <section id="hero">
      <div className="wrap">
        <h1 className="name fi">Ferdynand<br />Odhiambo</h1>
        <p className="hero-role fi">AI-Native Product Engineer</p>
        <p className="hero-bio fi">
          Product engineer based in Nairobi, Kenya. I build software products with AI capabilities integrated
          into the core of the system, including LLM agents, retrieval systems and automated workflows. My
          background is in backend engineering for fintech and talent platforms.
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
