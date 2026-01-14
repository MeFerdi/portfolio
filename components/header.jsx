import React from "react";
import ThemeToggle from "./theme-toggle";

const Header = (props) => {
    return (
        <header className="space-y-6">
            <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                    {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary/10 text-primary border border-primary/20">
                        Solana-inspired Build Track
                    </span> */}
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            {props.data.name}
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground">
                            {props.data.headline} • Shipping resilient backend and systems work.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#projects"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                        >
                            View Work
                        </a>
                        <a
                            href={`mailto:${props.data.socials.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:border-primary/60 hover:text-primary transition"
                        >
                            Contact
                        </a>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <a 
                            href={`mailto:${props.data.socials.email}`} 
                            className="hover:text-primary"
                        >
                            {props.data.socials.email}
                        </a>
                        {" · "}
                        <span>Distributed systems • Infra • Tooling</span>
                    </p>
                </div>
                <ThemeToggle />
            </div>
        </header>
    )
}

export default Header