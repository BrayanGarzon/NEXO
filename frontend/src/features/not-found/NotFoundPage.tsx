import { ButtonLink } from '../../components/Button'
import { Doodle } from '../../components/Doodle'

export function NotFoundPage() {
  return (
    <section className="status-page container">
      <Doodle name="sparkle" tone="lila" filled className="status-page__doodle" />
      <h1>Página no encontrada</h1>
      <p className="status-page__note hand">Este camino no existe… ¡pero hay muchos otros!</p>
      <p>La ruta que buscas no existe o cambió de lugar.</p>
      <ButtonLink to="/" iconEnd="arrow-right">
        Volver al inicio
      </ButtonLink>
    </section>
  )
}
