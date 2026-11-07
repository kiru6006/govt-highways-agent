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
    name: 'Tamil Nadu Classic',
    badge: 'Emerald & Slate',
    description: 'Original Tamil Nadu Highways brand palette (#006A4E)',
    primaryColor: '#006A4E',
    headerBg: '#FFFFFF',
    sidebarBg: '#0F172A',
  },
  'navy-gov': {
    id: 'navy-gov',
    name: 'Government Navy (DESIGN.md)',
    badge: 'GIGW / UX4G Token Shell',
    description: 'Provisional Government Shell (#0F2A4A) with #F4F7FB Surface',
    primaryColor: '#0F2A4A',
    headerBg: '#0F2A4A',
    sidebarBg: '#091A2E',
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

