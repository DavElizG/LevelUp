import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Apple, X, TrendingUp, Award, Target } from 'lucide-react';
import { AdminService } from '../../services/admin';
import type { Food, FoodFilters } from '../../types/admin.types';

interface FoodDetailsDialogProps {
  food: Food | null;
  onClose: () => void;
}

function FoodDetailsDialog({ food, onClose }: FoodDetailsDialogProps) {
  if (!food) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles del Alimento</h3>
            {food.is_common && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                Común
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Food Info */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{food.name}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Categoría: {food.category}</p>
          </div>

          {/* Nutritional Info - per 100g */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">
              Información Nutricional (por 100g)
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-900 dark:text-orange-300 mb-1">Calorías</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                  {food.calories_per_100g}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-400">kcal</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300 mb-1">Proteínas</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {food.protein_per_100g}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">g</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-300 mb-1">Carbohidratos</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                  {food.carbs_per_100g}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">g</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-sm text-purple-900 dark:text-purple-300 mb-1">Grasas</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                  {food.fat_per_100g}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400">g</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-300 mb-1">Fibra</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {food.fiber_per_100g}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">g</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uso en Dietas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {food.usage_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">veces</p>
              </div>
            </div>
          </div>

          {/* Macros Distribution */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Distribución de Macronutrientes</h5>
            <div className="space-y-2">
              {(() => {
                const totalMacros = food.protein_per_100g + food.carbs_per_100g + food.fat_per_100g;
                const proteinPct = ((food.protein_per_100g / totalMacros) * 100).toFixed(1);
                const carbsPct = ((food.carbs_per_100g / totalMacros) * 100).toFixed(1);
                const fatPct = ((food.fat_per_100g / totalMacros) * 100).toFixed(1);

                return (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Proteínas</span>
                        <span className="text-gray-900 dark:text-white">{proteinPct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${proteinPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Carbohidratos</span>
                        <span className="text-gray-900 dark:text-white">{carbsPct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${carbsPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Grasas</span>
                        <span className="text-gray-900 dark:text-white">{fatPct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${fatPct}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FoodManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const adminService = new AdminService();

  // Fetch foods stats
  const { data: stats } = useQuery({
    queryKey: ['admin', 'foods', 'stats'],
    queryFn: () => adminService.getFoodsStats(),
  });

  // Fetch foods with filters
  const filters: FoodFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
      limit: 100,
      offset: 0,
    }),
    [searchTerm, categoryFilter]
  );

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['admin', 'foods', filters],
    queryFn: () => adminService.getFoods(filters),
  });

  const categories = useMemo(() => {
    if (!stats?.categories) return [];
    return Object.keys(stats.categories);
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Alimentos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Administra el catálogo de {stats?.total || 0} alimentos disponibles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alimentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total || 0}</p>
            </div>
            <Apple className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alimentos Comunes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.common_count || 0}</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
            </div>
            <Filter className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Más Usado</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 truncate">
                {stats?.most_used?.name || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stats?.most_used?.usage_count || 0} usos
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({stats?.categories[cat] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Alimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Calorías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Proteínas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Carbohidratos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grasas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Cargando alimentos...
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron alimentos
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <tr
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {food.name}
                        </div>
                        {food.is_common && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Común
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {food.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {food.calories_per_100g} kcal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {food.protein_per_100g}g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {food.carbs_per_100g}g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {food.fat_per_100g}g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Target className="w-4 h-4 mr-1 text-gray-400" />
                        {food.usage_count}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Food Details Dialog */}
      <FoodDetailsDialog food={selectedFood} onClose={() => setSelectedFood(null)} />
    </div>
  );
}
