import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/** Preferencia del sistema de reducir movimiento. */
export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Desplaza la vista hasta la sección indicada en el `#hash` en cada navegación
 * (también al pulsar dos veces el mismo enlace, porque cambia `location.key`).
 */
export function useScrollToHash() {
  const { hash, key } = useLocation()

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    let cancelled = false
    let frame = 0
    // Espera a las fuentes web (cambian la altura del texto al cargar) y al siguiente
    // fotograma, para que la posición de la sección ya sea la definitiva.
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView?.({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [hash, key])
}

interface BandState {
  /** Secciones que cruzan ahora la franja de lectura, en orden de la página. */
  inBand: string[]
  /** Última sección detectada (se mantiene en los huecos entre secciones). */
  last: string
}

/**
 * Devuelve el id de la sección visible para resaltarla en el menú.
 *
 * Si varias secciones comparten fila (Espacio Pausa y Mi siguiente paso), se prefiere
 * la del `#hash` actual, es decir, la que la persona acaba de elegir en el menú.
 */
export function useActiveSection(ids: string[]) {
  const { pathname, hash } = useLocation()
  const [band, setBand] = useState<BandState>({ inBand: [], last: ids[0] })
  const idsKey = ids.join(',')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const order = idsKey.split(',')
    const elements = order
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    // Una sección cuenta como visible al cruzar una franja cerca de la parte superior.
    const observer = new IntersectionObserver(
      (entries) => {
        setBand((current) => {
          const next = new Set(current.inBand)
          for (const entry of entries) {
            if (entry.isIntersecting) next.add(entry.target.id)
            else next.delete(entry.target.id)
          }
          const inBand = order.filter((id) => next.has(id))
          return { inBand, last: inBand[0] ?? current.last }
        })
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
    // `pathname`: vuelve a observar cuando la página única aparece tras una redirección.
  }, [idsKey, pathname])

  const hashId = decodeURIComponent(hash.slice(1))
  if (band.inBand.includes(hashId)) return hashId
  return band.inBand[0] ?? band.last
}
