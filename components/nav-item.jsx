import React from "react";

function NavItem({ active, href, name, description, icon: Icon, index, onClick, delay }) {
    return (
        <a 
            href={href} 
            onClick={(e) => onClick(e, href)}
            className={`group relative flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:bg-muted/50 animate-fade-in ${
                active ? 'bg-primary/5' : ''
            }`}
            style={{ 
                animationDelay: `${delay}s`,
                animationFillMode: 'both'
            }}
            aria-current={active ? 'page' : undefined}
        >
            {/* Active indicator */}
            <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300 ${
                    active ? 'bg-primary scale-100' : 'bg-transparent scale-0'
                }`}
            />

            {/* Icon */}
            <div className={`flex-shrink-0 transition-all duration-300 ${
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 min-w-0">
                <div className={`font-medium transition-all duration-300 ${
                    active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}>
                    {name}
                </div>
                <div className={`text-xs mt-0.5 transition-all duration-300 ${
                    active ? 'text-primary/70' : 'text-muted-foreground group-hover:text-muted-foreground/80'
                }`}>
                    {description}
                </div>
            </div>

            {/* Index number */}
            <div className={`text-xs font-mono transition-all duration-300 ${
                active ? 'text-primary opacity-100' : 'text-muted-foreground/50 group-hover:text-muted-foreground group-hover:opacity-100'
            }`}>
                {String(index).padStart(2, '0')}
            </div>

            {/* Hover indicator */}
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                active 
                    ? 'bg-primary scale-100' 
                    : 'bg-muted-foreground scale-0 group-hover:scale-100'
            }`} />
        </a>
    )
}

export default NavItem