"use client";
import PortfolioStyles from './PortfolioStyles';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';
import WritingSection from './WritingSection';
import ContactSection from './ContactSection';
import PortfolioFooter from './PortfolioFooter';

export default function PortfolioPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main className="portfolio-page" id="main-content">
        <PortfolioStyles />
        <Navigation />
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <WritingSection />
        <ContactSection />
        <PortfolioFooter />
      </main>
    </>
  );
}
