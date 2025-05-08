
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Image, Palette, Sun, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { workspaceService } from "@/services/workspaceService";

export const AppearanceTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Box Workspace");
  const [sidebarLogo, setSidebarLogo] = useState("");
  const [authLogo, setAuthLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [sidebarColor, setSidebarColor] = useState("#004743");
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
        
        if (titleSetting) setTitle(titleSetting.setting_value);
        if (sidebarLogoSetting) setSidebarLogo(sidebarLogoSetting.setting_value);
        if (authLogoSetting) setAuthLogo(authLogoSetting.setting_value);
        if (faviconSetting) setFavicon(faviconSetting.setting_value);
        if (sidebarColorSetting) setSidebarColor(sidebarColorSetting.setting_value);
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
        </div>
      )}
    </div>
  );
};
