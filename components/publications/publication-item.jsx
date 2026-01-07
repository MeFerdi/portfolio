import React from "react";
import { DocumentTextIcon, CalendarIcon, LinkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Try to parse the date and format it nicely
    const date = new Date(dateString + ' 1, 2024'); // Add day for parsing
    if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
    }
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
    });
}

function PublicationItem(props) {
    const hostLabel = (() => {
        try {
            if (!props.href) return '';
            const url = new URL(props.href);
            return url.hostname.replace('www.', '');
        } catch (_) {
            return props.publication || '';
        }
    })();

    return (
        <article className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-medium hover:border-border/60">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    
                    {/* Date Section */}
                    <div className="flex items-center gap-2 text-muted-foreground text-sm lg:basis-1/4 lg:flex-col lg:items-start">
                        <CalendarIcon className="w-4 h-4 text-primary lg:hidden" />
                        <div className="flex items-center gap-1">
                            <span className="font-medium">{formatDate(props.date)}</span>
                        </div>
                        <div className="hidden lg:block">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
                                <DocumentTextIcon className="w-3 h-3" />
                                Publication
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:basis-3/4 space-y-3">
                        
                        {/* Title and Publication */}
                        <div className="flex items-start justify-between gap-3">
                            {props.href ? (
                                <a 
                                    href={props.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-start gap-2 group/link"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground group-hover/link:text-primary transition-colors duration-200 leading-tight">
                                            {props.title}
                                        </h3>
                                        <p className="text-sm font-medium">
                                            <span className="text-muted-foreground">Published on </span>
                                            <span className="text-primary underline decoration-transparent group-hover/link:decoration-primary/50">{props.publication}</span>
                                        </p>
                                    </div>
                                </a>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                                        {props.title}
                                    </h3>
                                    <p className="text-sm text-primary font-medium">
                                        Published on {props.publication}
                                    </p>
                                </div>
                            )}

                            {props.href && (
                                <a 
                                    href={props.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                    aria-label={`Open ${props.title}`}
                                >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        {/* Publication Platform */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <LinkIcon className="w-4 h-4 text-primary" />
                            <span className="font-medium">{props.publication}</span>
                        </div>

                        {/* Description */}
                        {props.description && (
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {props.description}
                            </p>
                        )}

                        {/* Tags */}
                        {props.tags && props.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {props.tags.map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Read Article CTA */}
                        {props.href && (
                            <div className="pt-2">
                                <a 
                                    href={props.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Read ${props.title} on ${hostLabel || props.publication}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all text-sm font-medium"
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    <span>{props.publication ? `Read on ${props.publication}` : 'Read Article'}</span>
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}

export default PublicationItem
