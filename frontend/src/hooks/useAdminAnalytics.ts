import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export interface AdminOverview {
  usersByRole: { student: number; instructor: number; director_tfm: number; admin: number }
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  avgCompletionRate: number
  courses: Array<{
    id: string
    slug: string
    title: string
    kind: string
    published: boolean
    enrolled: number
    avgProgress: number
  }>
}

export function useAdminOverview() {
  return useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const response = await api.get<AdminOverview>('/admin/analytics/overview')
      return response.data
    },
  })
}
