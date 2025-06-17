
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  FolderArchive, 
  DollarSign,
  Sliders,
  BookOpen,
  Clock,
  FileText,
  CheckSquare,
  Tag,
  FileClock,
  Building,
  Home,
  Calendar,
  BarChart3,
} from "lucide-react";

export function getSidebarItems() {
  const t = useTranslation();
  const { isAdmin, isEmployee, isClient } = useAuth();

  const items = [
    // MENU category items
    {
      title: t('Dashboard'),
      href: isClient ? '/client' : '/dashboard',
      icon: isClient ? Home : LayoutDashboard,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Calendar'),
      href: '/calendar',
      icon: Calendar,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Analytics'),
      href: '/analytics',
      icon: BarChart3,
      roles: ['admin'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Companies'),
      href: '/companies',
      icon: Building,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Campaigns'),
      href: '/campaigns',
      icon: BookOpen,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Tasks'),
      href: isClient ? '/client/tasks' : '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Deals'),
      href: '/deals',
      icon: Tag,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Time Tracking'),
      href: '/time-tracking',
      icon: Clock,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Contracts'),
      href: isClient ? '/client/contracts' : '/contracts',
      icon: FileText,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Projects'),
      href: '/projects',
      icon: FileClock,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Media'),
      href: '/media',
      icon: FolderArchive,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Finance'),
      href: '/finance',
      icon: DollarSign,
      roles: ['admin'],
      category: 'MENU',
      hasDropdown: false,
      disabled: true,
      tooltip: "This is not available yet"
    },
    {
      title: t('Management'),
      href: '/workspace',
      icon: Sliders,
      roles: ['admin'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
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
