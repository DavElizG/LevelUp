import { useSystemStats } from '../../hooks/admin/useAdmin';
import { Users, Activity, TrendingUp, Dumbbell } from 'lucide-react';

export function AdminDashboard() {
  const { data: stats, isLoading } = useSystemStats();

  if (isLoading || !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {new Array(4).fill(0).map((_, i) => (
              <div key={`loading-${String(i)}`} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Usuarios',
      value: stats.total_users,
      icon: Users,
      subtitle: `${stats.new_users_last_7_days} nuevos esta semana`,
      color: 'bg-blue-500',
    },
    {
      title: 'Usuarios Activos (30d)',
      value: stats.active_users_last_30_days,
      icon: TrendingUp,
      subtitle: `${stats.active_users_last_7_days} en los últimos 7 días`,
      color: 'bg-green-500',
    },
    {
      title: 'Rutinas Totales',
      value: stats.total_routines,
      icon: Dumbbell,
      subtitle: `${stats.public_routines} públicas`,
      color: 'bg-purple-500',
    },
    {
      title: 'Sesiones Completadas',
      value: stats.total_workout_sessions,
      icon: Activity,
      subtitle: 'Total histórico',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema LevelUp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Sistema</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Ejercicios:</span>
              <span className="font-semibold">{stats.total_exercises}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Alimentos:</span>
              <span className="font-semibold">{stats.total_foods}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Planes de Dieta:</span>
              <span className="font-semibold">{stats.total_diet_plans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Generaciones IA (30d):</span>
              <span className="font-semibold">{stats.ai_generations_last_30_days}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nuevos usuarios (7d):</span>
              <span className="font-semibold text-green-600">+{stats.new_users_last_7_days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nuevos usuarios (30d):</span>
              <span className="font-semibold text-green-600">+{stats.new_users_last_30_days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rutinas Privadas:</span>
              <span className="font-semibold">{stats.private_routines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rutinas Públicas:</span>
              <span className="font-semibold">{stats.public_routines}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
