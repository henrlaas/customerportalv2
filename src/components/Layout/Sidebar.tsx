
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Marketing Portal</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  location.pathname === item.href && "bg-gray-100 text-gray-900 font-medium"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
