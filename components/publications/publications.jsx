"use client";

import React, { useState } from "react";
import PublicationItem from "./publication-item";
import { 
    DocumentTextIcon, 
    FunnelIcon, 
    ViewColumnsIcon
} from '@heroicons/react/24/outline';

const Publications = (props) => {
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title'
    const [filterTag, setFilterTag] = useState('all');

    // Get all unique tags
    const getAllTags = () => {
        const tags = new Set();
        props.data?.forEach(publication => {
            publication.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    };

    // Apply filtering and sorting
    const getFilteredAndSortedPublications = () => {
        let filtered = [...(props.data || [])];

        // Apply tag filter
        if (filterTag !== 'all') {
            filtered = filtered.filter(publication => 
                publication.tags?.includes(filterTag)
            );
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            // Default to recent (by date)
            return new Date(b.date + ' 1, 2024') - new Date(a.date + ' 1, 2024');
        });
    };

    const sortedPublications = getFilteredAndSortedPublications();
    const allTags = getAllTags();

    return (
        <section 
            data-section 
            id='publications' 
            className='mb-16 scroll-mt-20'
            aria-labelledby="publications-heading"
        >
            {/* Mobile-first Section Header */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:hidden">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/40">
                        <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h2 
                        id="publications-heading"
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                    >
                        Publications
                    </h2>
                </div>
                
                {/* Hidden heading for desktop navigation */}
                <h2 className="hidden lg:block text-3xl font-bold tracking-tight text-foreground mb-6">
                    Publications
                </h2>
                
                {/* Mobile-first section description */}
                <div className="space-y-3 sm:space-y-4">
                    <p className="text-muted-foreground text-sm sm:text-base lg:text-base leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl">
                        A collection of articles and technical writings I've published across various platforms. 
                        These publications share insights, tutorials, and best practices from my experience in software development.
                    </p>
                    
                    {/* Mobile-first publication statistics */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-card border border-border/40">
                            <ViewColumnsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <span className="text-foreground font-medium">{props.data?.length || 0} Articles</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">Technical Writing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-first Publications Content */}
            <div className="space-y-6 sm:space-y-8">
                {props.data && props.data.length > 0 ? (
                    <>
                        {/* Mobile-first Filters and Sorting */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between sm:items-center">
                            {/* Tag filters */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterTag('all')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        filterTag === 'all' 
                                            ? 'bg-primary text-primary-foreground shadow-md' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    All Topics
                                </button>
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(tag)}
                                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            filterTag === tag 
                                                ? 'bg-primary text-primary-foreground shadow-md' 
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile-first sort dropdown */}
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-card border border-border/40 text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="title">Alphabetical</option>
                                </select>
                            </div>
                        </div>

                        {/* Publications List */}
                        <div className="publications-container">
                            <div className="publications-grid">
                                {sortedPublications.map((publication, index) => (
                                    <div 
                                        key={publication.title}
                                        className="publication-wrapper animate-fade-in"
                                        style={{ 
                                            animationDelay: `${index * 0.1}s`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <PublicationItem
                                            title={publication.title}
                                            publication={publication.publication}
                                            date={publication.date}
                                            description={publication.description}
                                            href={publication.href}
                                            tags={publication.tags}
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
                                <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                            No Publications Yet
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-sm sm:max-w-md mx-auto">
                            Articles and technical writings will appear here once published. Check back soon for new content!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Publications
