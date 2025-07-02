import React from "react";
import { UserIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const About = (props) => {
    return (
        <section 
            data-section 
            id='about' 
            className='mb-16 scroll-mt-20'
            aria-labelledby="about-heading"
        >
            {/* Section Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 lg:hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                        <UserIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 
                        id="about-heading"
                        className="text-2xl font-bold tracking-tight text-foreground"
                    >
                        About
                    </h2>
                </div>
                
                {/* Hidden heading for desktop navigation */}
                <h2 className="hidden lg:block text-2xl font-bold tracking-tight text-foreground mb-4">
                    About
                </h2>
            </div>

            {/* About Content */}
            <div className="space-y-6">
                {/* Introduction Card */}
                <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-medium hover:border-border/60">
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative p-6">

                        {/* About Paragraphs */}
                        <div className="space-y-4">
                            {props.data.about.map((paragraph, index) => {
                                // Check if it's the greeting paragraph (first one with emoji)
                                const isGreeting = paragraph.includes('👋');
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`animate-fade-in ${
                                            isGreeting 
                                                ? 'text-lg font-medium text-foreground' 
                                                : 'text-muted-foreground leading-relaxed'
                                        }`}
                                        style={{ 
                                            animationDelay: `${index * 0.1}s`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        {paragraph}
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>

                {/* Key Skills or Highlights (optional) */}
                <div className="flex flex-wrap gap-2">
                    {['Full Stack Development', 'AI & Machine Learning', 'Python & JavaScript', 'Database Architecture'].map((skill, index) => (
                        <span 
                            key={skill}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                            style={{ 
                                animationDelay: `${(index + 2) * 0.1}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default About