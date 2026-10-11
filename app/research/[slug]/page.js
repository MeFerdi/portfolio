import { notFound } from 'next/navigation';
import PaperPage from '../../../components/portfolio/PaperPage';
import { research, findPaper } from '../../../components/portfolio/portfolioData';

export function generateStaticParams() {
  return research.map((report) => ({ slug: report.slug }));
}

export function generateMetadata({ params }) {
  const report = findPaper(params.slug);
  if (!report) return {};
  return {
    title: `${report.title} | Ferdynand Odhiambo`,
    description: report.abstract,
  };
}

export default function ResearchPaper({ params }) {
  const report = findPaper(params.slug);
  if (!report) notFound();
  return <PaperPage report={report} />;
}
