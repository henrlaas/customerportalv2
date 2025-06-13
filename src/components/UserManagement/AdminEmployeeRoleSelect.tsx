
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminEmployeeRoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function AdminEmployeeRoleSelect({ value, onValueChange }: AdminEmployeeRoleSelectProps) {
  const t = useTranslation();
  
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">{t('Admin')}</SelectItem>
        <SelectItem value="employee">{t('Employee')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
