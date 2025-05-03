
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
    <NextThemesProvider 
      attribute={attribute} 
      defaultTheme={defaultTheme} 
      enableSystem={enableSystem}
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
