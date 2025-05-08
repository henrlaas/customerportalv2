
import { useEffect, useState, createContext, useContext } from "react";
import { workspaceService } from "@/services/workspaceService";
import { useToast } from "@/components/ui/use-toast";

type AppearanceContextType = {
  title: string;
  sidebarLogo: string;
  authLogo: string;
  favicon: string;
  sidebarColor: string;
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
  buttonColor: "#004743", // Default button color
  buttonTextColor: "#FFFFFF", // Default button text color (white)
  isLoading: true
};

const AppearanceContext = createContext<AppearanceContextType>(defaultAppearance);

export const useAppearance = () => useContext(AppearanceContext);

interface AppearanceProviderProps {
  children: React.ReactNode;
}

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
        const buttonColorSetting = settings.find(s => s.setting_key === 'appearance.button.color');
        const buttonTextColorSetting = settings.find(s => s.setting_key === 'appearance.button.text.color');
        
        // Update appearance state with database values or defaults
        setAppearance({
          title: titleSetting?.setting_value || defaultAppearance.title,
          sidebarLogo: sidebarLogoSetting?.setting_value || defaultAppearance.sidebarLogo,
          authLogo: authLogoSetting?.setting_value || defaultAppearance.authLogo,
          favicon: faviconSetting?.setting_value || defaultAppearance.favicon,
          sidebarColor: sidebarColorSetting?.setting_value || defaultAppearance.sidebarColor,
          buttonColor: buttonColorSetting?.setting_value || defaultAppearance.buttonColor,
          buttonTextColor: buttonTextColorSetting?.setting_value || defaultAppearance.buttonTextColor,
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
        
        if (buttonColorSetting) {
          document.documentElement.style.setProperty('--primary', buttonColorSetting.setting_value);
        }
        
        if (buttonTextColorSetting) {
          document.documentElement.style.setProperty('--primary-foreground', buttonTextColorSetting.setting_value);
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
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
