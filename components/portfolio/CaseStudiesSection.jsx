import Link from "next/link";
import { getCaseStudies, getSections } from "../../lib/content";

export default function CaseStudiesSection() {
  const caseStudies = getCaseStudies();
  if (caseStudies.length === 0) return null;
  const { heading } = getSections().byId["case-studies"];

  return (
    <section id="case-studies">
      <div className="wrap">
        <h2 className="section-label">{heading}</h2>
        <p className="projects-note">
          A record of the problems I have worked on, what I built, and the
          results that can be verified.
        </p>
        <Link href="/case-studies" className="repository-link">
          Browse case studies and research <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
