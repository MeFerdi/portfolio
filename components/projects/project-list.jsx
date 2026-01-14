import React from "react";

const ProjectList = (props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {props.data.map((project, index) => {
                const techList = project["technologies used"] || project.framework || [];
                const mainLink = project.href || project.github || '';
                const hasLink = Boolean(mainLink);
                const initials = project.name
                    ? project.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
                    : 'PR';
                
                return (
                    <div key={index} className="border border-border rounded-xl overflow-hidden bg-card flex flex-col">
                        {/* Image / Preview */}
                        {hasLink ? (
                            <a 
                                href={mainLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block group"
                                aria-label={`Open ${project.name}`}
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    {project.image ? (
                                        <img 
                                            src={project.image}
                                            alt={`${project.name} preview`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border text-foreground text-lg font-semibold tracking-wide">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                            </a>
                        ) : (
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                {project.image ? (
                                    <img 
                                        src={project.image}
                                        alt={`${project.name} preview`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border text-foreground text-lg font-semibold tracking-wide">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-4 space-y-3 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-base font-semibold leading-tight">{project.name}</h3>
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 text-xs text-foreground">
                                    {project.href && (
                                        <a 
                                            href={project.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            Live
                                        </a>
                                    )}
                                    {project.github && (
                                        <a 
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>

                            {techList?.length ? (
                                <p className="text-xs font-mono text-muted">
                                    {Array.isArray(techList) ? techList.join(", ") : techList}
                                </p>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProjectList;
