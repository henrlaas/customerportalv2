import {
  BarChart3,
  Building,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  Home,
  Image,
  LineChart,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export function SidebarItems() {
  const { isAdmin, isEmployee, isClient } = useAuth();
  
  const route = window.location.pathname;
  const navigate = useNavigate();

  const adminEmployeeLinks = useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home />,
    },
    {
      title: 'Companies',
      href: '/companies',
      icon: <Building />,
    },
    {
      title: 'Deals',
      href: '/deals',
      icon: <LineChart />,
    },
    {
      title: 'Tasks',
      href: '/tasks',
      icon: <CheckSquare />,
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: <FolderKanban />,
    },
    {
      title: 'Campaigns',
      href: '/campaigns',
      icon: <BarChart3 />,
    },
    {
      title: 'Time Tracking',
      href: '/time-tracking',
      icon: <Clock />,
    },
    {
      title: 'Finance',
      href: '/finance',
      icon: <Wallet />,
    },
    {
      title: 'Contracts',
      href: '/contracts',
      icon: <FileText />,
    },
    {
      title: 'Media',
      href: '/media',
      icon: <Image />,
    },
  ], []);

  const clientLinks = useMemo(() => [
    {
      title: 'Dashboard',
      href: '/client-dashboard',
      icon: <Home />,
    },
    {
      title: 'Company Details',
      href: '/client-company',
      icon: <Building />,
    },
  ], []);

  const settingsLink = useMemo(() => [
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings />,
    },
  ], []);

  const workspaceManagementLink = useMemo(() => [
    {
      title: 'Workspace Management',
      href: '/workspace-management',
      icon: <User />,
    },
    {
      title: 'User Management',
      href: '/users',
      icon: <User />,
    },
  ], []);

  return (
    <div className="flex flex-col space-y-4">
      {(isAdmin || isEmployee) && (
        <>
          {adminEmployeeLinks.map((link) => (
            <Button
              variant="ghost"
              className="justify-start"
              key={link.href}
              onClick={() => navigate(link.href)}
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.title}</span>
            </Button>
          ))}
          {(isAdmin) && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="workspace">
                <AccordionTrigger>Workspace</AccordionTrigger>
                <AccordionContent>
                  {workspaceManagementLink.map((link) => (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      key={link.href}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      <span>{link.title}</span>
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </>
      )}
      {isClient && (
        <>
          {clientLinks.map((link) => (
            <Button
              variant="ghost"
              className="justify-start"
              key={link.href}
              onClick={() => navigate(link.href)}
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.title}</span>
            </Button>
          ))}
        </>
      )}
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => navigate('/settings')}
      >
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </Button>
    </div>
  );
}
