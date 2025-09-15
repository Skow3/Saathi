// src/contexts/ThemeContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

const themes = ['light', 'dark', 'system'];
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return themes.includes(savedTheme) ? savedTheme : 'system';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const root = window.document.documentElement;

    // This function is now ONLY for the event listener
    const handleSystemThemeChange = (e) => {
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // When the theme changes, first remove any old listeners
    mediaQuery.removeEventListener('change', handleSystemThemeChange);

    // Now, apply the theme based on the current state
    if (theme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else { // theme === 'system'
      localStorage.setItem('theme', 'system');
      // Apply the current system theme immediately
      handleSystemThemeChange(mediaQuery);
      // And ONLY now, add the listener for future changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    // The cleanup function for when the component unmounts
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]); // Rerun this whole effect when the theme state changes

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);