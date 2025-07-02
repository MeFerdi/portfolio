import React from "react";
import { AcademicCapIcon, CalendarIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

function EducationItem(props) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-medium hover:border-border/60">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    
                    {/* Date Section */}
                    <div className="flex items-center gap-2 text-muted-foreground text-sm lg:basis-1/4 lg:flex-col lg:items-start">
                        <CalendarIcon className="w-4 h-4 text-primary lg:hidden" />
                        <div className="flex items-center gap-1">
                            <span className="font-medium">{props.startDate}</span>
                            {checkEndDate(props) && (
                                <>
                                    <span className="text-muted-foreground/60">—</span>
                                    <span className="font-medium">{formatEndDate(props.endDate)}</span>
                                </>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <AcademicCapIcon className="w-3 h-3" />
                                Education
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:basis-3/4 space-y-3">
                        
                        {/* Title and Degree */}
                        <div>
                            {props.href ? (
                                <a 
                                    href={props.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-start gap-2 group/link"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground group-hover/link:text-primary transition-colors duration-200">
                                            {props.subject}
                                        </h3>
                                        <p className="text-sm text-primary font-medium">
                                            {props.degree}
                                        </p>
                                    </div>
                                    <svg 
                                        className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-all duration-200 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 mt-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {props.subject}
                                    </h3>
                                    <p className="text-sm text-primary font-medium">
                                        {props.degree}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* University */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BuildingLibraryIcon className="w-4 h-4 text-primary" />
                            <span className="font-medium">{props.university}</span>
                        </div>

                        {/* Description */}
                        {props.description && (
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {props.description}
                            </p>
                        )}

                        {/* Additional Info for Current Education */}
                        {isCurrentEducation(props) && (
                            <div className="flex items-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Currently Studying
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function checkEndDate(props) {
    return props.endDate && props.endDate.trim() !== '';
}

function formatEndDate(endDate) {
    if (!endDate) return '';
    
    // Handle common variations of "current" status
    const currentVariations = ['NOW', 'CURRENT', 'Present', 'present', 'now', 'current'];
    if (currentVariations.includes(endDate)) {
        return 'Present';
    }
    
    return endDate;
}

function isCurrentEducation(props) {
    if (!props.endDate) return false;
    
    const currentVariations = ['NOW', 'CURRENT', 'Present', 'present', 'now', 'current'];
    return currentVariations.includes(props.endDate);
}

export default EducationItem