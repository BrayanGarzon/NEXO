import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Icon } from '../../components/Icon'
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
            <Card
              key={service.id}
              as="li"
              interactive
              className={`service-card service-card--${category.tone}`}
            >
              <div className="service-card__cover" aria-hidden="true">
                <svg viewBox="0 0 320 96" preserveAspectRatio="none" className="service-card__wave">
                  <path d="M0 70c60-22 120-26 180-12s100 14 140 0v38H0z" />
                </svg>
                <span className="service-card__icon">
                  <Icon name={category.icon} size={24} />
                </span>
                <span className="service-card__category">{category.label}</span>
              </div>
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
                  <span>
                    <Icon name="map-pin" size={16} /> Comuna {service.comuna}
                  </span>
                  <span>
                    <Icon name="navigation" size={16} />{' '}
                    {service.distanceKm.toLocaleString('es-CO')} km
                  </span>
                </p>
              </div>
              <div className="service-card__footer">
                {service.verified ? (
                  <Tag tone="success" icon="verified">
                    Servicio verificado
                  </Tag>
                ) : (
                  <span />
                )}
                <span className="service-card__cta" aria-hidden="true">
                  Ver detalle <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Card>
          )
        })}
      </ul>
    </section>
  )
}
