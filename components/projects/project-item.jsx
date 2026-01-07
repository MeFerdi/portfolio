import React from "react";
import { 
    StarIcon, 
    ArrowTopRightOnSquareIcon, 
    CodeBracketIcon,
    GlobeAltIcon,
    SparklesIcon,
    UsersIcon,
    BuildingStorefrontIcon,
    PhotoIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, FireIcon } from '@heroicons/react/24/solid';

// GitHub icon component (since it's not in Heroicons)
const GitHubIcon = ({ className }) => (
    <svg 
        className={className} 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

function ProjectItem(props) {
    // Parse stars and determine project status
    const starCount = parseInt(props.stars?.replace(',', '')) || 0;
    const isFeatured = starCount > 1000;
    const isPopular = starCount > 100 && starCount <= 1000;
    const hasStars = starCount > 0;
    
    // Get the main framework/technology from various possible props
    const getMainFramework = () => {
        // Check for 'framework' prop (could be string or array)
        if (props.framework) {
            if (Array.isArray(props.framework)) {
                return props.framework[0]; // Take the first one
            }
            return props.framework;
        }
        
        // Check for 'lib' prop
        if (props.lib) {
            if (Array.isArray(props.lib)) {
                return props.lib[0];
            }
            return props.lib;
        }
        
        // Check for 'technologies' prop (passed from 'technologies used')
        if (props.technologies) {
            if (Array.isArray(props.technologies)) {
                return props.technologies[0];
            }
            return props.technologies;
        }
        
        // Check for 'technologies used' prop
        if (props['technologies used']) {
            if (Array.isArray(props['technologies used'])) {
                return props['technologies used'][0];
            }
            return props['technologies used'];
        }
        
        return '';
    };
    
    // Get framework icon and color
    const getFrameworkInfo = (framework) => {
        if (!framework) return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
        
        const fw = framework.toLowerCase();
        if (fw.includes('next') || fw.includes('react')) {
            return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        } else if (fw.includes('vue')) {
            return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
        } else if (fw.includes('flutter')) {
            return { color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
        } else if (fw.includes('javascript')) {
            return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
        } else if (fw.includes('python') || fw.includes('django')) {
            return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
        } else if (fw.includes('go')) {
            return { color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' };
        }
        return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    };

    const mainFramework = getMainFramework();
    const frameworkInfo = getFrameworkInfo(mainFramework);

    // Choose a project-specific icon based on name/description keywords
    const getProjectIcon = () => {
        const text = `${props.name || ''} ${props.description || ''}`.toLowerCase();
        if (text.includes('ai') || text.includes('talent') || text.includes('match')) {
            return <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
        }
        if (text.includes('farm') || text.includes('agri') || text.includes('buyer') || text.includes('market')) {
            return <BuildingStorefrontIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
        }
        if (text.includes('image') || text.includes('vision') || text.includes('aerial') || text.includes('land') || text.includes('snap')) {
            return <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
        }
        // Fallback icon
        return <CodeBracketIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
    };
    
    return (
        <article className="group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-lg transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-4 hover:scale-[1.03] project-execution-card">
            {/* Animated background mesh */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-2xl transform -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary/30 to-transparent rounded-full blur-2xl transform translate-x-20 translate-y-20 group-hover:scale-150 transition-transform duration-1000" />
            </div>
            
            {/* Progress bar - representing project execution */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" />
            </div>
            
            {/* Main content - responsive padding */}
            <div className="relative p-4 sm:p-6 lg:p-8 h-full min-h-[280px] sm:min-h-[320px] flex flex-col">
                {/* Header section */}
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Project execution icon */}
                        <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent border border-primary/20 group-hover:border-primary/40 transition-all duration-500">
                            {getProjectIcon()}
                            {/* Execution pulse effect */}
                            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                        </div>
                        
                        {/* Project metrics */}
                        <div className="hidden sm:flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span>Active</span>
                            </div>
                            {mainFramework && (
                                <div className="text-xs text-primary font-medium">
                                    {mainFramework}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Launch button - responsive */}
                    {props.href ? (
                        <a 
                            href={props.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transform hover:scale-110 transition-all duration-300 group/launch"
                            aria-label={`Launch ${props.name} project`}
                        >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover/launch:translate-x-0.5 group-hover/launch:-translate-y-0.5 transition-transform duration-200" />
                        </a>
                    ) : props.github ? (
                        <a 
                            href={props.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-600 hover:bg-gray-600 hover:text-white transform hover:scale-110 transition-all duration-300 group/github"
                            aria-label={`View ${props.name} repository on GitHub`}
                        >
                            <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover/github:scale-110 transition-transform duration-200" />
                        </a>
                    ) : null}
                </div>

                {/* Project title - responsive typography */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-3 sm:mb-4">
                    {props.name}
                </h3>

                {/* Description - responsive text */}
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 lg:mb-8 line-clamp-3 sm:line-clamp-4 flex-grow">
                    {props.description}
                </p>

                {/* Bottom section - responsive layout */}
                <div className="mt-auto">
                    {/* Technology stack */}
                    {mainFramework && (
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg ${frameworkInfo.bg} ${frameworkInfo.color} border ${frameworkInfo.border} transition-all duration-300`}>
                                <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                                    {mainFramework}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {/* Action area */}
                    <div className="flex items-center justify-between">
                        {/* Execution progress indicator */}
                        <div className="flex items-center gap-2">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                Status:
                            </div>
                            <div className="flex items-center gap-1">
                                {props.href ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs sm:text-sm font-medium text-green-600">Live</span>
                                    </>
                                ) : props.github ? (
                                    <>
                                        <GitHubIcon className="w-3 h-3 text-gray-600" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-600">Repository</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        <span className="text-xs sm:text-sm font-medium text-yellow-600">In Progress</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Interactive CTA */}
                        {props.href ? (
                            <a 
                                href={props.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-300 text-xs sm:text-sm font-medium group/cta"
                            >
                                <span>Launch</span>
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform duration-200" />
                            </a>
                        ) : props.github ? (
                            <a 
                                href={props.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-500/10 hover:bg-gray-600 text-gray-600 hover:text-white border border-gray-500/20 hover:border-gray-600 transition-all duration-300 text-xs sm:text-sm font-medium group/github"
                            >
                                <GitHubIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Repository</span>
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover/github:translate-x-0.5 group-hover/github:-translate-y-0.5 transition-transform duration-200" />
                            </a>
                        ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground italic">
                                In Development
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Execution trail effect */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
            </div>
            
            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-primary/40 group-hover:to-secondary/40 transition-all duration-500 pointer-events-none" />
        </article>
    )
}

export default ProjectItem