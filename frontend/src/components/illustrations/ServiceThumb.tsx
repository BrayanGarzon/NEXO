import { Icon, type IconName } from '../Icon'
import './illustrations.css'

export type ThumbTone = 'lila' | 'menta' | 'amarillo' | 'coral'

/** Miniatura ilustrada para servicios sin fotografía aprobada. */
export function ServiceThumb({ icon, tone }: { icon: IconName; tone: ThumbTone }) {
  return (
    <span className={`service-thumb service-thumb--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 80 80" className="service-thumb__shape">
        <path d="M0 58c18-10 36-12 52-4s22 6 28 2v24H0z" />
        <circle cx="62" cy="18" r="9" />
      </svg>
      <Icon name={icon} size={30} className="service-thumb__icon" />
    </span>
  )
}
