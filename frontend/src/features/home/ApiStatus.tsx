import { useEffect, useState } from 'react'
import { getHealth } from '../../services/health'
import './ApiStatus.css'

type Status = 'loading' | 'ok' | 'error'

export function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const controller = new AbortController()
    getHealth(controller.signal)
      .then(() => setStatus('ok'))
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error')
      })
    return () => controller.abort()
  }, [])

  const labels: Record<Status, string> = {
    loading: 'Comprobando API…',
    ok: 'API disponible',
    error: 'API no disponible',
  }

  return (
    <p className={`api-status api-status--${status}`} role="status">
      {labels[status]}
    </p>
  )
}
