import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default async function Imprint() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Back to Portfolio</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="animate-fade-in">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                            Imprint
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Legal information and contact details as required by law.
                        </p>
                    </div>

                    {/* Imprint Content */}
                    <div className="space-y-8">
                        
                        {/* Website Owner */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-6 text-foreground">Website Owner & Responsible Party</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-medium mb-4 text-foreground">Personal Information</h3>
                                    <div className="space-y-3 text-muted-foreground">
                                        <p><strong className="text-foreground">Name:</strong> Ferdynand Odhiambo</p>
                                        <p><strong className="text-foreground">Profession:</strong> Full Stack Software Developer</p>
                                        <p><strong className="text-foreground">Website:</strong> ferdynand.dev</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-4 text-foreground">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <EnvelopeIcon className="w-5 h-5 text-primary" />
                                            <span>ferdynandodhiambo@gmail.com</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <GlobeAltIcon className="w-5 h-5 text-primary" />
                                            <span>ferdynand.dev</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Purpose of Website */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Purpose of This Website</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This website serves as a professional portfolio showcasing my work as a Full Stack Software Developer. 
                                It contains information about my skills, experience, projects, and provides a means for potential 
                                clients, employers, and collaborators to contact me for professional purposes.
                            </p>
                        </section>

                        {/* Technical Information */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Technical Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-3 text-foreground">Hosting & Infrastructure</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Built with Next.js and React</li>
                                        <li>• Styled with Tailwind CSS</li>
                                        <li>• Hosted on modern cloud infrastructure</li>
                                        <li>• SSL encrypted connection</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-3 text-foreground">External Services</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Google Fonts (typography)</li>
                                        <li>• Google Drive (CV downloads)</li>
                                        <li>• GitHub (code repositories)</li>
                                        <li>• LinkedIn (professional networking)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Intellectual Property */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Intellectual Property</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    All content on this website, including but not limited to text, images, code, and design, 
                                    is the intellectual property of Ferdynand Odhiambo unless otherwise stated.
                                </p>
                                <p>
                                    Project demonstrations and code samples may be subject to their respective licenses. 
                                    Some projects may be open source and available on GitHub with appropriate licensing.
                                </p>
                                <p>
                                    Third-party libraries, frameworks, and tools used in the development of this website 
                                    are subject to their respective licenses and terms of use.
                                </p>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Disclaimer</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    The information on this website is provided for general informational purposes only. 
                                    While I strive to keep the information up to date and correct, I make no representations 
                                    or warranties of any kind about the completeness, accuracy, reliability, or availability 
                                    of the information.
                                </p>
                                <p>
                                    Any reliance you place on such information is strictly at your own risk. In no event 
                                    will I be liable for any loss or damage including indirect or consequential loss or 
                                    damage arising from the use of this website.
                                </p>
                            </div>
                        </section>

                        {/* External Links */}
                        <section className="card p-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">External Links</h2>
                            <p className="text-muted-foreground">
                                This website contains links to external websites. I have no control over the content 
                                and nature of these sites and cannot be held responsible for their content, privacy 
                                policies, or practices. The inclusion of any links does not necessarily imply a 
                                recommendation or endorsement of the views expressed within them.
                            </p>
                        </section>

                        {/* Updates */}
                        <section className="card p-8 bg-muted/20">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Updates to This Imprint</h2>
                            <p className="text-muted-foreground mb-4">
                                This imprint may be updated from time to time to reflect changes in our practices or for other operational, 
                                legal, or regulatory reasons.
                            </p>
                            <div className="text-sm text-muted-foreground/70">
                                Last updated: {new Date().toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </div>
                        </section>

                    </div>

                    {/* Footer Navigation */}
                    <div className="mt-12 pt-8 border-t border-border/40">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link 
                                href="/" 
                                className="btn btn-ghost"
                            >
                                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                                Back to Portfolio
                            </Link>
                            <Link 
                                href="/privacy" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                View Privacy Policy →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}