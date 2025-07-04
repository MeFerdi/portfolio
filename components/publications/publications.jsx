"use client";

import React, { useState, useEffect, useRef } from "react";
import PublicationItem from "./publication-item";
import { 
    DocumentTextIcon, 
    FunnelIcon, 
    ViewColumnsIcon
} from '@heroicons/react/24/outline';

const Publications = (props) => {
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title'
    const [filterTag, setFilterTag] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stackedView, setStackedView] = useState(true);
    const publicationsRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

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

    // Handle scroll-based card stacking
    useEffect(() => {
        if (!stackedView || !publicationsRef.current) return;

        const handleScroll = () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                const container = publicationsRef.current;
                const rect = container.getBoundingClientRect();
                const containerTop = rect.top;
                const containerHeight = rect.height;
                const viewportHeight = window.innerHeight;
                
                // Calculate scroll progress within the publications section
                let scrollProgress = 0;
                if (containerTop <= viewportHeight * 0.3 && containerTop + containerHeight > viewportHeight * 0.7) {
                    scrollProgress = Math.abs(containerTop - viewportHeight * 0.3) / (containerHeight - viewportHeight * 0.4);
                    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
                }

                // Calculate current index based on scroll progress
                const totalPublications = sortedPublications.length;
                if (totalPublications > 1) {
                    const newIndex = Math.floor(scrollProgress * (totalPublications - 1));
                    setCurrentIndex(Math.max(0, Math.min(totalPublications - 1, newIndex)));
                }
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [stackedView, sortedPublications.length]);

    // Navigation functions
    const goToNext = () => {
        setCurrentIndex(prev => Math.min(sortedPublications.length - 1, prev + 1));
    };

    const goToPrev = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const goToCard = (index) => {
        setCurrentIndex(index);
    };

    // Get stack class for each card - show all cards with proper layering
    const getStackClass = (index) => {
        const diff = index - currentIndex;
        
        // Current card on top
        if (diff === 0) return 'stack-1';
        // Cards behind current
        if (diff < 0) {
            if (diff >= -3) return `stack-${Math.abs(diff) + 1}`;
            return 'fade-out';
        }
        // Cards in front of current
        if (diff > 0) {
            if (diff <= 3) return `stack-${diff + 1}`;
            return 'fade-out';
        }
        return 'fade-out';
    };

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
                        {/* View Toggle */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between sm:items-center">
                            {/* Layout toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setStackedView(true)}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        stackedView 
                                            ? 'bg-primary text-primary-foreground shadow-md' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    Stacked View
                                </button>
                                <button
                                    onClick={() => setStackedView(false)}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        !stackedView 
                                            ? 'bg-primary text-primary-foreground shadow-md' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    List View
                                </button>
                            </div>

                            {/* Tag filters */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterTag('all')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        filterTag === 'all' 
                                            ? 'bg-secondary text-secondary-foreground shadow-md' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    All Topics
                                </button>
                                {allTags.slice(0, 3).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(tag)}
                                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            filterTag === tag 
                                                ? 'bg-secondary text-secondary-foreground shadow-md' 
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Sort dropdown */}
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

                        {/* Publications Display */}
                        {stackedView ? (
                            /* Stacked View */
                            <div className="relative">
                                <div 
                                    ref={publicationsRef}
                                    className="publications-stacked"
                                    style={{ height: `60vh`, minHeight: '500px' }}
                                >
                                    <div className="sticky top-10 w-full">
                                        {sortedPublications.map((publication, index) => (
                                            <div 
                                                key={`${publication.title}-${index}`}
                                                className={`publication-stack-item ${getStackClass(index)}`}
                                                style={{ zIndex: sortedPublications.length - Math.abs(index - currentIndex) }}
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
                                
                                {/* Navigation Controls */}
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <button
                                        onClick={goToPrev}
                                        disabled={currentIndex === 0}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Dot indicators */}
                                    <div className="flex items-center gap-2">
                                        {sortedPublications.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToCard(index)}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                    index === currentIndex 
                                                        ? 'bg-primary scale-125' 
                                                        : 'bg-muted hover:bg-muted-foreground/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={goToNext}
                                        disabled={currentIndex === sortedPublications.length - 1}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Progress indicator */}
                                <div className="fixed bottom-8 right-8 z-30">
                                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {currentIndex + 1} / {sortedPublications.length}
                                        </span>
                                        <div className="text-xs text-center text-muted-foreground max-w-20 truncate">
                                            {sortedPublications[currentIndex]?.title}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* List View */
                            <div className="publications-container">
                                <div className="publications-grid">
                                    {sortedPublications.map((publication, index) => (
                                        <div 
                                            key={`${publication.title}-${index}`}
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
                        )}
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
