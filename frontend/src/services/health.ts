import type { HealthResponse } from '../types/api'
import { apiGet } from './apiClient'

export function getHealth(signal?: AbortSignal) {
  return apiGet<HealthResponse>('/health', signal)
}
