
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
} from "lucide-react";

export function getSidebarItems() {
  const t = useTranslation();
  const { isAdmin, isEmployee } = useAuth();

  const items = [
    // MENU category items
    {
      title: t('Dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee', 'client'],
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
      href: '/tasks',
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
      title: t('Companies'),
      href: '/companies',
      icon: Users,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: false,
      disabled: false,
      tooltip: null
    },
    {
      title: t('Contracts'),
      href: '/contracts',
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
      roles: ['admin', 'employee'],
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
