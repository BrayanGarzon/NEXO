import { ApiStatus } from './ApiStatus'

export function HomePage() {
  return (
    <section className="home">
      <p className="home__tag">Estructura base · Fase 00</p>
      <h1>NEXO JOVEN 360</h1>
      <p>
        Página temporal de la estructura base. El diseño definitivo se implementará siguiendo la
        referencia gráfica aprobada (ver <code>docs/DISENO_VISUAL.md</code>).
      </p>
      <ApiStatus />
    </section>
  )
}
