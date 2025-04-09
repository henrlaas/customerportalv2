
import { useState } from "react";
import { WorkspaceSetting } from "@/services/workspaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";

interface SettingItemProps {
  setting: WorkspaceSetting;
  onSave: (id: string, newValue: string) => Promise<void>;
}

export const SettingItem = ({ setting, onSave }: SettingItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(setting.setting_value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(setting.id, value);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSettingKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format display value to show kr for monetary values
  const formatDisplayValue = (key: string, value: string) => {
    // If the key indicates it's a rate or price value, format with kr
    if (key.includes('rate') || key.includes('price') || key.includes('cost')) {
      return `${value} kr`;
    }
    return value;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{formatSettingKey(setting.setting_key)}</h3>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => {
                  setValue(setting.setting_value);
                  setIsEditing(false);
                }}>
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <div className="text-xl font-semibold">{formatDisplayValue(setting.setting_key, setting.setting_value)}</div>
          ) : (
            <Input 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              className="w-full" 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
