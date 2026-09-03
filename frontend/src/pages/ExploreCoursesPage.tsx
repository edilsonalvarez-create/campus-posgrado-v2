import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';

export function ExploreCoursesPage() {
  const navigate = useNavigate();
  const { data: allCourses = [], isLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent');
  const [filterProgress, setFilterProgress] = useState<'all' | 'active' | 'completed'>('all');

  const displayCourses = allCourses
    .filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgress =
        filterProgress === 'all' ||
        (filterProgress === 'active' && course.progress.percentage < 100) ||
        (filterProgress === 'completed' && course.progress.percentage === 100);

      return matchesSearch && matchesProgress;
    })
    .sort((a: any, b: any) =>
      sortBy === 'progress' ? b.progress.percentage - a.progress.percentage : 0
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Volver al dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Explorar Cursos
        </h1>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar cursos por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Filter by Progress */}
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">En Progreso</option>
              <option value="completed">Completados</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recientes</option>
              <option value="progress">Por Progreso</option>
            </select>
          </div>

          {/* Results counter */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {displayCourses.length} curso{displayCourses.length !== 1 ? 's' : ''} encontrado{displayCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando cursos...</div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No se encontraron cursos con esos criterios</p>
            <p className="text-sm">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl}
                progress={course.progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
