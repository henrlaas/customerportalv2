
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
  Sliders,
  BookOpen,
} from "lucide-react";

export function getSidebarItems() {
  const t = useTranslation();
  const { isAdmin, isEmployee } = useAuth();
  
  // Group items by section
  const marketingSection = {
    title: t('MARKETING'),
    items: [
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
        title: t('Orders'),
        href: '/tasks',
        icon: CheckSquare,
        roles: ['admin', 'employee', 'client'],
      },
      {
        title: t('Tracking'),
        href: '/time-tracking',
        icon: Clock,
        roles: ['admin', 'employee'],
      },
      {
        title: t('Companies'),
        href: '/companies',
        icon: Users,
        roles: ['admin', 'employee'],
      },
      {
        title: t('Discounts'),
        href: '/deals',
        icon: BarChart,
        roles: ['admin', 'employee'],
      }
    ]
  };
  
  const paymentsSection = {
    title: t('PAYMENTS'),
    items: [
      {
        title: t('Ledger'),
        href: '/contracts',
        icon: FileText,
        roles: ['admin', 'employee', 'client'],
      },
      {
        title: t('Taxes'),
        href: '/finance',
        icon: DollarSign,
        roles: ['admin', 'employee'],
      }
    ]
  };
  
  const systemSection = {
    title: t('SYSTEM'),
    items: [
      {
        title: t('Workspace Management'),
        href: '/workspace-management',
        icon: Sliders,
        roles: ['admin'],
      },
      {
        title: t('Media'),
        href: '/media',
        icon: FolderArchive,
        roles: ['admin', 'employee', 'client'],
      }
    ]
  };
  
  // Filter sections and items based on user role
  const filterItems = (section) => {
    const filteredItems = section.items.filter(item => {
      if (isAdmin) return item.roles.includes('admin');
      if (isEmployee) return item.roles.includes('employee');
      return item.roles.includes('client');
    });
    
    return { ...section, items: filteredItems };
  };
  
  const filteredSections = [
    filterItems(marketingSection),
    filterItems(paymentsSection),
    filterItems(systemSection)
  ].filter(section => section.items.length > 0);
  
  return filteredSections;
}
