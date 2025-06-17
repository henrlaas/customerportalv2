
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ThemedMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  theme: 'blue' | 'emerald' | 'purple' | 'orange' | 'teal' | 'rose' | 'indigo' | 'amber';
  className?: string;
}

const themeStyles = {
  blue: {
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    bg: 'bg-blue-50/50'
  },
  emerald: {
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    bg: 'bg-emerald-50/50'
  },
  purple: {
    border: 'border-purple-200',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-700',
    bg: 'bg-purple-50/50'
  },
  orange: {
    border: 'border-orange-200',
    iconColor: 'text-orange-600',
    valueColor: 'text-orange-700',
    bg: 'bg-orange-50/50'
  },
  teal: {
    border: 'border-teal-200',
    iconColor: 'text-teal-600',
    valueColor: 'text-teal-700',
    bg: 'bg-teal-50/50'
  },
  rose: {
    border: 'border-rose-200',
    iconColor: 'text-rose-600',
    valueColor: 'text-rose-700',
    bg: 'bg-rose-50/50'
  },
  indigo: {
    border: 'border-indigo-200',
    iconColor: 'text-indigo-600',
    valueColor: 'text-indigo-700',
    bg: 'bg-indigo-50/50'
  },
  amber: {
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
    bg: 'bg-amber-50/50'
  }
};

export const ThemedMetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  theme,
  className = "" 
}: ThemedMetricCardProps) => {
  const styles = themeStyles[theme];
  
  return (
    <Card className={`${styles.border} ${styles.bg} hover:scale-105 transition-transform duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${styles.iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${styles.valueColor}`}>{value}</div>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
