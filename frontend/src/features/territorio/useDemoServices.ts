import { useCallback, useEffect, useState } from 'react'
import { listDemoServices, type ListOptions } from '../../services/catalog'
import type { DemoService } from '../../types/catalog'

export type LoadState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; services: DemoService[] }

export function useDemoServices(simulate?: ListOptions['simulate']) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listDemoServices({ signal: controller.signal, simulate })
      .then((services) => setState({ status: 'ready', services }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [attempt, simulate])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  return { state, retry }
}
