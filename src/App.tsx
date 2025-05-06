import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import TasksPage from './pages/TasksPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import MediaPage from './pages/MediaPage';
import CompaniesPage from './pages/CompaniesPage';
import CampaignsPage from './pages/CampaignsPage';
import DashboardPage from './pages/DashboardPage';
import DealsPage from './pages/DealsPage';
import EmployeesPage from './pages/EmployeesPage';
import ExpensesPage from './pages/ExpensesPage';
import InvoicesPage from './pages/InvoicesPage';
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { CommandDialog, CommandProvider } from "@/components/command"
import { TaskDetailSheet } from './components/Tasks/TaskDetailSheet';

const App: React.FC = () => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const closeTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <AuthProvider>
      <CommandProvider>
        <Router>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-y-auto p-4">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><TasksPage openTaskDetail={openTaskDetail} /></ProtectedRoute>} />
                <Route path="/time-tracking" element={<ProtectedRoute><TimeTrackingPage /></ProtectedRoute>} />
                <Route path="/media" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
                <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
                <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
                <Route path="/deals" element={<ProtectedRoute><DealsPage /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
              </Routes>
            </div>
          </div>
          {selectedTaskId && (
            <TaskDetailSheet 
              taskId={selectedTaskId} 
            />
          )}
        </Router>
      </CommandProvider>
    </AuthProvider>
  );
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <Link to="/" className="text-lg font-semibold">Magic Wand</Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xs p-0">
            <div className="py-4">
              <SheetHeader className="px-4 pb-4">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the app.
                </SheetDescription>
              </SheetHeader>
              <SidebarContentMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="p-4">
        <SidebarContent />
      </div>
      <div className="sticky bottom-0 w-full border-t border-gray-200 bg-white p-4 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="text-sm line-clamp-1">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const SidebarContent: React.FC = () => (
  <nav className="space-y-2">
    <SidebarLink to="/" label="Dashboard" />
    <SidebarLink to="/tasks" label="Tasks" />
    <SidebarLink to="/time-tracking" label="Time Tracking" />
    <SidebarLink to="/media" label="Media" />
    <SidebarLink to="/companies" label="Companies" />
    <SidebarLink to="/campaigns" label="Campaigns" />
    <SidebarLink to="/deals" label="Deals" />
    <SidebarLink to="/employees" label="Employees" />
    <SidebarLink to="/expenses" label="Expenses" />
    <SidebarLink to="/invoices" label="Invoices" />
  </nav>
);

const SidebarContentMobile: React.FC = () => (
  <nav className="space-y-2 px-4">
    <SidebarLinkMobile to="/" label="Dashboard" />
    <SidebarLinkMobile to="/tasks" label="Tasks" />
    <SidebarLinkMobile to="/time-tracking" label="Time Tracking" />
    <SidebarLinkMobile to="/media" label="Media" />
    <SidebarLinkMobile to="/companies" label="Companies" />
    <SidebarLinkMobile to="/campaigns" label="Campaigns" />
    <SidebarLinkMobile to="/deals" label="Deals" />
    <SidebarLinkMobile to="/employees" label="Employees" />
    <SidebarLinkMobile to="/expenses" label="Expenses" />
    <SidebarLinkMobile to="/invoices" label="Invoices" />
  </nav>
);

interface SidebarLinkProps {
  to: string;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, label }) => (
  <Link to={to} className="block px-4 py-2 rounded hover:bg-gray-200 transition-colors">
    {label}
  </Link>
);

const SidebarLinkMobile: React.FC<SidebarLinkProps> = ({ to, label }) => (
  <SheetClose asChild>
    <Link to={to} className="block px-4 py-2 rounded hover:bg-gray-200 transition-colors">
      {label}
    </Link>
  </SheetClose>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default App;
