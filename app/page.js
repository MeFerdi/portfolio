import React from 'react';
import Header from "../components/header";
import Navigation from "../components/navigation";
import ExperienceList from "../components/experiences/experience-list";
import ProjectList from "../components/projects/project-list";
import Footer from "../components/footer";
import TechCarousel from "../components/tech-carousel";
import BlogCarousel from "../components/blog-carousel";
import {promises as fs} from 'fs';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/public/translations/en.json', 'utf-8');
  const data = JSON.parse(file);

  const techItems = [
    "Rust",
    "Go",
    "Python",
    "Django",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "Kafka",
  ];

  return (
    <main className="bg-background text-foreground relative">
      {/* Side rails - visible on xl+ to avoid crowding */}
      <div className="hidden lg:block fixed left-6 top-48 z-30">
        <TechCarousel items={techItems} />
      </div>
      <div className="hidden lg:block fixed right-6 top-48 z-30">
        <BlogCarousel items={data.publications || []} />
      </div>

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
            <div className="mb-3 text-xs font-semibold tracking-[0.25em] text-primary uppercase">About</div>
            <p className="text-sm leading-relaxed text-foreground mb-4">
              {data.general.about[1]}
            </p>
            <div className="text-sm text-muted">
              <strong>Focus Areas:</strong> Systems Engineering, Distributed Systems, Networking, Rust, Go, Python, PostgreSQL, Docker, Kubernetes
            </div>
          </section>

          {/* Work Experience */}
          <section id="work" className="scroll-mt-20">
            <div className="mb-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">Work</div>
            <h2 className="text-xl font-semibold mb-6">Experience</h2>
            <ExperienceList data={data.experiences} />
          </section>

          {/* Blogs (simple links) */}
          <section id="blogs" className="scroll-mt-20">
            <div className="mb-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">Blogs</div>
            <h2 className="text-xl font-semibold mb-6">Writing & Notes</h2>
            <ul className="space-y-2">
              {data.publications.filter(p => p.href).map((pub) => (
                <li key={pub.href}>
                  <a
                    href={pub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline"
                  >
                    {pub.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Projects (simple list) */}
          <section id="projects" className="scroll-mt-20">
            <div className="mb-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">Projects</div>
            <h2 className="text-xl font-semibold mb-6">Builds</h2>
            <ProjectList data={data.projects} />
          </section>

          {/* Footer */}
          <Footer data={data.general.socials} />
        </div>
      </div>
    </main>
  )
}
