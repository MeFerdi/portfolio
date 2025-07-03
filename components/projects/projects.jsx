"use client";

import React, { useState } from "react";
import ProjectItem from "./project-item";
import { 
    RocketLaunchIcon, 
    FunnelIcon, 
    ViewColumnsIcon
} from '@heroicons/react/24/outline';

const Projects = (props) => {
    const [sortBy, setSortBy] = useState('name'); // 'name', 'recent'

    // Simplified sorting logic without stars
    const getSortedProjects = () => {
        let filtered = [...props.data];

        // Apply sorting
        return filtered.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0; // Default order for 'recent'
        });
    };

    const sortedProjects = getSortedProjects();

    return (
        <section 
            data-section 
            id='projects' 
            className='mb-16 scroll-mt-20'
            aria-labelledby="projects-heading"
        >
            {/* Mobile-first Section Header */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:hidden">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/40">
                        <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h2 
                        id="projects-heading"
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                    >
                        Projects
                    </h2>
                </div>
                
                {/* Hidden heading for desktop navigation */}
                <h2 className="hidden lg:block text-3xl font-bold tracking-tight text-foreground mb-6">
                    Projects
                </h2>
                
                {/* Mobile-first section description */}
                <div className="space-y-3 sm:space-y-4">
                    <p className="text-muted-foreground text-sm sm:text-base lg:text-base leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl">
                        A curated collection of projects showcasing my expertise across different technologies and domains. 
                        From full-stack applications to innovative solutions, each project represents a journey of learning and problem-solving.
                    </p>
                    
                    {/* Mobile-first project statistics */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-card border border-border/40">
                            <ViewColumnsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <span className="text-foreground font-medium">{props.data.length} Projects</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-medium">All Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-first Projects Content */}
            <div className="space-y-6 sm:space-y-8">
                {props.data.length > 0 ? (
                    <>
                        {/* Mobile-first Filters and Sorting */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between sm:items-center">
                            {/* Simple filter - only All Projects now */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-primary text-primary-foreground shadow-md"
                                >
                                    All Projects
                                </button>
                            </div>

                            {/* Mobile-first sort dropdown */}
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-card border border-border/40 text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                                >
                                    <option value="name">Alphabetical</option>
                                    <option value="recent">Recent</option>
                                </select>
                            </div>
                        </div>

                        {/* Invisible Projects Container with Mobile-first Grid */}
                        <div className="projects-container">
                            <div className="projects-grid">
                                {sortedProjects.map((project, index) => (
                                    <div 
                                        key={project.name}
                                        className="project-wrapper animate-fade-in"
                                        style={{ 
                                            animationDelay: `${index * 0.1}s`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <ProjectItem
                                            name={project.name}
                                            lib={project.framework}
                                            framework={project.framework}
                                            technologies={project['technologies used']}
                                            description={project.description}
                                            href={project.href}
                                            stars={project.stars}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Mobile-first Empty state */
                    <div className="text-center py-12 sm:py-16">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/40">
                                <RocketLaunchIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                            No Projects Listed
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-sm sm:max-w-md mx-auto">
                            Projects will be displayed here once available. Check back soon for exciting new developments!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects