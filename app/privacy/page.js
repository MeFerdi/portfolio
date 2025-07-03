import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default async function PrivacyStatement() {
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
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                        </p>
                        <div className="text-sm text-muted-foreground/70 mt-4">
                            Last updated: {new Date().toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>

                    {/* Privacy Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="space-y-8">
                            
                            {/* Introduction */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    This Privacy Policy describes how Ferdynand Odhiambo ("we," "our," or "us") collects, uses, and shares your personal information when you visit or interact with our portfolio website (the "Service").
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-foreground">Information You Provide</h3>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                            <li>Contact information (name, email address) when you reach out through our contact form</li>
                                            <li>Any messages or communications you send to us</li>
                                            <li>Information you provide when downloading our CV or portfolio materials</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-foreground">Automatically Collected Information</h3>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                            <li>IP address and general location information</li>
                                            <li>Browser type and version</li>
                                            <li>Device information and screen resolution</li>
                                            <li>Pages visited and time spent on our website</li>
                                            <li>Referring website information</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* How We Use Information */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
                                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>Respond to your inquiries and communications</li>
                                    <li>Improve our website and user experience</li>
                                    <li>Analyze website usage and performance</li>
                                    <li>Prevent spam and abuse</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </section>

                            {/* Information Sharing */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Information Sharing</h2>
                                <p className="text-muted-foreground mb-4">
                                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>With your explicit consent</li>
                                    <li>To comply with legal requirements or court orders</li>
                                    <li>To protect our rights, property, or safety</li>
                                    <li>With service providers who assist in website operations (under strict confidentiality agreements)</li>
                                </ul>
                            </section>

                            {/* Data Security */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Security</h2>
                                <p className="text-muted-foreground">
                                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </section>

                            {/* Cookies and Tracking */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookies and Tracking Technologies</h2>
                                <p className="text-muted-foreground mb-4">
                                    We use cookies and similar tracking technologies to enhance your browsing experience:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    You can control cookies through your browser settings, though disabling certain cookies may affect website functionality.
                                </p>
                            </section>

                            {/* Your Rights */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Privacy Rights</h2>
                                <p className="text-muted-foreground mb-4">You have the right to:</p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>Access the personal information we have about you</li>
                                    <li>Request correction of inaccurate information</li>
                                    <li>Request deletion of your personal information</li>
                                    <li>Object to or restrict certain processing of your information</li>
                                    <li>Data portability (where applicable)</li>
                                    <li>Withdraw consent at any time</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    To exercise these rights, please contact us using the information provided below.
                                </p>
                            </section>

                            {/* Third-Party Services */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Services</h2>
                                <p className="text-muted-foreground mb-4">
                                    Our website may contain links to third-party services such as:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>GitHub (for code repositories)</li>
                                    <li>LinkedIn (for professional networking)</li>
                                    <li>Google Drive (for CV downloads)</li>
                                    <li>Email services (for contact forms)</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    These services have their own privacy policies, and we are not responsible for their practices.
                                </p>
                            </section>

                            {/* Changes to Policy */}
                            <section className="card p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to This Policy</h2>
                                <p className="text-muted-foreground">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically for any changes.
                                </p>
                            </section>

                            {/* Contact Information */}
                            <section className="card p-8 bg-muted/20">
                                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                                <p className="text-muted-foreground mb-4">
                                    If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                                </p>
                                <div className="space-y-2 text-muted-foreground">
                                    <p><strong>Email:</strong> ferdynandodhiambo@gmail.com</p>
                                    <p><strong>Website:</strong> ferdynand.dev</p>
                                    <p><strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 72 hours.</p>
                                </div>
                            </section>

                        </div>
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
                                href="/imprint" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                View Imprint →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}