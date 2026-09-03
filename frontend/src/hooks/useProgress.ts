import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useMarkResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { resourceId: string; completed: boolean }) => {
      const res = await api.post('/progress', vars)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['course'] })
      qc.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
