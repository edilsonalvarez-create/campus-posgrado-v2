import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export interface ProgramAsignatura {
  id: string
  slug: string
  title: string
  description: string
  track: string
  programOrder: number
  prerequisiteSlug: string | null
  officialCode: string | null
  contenidos: string[]
  progress: { completed: number; total: number; percentage: number }
  locked: boolean
}

export interface ProgramTrack {
  key: string
  label: string
  asignaturas: ProgramAsignatura[]
  progress: { completed: number; total: number; percentage: number }
  completed: boolean
}

export interface Program {
  slug: string
  title: string
  tracks: ProgramTrack[]
  progress: { completed: number; total: number; percentage: number }
}

export function useProgram(slug: string) {
  return useQuery<Program>({
    queryKey: ['program', slug],
    queryFn: async () => {
      const res = await api.get<Program>(`/programs/${slug}`)
      return res.data
    },
    enabled: !!slug,
  })
}
