import type { ReactNode } from 'react'
import { DemoTag } from '../../components/Tag'
import { USUARIO_DEMO } from './mocks/datosSinteticos'

interface PanelHeaderProps {
  titulo: string
  subtitulo?: string
  /** Contenido antes del título (p. ej. enlace de regreso). */
  antes?: ReactNode
  /** Contenido bajo el título (etiquetas). */
  children?: ReactNode
  /** Nota manuscrita junto al usuario. */
  nota?: ReactNode
}

/** Encabezado de página del panel: título, subtítulo y usuario institucional. */
export function PanelHeader({ titulo, subtitulo, antes, children, nota }: PanelHeaderProps) {
  return (
    <header className="panel-header">
      <div className="panel-header__titles">
        {antes}
        <h2 className="panel-header__title">{titulo}</h2>
        {subtitulo && <p className="panel-header__subtitle">{subtitulo}</p>}
        {children}
      </div>
      <div className="panel-header__user">
        {nota}
        <DemoTag />
        <span className="panel-user">
          <span className="panel-user__avatar" aria-hidden="true">
            {USUARIO_DEMO.split(' ')
              .map((parte) => parte[0])
              .join('')}
          </span>
          <span>
            <span className="panel-user__name">{USUARIO_DEMO}</span>
            <span className="panel-user__role">Gestión institucional</span>
          </span>
        </span>
      </div>
    </header>
  )
}
