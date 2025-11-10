import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Activity, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  Dumbbell,
  Apple
} from 'lucide-react';
import { useAdminAccess } from '../../hooks/admin/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../app/providers/useTheme';

export function AdminLayout() {
  const { data: isAdmin, isLoading } = useAdminAccess();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
    { to: '/admin/roles', icon: Shield, label: 'Roles' },
    { to: '/admin/routines', icon: Activity, label: 'Rutinas' },
    { to: '/admin/exercises', icon: Dumbbell, label: 'Ejercicios' },
    { to: '/admin/foods', icon: Apple, label: 'Alimentos' },
    { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">LevelUp Gym</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Modo Oscuro</span>
              </>
            )}
          </button>

          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Volver al App</span>
          </NavLink>
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
