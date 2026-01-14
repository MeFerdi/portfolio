"use client";

import React from "react";

const BlogCarousel = ({ items = [] }) => {
  if (!items.length) return null;
  const doubled = [...items, ...items];

  return (
    <div className="w-80 rounded-2xl bg-card/90 backdrop-blur-sm overflow-hidden shadow-soft">
      <div className="px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-primary">
        Blogs
      </div>
      <div className="relative h-96 overflow-hidden">
        <div className="marquee-vert space-y-4 py-4">
          {doubled.map((post, idx) => (
            <a
              key={`${post.href || post.title}-${idx}`}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block mx-4 p-4 rounded-xl bg-border/15 hover:bg-border/25 transition text-base"
            >
              <div className="text-foreground font-semibold leading-snug line-clamp-2">
                {post.title}
              </div>
              {post.publication ? (
                <div className="text-xs text-muted-foreground mt-2">
                  {post.publication}
                </div>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogCarousel;
