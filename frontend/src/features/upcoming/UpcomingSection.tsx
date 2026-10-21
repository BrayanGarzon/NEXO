import { Annotation, type AnnotationTone } from '../../components/Annotation'
import { Icon, type IconName } from '../../components/Icon'
import { Tag } from '../../components/Tag'
import './UpcomingSection.css'

interface UpcomingModule {
  id: string
  title: string
  description: string
  note: string
  icon: IconName
  tone: Extract<AnnotationTone, 'amarillo' | 'coral'>
}

const upcomingModules: UpcomingModule[] = [
  {
    id: 'pausa',
    title: 'Espacio Pausa',
    description:
      'Ejercicios de respiración, sonidos de la naturaleza y pausas guiadas para reconectarte.',
    note: 'Un respiro también es avance',
    icon: 'feather',
    tone: 'amarillo',
  },
  {
    id: 'mi-siguiente-paso',
    title: 'Mi siguiente paso',
    description:
      'Guarda los servicios y actividades que te interesan y organiza tus opciones a tu ritmo.',
    note: 'Organiza tu propio camino',
    icon: 'steps',
    tone: 'coral',
  },
]

/** Módulos de la página única que aún están en construcción. */
export function UpcomingSection() {
  return (
    <div className="upcoming container">
      {upcomingModules.map((module) => (
        <section
          key={module.id}
          id={module.id}
          className={`upcoming__card upcoming__card--${module.tone}`}
          aria-labelledby={`${module.id}-title`}
        >
          <span className="upcoming__icon" aria-hidden="true">
            <Icon name={module.icon} size={36} />
          </span>
          <Tag tone="neutral">Próximamente</Tag>
          <h2 id={`${module.id}-title`} className="upcoming__title hand">
            {module.title}
          </h2>
          <p>{module.description}</p>
          <Annotation tone={module.tone} tilt={-3} className="upcoming__note">
            {module.note}
          </Annotation>
        </section>
      ))}
    </div>
  )
}
