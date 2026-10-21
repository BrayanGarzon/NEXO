import { Link, Outlet } from 'react-router'

export function MainLayout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__brand">
          NEXO JOVEN 360
        </Link>
        <nav aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">
        <small>NEXO JOVEN 360 · Villavicencio</small>
      </footer>
    </div>
  )
}
