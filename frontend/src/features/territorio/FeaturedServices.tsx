import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Icon } from '../../components/Icon'
import { ServiceThumb } from '../../components/illustrations/ServiceThumb'
import { DemoTag, Tag } from '../../components/Tag'
import { categories } from '../../content/categories'
import { getFeaturedDemoServices } from '../../services/catalog'

/** Id del bloque de resultados y mapa, destino de «Ver todos» y de cada destacado. */
export const territorioExplorarId = 'territorio-explorar'

export function FeaturedServices() {
  const services = getFeaturedDemoServices()

  return (
    <section className="featured container" aria-labelledby="featured-title">
      <header className="featured__header">
        <div className="featured__heading">
          <span className="featured__badge" aria-hidden="true">
            <Icon name="sparkle" size={18} />
          </span>
          <h3 id="featured-title" className="featured__title">
            Servicios destacados en Villavicencio
          </h3>
          <DemoTag />
        </div>
        {/* Sin parámetros de búsqueda: el listado se muestra completo, sin filtros. */}
        <Link to={`/#${territorioExplorarId}`} className="featured__all">
          Ver todos <Icon name="arrow-right" size={18} />
        </Link>
      </header>
      <ul className="featured__list">
        {services.map((service) => {
          const category = categories[service.category]
          return (
            <Card key={service.id} as="li" interactive className="service-card">
              <ServiceThumb icon={category.icon} tone={category.tone} />
              <div className="service-card__body">
                <h4 className="service-card__title">
                  <Link
                    to={`/?servicio=${service.id}#${territorioExplorarId}`}
                    className="card__link"
                  >
                    {service.name}
                  </Link>
                </h4>
                <p className="service-card__summary">{service.summary}</p>
                <p className="service-card__meta">
                  {category.label} · Comuna {service.comuna}
                </p>
                {service.verified && (
                  <Tag tone="success" icon="verified">
                    Servicio verificado
                  </Tag>
                )}
              </div>
              <Icon name="chevron-right" className="service-card__chevron" />
            </Card>
          )
        })}
      </ul>
    </section>
  )
}
