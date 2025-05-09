
import React, { createContext, useContext, useState } from "react";

interface AppearanceContextType {
  sidebarColor: string;
  setSidebarColor: (color: string) => void;
}

const defaultAppearanceContext: AppearanceContextType = {
  sidebarColor: "#004743",
  setSidebarColor: () => {},
};

const AppearanceContext = createContext<AppearanceContextType>(defaultAppearanceContext);

export const useAppearance = () => useContext(AppearanceContext);

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarColor, setSidebarColor] = useState<string>("#004743");

  return (
    <AppearanceContext.Provider value={{ sidebarColor, setSidebarColor }}>
      {children}
    </AppearanceContext.Provider>
  );
};
