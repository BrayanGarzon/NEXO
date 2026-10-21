import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="status-page">
      <h1>Página no encontrada</h1>
      <p>La ruta que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}
