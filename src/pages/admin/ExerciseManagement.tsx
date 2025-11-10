import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Dumbbell, X, TrendingUp, Award, Target, Edit2, Save } from 'lucide-react';
import { AdminService } from '../../services/admin';
import type { Exercise, ExerciseFilters, ExerciseUpdateData } from '../../types/admin.types';

interface ExerciseEditDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (exerciseId: string, updates: ExerciseUpdateData) => void;
  isLoading: boolean;
}

function ExerciseEditDialog({ exercise, onClose, onSave, isLoading }: ExerciseEditDialogProps) {
  if (!exercise) return null;

  const [formData, setFormData] = useState({
    name: exercise.name,
    category: exercise.category,
    description: exercise.description || '',
    difficulty_level: exercise.difficulty_level,
    equipment: exercise.equipment || '',
    muscle_groups: exercise.muscle_groups.join(', '),
    video_url: exercise.video_url || '',
    thumbnail_url: exercise.thumbnail_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: ExerciseUpdateData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      difficulty_level: formData.difficulty_level,
      equipment: formData.equipment,
      muscle_groups: formData.muscle_groups.split(',').map(m => m.trim()).filter(Boolean),
      video_url: formData.video_url || undefined,
      thumbnail_url: formData.thumbnail_url || undefined,
    };

    onSave(exercise.id, updates);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Ejercicio</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Ejercicio *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Press de Banca"
            />
          </div>

          {/* Categoría y Dificultad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="Pecho">Pecho</option>
                <option value="Espalda">Espalda</option>
                <option value="Piernas">Piernas</option>
                <option value="Hombros">Hombros</option>
                <option value="Brazos">Brazos</option>
                <option value="Core">Core</option>
                <option value="Generado por IA">Generado por IA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dificultad *
              </label>
              <select
                required
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Equipamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipamiento
            </label>
            <input
              type="text"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Barra, Mancuernas, Bodyweight"
            />
          </div>

          {/* Grupos Musculares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grupos Musculares (separados por coma)
            </label>
            <input
              type="text"
              value={formData.muscle_groups}
              onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Pectorales, Tríceps, Deltoides"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Describe la ejecución del ejercicio..."
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL del Video/GIF
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://ejemplo.com/video.mp4 o .gif"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Soporta YouTube, Vimeo, archivos MP4, GIFs, etc.
            </p>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de la Imagen/Miniatura
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.thumbnail_url && (
              <div className="mt-2">
                <img
                  src={formData.thumbnail_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ExerciseDetailsDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
  onEdit: (exercise: Exercise) => void;
}

function ExerciseDetailsDialog({ exercise, onClose, onEdit }: ExerciseDetailsDialogProps) {
  if (!exercise) return null;

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles del Ejercicio</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(exercise);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Editar ejercicio"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Exercise Info */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{exercise.name}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{exercise.description || 'Sin descripción'}</p>
          </div>

          {/* Thumbnail/Video */}
          {exercise.thumbnail_url && (
            <div>
              <img
                src={exercise.thumbnail_url}
                alt={exercise.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoría</p>
              <p className="font-semibold text-gray-900 dark:text-white">{exercise.category}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dificultad</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{exercise.difficulty_level}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Equipamiento</p>
              <p className="font-semibold text-gray-900 dark:text-white">{exercise.equipment || 'No requerido'}</p>
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Grupos Musculares</p>
            <div className="flex flex-wrap gap-2">
              {exercise.muscle_groups.map((muscle, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-900 dark:text-green-300 mb-1">Uso en Rutinas</p>
            <p className="font-medium text-green-900 dark:text-green-200">{exercise.usage_count} veces</p>
          </div>

          {/* Video Link */}
          {exercise.video_url && (
            <div>
              <a
                href={exercise.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Ver video de demostración →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExerciseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const adminService = new AdminService();
  const queryClient = useQueryClient();

  // Mutation for updating exercise
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExerciseUpdateData }) =>
      adminService.updateExercise(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exercises'] });
      setEditingExercise(null);
    },
  });

  // Fetch exercises stats
  const { data: stats } = useQuery({
    queryKey: ['admin', 'exercises', 'stats'],
    queryFn: () => adminService.getExercisesStats(),
  });

  // Fetch exercises with filters
  const filters: ExerciseFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
      difficulty: difficultyFilter || undefined,
      limit: 100,
      offset: 0,
    }),
    [searchTerm, categoryFilter, difficultyFilter]
  );

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['admin', 'exercises', filters],
    queryFn: () => adminService.getExercises(filters),
  });

  const categories = useMemo(() => {
    if (!stats?.categories) return [];
    return Object.keys(stats.categories);
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Ejercicios</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Administra el catálogo de {stats?.total || 0} ejercicios disponibles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ejercicios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total || 0}</p>
            </div>
            <Dumbbell className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generados por IA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.ai_generated_count || 0}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
            </div>
            <Filter className="w-8 h-8 text-green-500" />
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
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas las dificultades</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
      </div>

      {/* Exercises Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ejercicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dificultad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grupos Musculares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Equipamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Cargando ejercicios...
                  </td>
                </tr>
              ) : exercises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron ejercicios
                  </td>
                </tr>
              ) : (
                exercises.map((exercise) => (
                  <tr
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {exercise.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        exercise.difficulty_level === 'beginner'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : exercise.difficulty_level === 'intermediate'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {exercise.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscle_groups.slice(0, 2).map((muscle, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {muscle}
                          </span>
                        ))}
                        {exercise.muscle_groups.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            +{exercise.muscle_groups.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {exercise.equipment || 'Sin equipamiento'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Target className="w-4 h-4 mr-1 text-gray-400" />
                        {exercise.usage_count}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exercise Details Dialog */}
      <ExerciseDetailsDialog
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onEdit={(exercise) => {
          setSelectedExercise(null);
          setEditingExercise(exercise);
        }}
      />

      {/* Exercise Edit Dialog */}
      <ExerciseEditDialog
        exercise={editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={(id, updates) => {
          updateMutation.mutate({ id, updates });
        }}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
