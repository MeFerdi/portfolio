import React from "react";
import VolunteeringItem from "./volunteering-item";

const Volunteering = (props) => {
    return (
        <div data-section id='volunteering' className='mb-16'>
            <h2 className='mb-8 visible lg:invisible font-medium tracking-widest'>Volunteering</h2>
            {props.data.map(({ position, event, organisation, href, startDate, endDate, description }) => (
                <VolunteeringItem  
                    key={`${position}+${startDate}`}
                    position={position}
                    event={event} 
                    organisation={organisation}
                    href={href}
                    startDate={startDate}
                    endDate={endDate ? endDate : ''}
                    description={description}
                />
            ))}
        </div>
    )
}

export default Volunteering