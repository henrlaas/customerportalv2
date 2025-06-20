
import { useEffect, useState, createContext, useContext } from "react";
import { workspaceService } from "@/services/workspaceService";
import { useToast } from "@/components/ui/use-toast";

type AppearanceContextType = {
  title: string;
  sidebarLogo: string;
  authLogo: string;
  favicon: string;
  sidebarColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  isLoading: boolean;
};

const defaultAppearance: AppearanceContextType = {
  title: "Box Workspace",
  sidebarLogo: "/lovable-uploads/e182ec20-ac09-45b3-8323-c8a29e84c3aa.png",
  authLogo: "/lovable-uploads/960baec8-7ae0-4685-bb7d-f3272c86efbe.png",
  favicon: "/lovable-uploads/6bacacdd-44b5-4207-8821-0528077e33d1.png",
  sidebarColor: "#004743",
  accentColor: "#f3f3f3", // Default accent color
  buttonColor: "#004743", // Default button color
  buttonTextColor: "#FFFFFF", // Default button text color (white)
  isLoading: true
};

const AppearanceContext = createContext<AppearanceContextType>(defaultAppearance);

export const useAppearance = () => useContext(AppearanceContext);

interface AppearanceProviderProps {
  children: React.ReactNode;
}

// Helper function to convert HEX to HSL
const hexToHsl = (hex: string): string => {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

export const AppearanceProvider = ({ children }: AppearanceProviderProps) => {
  const [appearance, setAppearance] = useState<AppearanceContextType>(defaultAppearance);
  const { toast } = useToast();

  useEffect(() => {
    const loadAppearanceSettings = async () => {
      try {
        const settings = await workspaceService.getSettings();
        
        const titleSetting = settings.find(s => s.setting_key === 'appearance.title');
        const sidebarLogoSetting = settings.find(s => s.setting_key === 'appearance.sidebar.logo');
        const authLogoSetting = settings.find(s => s.setting_key === 'appearance.auth.logo');
        const faviconSetting = settings.find(s => s.setting_key === 'appearance.favicon');
        const sidebarColorSetting = settings.find(s => s.setting_key === 'appearance.sidebar.color');
        const accentColorSetting = settings.find(s => s.setting_key === 'appearance.accent.color');
        const buttonColorSetting = settings.find(s => s.setting_key === 'appearance.button.color');
        const buttonTextColorSetting = settings.find(s => s.setting_key === 'appearance.button.text.color');
        
        // Determine button text color with proper fallback
        const buttonTextColorValue = buttonTextColorSetting?.setting_value || defaultAppearance.buttonTextColor;
        
        console.log("Button text color from DB:", buttonTextColorSetting?.setting_value);
        console.log("Using button text color:", buttonTextColorValue);
        
        // Update appearance state with database values or defaults
        setAppearance({
          title: titleSetting?.setting_value || defaultAppearance.title,
          sidebarLogo: sidebarLogoSetting?.setting_value || defaultAppearance.sidebarLogo,
          authLogo: authLogoSetting?.setting_value || defaultAppearance.authLogo,
          favicon: faviconSetting?.setting_value || defaultAppearance.favicon,
          sidebarColor: sidebarColorSetting?.setting_value || defaultAppearance.sidebarColor,
          accentColor: accentColorSetting?.setting_value || defaultAppearance.accentColor,
          buttonColor: buttonColorSetting?.setting_value || defaultAppearance.buttonColor,
          buttonTextColor: buttonTextColorValue,
          isLoading: false
        });

        // Apply settings directly to DOM
        if (titleSetting) {
          document.title = titleSetting.setting_value;
        }

        if (faviconSetting) {
          const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (faviconLink && faviconSetting.setting_value) {
            faviconLink.href = faviconSetting.setting_value;
          }
        }

        if (sidebarColorSetting) {
          document.documentElement.style.setProperty('--sidebar-background', sidebarColorSetting.setting_value);
        }

        if (accentColorSetting) {
          document.documentElement.style.setProperty('--accent', accentColorSetting.setting_value);
        }
        
        if (buttonColorSetting) {
          try {
            const hslValue = hexToHsl(buttonColorSetting.setting_value);
            document.documentElement.style.setProperty('--primary', hslValue);
            console.log(`Button color set to HSL: ${hslValue}`);
          } catch (error) {
            console.error('Error converting button color to HSL:', error);
            document.documentElement.style.setProperty('--primary', hexToHsl(defaultAppearance.buttonColor));
          }
        }
        
        // Apply button text color with proper fallback
        try {
          const hslValue = hexToHsl(buttonTextColorValue);
          document.documentElement.style.setProperty('--primary-foreground', hslValue);
          console.log(`Button text color set to HSL: ${hslValue} (from ${buttonTextColorValue})`);
          
          // For compatibility, also set the data attribute
          document.documentElement.setAttribute('data-button-text-color', buttonTextColorValue);
        } catch (error) {
          console.error('Error converting button text color to HSL:', error);
          // Use fallback
          const fallbackHsl = hexToHsl(defaultAppearance.buttonTextColor);
          document.documentElement.style.setProperty('--primary-foreground', fallbackHsl);
          console.log(`Using fallback button text color HSL: ${fallbackHsl}`);
        }
        
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
        
        // Apply fallbacks when database fails
        const fallbackButtonTextHsl = hexToHsl(defaultAppearance.buttonTextColor);
        document.documentElement.style.setProperty('--primary-foreground', fallbackButtonTextHsl);
        document.documentElement.setAttribute('data-button-text-color', defaultAppearance.buttonTextColor);
        console.log(`Database failed, using fallback button text color: ${defaultAppearance.buttonTextColor}`);
        
        toast({
          title: "Error",
          description: "Failed to load appearance settings.",
          variant: "destructive",
        });
      }
    };

    loadAppearanceSettings();
  }, [toast]);

  return (
    <AppearanceContext.Provider value={appearance}>
      {children}
    </AppearanceContext.Provider>
  );
};
