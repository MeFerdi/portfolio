import React from "react";
import Navigation from "./navigation";
import Socials from "./socials";
import ThemeToggle from "./theme-toggle";

const Header = (props) => {
    return (
        <div className='lg:fixed h-screen basis-1.5/4 flex flex-col justify-between pb-48 self-center lg:self-auto'>
            {/* Profile Header */}
            <div className='space-y-6'>
                {/* Top row with theme toggle */}
                <div className="flex justify-end mb-4 lg:mb-6">
                    <ThemeToggle />
                </div>
                
                {/* Avatar/Profile Section */}
                <div className="flex items-center gap-4 mb-6 lg:flex-col lg:items-start lg:gap-4">
                    {/* Name and Title */}
                    <div className="flex-1 lg:w-full">
                        <h1 className='text-4xl lg:text-5xl font-bold subpixel-antialiased tracking-tight text-foreground leading-tight'>
                            {props.data.name}
                        </h1>
                        <h2 className='text-primary pt-2 text-lg lg:text-xl font-semibold tracking-wide'>
                            {props.data.headline}
                        </h2>
                        
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex items-center lg:items-start">
                <Navigation />
            </div>
             <Socials data={props.data.socials}></Socials>

        </div>
    )
}

export default Header