export default function HeroSection() {
  return (
    <section id="hero">
      <div className="wrap">
        <h1 className="name">Ferdynand<br />Odhiambo</h1>
        <p className="hero-role">AI-Native Product Engineer</p>
        <p className="hero-bio">
          AI-native product engineer. I build software products with AI capabilities integrated
          into the core of the system, including LLM agents, retrieval systems and automated workflows. My
          background is in backend engineering for fintech and talent platforms, and my current research
          concerns the evaluation and security of AI systems that handle financial data.
        </p>
        <div className="hero-actions">
          <a href="#research" className="btn btn-primary">Research</a>
          <a href="#work" className="btn">Experience</a>
          <a href="mailto:oferdinaddev112@gmail.com" className="btn">Contact</a>
        </div>
      </div>
    </section>
  );
}
