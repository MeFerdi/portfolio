import './site.css';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ExperienceSection from './ExperienceSection';
import ResearchSection from './ResearchSection';
import CaseStudiesSection from './CaseStudiesSection';
import OpenSourceSection from './OpenSourceSection';
import ApproachSection from './ApproachSection';
import TrainingSection from './TrainingSection';
import ContactSection from './ContactSection';
import PortfolioFooter from './PortfolioFooter';
import { getNavSections, getProfile } from '../../lib/content';

export default function PortfolioPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main className="portfolio-page" id="main-content">
        <Navigation sections={getNavSections()} />
        <HeroSection />
        <AboutSection />
        <ResearchSection />
        <CaseStudiesSection />
        <OpenSourceSection />
        <ApproachSection />
        <ExperienceSection />
        <TrainingSection />
        <ContactSection />
        <PortfolioFooter profile={getProfile()} />
      </main>
    </>
  );
}
