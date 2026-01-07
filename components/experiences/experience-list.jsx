import React from "react";

const ExperienceList = (props) => {
    return (
        <div className="space-y-8">
            {props.data.map((experience, index) => (
                <div key={index} className="border-l border-border pl-6 pb-8 last:pb-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                        <div>
                            <h3 className="text-base font-semibold">{experience.company}</h3>
                            <p className="text-sm text-foreground">{experience.title}</p>
                        </div>
                        <span className="text-sm text-muted whitespace-nowrap">
                            {experience.startDate} — {experience.endDate}
                        </span>
                    </div>
                    
                    {/* Skills as monospace comma-separated list */}
                    <p className="text-xs font-mono text-muted mb-3">
                        {experience.skills?.join(", ")}
                    </p>
                    
                    {/* Description */}
                    <p className="text-sm text-foreground leading-relaxed">
                        {experience.description}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ExperienceList;
