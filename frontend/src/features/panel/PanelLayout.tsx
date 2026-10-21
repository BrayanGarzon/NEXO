import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { Icon } from '../../components/Icon'
import { Logo } from '../../components/Logo'
import { PanelIcon, type PanelIconName } from './PanelIcon'
import './Panel.css'

interface EntradaMenu {
  etiqueta: string
  icono: PanelIconName | 'users'
  a: string
  /** En celular va dentro de «Más» para que el menú quepa en una fila. */
  secundaria?: boolean
}

const menu: EntradaMenu[] = [
  { etiqueta: 'Dashboard', icono: 'dashboard', a: '/panel/observatorio' },
  { etiqueta: 'Servicios', icono: 'file', a: '/panel/servicios' },
  { etiqueta: 'Verificación', icono: 'shield', a: '/panel/servicios?estado=en_revision' },
  { etiqueta: 'Categorías', icono: 'tag', a: '/panel/categorias', secundaria: true },
  { etiqueta: 'Fuentes', icono: 'link', a: '/panel/fuentes', secundaria: true },
  { etiqueta: 'Usuarios', icono: 'users', a: '/panel/usuarios', secundaria: true },
  { etiqueta: 'Configuración', icono: 'gear', a: '/panel/configuracion', secundaria: true },
]

function MenuIcono({ icono }: { icono: EntradaMenu['icono'] }) {
  return icono === 'users' ? <Icon name="users" size={20} /> : <PanelIcon name={icono} />
}

/** Barra lateral (cabecera en celular) + área de contenido del panel institucional. */
export function PanelLayout() {
  const { pathname, search } = useLocation()
  const [masAbierto, setMasAbierto] = useState(false)
  const enVerificacion = pathname === '/panel/servicios' && search.includes('estado=en_revision')

  function activa(entrada: EntradaMenu) {
    if (entrada.etiqueta === 'Verificación') return enVerificacion
    if (entrada.etiqueta === 'Servicios') return pathname.startsWith(entrada.a) && !enVerificacion
    return pathname.startsWith(entrada.a)
  }

  const secundariaActiva = menu.some((entrada) => entrada.secundaria && activa(entrada))

  return (
    <div className="panel">
      <a className="skip-link" href="#panel-contenido">
        Saltar al contenido
      </a>
      <aside className="panel-sidebar">
        <Link to="/panel" className="panel-sidebar__brand" aria-label="Panel institucional, inicio">
          <Logo inverse />
        </Link>
        <nav
          aria-label="Panel institucional"
          className={
            masAbierto ? 'panel-sidebar__nav panel-sidebar__nav--open' : 'panel-sidebar__nav'
          }
        >
          <ul id="panel-menu">
            {menu.map((entrada) => (
              <li
                key={entrada.etiqueta}
                className={entrada.secundaria ? 'panel-nav__secondary' : undefined}
              >
                <Link
                  to={entrada.a}
                  className={
                    activa(entrada) ? 'panel-nav__item panel-nav__item--active' : 'panel-nav__item'
                  }
                  aria-current={activa(entrada) ? 'page' : undefined}
                  onClick={() => setMasAbierto(false)}
                >
                  <MenuIcono icono={entrada.icono} />
                  {entrada.etiqueta}
                </Link>
              </li>
            ))}
            <li className="panel-nav__more">
              <button
                type="button"
                className={
                  secundariaActiva ? 'panel-nav__item panel-nav__item--active' : 'panel-nav__item'
                }
                aria-expanded={masAbierto}
                aria-controls="panel-menu"
                onClick={() => setMasAbierto((abierto) => !abierto)}
              >
                <Icon name={masAbierto ? 'close' : 'menu'} size={20} />
                Más
              </button>
            </li>
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
