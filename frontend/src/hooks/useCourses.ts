import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export interface Course {
  id: string
  title: string
  description: string
  imageUrl?: string
  published: boolean
  instructorId?: string
  modules?: any[]
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get<Course[]>('/courses')
      return response.data
    },
  })
}

export function useCourse(courseId: string) {
  return useQuery<any>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseId}`)
      return response.data
    },
    enabled: !!courseId,
  })
}

export interface ProgressSummary {
  userId: string
  totalCourses: number
  averageProgress: number
  courses: Record<string, { courseId: string; completed: number; total: number; percentage: number }>
}

export function useProgress() {
  return useQuery<ProgressSummary>({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get<ProgressSummary>('/progress')
      return response.data
    },
  })
}
