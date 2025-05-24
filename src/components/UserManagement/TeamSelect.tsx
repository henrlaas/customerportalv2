
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TeamSelect({ value, onValueChange }: TeamSelectProps) {
  const t = useTranslation();
  
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Executive Team">{t('Executive Team')}</SelectItem>
        <SelectItem value="Creative Team">{t('Creative Team')}</SelectItem>
        <SelectItem value="Client Services">{t('Client Services')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
