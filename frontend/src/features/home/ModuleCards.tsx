import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Doodle } from '../../components/Doodle'
import { Icon } from '../../components/Icon'
import { IconBadge } from '../../components/IconBadge'
import { homeModules, type ModuleTone } from './homeContent'

const arrowTone: Record<ModuleTone, 'lila' | 'petroleo' | 'amarillo' | 'coral'> = {
  lila: 'lila',
  menta: 'petroleo',
  amarillo: 'amarillo',
  coral: 'coral',
}

export function ModuleCards() {
  return (
    <section className="modules" aria-labelledby="modules-title">
      <div className="container">
        <h2 id="modules-title" className="visually-hidden">
          Explora NEXO JOVEN 360
        </h2>
        <ul className="modules__list">
          {homeModules.map((module) => (
            <Card
              key={module.id}
              as="li"
              tone={module.tone}
              interactive
              className={`module-card module-card--${module.tone}`}
            >
              <span className="module-card__icon">
                <Icon name={module.icon} size={34} />
              </span>
              <Doodle
                name={module.doodle}
                tone={module.doodleTone}
                className="module-card__doodle"
              />
              <h3 className="module-card__title">
                <Link to={module.to} className="card__link">
                  {module.title}
                </Link>
              </h3>
              <p className="module-card__description">{module.description}</p>
              <span className="module-card__arrow">
                <IconBadge icon="arrow-right" tone={arrowTone[module.tone]} size="sm" />
              </span>
            </Card>
          ))}
        </ul>
      </div>
    </section>
  )
}
