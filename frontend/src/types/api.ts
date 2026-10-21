// Tipos espejo de los contratos documentados en docs/API_CONTRACTS.md

export interface HealthResponse {
  status: 'ok'
  service: string
  version: string
  environment: string
}
