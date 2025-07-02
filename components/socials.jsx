import React from "react";
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const Socials = (props) => {
    const socialLinks = [
        {
            name: 'Email',
            href: `mailto:${props.data.email}`,
            icon: <EnvelopeIcon className="w-5 h-5" />,
            isEmail: true
        },
        {
            name: 'GitHub',
            href: props.data.github,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            name: 'LinkedIn',
            href: props.data.linkedin,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {/* Social Links Container - Horizontal Layout */}
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                <div className="p-2">
                    <div className="flex flex-wrap gap-2">
                        {socialLinks.map((social, index) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target={social.isEmail ? undefined : "_blank"}
                                rel={social.isEmail ? undefined : "noopener noreferrer"}
                                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 animate-fade-in flex-1 min-w-0"
                                style={{ 
                                    animationDelay: `${index * 0.1}s`,
                                    animationFillMode: 'both'
                                }}
                                aria-label={social.isEmail ? "Send me an email" : `Visit my ${social.name} profile`}
                            >
                                <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                                    {social.icon}
                                </div>
                                <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                                    {social.name}
                                </span>
                                
                                {/* Arrow Box - Green for Email, Default for Others */}
                                <div className={`flex items-center justify-center w-5 h-5 rounded transition-all duration-200 ${
                                    social.isEmail 
                                        ? 'bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 group-hover:border-green-500/40' 
                                        : 'border border-border group-hover:border-primary group-hover:bg-primary/5'
                                }`}>
                                    <svg 
                                        className={`w-3 h-3 transition-all duration-200 ${
                                            social.isEmail 
                                                ? 'text-green-600 group-hover:text-green-700' 
                                                : 'text-muted-foreground group-hover:text-primary'
                                        } group-hover:translate-x-0.5`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        {social.isEmail ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        )}
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Socials