import type { ReactNode } from 'react'
import './Annotation.css'

export type AnnotationTone = 'menta' | 'lila' | 'amarillo' | 'coral' | 'plain'

interface AnnotationProps {
  tone?: AnnotationTone
  /** Inclinación en grados (sugerido entre -8 y 8). */
  tilt?: number
  size?: 'md' | 'lg'
  className?: string
  children: ReactNode
}

/** Nota manuscrita estilo recorte/sticker (Caveat). Texto real, no imagen. */
export function Annotation({
  tone = 'amarillo',
  tilt = -4,
  size = 'md',
  className,
  children,
}: AnnotationProps) {
  return (
    <p
      className={['annotation', `annotation--${tone}`, `annotation--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      style={{ rotate: `${tilt}deg` }}
    >
      {children}
    </p>
  )
}
