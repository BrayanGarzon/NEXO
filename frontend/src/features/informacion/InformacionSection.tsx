import { Annotation } from '../../components/Annotation'
import { Icon, type IconName } from '../../components/Icon'
import './InformacionSection.css'

const principles: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'verified',
    title: 'Información confiable',
    text: 'Los servicios muestran si ya fueron verificados y de qué institución provienen.',
  },
  {
    icon: 'compass',
    title: 'Orientación, no diagnóstico',
    text: 'Brújula te muestra opciones según lo que buscas. No evalúa ni diagnostica.',
  },
  {
    icon: 'users',
    title: 'Hecho para jóvenes',
    text: 'Servicios, actividades y espacios de Villavicencio pensados para ti.',
  },
]

export function InformacionSection() {
  return (
    <section id="informacion" className="informacion container" aria-labelledby="informacion-title">
      <div className="informacion__intro">
        <p className="section-eyebrow">
          <Icon name="info" size={18} /> Información
        </p>
        <h2 id="informacion-title">¿Qué es NEXO JOVEN 360?</h2>
        <p>
          Una plataforma para que las y los jóvenes de Villavicencio encuentren información
          confiable sobre servicios de apoyo, recursos de bienestar, actividades juveniles y canales
          institucionales, en un solo lugar.
        </p>
        <Annotation tone="menta" tilt={-3}>
          Información clara y cercana
        </Annotation>
      </div>
      <ul className="informacion__list">
        {principles.map((item) => (
          <li key={item.title} className="informacion__item">
            <span className="informacion__icon" aria-hidden="true">
              <Icon name={item.icon} size={22} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="informacion__help">
        <Icon name="heart" size={20} />
        <span>
          Si estás en peligro o necesitas ayuda inmediata, llama a la línea de emergencias{' '}
          <a href="tel:123">123</a>.
        </span>
      </p>
    </section>
  )
}
