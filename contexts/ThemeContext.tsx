import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { ThemeSettings } from '../types';

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: ThemeSettings) => Promise<void>;
  isLoading: boolean;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#C4170C',
  secondaryColor: '#1e3a8a',
  logoUrl: '',
  siteName: 'AI News Portal'
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: async () => {},
  isLoading: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await dbService.getTheme();
        setTheme(savedTheme);
      } catch (error) {
        console.error("Failed to load theme", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Update CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
  }, [theme]);

  const updateTheme = async (newTheme: ThemeSettings) => {
    setTheme(newTheme); // Optimistic update
    await dbService.updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);