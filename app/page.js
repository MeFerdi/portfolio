import PortfolioPage from '../components/portfolio/PortfolioPage';
import { getProfile } from '../lib/content';

export function generateMetadata() {
  return getProfile().meta;
}

export default function Home() {
  return <PortfolioPage />;
}
