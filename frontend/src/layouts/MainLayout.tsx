import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { mainNav } from '../app/navigation'
import { ButtonLink } from '../components/Button'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { ApiStatus } from '../features/home/ApiStatus'
import './MainLayout.css'

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="site-header__inner container">
          <Link to="/" className="site-header__brand" aria-label="NEXO JOVEN 360, inicio">
            <Logo />
          </Link>

          <nav
            id="navegacion-principal"
            className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'}
            aria-label="Navegación principal"
          >
            <ul className="site-nav__list">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className="site-nav__link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <Link to="/territorio" className="site-header__icon-link">
              <Icon name="search" label="Buscar servicios" />
            </Link>
            <ButtonLink to="/territorio" className="site-header__cta">
              Explorar
            </ButtonLink>
            <button
              type="button"
              className="site-header__menu"
              aria-expanded={menuOpen}
              aria-controls="navegacion-principal"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon
                name={menuOpen ? 'close' : 'menu'}
                label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              />
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" className="layout__main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner container">
          <div className="site-footer__brand">
            <Logo inverse />
            <p>
              Información confiable y cercana para jóvenes de Villavicencio. Explora, conéctate y da
              tu siguiente paso.
            </p>
          </div>
          <nav aria-label="Enlaces del pie de página">
            <ul className="site-footer__links">
              {mainNav.slice(1).map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-footer__note">
            <p>
              NEXO JOVEN 360 no ofrece diagnósticos. Si estás en peligro o necesitas ayuda
              inmediata, llama a la línea de emergencias <strong>123</strong>.
            </p>
            <p className="site-footer__meta">
              Prototipo en desarrollo · los servicios mostrados son datos de demostración.
            </p>
            {import.meta.env.DEV && <ApiStatus />}
          </div>
        </div>
      </footer>
    </div>
  )
}
