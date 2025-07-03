import React from 'react';
import About from "@/components/about";
import Education from "@/components/education/education";
import Experiences from "@/components/experiences/experiences";
import Header from "@/components/header";
import Projects from '@/components/projects/projects';
import Publications from '@/components/publications/publications';
import {promises as fs} from 'fs';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/public/translations/en.json', 'utf-8');
  const data = JSON.parse(file);

  return (
    <main className="flex min-h-screen flex-col items-center py-24 px-6 lg:px-24">
      <div className="z-2 w-full max-w-5xl font-mono text-sm flex flex-col lg:flex-row justify-between">
        <Header data={data.general}></Header>
        <div className='lg:pl-[50%]'>
          <About data={data.general}></About>
          <Experiences data={data.experiences}></Experiences>
          <Education data={data.education}></Education>
          <Projects data={data.projects}></Projects>
          <Publications data={data.publications}></Publications>
        </div>
      </div>
    </main>
  )
}
