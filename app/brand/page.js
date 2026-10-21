import '../globals.css';
import BrandPage from '../../components/portfolio/BrandPage';
import { getBrand, getProfile } from '../../lib/content';

export function generateMetadata() {
  return getBrand().meta;
}

export default function Brand() {
  return <BrandPage brand={getBrand()} profile={getProfile()} />;
}
