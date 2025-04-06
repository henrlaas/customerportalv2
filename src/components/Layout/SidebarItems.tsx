
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Building, 
  FileText, 
  BarChart, 
  Users,
  Settings
} from "lucide-react";

export function getSidebarItems() {
  const t = useTranslation();
  const { isAdmin, isEmployee } = useAuth();

  const items = [
    {
      title: t('Dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee', 'client'],
    },
    {
      title: t('Tasks'),
      href: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'employee', 'client'],
    },
    {
      title: t('Time Tracking'),
      href: '/time-tracking',
      icon: Clock,
      roles: ['admin', 'employee'],
    },
    {
      title: t('Companies'),
      href: '/companies',
      icon: Building,
      roles: ['admin', 'employee'],
    },
    {
      title: t('Contracts'),
      href: '/contracts',
      icon: FileText,
      roles: ['admin', 'employee', 'client'],
    },
    {
      title: t('Deals'),
      href: '/deals',
      icon: BarChart,
      roles: ['admin', 'employee'],
    },
    {
      title: t('User Management'),
      href: '/user-management',
      icon: Users,
      roles: ['admin'],
    },
    {
      title: t('Settings'),
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'employee', 'client'],
    },
  ];

  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (isAdmin) return item.roles.includes('admin');
    if (isEmployee) return item.roles.includes('employee');
    return item.roles.includes('client');
  });

  return filteredItems;
}
