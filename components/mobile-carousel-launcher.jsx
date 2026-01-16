"use client";

import React, { useEffect, useRef, useState } from "react";
import TechCarousel from "./tech-carousel";
import BlogCarousel from "./blog-carousel";

const MobileCarouselLauncher = ({ techItems = [], blogItems = [] }) => {
  const [open, setOpen] = useState(null); // 'stack' | 'blogs' | null
  const closeBtnRef = useRef(null);
  const lastTriggerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      // Focus the close button for accessibility
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      document.removeEventListener("keydown", onKey);
      // Restore focus to the last trigger
      lastTriggerRef.current?.focus?.();
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openStack = (e) => {
    lastTriggerRef.current = e.currentTarget;
    setOpen("stack");
  };

  const openBlogs = (e) => {
    lastTriggerRef.current = e.currentTarget;
    setOpen("blogs");
  };

  const close = () => setOpen(null);

  return (
    <>
      {/* Launchers visible only on mobile/tablet */}
      <div className="lg:hidden">
        <div className="fixed left-4 bottom-24 z-40">
          <button
            type="button"
            onClick={openStack}
            aria-label="Open Stack carousel"
            aria-haspopup="dialog"
            aria-expanded={open === "stack"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <span className="inline-block w-4 h-3 bg-primary-foreground rounded-sm"></span>
            <span className="text-sm font-semibold">Stack</span>
          </button>
        </div>
        <div className="fixed right-4 bottom-24 z-40">
          <button
            type="button"
            onClick={openBlogs}
            aria-label="Open Blogs carousel"
            aria-haspopup="dialog"
            aria-expanded={open === "blogs"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <span className="inline-block w-4 h-3 bg-foreground rounded-sm"></span>
            <span className="text-sm font-semibold">Blogs</span>
          </button>
        </div>
      </div>

      {/* Overlay modal with backdrop blur */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open === "stack" ? "Stack carousel" : "Blogs carousel"}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                className="absolute -top-3 -right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border shadow-soft text-foreground hover:bg-border/20 focus:outline-none focus:ring-2 focus:ring-primary/60"
                aria-label="Close carousel"
              >
                ×
              </button>
              {open === "stack" ? (
                <TechCarousel items={techItems} />
              ) : (
                <BlogCarousel items={blogItems} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileCarouselLauncher;
