import { stackIcons } from './stackIcons';
import { getProfile, getSections } from '../../lib/content';

// Each item is a key of `stackIcons`, shown with its logo from the /stack-icons.svg
// sprite, or plain text where no official mark is available.
function StackGroup({ title, items }) {
  return (
    <div className="stack-group">
      <h3>{title}</h3>
      <div className="stack-row">
        {items.map((item) => {
          const icon = stackIcons[item];
          return (
            <span key={item} className="stack-item">
              {icon && (
                <svg aria-hidden="true" focusable="false">
                  <use href={`/stack-icons.svg#${item}`} />
                </svg>
              )}
              {icon ? icon.label : item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CapabilityList({ title, items }) {
  return (
    <div className="stack-group">
      <h3>{title}</h3>
      <ul className="stack-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutSection() {
  const { about } = getProfile();
  const { heading } = getSections().byId.about;

  return (
    <section id="about">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        <div className="about-grid">
          <div className="about-text">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div>
            {about.skills.filter((g) => g.items.length > 0).map((group) =>
              group.display === 'list'
                ? <CapabilityList key={group.title} title={group.title} items={group.items} />
                : <StackGroup key={group.title} title={group.title} items={group.items} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
