
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

export const Languages = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState(profile?.language || 'en');

  const languageMutation = useMutation({
    mutationFn: async (lang: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', user.id);
      
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
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger id="language" className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Languages;
