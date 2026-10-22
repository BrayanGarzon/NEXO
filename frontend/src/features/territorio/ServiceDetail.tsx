import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { ServiceThumb } from '../../components/illustrations/ServiceThumb'
import { Tag } from '../../components/Tag'
import { categories } from '../../content/categories'
import type { DemoService } from '../../types/catalog'
import { useSavedServices } from '../paso/useSavedServices'

interface ServiceDetailProps {
  service: DemoService
  onClose: () => void
}

export function ServiceDetail({ service, onClose }: ServiceDetailProps) {
  const category = categories[service.category]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { isSaved, save, remove } = useSavedServices()
  const saved = isSaved(service.id)

  useEffect(() => {
    // Enfoca el título sin saltos bruscos y acerca el panel si quedó fuera de la vista.
    const title = titleRef.current
    title?.focus({ preventScroll: true })
    title?.closest('aside')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [service.id])

  return (
    <aside className="service-detail" aria-labelledby="detalle-servicio">
      <div className={`service-detail__cover service-detail__cover--${category.tone}`}>
        <ServiceThumb icon={category.icon} tone={category.tone} />
        <button type="button" className="service-detail__close" onClick={onClose}>
          <Icon name="close" size={20} label="Cerrar detalle" />
        </button>
      </div>
      <div className="service-detail__body">
        <h3 id="detalle-servicio" ref={titleRef} tabIndex={-1}>
          {service.name}
        </h3>
        <div className="service-detail__tags">
          <Tag tone="accent">{category.label}</Tag>
          {service.verified ? (
            <Tag tone="success" icon="verified">
              Servicio verificado
            </Tag>
          ) : (
            <Tag tone="warning">En verificación</Tag>
          )}
        </div>
        <p>{service.summary}</p>
        <dl className="service-detail__facts">
          <div>
            <dt>
              <Icon name="building" size={18} /> Institución
            </dt>
            <dd>{service.institution}</dd>
          </div>
          <div>
            <dt>
              <Icon name="map-pin" size={18} /> Ubicación
            </dt>
            <dd>
              {service.address}
              {service.comuna > 0 && ` · Comuna ${service.comuna}`}
            </dd>
          </div>
          <div>
            <dt>
              <Icon name="clock" size={18} /> Horario
            </dt>
            <dd>{service.schedule}</dd>
          </div>
          <div>
            <dt>
              <Icon name="sparkle" size={18} /> Servicios
            </dt>
            <dd>{service.offerings.join(', ')}.</dd>
          </div>
        </dl>
        <div className="service-detail__actions">
          <Button iconStart="navigation" disabled aria-describedby="detalle-acciones-nota">
            Cómo llegar
          </Button>
          <Button
            variant="secondary"
            iconStart={saved ? 'verified' : 'bookmark'}
            aria-pressed={saved}
            className={saved ? 'service-detail__save--saved' : undefined}
            onClick={() => (saved ? remove(service.id) : save(service.id))}
          >
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
        </div>
        <p className="service-detail__note" role="status">
          {saved && (
            <>
              Está en <Link to="/#mi-siguiente-paso">Mi siguiente paso</Link>.{' '}
            </>
          )}
        </p>
        <p id="detalle-acciones-nota" className="service-detail__note">
          "Cómo llegar" se activará cuando el catálogo tenga direcciones reales.
        </p>
      </div>
    </aside>
  )
}
