import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { DemoTag } from '../../components/Tag'
import { PanelIcon } from './PanelIcon'
import { PanelPerfil } from './PanelPerfil'

interface PanelHeaderProps {
  titulo: string
  subtitulo?: string
  /** Contenido antes del título (p. ej. enlace de regreso). */
  antes?: ReactNode
  /** Contenido bajo el título (etiquetas). */
  children?: ReactNode
}

/** Encabezado de página del panel: título, subtítulo y usuario institucional. */
export function PanelHeader({ titulo, subtitulo, antes, children }: PanelHeaderProps) {
  return (
    <header className="panel-header">
      <div className="panel-header__titles">
        {antes}
        <h2 className="panel-header__title">{titulo}</h2>
        {subtitulo && <p className="panel-header__subtitle">{subtitulo}</p>}
        {children}
      </div>
      <div className="panel-header__user">
        <DemoTag />
        <Link
          to="/"
          className="panel-home"
          aria-label="Ir a la página principal"
          title="Página principal"
        >
          <PanelIcon name="home" size={22} />
        </Link>
        <PanelPerfil />
      </div>
    </header>
  )
}
