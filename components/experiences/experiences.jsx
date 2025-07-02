import React from "react";
import ExperienceItem from "./experience-item";
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const Experiences = (props) => {
    // Sort experience data by start date (most recent first)
    const sortedExperiences = [...props.data].sort((a, b) => {
        // Handle current positions (NOW, CURRENT, etc.)
        const aYear = a.startDate === 'NOW' || a.startDate === 'CURRENT' ? new Date().getFullYear() : parseInt(a.startDate);
        const bYear = b.startDate === 'NOW' || b.startDate === 'CURRENT' ? new Date().getFullYear() : parseInt(b.startDate);
        return bYear - aYear;
    });

    return (
        <section 
            data-section 
            id='experiences' 
            className='mb-16 scroll-mt-20'
            aria-labelledby="experiences-heading"
        >
            {/* Section Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 lg:hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                        <BriefcaseIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 
                        id="experiences-heading"
                        className="text-2xl font-bold tracking-tight text-foreground"
                    >
                        Experience
                    </h2>
                </div>
                
                {/* Hidden heading for desktop navigation */}
                <h2 className="hidden lg:block text-2xl font-bold tracking-tight text-foreground mb-4">
                    Experience
                </h2>
                
                {/* Section description */}
                <p className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-2xl">
                    My professional journey showcasing roles, responsibilities, and achievements that have shaped my expertise in software development.
                </p>
            </div>

            {/* Experience Items Container */}
            <div className="space-y-4">
                {sortedExperiences.length > 0 ? (
                    sortedExperiences.map((experienceItem, index) => (
                        <div 
                            key={`${experienceItem.title}-${experienceItem.company}-${experienceItem.startDate}-${index}`}
                            className="animate-fade-in"
                            style={{ 
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            <ExperienceItem
                                title={experienceItem.title}
                                company={experienceItem.company}
                                href={experienceItem.href}
                                startDate={experienceItem.startDate}
                                endDate={experienceItem.endDate || ''}
                                description={experienceItem.description}
                                logo={experienceItem.logo}
                                skills={experienceItem.skills}
                            />
                        </div>
                    ))
                ) : (
                    /* Empty state */
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
                                <BriefcaseIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No Experience Listed
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Professional experience will be displayed here once available.
                        </p>
                    </div>
                )}
            </div>

            {/* Experience Summary Stats (optional) */}
            {sortedExperiences.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/40">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>
                                {sortedExperiences.length} {sortedExperiences.length === 1 ? 'Position' : 'Positions'}
                            </span>
                        </div>
                        {sortedExperiences.some(exp => isCurrentPosition(exp)) && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>Currently Employed</span>
                            </div>
                        )}
                        {calculateTotalExperience(sortedExperiences) && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>{calculateTotalExperience(sortedExperiences)} Total Experience</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

// Helper function to check if position is current
function isCurrentPosition(experience) {
    if (!experience.endDate) return false;
    const currentVariations = ['NOW', 'CURRENT', 'Present', 'present', 'now', 'current'];
    return currentVariations.includes(experience.endDate);
}

// Helper function to calculate total years of experience
function calculateTotalExperience(experiences) {
    if (!experiences.length) return null;
    
    try {
        const currentYear = new Date().getFullYear();
        const earliestYear = Math.min(...experiences.map(exp => {
            const year = parseInt(exp.startDate);
            return isNaN(year) ? currentYear : year;
        }));
        
        const years = currentYear - earliestYear;
        return years > 0 ? `${years}+ Years` : null;
    } catch (error) {
        return null;
    }
}

export default Experiences