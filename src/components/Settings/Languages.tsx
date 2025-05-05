
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

export const Languages = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState(profile?.language || 'en');

  const languageMutation = useMutation({
    mutationFn: async (lang: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({ language: lang } as any)
        .eq('id', user.id as any);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Language updated',
        description: 'Your language preference has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating language',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    languageMutation.mutate(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="language" className="flex items-center mb-2">
          <Globe className="h-4 w-4 mr-2 text-[#004743]" />
          Language
        </Label>
        <Select
          value={language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger id="language" className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent className="[&_[data-radix-select-item]]:hover:bg-gray-100 rounded-xl shadow-md border-0">
            <SelectItem value="en" className="flex items-center gap-2">
              <span className="text-lg mr-1">🇺🇸</span>
              English
            </SelectItem>
            <SelectItem value="es" className="flex items-center gap-2">
              <span className="text-lg mr-1">🇪🇸</span>
              Español
            </SelectItem>
            <SelectItem value="fr" className="flex items-center gap-2">
              <span className="text-lg mr-1">🇫🇷</span>
              Français
            </SelectItem>
            <SelectItem value="de" className="flex items-center gap-2">
              <span className="text-lg mr-1">🇩🇪</span>
              Deutsch
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Languages;
