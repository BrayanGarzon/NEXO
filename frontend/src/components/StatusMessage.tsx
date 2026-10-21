import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './StatusMessage.css'

export type StatusKind = 'loading' | 'empty' | 'error'

interface StatusMessageProps {
  kind: StatusKind
  title: string
  description?: string
  action?: ReactNode
}

const icons: Record<StatusKind, IconName> = {
  loading: 'compass',
  empty: 'search',
  error: 'alert',
}

/** Estados de carga, ausencia de resultados y error con semántica accesible. */
export function StatusMessage({ kind, title, description, action }: StatusMessageProps) {
  return (
    <div
      className={`status-message status-message--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
    >
      <span className="status-message__icon">
        <Icon name={icons[kind]} size={28} />
      </span>
      <p className="status-message__title">{title}</p>
      {description && <p className="status-message__description">{description}</p>}
      {action}
    </div>
  )
}
