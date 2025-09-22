import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/dashboard',
      icon: (isActive: boolean) => (
        <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      id: 'workouts',
      label: 'Workouts',
      path: '/workouts',
      icon: (isActive: boolean) => (
        <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
        </svg>
      )
    },
    {
      id: 'progress',
      label: 'Progress',
      path: '/progress',
      icon: (isActive: boolean) => (
        <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      )
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      path: '/nutrition',
      icon: (isActive: boolean) => (
        <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97L6.5 22h3l-.25-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5l1.5 6h2l-1.5-6H22V6h-6z"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: (isActive: boolean) => (
        <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon(isActive)}
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavbar;