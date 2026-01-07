import React from "react";

const Footer = (props) => {
    // Support both direct props (email, github, linkedin) and nested props.data
    const email = props.email || props.data?.email;
    const github = props.github || props.data?.github;
    const linkedin = props.linkedin || props.data?.linkedin;
    return (
        <footer id="contact" className="scroll-mt-20 pt-12 border-t border-border">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact</h2>
                <div className="flex flex-col gap-2 text-sm">
                    <a 
                        href={email ? `mailto:${email}` : undefined}
                        className="text-foreground hover:underline"
                    >
                        Email
                    </a>
                    <a 
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        GitHub
                    </a>
                    <a 
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        LinkedIn
                    </a>
                </div>
            </div>
            <p className="text-xs text-muted mt-8 pt-8 border-t border-border">
                Built with Next.js • Deployed on Fly.io
            </p>
        </footer>
    );
};

export default Footer;
