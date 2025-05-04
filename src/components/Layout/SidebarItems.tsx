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
  MessageSquare,
  Mail,
  Receipt,
  LineChart,
  LayoutGrid,
  KeyRound
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
      hasDropdown: false
    },
    {
      title: t('Calendar'),
      href: '/calendar',
      icon: Clock,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: false
    },
    {
      title: t('User Profile'),
      href: '/profile',
      icon: Users,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: false
    },
    {
      title: t('Tasks'),
      href: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: true
    },
    {
      title: t('Forms'),
      href: '/forms',
      icon: FileText,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: true
    },
    {
      title: t('Tables'),
      href: '/tables',
      icon: LayoutGrid,
      roles: ['admin', 'employee'],
      category: 'MENU',
      hasDropdown: true
    },
    {
      title: t('Pages'),
      href: '/pages',
      icon: FolderArchive,
      roles: ['admin', 'employee', 'client'],
      category: 'MENU',
      hasDropdown: true
    },

    // SUPPORT category items
    {
      title: t('Chat'),
      href: '/chat',
      icon: MessageSquare,
      roles: ['admin', 'employee', 'client'],
      category: 'SUPPORT',
      hasDropdown: false
    },
    {
      title: t('Email'),
      href: '/email',
      icon: Mail,
      roles: ['admin', 'employee', 'client'],
      category: 'SUPPORT',
      hasDropdown: true
    },
    {
      title: t('Invoice'),
      href: '/invoice',
      icon: Receipt,
      roles: ['admin', 'employee'],
      category: 'SUPPORT',
      hasDropdown: false
    },

    // OTHERS category items
    {
      title: t('Charts'),
      href: '/charts',
      icon: LineChart,
      roles: ['admin', 'employee'],
      category: 'OTHERS',
      hasDropdown: true
    },
    {
      title: t('UI Elements'),
      href: '/ui-elements',
      icon: Sliders,
      roles: ['admin'],
      category: 'OTHERS',
      hasDropdown: true
    },
    {
      title: t('Authentication'),
      href: '/authentication',
      icon: KeyRound,
      roles: ['admin'],
      category: 'OTHERS',
      hasDropdown: true
    },

    // Original items - keeping them but not showing directly
    {
      title: t('Campaigns'),
      href: '/campaigns',
      icon: BookOpen,
      roles: ['admin', 'employee', 'client'],
      hasDropdown: false
    },
    {
      title: t('Time Tracking'),
      href: '/time-tracking',
      icon: Clock,
      roles: ['admin', 'employee'],
      hasDropdown: false
    },
    {
      title: t('Companies'),
      href: '/companies',
      icon: Users,
      roles: ['admin', 'employee'],
      hasDropdown: false
    },
    {
      title: t('Deals'),
      href: '/deals',
      icon: BarChart,
      roles: ['admin', 'employee'],
      hasDropdown: false
    },
    {
      title: t('Contracts'),
      href: '/contracts',
      icon: FileText,
      roles: ['admin', 'employee', 'client'],
      hasDropdown: false
    },
    {
      title: t('Media'),
      href: '/media',
      icon: FolderArchive,
      roles: ['admin', 'employee', 'client'],
      hasDropdown: false
    },
    {
      title: t('Finance'),
      href: '/finance',
      icon: DollarSign,
      roles: ['admin', 'employee'],
      hasDropdown: false
    },
    {
      title: t('Workspace Management'),
      href: '/workspace-management',
      icon: Sliders,
      roles: ['admin'],
      hasDropdown: false
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
