import { Annotation, type AnnotationTone } from '../../components/Annotation'
import { ButtonLink } from '../../components/Button'
import { Icon, type IconName } from '../../components/Icon'
import './ComingSoonPage.css'

interface ComingSoonPageProps {
  title: string
  description: string
  note: string
  icon: IconName
  tone: AnnotationTone
}

/** Página pública de un módulo aún no implementado, con la identidad aprobada. */
export function ComingSoonPage({ title, description, note, icon, tone }: ComingSoonPageProps) {
  return (
    <section className="coming-soon container" aria-labelledby="coming-soon-title">
      <span className={`coming-soon__icon coming-soon__icon--${tone}`} aria-hidden="true">
        <Icon name={icon} size={44} />
      </span>
      <h1 id="coming-soon-title" className="coming-soon__title hand">
        {title}
      </h1>
      <p className="coming-soon__description">{description}</p>
      <Annotation tone={tone} tilt={-3}>
        {note}
      </Annotation>
      <div className="coming-soon__actions">
        <ButtonLink to="/brujula" iconEnd="arrow-right">
          Ir a Brújula
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Volver al inicio
        </ButtonLink>
      </div>
    </section>
  )
}
