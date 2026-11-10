import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'classic' | 'navy-gov';

export interface ThemeInfo {
  id: ThemeMode;
  name: string;
  badge: string;
  description: string;
  primaryColor: string;
  headerBg: string;
  sidebarBg: string;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeInfo> = {
  classic: {
    id: 'classic',
    name: 'Highways Standard (Light)',
    badge: 'Charcoal & Yellow Accent',
    description: 'Highways Government light theme with yellow road markings accent (#FACC15)',
    primaryColor: '#20242B',
    headerBg: '#FFFFFF',
    sidebarBg: '#FFFFFF',
  },
  'navy-gov': {
    id: 'navy-gov',
    name: 'Highways State Blue (Light)',
    badge: 'State Blue Accent',
    description: 'Clean government light theme with State Highway blue accent (#1D4ED8)',
    primaryColor: '#1D4ED8',
    headerBg: '#FFFFFF',
    sidebarBg: '#FFFFFF',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isNavyGov: boolean;
  themeInfo: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tn_hdos_theme');
    return saved === 'navy-gov' || saved === 'classic' ? (saved as ThemeMode) : 'classic';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('tn_hdos_theme', newTheme);
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'classic' ? 'navy-gov' : 'classic';
    setTheme(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'navy-gov') {
      root.classList.add('theme-navy-gov');
      root.classList.remove('theme-classic');
    } else {
      root.classList.add('theme-classic');
      root.classList.remove('theme-navy-gov');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isNavyGov: theme === 'navy-gov',
        themeInfo: THEME_CONFIGS[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
