import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DocumentDuplicateIcon,
  Bars3Icon,
  XMarkIcon,
  ServerIcon,
  ShieldCheckIcon,
  ClipboardIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { 
    icon: <DocumentDuplicateIcon className="w-5 h-5" />, 
    label: "Template Generator",
    path: "/template"
  },
  { 
    icon: <QueueListIcon className="w-5 h-5" />, 
    label: "Batch Template",
    path: "/batch-template"
  },
  {
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    label: "Firewall Rules",
    path: "/firewall"
  },
  {
    icon: <ClipboardIcon className="w-5 h-5" />, 
    label: "Clone Template",
    path: "/clone-template"
  }
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <ServerIcon className="w-5 h-5 text-[#ec7211]" />
            <span className="text-base font-semibold text-gray-900">PVEQC</span>
          </Link>

          <div className="hidden sm:flex sm:items-center">
            {menuItems.map(({ icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`group relative flex h-14 items-center px-4 text-sm font-medium ${
                    isActive ? 'text-[#ec7211]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className={`mr-1.5 ${isActive ? 'text-[#ec7211]' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {icon}
                  </span>
                  {label}
                  {isActive && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#ec7211]" />}
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 scale-x-0 transition group-hover:scale-x-100" />
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-1.5 text-gray-500 hover:text-[#ec7211]"
          >
            {isMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          {menuItems.map(({ icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'text-[#ec7211] bg-orange-50/80 border-l border-[#ec7211]'
                    : 'text-gray-600 hover:text-[#ec7211] hover:bg-gray-50/80 hover:border-l hover:border-gray-200'
                }`}
              >
                <span className={`mr-2 ${isActive ? 'text-[#ec7211]' : 'text-gray-400'}`}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 