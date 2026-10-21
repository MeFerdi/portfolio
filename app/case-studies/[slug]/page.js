import { notFound } from "next/navigation";
import CaseStudyPage from "../../../components/portfolio/CaseStudyPage";
import { getCaseStudies, getProfile } from "../../../lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((study) => ({ slug: study.slug }));
}

export function generateMetadata({ params }) {
  const study = getCaseStudies().find((item) => item.slug === params.slug);
  if (!study) return {};
  return {
    title: `${study.title} | ${getProfile().name}`,
    description: study.summary,
  };
}

export default function CaseStudyDetail({ params }) {
  const study = getCaseStudies().find((item) => item.slug === params.slug);
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
