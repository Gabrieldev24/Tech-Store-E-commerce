'use client';

import { useEffect, useState } from 'react';

export function ThemeClient({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load theme from localStorage and apply to html element
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);

    const html = document.documentElement;
    if (isDarkTheme) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Listen for theme changes
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 'light';
      const isDarkTheme = newTheme === 'dark';
      setIsDark(isDarkTheme);

      const html = document.documentElement;
      if (isDarkTheme) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}
