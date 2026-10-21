import { Link, Outlet, useLocation } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { Icon } from '../../components/Icon'
import { Logo } from '../../components/Logo'
import { PanelIcon, type PanelIconName } from './PanelIcon'
import './Panel.css'

interface EntradaMenu {
  etiqueta: string
  icono: PanelIconName | 'users'
  /** Sin destino: «próximamente» hasta definir roles y recursos (PLAN_PERSONA_3 §2). */
  a?: string
}

const menu: EntradaMenu[] = [
  { etiqueta: 'Dashboard', icono: 'dashboard', a: '/panel/observatorio' },
  { etiqueta: 'Servicios', icono: 'file', a: '/panel/servicios' },
  { etiqueta: 'Verificación', icono: 'shield', a: '/panel/servicios?estado=en_revision' },
  { etiqueta: 'Categorías', icono: 'tag' },
  { etiqueta: 'Fuentes', icono: 'link' },
  { etiqueta: 'Usuarios', icono: 'users' },
  { etiqueta: 'Configuración', icono: 'gear' },
]

function MenuIcono({ icono }: { icono: EntradaMenu['icono'] }) {
  return icono === 'users' ? <Icon name="users" size={20} /> : <PanelIcon name={icono} />
}

/** Barra lateral + área de contenido de los paneles Fuente Viva y Observatorio. */
export function PanelLayout() {
  const { pathname, search } = useLocation()
  const enVerificacion = pathname === '/panel/servicios' && search.includes('estado=en_revision')

  function activa(entrada: EntradaMenu) {
    if (!entrada.a) return false
    if (entrada.etiqueta === 'Verificación') return enVerificacion
    if (entrada.etiqueta === 'Servicios') return pathname.startsWith(entrada.a) && !enVerificacion
    return pathname.startsWith(entrada.a)
  }

  return (
    <div className="panel">
      <a className="skip-link" href="#panel-contenido">
        Saltar al contenido
      </a>
      <aside className="panel-sidebar">
        <Link to="/panel" className="panel-sidebar__brand" aria-label="Panel institucional, inicio">
          <Logo inverse />
        </Link>
        <nav aria-label="Panel institucional" className="panel-sidebar__nav">
          <ul>
            {menu.map((entrada) => (
              <li key={entrada.etiqueta}>
                {entrada.a ? (
                  <Link
                    to={entrada.a}
                    className={
                      activa(entrada)
                        ? 'panel-nav__item panel-nav__item--active'
                        : 'panel-nav__item'
                    }
                    aria-current={activa(entrada) ? 'page' : undefined}
                  >
                    <MenuIcono icono={entrada.icono} />
                    {entrada.etiqueta}
                  </Link>
                ) : (
                  <span className="panel-nav__item panel-nav__item--disabled" aria-disabled="true">
                    <MenuIcono icono={entrada.icono} />
                    {entrada.etiqueta}
                    <span className="panel-nav__soon">Pronto</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <Annotation tone="amarillo" tilt={-6} className="panel-sidebar__note">
          Información confiable para más oportunidades
        </Annotation>
        <Link to="/" className="panel-sidebar__exit">
          <Icon name="arrow-left" size={16} />
          Ir a la web pública
        </Link>
      </aside>
      <main id="panel-contenido" className="panel-main" tabIndex={-1}>
        <h1 className="visually-hidden">Panel institucional</h1>
        <Outlet />
      </main>
    </div>
  )
}
