import { Annotation } from '../../components/Annotation'
import { Doodle } from '../../components/Doodle'
import { Icon } from '../../components/Icon'
import { principles } from './informacionContent'
import './InformacionSection.css'

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
        <div className="informacion__art">
          <Annotation tone="menta" tilt={-3}>
            Información clara y cercana
          </Annotation>
          <Doodle name="sprout" tone="menta" className="informacion__sprout" />
          <Doodle name="sparkle" tone="amarillo" filled className="informacion__spark" />
        </div>
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
        <span className="informacion__help-icon" aria-hidden="true">
          <Icon name="heart" size={22} />
        </span>
        <span>
          Si estás en peligro o necesitas ayuda inmediata, llama a la línea de emergencias{' '}
          <a href="tel:123">123</a>.
        </span>
        <Doodle name="leaf" tone="coral" className="informacion__help-leaf" />
      </p>
    </section>
  )
}
