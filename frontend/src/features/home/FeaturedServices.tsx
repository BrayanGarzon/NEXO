import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Icon } from '../../components/Icon'
import { ServiceThumb } from '../../components/illustrations/ServiceThumb'
import { DemoTag, Tag } from '../../components/Tag'
import { categories } from '../../content/categories'
import { getFeaturedDemoServices } from '../../services/catalog'

export function FeaturedServices() {
  const services = getFeaturedDemoServices()

  return (
    <section className="featured container" aria-labelledby="featured-title">
      <header className="featured__header">
        <div className="featured__heading">
          <h2 id="featured-title">Servicios destacados en Villavicencio</h2>
          <DemoTag />
        </div>
        <Link to="/#territorio" className="featured__all">
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
                <h3 className="service-card__title">
                  <Link to={`/?servicio=${service.id}#territorio`} className="card__link">
                    {service.name}
                  </Link>
                </h3>
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
