import { useState } from 'react'
import { useCourses } from '../../hooks/useCourses'

const KIND_LABEL: Record<string, string> = {
  program: 'Programa',
  aula: 'Aula',
  library: 'Biblioteca',
  master: 'Máster',
  native: 'Curso nativo',
  course: 'Curso',
}

export function CourseMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { data: courses, isLoading } = useCourses()
  const [search, setSearch] = useState('')

  const filtered = (courses || []).filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Buscar curso o programa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 text-sm"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {selected.length} seleccionado{selected.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto p-1">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-2">Cargando cursos…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">Sin resultados.</p>
        ) : (
          filtered.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="rounded"
              />
              <span className="flex-1 text-gray-900 dark:text-white">{c.title}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{KIND_LABEL[c.kind || ''] || c.kind}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
