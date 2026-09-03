import { useQuery } from 'react-query'
import { api } from '../services/api'

export interface Course {
  id: string
  title: string
  description: string
  imageUrl?: string
  published: boolean
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

export function useCourses() {
  return useQuery<Course[]>('courses', async () => {
    const response = await api.get<Course[]>('/courses')
    return response.data
  })
}

export function useCourse(courseId: string) {
  return useQuery(['course', courseId], async () => {
    const response = await api.get(`/courses/${courseId}`)
    return response.data
  }, {
    enabled: !!courseId
  })
}

export function useProgress() {
  return useQuery('progress', async () => {
    const response = await api.get('/progress')
    return response.data
  })
}
