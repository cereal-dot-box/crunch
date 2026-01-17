import { checkStatus } from '../server/auth'

export const authQuery = {
  queryKey: ['auth'] as const,
  queryFn: checkStatus,
  staleTime: 5 * 60 * 1000, // 5 minutes - cache auth on client
  gcTime: 5 * 60 * 1000,
  retry: false,
}
