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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Special+Elite&display=swap"
        rel="stylesheet"
      />

      <main className="portfolio-page">
        <PortfolioStyles />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />
        <div className="glitch-sweep" />
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
