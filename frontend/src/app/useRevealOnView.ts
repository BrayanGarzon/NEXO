import { useEffect, useRef, useState } from 'react'

/**
 * Indica si el elemento ya entró en pantalla (una sola vez), para lanzar animaciones de
 * aparición al verlo y no al cargar la página. Sin IntersectionObserver cuenta como visible.
 */
export function useRevealOnView<T extends Element>(rootMargin = '0px 0px -15% 0px') {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (revealed || !element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setRevealed(true)
        observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [revealed, rootMargin])

  return [ref, revealed] as const
}
