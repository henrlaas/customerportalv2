import React, { useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import Logo from './Logo';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <aside
      ref={sidebar}
      className="absolute left-0 top-0 z-50 h-screen w-72 border-r border-stroke bg-white dark:border-strokedark dark:bg-boxdark lg:static"
    >
      {/* Sidebar header */}
      <div className="flex h-[84px] items-center justify-between gap-2 border-b border-stroke px-6 py-6 dark:border-strokedark">
        <Logo />
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden block"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* Sidebar menu */}
      <div className="no-scrollbar flex flex-col overflow-y-auto px-4 py-6">
        <nav className="mb-6">
          <ul className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`sidebar-menu-item ${
                    location.pathname === item.href
                      ? 'sidebar-menu-item-active'
                      : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Settings at bottom */}
        <div className="mt-auto pt-4 border-t border-stroke dark:border-strokedark">
          <Link
            to="/settings"
            className={`sidebar-menu-item ${
              location.pathname === '/settings'
                ? 'sidebar-menu-item-active'
                : ''
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.325 13.4625C20.0312 14.3147 19.9189 15.2145 19.995 16.1085C20.0712 17.0025 20.3337 17.8723 20.7675 18.6675C20.925 18.975 20.9875 19.3575 20.925 19.725C20.8625 20.0925 20.7 20.4225 20.4375 20.6775C19.6387 21.4763 18.6851 22.0667 17.6416 22.4015C16.5981 22.7363 15.4956 22.8076 14.4225 22.6025C13.4821 22.4193 12.5799 22.0519 11.7675 21.525C10.9551 20.9981 10.2465 20.3202 9.675 19.5375"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
