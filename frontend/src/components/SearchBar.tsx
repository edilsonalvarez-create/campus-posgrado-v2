import { useState, useMemo } from 'react';
import { useCourses } from '../hooks/useCourses';

interface SearchBarProps {
  onFilter?: (courses: any[]) => void;
}

export function SearchBar({ onFilter }: SearchBarProps) {
  const { data: allCourses = [] } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent');
  const [filterProgress, setFilterProgress] = useState<'all' | 'active' | 'completed'>('all');

  const filteredCourses = useMemo(() => {
    let results = allCourses.filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgress =
        filterProgress === 'all' ||
        (filterProgress === 'active' && course.progress.percentage < 100) ||
        (filterProgress === 'completed' && course.progress.percentage === 100);

      return matchesSearch && matchesProgress;
    });

    // Sort
    if (sortBy === 'progress') {
      results = results.sort((a: any, b: any) => b.progress.percentage - a.progress.percentage);
    }

    return results;
  }, [allCourses, searchTerm, sortBy, filterProgress]);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4 flex-col md:flex-row">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar cursos..."
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
      {searchTerm && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
