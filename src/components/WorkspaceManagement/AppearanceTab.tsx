import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Image, Palette, Sun, LayoutDashboard, MousePointer, Brush } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { workspaceService } from "@/services/workspaceService";

export const AppearanceTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Box Workspace");
  const [sidebarLogo, setSidebarLogo] = useState("");
  const [authLogo, setAuthLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [sidebarColor, setSidebarColor] = useState("#004743");
  const [accentColor, setAccentColor] = useState("#f3f3f3");
  const [buttonColor, setButtonColor] = useState("#004743");
  const [buttonTextColor, setButtonTextColor] = useState("#FFFFFF");
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await workspaceService.getSettings();
        
        // Extract settings
        const titleSetting = settings.find(s => s.setting_key === 'appearance.title');
        const sidebarLogoSetting = settings.find(s => s.setting_key === 'appearance.sidebar.logo');
        const authLogoSetting = settings.find(s => s.setting_key === 'appearance.auth.logo');
        const faviconSetting = settings.find(s => s.setting_key === 'appearance.favicon');
        const sidebarColorSetting = settings.find(s => s.setting_key === 'appearance.sidebar.color');
        const accentColorSetting = settings.find(s => s.setting_key === 'appearance.accent.color');
        const buttonColorSetting = settings.find(s => s.setting_key === 'appearance.button.color');
        const buttonTextColorSetting = settings.find(s => s.setting_key === 'appearance.button.text.color');
        
        if (titleSetting) setTitle(titleSetting.setting_value);
        if (sidebarLogoSetting) setSidebarLogo(sidebarLogoSetting.setting_value);
        if (authLogoSetting) setAuthLogo(authLogoSetting.setting_value);
        if (faviconSetting) setFavicon(faviconSetting.setting_value);
        if (sidebarColorSetting) setSidebarColor(sidebarColorSetting.setting_value);
        if (accentColorSetting) setAccentColor(accentColorSetting.setting_value);
        if (buttonColorSetting) setButtonColor(buttonColorSetting.setting_value);
        if (buttonTextColorSetting) {
          console.log("Loaded button text color from DB:", buttonTextColorSetting.setting_value);
          setButtonTextColor(buttonTextColorSetting.setting_value);
        }
      } catch (error) {
        console.error("Failed to fetch appearance settings:", error);
        toast({
          title: "Error",
          description: "Failed to load appearance settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSaveTitle = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.title', title, 'Website title displayed in browser tab');
      
      // Update the actual page title
      document.title = title;
      
      toast({
        title: "Title updated",
        description: "Website title has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update website title.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSidebarColor = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.sidebar.color', sidebarColor, 'Sidebar navigation background color');
      
      // Update CSS variable for sidebar color
      document.documentElement.style.setProperty('--sidebar-background', sidebarColor);
      
      toast({
        title: "Sidebar color updated",
        description: "Sidebar background color has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sidebar color.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccentColor = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.accent.color', accentColor, 'Application accent color');
      
      // Update CSS variable for accent color
      document.documentElement.style.setProperty('--accent', accentColor);
      
      toast({
        title: "Accent color updated",
        description: "Application accent color has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update accent color.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveButtonColor = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.button.color', buttonColor, 'Button background color');
      
      // Convert HEX to HSL for button background color
      const tempElement = document.createElement('div');
      tempElement.style.backgroundColor = buttonColor;
      document.body.appendChild(tempElement);
      const rgbColor = window.getComputedStyle(tempElement).backgroundColor;
      document.body.removeChild(tempElement);
      
      // Parse RGB values
      const rgb = rgbColor.match(/\d+/g);
      if (rgb && rgb.length === 3) {
        const r = parseInt(rgb[0]) / 255;
        const g = parseInt(rgb[1]) / 255;
        const b = parseInt(rgb[2]) / 255;
        
        // Calculate HSL values
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
        
        // Set the CSS variable in HSL format
        document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
        console.log(`Button color set to HSL: ${h} ${s}% ${l}%`);
      }
      
      toast({
        title: "Button color updated",
        description: "Button background color has been updated successfully.",
      });
    } catch (error) {
      console.error("Button color update error:", error);
      toast({
        title: "Error",
        description: "Failed to update button color.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveButtonTextColor = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.button.text.color', buttonTextColor, 'Button text color');
      
      // Apply CSS variable directly 
      document.documentElement.style.setProperty('--primary-foreground', buttonTextColor);
      console.log("Applied button text color:", buttonTextColor);
      
      toast({
        title: "Button text color updated",
        description: "Button text color has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update button text color.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSidebarLogo = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.sidebar.logo', sidebarLogo, 'Logo displayed in the sidebar navigation');
      
      toast({
        title: "Sidebar logo updated",
        description: "Sidebar logo URL has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sidebar logo URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAuthLogo = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.auth.logo', authLogo, 'Logo displayed on login and password reset pages');
      
      toast({
        title: "Auth logo updated",
        description: "Auth logo URL has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auth logo URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFavicon = async () => {
    try {
      setIsLoading(true);
      await saveOrCreateSetting('appearance.favicon', favicon, 'Website favicon URL');
      
      // Update favicon link
      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = favicon;
      }
      
      toast({
        title: "Favicon updated",
        description: "Website favicon has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favicon URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveOrCreateSetting = async (key: string, value: string, description: string) => {
    const settings = await workspaceService.getSettings();
    const setting = settings.find(s => s.setting_key === key);
    
    if (setting) {
      await workspaceService.updateSetting(setting.id, value);
    } else {
      await workspaceService.createSetting(key, value, description);
    }
  };

  // This function now directly sets the button text color to the selected value
  const setButtonTextColorValue = (color: string) => {
    console.log("Setting button text color to:", color);
    setButtonTextColor(color);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Appearance Settings</h2>
      </div>
      <p className="text-muted-foreground">
        Customize the visual elements of your workspace.
      </p>
      <Separator />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Website Title
              </CardTitle>
              <CardDescription>
                Set the title that appears in the browser tab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Website Title"
                />
              </div>
              <Button onClick={handleSaveTitle} disabled={isLoading}>
                Save Title
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Sidebar Logo
              </CardTitle>
              <CardDescription>
                Set the logo that appears in the sidebar navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sidebarLogo">Logo URL</Label>
                <Input
                  id="sidebarLogo"
                  value={sidebarLogo}
                  onChange={(e) => setSidebarLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              {sidebarLogo && (
                <div className="border rounded p-4 flex items-center justify-center bg-gray-50">
                  <img 
                    src={sidebarLogo} 
                    alt="Sidebar Logo Preview" 
                    className="h-14 max-w-full object-contain" 
                  />
                </div>
              )}
              <Button onClick={handleSaveSidebarLogo} disabled={isLoading}>
                Save Sidebar Logo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Auth Pages Logo
              </CardTitle>
              <CardDescription>
                Set the logo for login and password reset pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authLogo">Logo URL</Label>
                <Input
                  id="authLogo"
                  value={authLogo}
                  onChange={(e) => setAuthLogo(e.target.value)}
                  placeholder="https://example.com/auth-logo.png"
                />
              </div>
              {authLogo && (
                <div className="border rounded p-4 flex items-center justify-center bg-gray-50">
                  <img 
                    src={authLogo} 
                    alt="Auth Logo Preview" 
                    className="h-14 max-w-full object-contain" 
                  />
                </div>
              )}
              <Button onClick={handleSaveAuthLogo} disabled={isLoading}>
                Save Auth Logo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Favicon
              </CardTitle>
              <CardDescription>
                Set the website favicon (browser tab icon)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="https://example.com/favicon.png"
                />
              </div>
              {favicon && (
                <div className="border rounded p-4 flex items-center justify-center bg-gray-50">
                  <img 
                    src={favicon} 
                    alt="Favicon Preview" 
                    className="h-8 max-w-full object-contain" 
                  />
                </div>
              )}
              <Button onClick={handleSaveFavicon} disabled={isLoading}>
                Save Favicon
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Note: For best results, use a PNG image with dimensions 32x32 or 64x64 pixels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Sidebar Color
              </CardTitle>
              <CardDescription>
                Set the background color of the sidebar navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sidebarColor">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="sidebarColor"
                    type="color"
                    value={sidebarColor}
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={sidebarColor}
                    onChange={(e) => setSidebarColor(e.target.value)}
                    placeholder="#004743"
                    className="flex-1"
                  />
                </div>
              </div>
              <div 
                className="border rounded h-20 flex items-center justify-center text-white"
                style={{ backgroundColor: sidebarColor }}
              >
                Preview
              </div>
              <Button onClick={handleSaveSidebarColor} disabled={isLoading}>
                Save Sidebar Color
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                Accent Color
              </CardTitle>
              <CardDescription>
                Set the main accent color used throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accentColor">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#f3f3f3"
                    className="flex-1"
                  />
                </div>
              </div>
              <div 
                className="border rounded h-20 flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                Accent Preview
              </div>
              <Button onClick={handleSaveAccentColor} disabled={isLoading}>
                Save Accent Color
              </Button>
            </CardContent>
          </Card>

          {/* Button Customization Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Button Customization
              </CardTitle>
              <CardDescription>
                Customize the appearance of buttons throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor">Button Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonColor"
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        placeholder="#004743"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Button Text Color</Label>
                    <div className="flex items-center gap-4">
                      <Toggle
                        className={`bg-black text-white border-2 ${buttonTextColor === "#000000" ? "ring-2 ring-offset-2" : ""}`}
                        onClick={() => setButtonTextColorValue("#000000")}
                        pressed={buttonTextColor === "#000000"}
                      >
                        Black
                      </Toggle>
                      <Toggle
                        className={`bg-white text-black border-2 ${buttonTextColor === "#FFFFFF" ? "ring-2 ring-offset-2" : ""}`}
                        onClick={() => setButtonTextColorValue("#FFFFFF")}
                        pressed={buttonTextColor === "#FFFFFF"}
                      >
                        White
                      </Toggle>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Input
                          type="color"
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColorValue(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColorValue(e.target.value)}
                          placeholder="#FFFFFF"
                          className="w-28"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveButtonColor} disabled={isLoading}>
                        Save Button Color
                      </Button>
                      <Button onClick={handleSaveButtonTextColor} disabled={isLoading} variant="outline">
                        Save Text Color
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-6 flex flex-col items-center justify-center space-y-4 bg-gray-50">
                  <h3 className="text-lg font-medium">Button Preview</h3>
                  <div
                    className="p-4 rounded flex items-center justify-center"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    Primary Button
                  </div>
                  <div className="space-y-4 w-full">
                    <button
                      className="w-full py-2 px-4 rounded flex items-center justify-center"
                      style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    >
                      <span className="mr-2">Button with Icon</span>
                      <Sun className="h-4 w-4" />
                    </button>
                    
                    <button
                      className="w-full py-2 px-4 border-2 rounded flex items-center justify-center"
                      style={{ backgroundColor: "transparent", color: buttonColor, borderColor: buttonColor }}
                    >
                      Outline Button
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
