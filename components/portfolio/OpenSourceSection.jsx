import { openSource } from './portfolioData';

export default function OpenSourceSection() {
  if (openSource.length === 0) return null;

  return (
    <section id="open-source">
      <div className="wrap">
        <h2 className="section-label">Open source</h2>
        <div>
          {openSource.map((item) => (
            <a key={item.link} href={item.link} className="writing-item" target="_blank" rel="noreferrer">
              <div>
                <span className="wt">{item.title}</span>
                <span className="wm">{item.project} · {item.status}</span>
              </div>
              <span className="wa">View pull request</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
