import { useCallback, useEffect, useState } from 'react'

export type EstadoCarga<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

/**
 * Carga datos asíncronos con estados de carga/error y reintento.
 * `cargar` debe ser estable (useCallback) para no repetir la petición en cada render.
 */
export function useCarga<T>(cargar: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<EstadoCarga<T>>({ status: 'loading' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    cargar(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [cargar, intento])

  const reintentar = useCallback(() => {
    setState({ status: 'loading' })
    setIntento((valor) => valor + 1)
  }, [])

  /** Sustituye los datos tras una acción (p. ej. la respuesta de una transición). */
  const actualizar = useCallback((data: T) => setState({ status: 'ready', data }), [])

  return { state, reintentar, actualizar }
}
