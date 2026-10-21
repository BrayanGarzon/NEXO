import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Tag.css'

export type TagTone = 'neutral' | 'success' | 'accent' | 'warning' | 'demo'

interface TagProps {
  tone?: TagTone
  icon?: IconName
  children: ReactNode
}

/** Etiqueta informativa (no interactiva). */
export function Tag({ tone = 'neutral', icon, children }: TagProps) {
  return (
    <span className={`tag tag--${tone}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  )
}

/** Marca visible para contenido sintético mientras no exista la API real. */
export function DemoTag() {
  return (
    <Tag tone="demo" icon="info">
      Datos de demostración
    </Tag>
  )
}

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected?: boolean
  icon?: IconName
  children: ReactNode
}

/** Filtro o selección rápida. Comunica su estado con `aria-pressed`. */
export function Chip({ selected = false, icon, children, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={['chip', selected && 'chip--selected', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}
