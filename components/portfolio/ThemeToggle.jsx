'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'portfolio-theme';

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const initialTheme = storedTheme || 'light';

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const handleToggle = () => {
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95 6.95 1.41 1.41M3.64 3.64l1.41 1.41m11.9-1.41-1.41 1.41M5.05 18.95l-1.41 1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="sr-only">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
