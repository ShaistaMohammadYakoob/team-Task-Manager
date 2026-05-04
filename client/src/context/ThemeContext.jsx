import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ttm_theme';

const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(getSystemTheme());
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    localStorage.setItem(STORAGE_KEY, themeMode);
  }, [resolvedTheme, themeMode]);

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  const value = useMemo(
    () => ({ themeMode, resolvedTheme, setThemeMode, toggleTheme }),
    [themeMode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
