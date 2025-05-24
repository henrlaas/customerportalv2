
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function LanguageSelect({ value, onValueChange }: LanguageSelectProps) {
  const t = useTranslation();
  
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <div className="flex items-center">
            <span className="text-lg mr-2">🇺🇸</span>
            <span>English</span>
          </div>
        </SelectItem>
        <SelectItem value="no">
          <div className="flex items-center">
            <span className="text-lg mr-2">🇳🇴</span>
            <span>Norwegian</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
