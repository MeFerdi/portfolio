import { Fragment } from 'react';
import { getProfile } from '../../lib/content';
import { externalProps } from './links';

export default function HeroSection() {
  const { nameLines, hero } = getProfile();

  return (
    <section id="hero">
      <div className="wrap">
        <h1 className="name">
          {nameLines.map((line, i) => (
            <Fragment key={line}>{i > 0 && <br />}{line}</Fragment>
          ))}
        </h1>
        <p className="hero-role">{hero.role}</p>
        <p className="hero-bio">{hero.bio}</p>
        {hero.actions.length > 0 && (
          <div className="hero-actions">
            {hero.actions.map((a) => (
              <a key={a.href} href={a.href} className={a.primary ? 'btn btn-primary' : 'btn'} {...externalProps(a.href)}>{a.label}</a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
