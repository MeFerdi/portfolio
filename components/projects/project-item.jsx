import React from "react";
import { 
    StarIcon, 
    ArrowTopRightOnSquareIcon, 
    CodeBracketIcon,
    GlobeAltIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, FireIcon } from '@heroicons/react/24/solid';

function ProjectItem(props) {
    // Parse stars and determine project status
    const starCount = parseInt(props.stars?.replace(',', '')) || 0;
    const isFeatured = starCount > 1000;
    const isPopular = starCount > 100 && starCount <= 1000;
    const hasStars = starCount > 0;
    
    // Get framework icon and color
    const getFrameworkInfo = (framework) => {
        const fw = framework?.toLowerCase() || '';
        if (fw.includes('next') || fw.includes('react')) {
            return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        } else if (fw.includes('vue')) {
            return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
        } else if (fw.includes('flutter')) {
            return { color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
        } else if (fw.includes('javascript')) {
            return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
        } else if (fw.includes('python')) {
            return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
        } else if (fw.includes('go')) {
            return { color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' };
        }
        return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    };

    const frameworkInfo = getFrameworkInfo(props.lib);
    
    return (
        <article 
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-border/60 hover:-translate-y-2 hover:scale-[1.02]"
        >
            {/* Enhanced background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
            
            {/* Status badges */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                {isFeatured && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border border-orange-500/20 backdrop-blur-sm">
                        <FireIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">Featured</span>
                    </div>
                )}
                {isPopular && !isFeatured && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-500/20 backdrop-blur-sm">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">Popular</span>
                    </div>
                )}
                
                {/* Live status indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 backdrop-blur-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">Live</span>
                </div>
            </div>
            
            <a 
                href={props.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block relative p-8 h-full min-h-[300px]"
                aria-label={`View ${props.name} project`}
            >
                {/* Header section */}
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        {/* Project icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/40">
                            <CodeBracketIcon className="w-6 h-6 text-primary" />
                        </div>
                        
                        {/* Stars */}
                        {hasStars && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                                <StarIconSolid className="w-4 h-4" />
                                <span className="text-sm font-semibold">{props.stars}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* External link indicator */}
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowTopRightOnSquareIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </div>

                {/* Project title */}
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-4">
                    {props.name}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-base leading-relaxed mb-8 line-clamp-4">
                    {props.description}
                </p>

                {/* Framework and technologies */}
                <div className="flex items-center justify-between">
                    {props.lib && (
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg ${frameworkInfo.bg} ${frameworkInfo.color} border ${frameworkInfo.border}`}>
                            <GlobeAltIcon className="w-4 h-4" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {props.lib}
                            </span>
                        </div>
                    )}
                    
                    {/* View project CTA */}
                    <span className="text-sm font-medium text-muted-foreground/80 group-hover:text-primary transition-colors duration-300">
                        View Project →
                    </span>
                </div>
            </a>

            {/* Enhanced hover effects */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-all duration-500" />
            <div className="absolute inset-x-0 -bottom-1 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        </article>
    )
}

export default ProjectItem