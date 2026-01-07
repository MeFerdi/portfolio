import React from "react";

const ProjectList = (props) => {
    return (
        <div className="space-y-6">
            {props.data.map((project, index) => {
                const techList = project["technologies used"] || project.framework || [];
                
                return (
                    <div key={index} className="border-l border-border pl-6 pb-6 last:pb-0">
                        {/* Project Name and Links */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="text-base font-semibold">{project.name}</h3>
                            <div className="flex gap-4 text-sm">
                                {project.github && (
                                    <a 
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-foreground hover:underline"
                                    >
                                        GitHub
                                    </a>
                                )}
                                {project.href && (
                                    <a 
                                        href={project.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-foreground hover:underline"
                                    >
                                        Live
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        {/* Technologies as monospace */}
                        <p className="text-xs font-mono text-muted mb-3">
                            {Array.isArray(techList) ? techList.join(", ") : techList}
                        </p>
                        
                        {/* Description */}
                        <p className="text-sm text-foreground leading-relaxed">
                            {project.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default ProjectList;
