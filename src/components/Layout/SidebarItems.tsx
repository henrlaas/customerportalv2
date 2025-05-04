import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Users, 
  FileText, 
  BarChart, 
  FolderArchive, 
  DollarSign,
  Settings,
  BookOpen,
  Sliders,
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
      title: t('Campaigns'),
      href: '/campaigns',
      icon: BookOpen,
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
      title: t('Companies'),  // Changed from 'Clients' to 'Companies'
      href: '/companies',
      icon: Users,
      roles: ['admin', 'employee'],
    },
    {
      title: t('Deals'),
      href: '/deals',
      icon: BarChart,
      roles: ['admin', 'employee'],
    },
    {
      title: t('Contracts'),
      href: '/contracts',
      icon: FileText,
      roles: ['admin', 'employee', 'client'],
    },
    {
      title: t('Media'),
      href: '/media',
      icon: FolderArchive,
      roles: ['admin', 'employee', 'client'],
    },
    {
      title: t('Finance'),
      href: '/finance',
      icon: DollarSign,
      roles: ['admin', 'employee'],
    },
    {
      title: t('Workspace Management'),
      href: '/workspace-management',
      icon: Sliders,
      roles: ['admin'],
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
