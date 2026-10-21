import { notFound } from "next/navigation";
import PaperPage from "../../../components/portfolio/PaperPage";
import { getResearch, getPaper, getProfile } from "../../../lib/content";

// Every technical report is generated at build time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getResearch().map((report) => ({ slug: report.slug }));
}

export function generateMetadata({ params }) {
  const report = getPaper(params.slug);
  if (!report) return {};
  return {
    title: `${report.title} | ${getProfile().name}`,
    description: report.abstract,
  };
}

export default function ResearchPaper({ params }) {
  const report = getPaper(params.slug);
  if (!report) notFound();
  return <PaperPage report={report} />;
}
