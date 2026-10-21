import { Link } from 'react-router'

/** Marcador temporal hasta que exista el layout del panel (tarea I7). */
export function PanelPlaceholder() {
  return (
    <main className="status-page container">
      <h1>Panel institucional</h1>
      <p>En construcción: Fuente Viva (gestión de servicios) y Observatorio (calidad).</p>
      <Link to="/">Volver a la web pública</Link>
    </main>
  )
}
