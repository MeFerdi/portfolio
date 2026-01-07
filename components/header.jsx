import React from "react";
import ThemeToggle from "./theme-toggle";

const Header = (props) => {
    return (
        <header className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {props.data.name}
                    </h1>
                    <p className="text-lg text-muted mt-2">
                        Senior Backend Developer • Systems Engineering
                    </p>
                </div>
                <ThemeToggle />
            </div>
            <p className="text-sm text-foreground">
                <a 
                    href={`mailto:${props.data.socials.email}`} 
                    className="hover:underline"
                >
                    {props.data.socials.email}
                </a>
            </p>
        </header>
    )
}

export default Header