import '../globals.css';
import WebDevPage from '../../components/portfolio/WebDevPage';
import { getWebDev, getProfile } from '../../lib/content';

export function generateMetadata() {
  return getWebDev().meta;
}

export default function WebDev() {
  return <WebDevPage webdev={getWebDev()} profile={getProfile()} />;
}
