import { useEffect, useRef, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { mainNav, sectionHref, sectionIds } from '../app/navigation'
import { useActiveSection, useScrollToHash } from '../app/useSectionNavigation'
import { ButtonLink } from '../components/Button'
import { Doodle } from '../components/Doodle'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { ApiStatus } from '../features/home/ApiStatus'
import { AmbientSound } from '../features/sonido/AmbientSound'
import './MainLayout.css'

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const activeSection = useActiveSection(sectionIds)
  useScrollToHash()

  // Escape cierra el menú móvil y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // Expone la altura del pie para que la última sección y el pie compartan la pantalla final.
  useEffect(() => {
    const footer = footerRef.current
    if (!footer || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      layoutRef.current?.style.setProperty('--site-footer-height', `${footer.offsetHeight}px`)
    })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="layout" ref={layoutRef}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="site-header__inner container">
          <Link
            to={sectionHref('inicio')}
            className="site-header__brand"
            aria-label="NEXO JOVEN 360, inicio"
          >
            <Logo />
          </Link>

          <nav
            id="navegacion-principal"
            className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'}
            aria-label="Navegación principal"
          >
            <ul className="site-nav__list">
              {mainNav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={sectionHref(item.id)}
                    className={
                      activeSection === item.id ? 'site-nav__link active' : 'site-nav__link'
                    }
                    aria-current={activeSection === item.id ? 'location' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <Link to={sectionHref('territorio')} className="site-header__icon-link">
              <Icon name="search" label="Buscar servicios" />
            </Link>
            <ButtonLink to={sectionHref('territorio')} className="site-header__cta">
              Explorar
            </ButtonLink>
            <button
              ref={menuButtonRef}
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

      <footer className="site-footer" ref={footerRef}>
        <Doodle name="branch" tone="menta" className="site-footer__branch" />
        <div className="site-footer__inner container">
          <div className="site-footer__brand">
            <Logo inverse />
            <p>
              Información confiable y cercana para jóvenes de Villavicencio. Explora, conéctate y da
              tu siguiente paso.
            </p>
          </div>
          <nav aria-labelledby="pie-secciones">
            <h2 id="pie-secciones" className="site-footer__heading">
              Secciones
            </h2>
            <ul className="site-footer__links">
              {mainNav.map((item) => (
                <li key={item.id}>
                  <Link to={sectionHref(item.id)}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-footer__note">
            <h2 className="site-footer__heading">Importante</h2>
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

      <AmbientSound />
    </div>
  )
}
