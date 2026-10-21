import type { ReactNode } from 'react'
import './PhotoFrame.css'

interface PhotoFrameProps {
  /** Fotografía con licencia registrada en docs/diseno/RECURSOS.md. */
  src?: string
  alt: string
  /** Ilustración que se muestra mientras no exista fotografía aprobada. */
  fallback: ReactNode
  shape?: 'blob' | 'rounded'
  className?: string
}

export function PhotoFrame({ src, alt, fallback, shape = 'blob', className }: PhotoFrameProps) {
  return (
    <figure
      className={['photo-frame', `photo-frame--${shape}`, className].filter(Boolean).join(' ')}
    >
      {src ? (
        <img src={src} alt={alt} className="photo-frame__media" loading="lazy" />
      ) : (
        <div className="photo-frame__media" role="img" aria-label={alt}>
          {fallback}
        </div>
      )}
    </figure>
  )
}
