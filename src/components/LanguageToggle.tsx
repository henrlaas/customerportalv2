
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useAuth();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'no' : 'en');
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="text-sm font-medium"
    >
      {language === 'en' ? 'NO' : 'EN'}
    </Button>
  );
};
