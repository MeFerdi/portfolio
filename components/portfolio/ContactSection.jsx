import { getProfile, getSections } from '../../lib/content';
import { externalProps } from './links';

export default function ContactSection() {
  const { contact } = getProfile();
  const { heading } = getSections().byId.contact;

  return (
    <section id="contact">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        <div className="contact-block">
          <h3>{contact.heading}</h3>
          <p>{contact.body}</p>
          <div className="contact-links">
            {contact.links.map((l) => (
              <a key={l.href} href={l.href} className="contact-link" {...externalProps(l.href)}><span className="clabel">{l.label}</span>{l.text}</a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
