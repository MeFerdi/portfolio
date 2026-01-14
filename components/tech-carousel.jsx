"use client";

import React from "react";

const TechCarousel = ({ items = [] }) => {
  if (!items.length) return null;
  const doubled = [...items, ...items]; // smooth loop

  return (
    <div className="w-64 rounded-2xl bg-card/90 backdrop-blur-sm overflow-hidden shadow-soft">
      <div className="px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-primary">
        Stack
      </div>
      <div className="relative h-80 overflow-hidden">
        <div className="marquee-vert space-y-3 py-3">
          {doubled.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              className="mx-4 px-4 py-3 rounded-xl bg-border/15 text-base text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechCarousel;
