import CaseStudiesRepository from "../../components/portfolio/CaseStudiesRepository";
import { getProfile } from "../../lib/content";

export function generateMetadata() {
  return {
    title: `Case studies and research | ${getProfile().name}`,
    description:
      "An active and archived record of research, engineering work and measured outcomes.",
  };
}

export default function CaseStudiesIndex() {
  return <CaseStudiesRepository />;
}
