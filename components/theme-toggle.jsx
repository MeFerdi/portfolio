"use client";

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  // Safely try to use the theme context
  let theme, toggleTheme, mounted;
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
    mounted = themeContext.mounted;
  } catch (error) {
    // If ThemeProvider is not available, use default values
    theme = 'light';
    toggleTheme = () => {};
    mounted = false;
  }

  // Show a placeholder while theme is being determined or if provider is not available
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border/40 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun Icon */}
      <SunIcon 
        className={`absolute w-5 h-5 text-amber-500 transition-all duration-500 ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-90 scale-0'
        }`}
      />
      
      {/* Moon Icon */}
      <MoonIcon 
        className={`absolute w-5 h-5 text-blue-400 transition-all duration-500 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-0'
        }`}
      />
      
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-lg transition-all duration-500 ${
        theme === 'light' 
          ? 'bg-amber-500/10 group-hover:bg-amber-500/20' 
          : 'bg-blue-400/10 group-hover:bg-blue-400/20'
      }`} />
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
