import { Icon, type IconName } from './Icon'
import './IconBadge.css'

export type IconBadgeTone = 'lila' | 'petroleo' | 'amarillo' | 'coral' | 'menta' | 'surface'

interface IconBadgeProps {
  icon: IconName
  tone?: IconBadgeTone
  size?: 'sm' | 'md' | 'lg'
}

/** Círculo con icono (flechas de acción, iconos de categoría). Siempre decorativo. */
export function IconBadge({ icon, tone = 'surface', size = 'md' }: IconBadgeProps) {
  const iconSize = { sm: 16, md: 20, lg: 28 }[size]
  return (
    <span className={`icon-badge icon-badge--${tone} icon-badge--${size}`} aria-hidden="true">
      <Icon name={icon} size={iconSize} />
    </span>
  )
}
