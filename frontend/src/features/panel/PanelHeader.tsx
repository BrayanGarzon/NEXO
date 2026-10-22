import type { ReactNode } from 'react'
import { DemoTag } from '../../components/Tag'
import { PanelPerfil } from './PanelPerfil'

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
        <PanelPerfil />
      </div>
    </header>
  )
}
