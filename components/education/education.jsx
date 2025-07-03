import React from "react";
import EducationItem from "./education-item";
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const Education = (props) => {
    // Sort education data by start date (most recent first)
    const sortedEducation = [...props.data].sort((a, b) => {
        // Handle current education (NOW, CURRENT, etc.)
        const aYear = a.startDate === 'NOW' || a.startDate === 'CURRENT' ? new Date().getFullYear() : parseInt(a.startDate);
        const bYear = b.startDate === 'NOW' || b.startDate === 'CURRENT' ? new Date().getFullYear() : parseInt(b.startDate);
        return bYear - aYear;
    });

    return (
        <section 
            data-section 
            id='education' 
            className='mb-16 scroll-mt-20'
            aria-labelledby="education-heading"
        >
            {/* Section Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 lg:hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                        <AcademicCapIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 
                        id="education-heading"
                        className="text-2xl font-bold tracking-tight text-foreground"
                    >
                        Education
                    </h2>
                </div>
                
                {/* Hidden heading for desktop navigation */}
                <h2 className="hidden lg:block text-2xl font-bold tracking-tight text-foreground mb-4">
                    Education
                </h2>
                
                {/* Section description */}
                <p className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-2xl">
                    My academic journey and formal education background that laid the foundation for my career in software development.
                </p>
            </div>

            {/* Education Items Container */}
            <div className="space-y-4">
                {sortedEducation.length > 0 ? (
                    sortedEducation.map((educationItem, index) => (
                        <div 
                            key={`${educationItem.subject}-${educationItem.startDate}-${index}`}
                            className="animate-fade-in"
                            style={{ 
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            <EducationItem
                                subject={educationItem.subject}
                                degree={educationItem.degree}
                                university={educationItem.university}
                                href={educationItem.href}
                                startDate={educationItem.startDate} 
                                endDate={educationItem.endDate || ''} 
                                description={educationItem.description}
                            />
                        </div>
                    ))
                ) : (
                    /* Empty state */
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
                                <AcademicCapIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No Education Listed
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Education information will be displayed here once available.
                        </p>
                    </div>
                )}
            </div>

            {/* Education Summary Stats (optional) */}
            {sortedEducation.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/40">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>
                                {sortedEducation.length} {sortedEducation.length === 1 ? 'Degree' : 'Degrees'}
                            </span>
                        </div>
                        {sortedEducation.some(edu => isCurrentEducation(edu)) && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>Currently Studying</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

// Helper function to check if education is current
function isCurrentEducation(education) {
    if (!education.endDate) return false;
    const currentVariations = ['NOW', 'CURRENT', 'Present', 'present', 'now', 'current'];
    return currentVariations.includes(education.endDate);
}

export default Education;