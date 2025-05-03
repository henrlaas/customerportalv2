
import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  attribute?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  defaultTheme = "light",
  storageKey = "theme",
  enableSystem = true,
  attribute = "class"
}) => {
  return (
    <>
      {/* Add Google Fonts link for Nunito */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" />
      
      <NextThemesProvider 
        attribute={attribute} 
        defaultTheme={defaultTheme} 
        enableSystem={enableSystem}
        storageKey={storageKey}
      >
        {children}
      </NextThemesProvider>
    </>
  );
};

export default ThemeProvider;
