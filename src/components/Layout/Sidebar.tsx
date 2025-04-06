
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Calendar,
  Clock,
  File,
  Home,
  Settings,
  Users,
  Briefcase,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const Sidebar: React.FC = () => {
  const { isAdmin, isEmployee } = useAuth();
  const location = useLocation();
  const t = useTranslation();

  // Define navigation items with role-based access
  const navItems = [
    {
      name: t('Dashboard'),
      href: '/dashboard',
      icon: Home,
      roles: ['admin', 'employee', 'client'],
    },
    {
      name: t('Tasks'),
      href: '/tasks',
      icon: Calendar,
      roles: ['admin', 'employee', 'client'],
    },
    {
      name: t('Time Tracking'),
      href: '/time-tracking',
      icon: Clock,
      roles: ['admin', 'employee'],
    },
    {
      name: t('Companies'),
      href: '/companies',
      icon: Briefcase,
      roles: ['admin', 'employee'],
    },
    {
      name: t('Contracts'),
      href: '/contracts',
      icon: File,
      roles: ['admin', 'employee', 'client'],
    },
    {
      name: t('Deals'),
      href: '/deals',
      icon: BarChart,
      roles: ['admin', 'employee'],
    },
    {
      name: t('User Management'),
      href: '/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      name: t('Settings'),
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'employee', 'client'],
    },
  ];

  const userRole = isAdmin ? 'admin' : isEmployee ? 'employee' : 'client';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Marketing Portal</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  location.pathname === item.href && "bg-gray-100 text-gray-900 font-medium"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
