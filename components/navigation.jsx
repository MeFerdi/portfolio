'use client'

import React, { useState, useEffect, useRef } from "react";
import NavItem from "./nav-item";
import { 
    UserIcon, 
    BriefcaseIcon, 
    AcademicCapIcon, 
    HeartIcon, 
    RocketLaunchIcon 
} from '@heroicons/react/24/outline';

const Navigation = () => {
    const [activeSection, setActiveSection] = useState('about');
    const [isScrolling, setIsScrolling] = useState(false);
    const observer = useRef(null);
    const scrollTimeout = useRef(null);

    // Navigation items with icons and better labels
    const navigationItems = [
        { 
            id: 'about', 
            name: 'About', 
            href: '#about', 
            icon: UserIcon,
            description: 'Get to know me'
        },
        { 
            id: 'experiences', 
            name: 'Experience', 
            href: '#experiences', 
            icon: BriefcaseIcon,
            description: 'Professional journey'
        },
        { 
            id: 'education', 
            name: 'Education', 
            href: '#education', 
            icon: AcademicCapIcon,
            description: 'Academic background'
        },
        { 
            id: 'volunteering', 
            name: 'Volunteering', 
            href: '#volunteering', 
            icon: HeartIcon,
            description: 'Community involvement'
        },
        { 
            id: 'projects', 
            name: 'Projects', 
            href: '#projects', 
            icon: RocketLaunchIcon,
            description: 'Things I\'ve built'
        }
    ];

    useEffect(() => {
        // Enhanced intersection observer with better threshold
        observer.current = new IntersectionObserver((entries) => {
            const visibleSections = entries.filter(entry => entry.isIntersecting);
            
            if (visibleSections.length > 0) {
                // Get the section that's most visible
                const mostVisible = visibleSections.reduce((prev, current) => 
                    prev.intersectionRatio > current.intersectionRatio ? prev : current
                );
                setActiveSection(mostVisible.target.id);
            }
        }, {
            threshold: [0.1, 0.5, 0.7],
            rootMargin: '-20% 0px -20% 0px'
        });

        const sections = document.querySelectorAll('[data-section]');
        sections.forEach((section) => {
            observer.current.observe(section);
        });

        // Scroll detection for enhanced UX
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            sections.forEach((section) => {
                observer.current.unobserve(section);
            });
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout.current);
        };
    }, []);

    // Smooth scroll handler
    const handleNavClick = (e, href) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <nav 
            id='navigation' 
            className={`relative transition-all duration-300 ${
                isScrolling ? 'opacity-90' : 'opacity-100'
            }`}
            aria-label="Portfolio navigation"
        >
            {/* Progress indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40">
                <div 
                    className="w-px bg-primary transition-all duration-300 ease-out"
                    style={{
                        height: `${((navigationItems.findIndex(item => item.id === activeSection) + 1) / navigationItems.length) * 100}%`
                    }}
                />
            </div>

            {/* Navigation items */}
            <div className='flex flex-col space-y-2 pl-6'>
                {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                        <NavItem
                            key={item.id}
                            active={isActive}
                            href={item.href}
                            name={item.name}
                            description={item.description}
                            icon={Icon}
                            index={index + 1}
                            onClick={handleNavClick}
                            delay={index * 0.1}
                        />
                    );
                })}
            </div>

            {/* Mobile navigation indicator */}
            <div className="lg:hidden mt-6 flex justify-center">
                <div className="flex space-x-2">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                activeSection === item.id 
                                    ? 'bg-primary scale-125' 
                                    : 'bg-border hover:bg-muted-foreground'
                            }`}
                            aria-label={`Navigate to ${item.name}`}
                        />
                    ))}
                </div>
            </div>
        </nav>
    )
}

export default Navigation