import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

function prefersReducedMotion() {
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
    // Espera al siguiente fotograma para que la sección ya esté pintada.
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView?.({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, key])
}

/** Devuelve el id de la sección visible para resaltarla en el menú. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const idsKey = ids.join(',')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = idsKey
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    // Una sección se considera activa al cruzar una franja cerca de la parte superior.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [idsKey])

  return active
}
