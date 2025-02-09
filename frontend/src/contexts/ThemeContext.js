import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = Cookies.get('theme');
    return savedTheme || 'system';
  });

  const setThemeColorFromCSSVariable = () => {
      let primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();

      const h = primaryColor.split(' ')[0];
      const s = primaryColor.split(' ')[1];
      const l = primaryColor.split(' ')[2];

      primaryColor = `hsl(${h}, ${s}, ${l})`;
      // Find or create the <meta name="theme-color">
      let metaThemeColor = document.querySelector("meta[name=theme-color]");

      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
      }

      // Set the content of the meta tag to the primary color
      metaThemeColor.setAttribute("content",  primaryColor);

    };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    Cookies.set('theme', theme, { expires: 365 * 3 }); // Expires in 3 years
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  const setThemeAndStore = (newTheme) => {
    setTheme(newTheme);
    Cookies.set('theme', newTheme, { expires: 365 * 3 });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndStore }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
