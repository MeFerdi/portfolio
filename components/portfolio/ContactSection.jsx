export default function ContactSection() {
  return (
    <section id="contact">
      <div className="wrap">
        <div className="section-label">Contact</div>
        <div className="contact-block">
          <h2>Open to backend engineering roles.</h2>
          <p>
            Full-time, contract, or freelance. If you are building something that needs solid API design,
            payment infrastructure, or database work, feel free to reach out directly.
          </p>
          <div className="contact-links">
            <a href="mailto:oferdinaddev112@gmail.com" className="contact-link"><span className="clabel">email</span>oferdinaddev112@gmail.com</a>
            <a href="https://github.com/MeFerdi" className="contact-link" target="_blank" rel="noreferrer"><span className="clabel">github</span>github.com/MeFerdi</a>
            <a href="https://linkedin.com/in/ferdynand-odhiambo" className="contact-link" target="_blank" rel="noreferrer"><span className="clabel">linkedin</span>in/ferdynand-odhiambo</a>
            <a href="https://dev.to/ferdinandodhiambo" className="contact-link" target="_blank" rel="noreferrer"><span className="clabel">writing</span>dev.to/ferdinandodhiambo</a>
          </div>
        </div>
      </div>
    </section>
  );
}
