
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function UserRoleSelect({ value, onValueChange }: UserRoleSelectProps) {
  const t = useTranslation();
  
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">{t('Admin')}</SelectItem>
        <SelectItem value="employee">{t('Employee')}</SelectItem>
        <SelectItem value="client">{t('Client')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
