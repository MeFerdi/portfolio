'use client'

import React from "react";

const Navigation = () => {
    const links = [
        { label: "Work", href: "#work" },
        { label: "Blogs", href: "#blogs" },
        { label: "Projects", href: "#projects" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <nav className="flex gap-6 text-sm">
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className="text-foreground hover:underline transition-all"
                >
                    {link.label}
                </a>
            ))}
        </nav>
    );
};

export default Navigation;