import React from 'react';
import Header from "../components/header";
import Navigation from "../components/navigation";
import ExperienceList from "../components/experiences/experience-list";
import Projects from "../components/projects/projects";
import Footer from "../components/footer";
import {promises as fs} from 'fs';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/public/translations/en.json', 'utf-8');
  const data = JSON.parse(file);

  return (
    <main className="bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        {/* Fixed Navigation */}
        <nav className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" className="text-sm font-semibold">FO</a>
            <Navigation />
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-16">
          {/* Header */}
          <Header data={data.general} />

          {/* About Section */}
          <section id="about" className="scroll-mt-20">
            <p className="text-sm leading-relaxed text-foreground mb-6">
              {data.general.about[1]}
            </p>
            <div className="text-sm text-muted">
              <strong>Focus Areas:</strong> Systems Engineering, Distributed Systems, Networking, Rust, Go, Python, PostgreSQL, Docker, Kubernetes
            </div>
          </section>

          {/* Work Experience */}
          <section id="work" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-6">Work Experience</h2>
            <ExperienceList data={data.experiences} />
          </section>

          {/* Projects */}
          <Projects data={data.projects} />

          {/* Footer */}
          <Footer data={data.general.socials} />
        </div>
      </div>
    </main>
  )
}
