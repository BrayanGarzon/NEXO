import { useCallback } from 'react'
import { Button, ButtonLink } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { StatusMessage } from '../../../components/StatusMessage'
import { Tag } from '../../../components/Tag'
import { categories } from '../../../content/categories'
import { hoyIso } from '../fechas'
import { Proporcion } from '../observatorio/Graficos'
import { porcentaje } from '../observatorio/indicadores'
import { PanelHeader } from '../PanelHeader'
import { estadoLabels, estados } from '../reglas'
import { listarServicios } from '../services/panelData'
import { useCarga } from '../useCarga'
import { resumirCategorias } from './resumenCategorias'

/** Categorías — estado del catálogo por categoría y acceso a sus servicios. */
export function CategoriasPage() {
  const cargar = useCallback((signal: AbortSignal) => listarServicios({ signal }), [])
  const { state, reintentar } = useCarga(cargar)

  return (
    <>
      <PanelHeader
        titulo="Categorías"
        subtitulo="Cómo está el catálogo en cada categoría de servicios."
      />
      {state.status === 'loading' && <StatusMessage kind="loading" title="Cargando categorías…" />}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar las categorías"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && (
        <ul className="panel-category-grid" aria-label="Categorías del catálogo">
          {resumirCategorias(state.data, hoyIso()).map((resumen) => {
            const meta = categories[resumen.categoria]
            const calidad = porcentaje(resumen.conFuenteVerificable, resumen.activos)
            const tituloId = `categoria-${resumen.categoria}`
            return (
              <li key={resumen.categoria} className="panel-card panel-category">
                <div className="panel-category__head">
                  <span className={`panel-cat-icon panel-cat-icon--${meta.tone}`}>
                    <Icon name={meta.icon} size={18} />
                  </span>
                  <h3 id={tituloId}>{meta.label}</h3>
                  <span className="panel-category__total">
                    {resumen.total === 1 ? '1 servicio' : `${resumen.total} servicios`}
                  </span>
                </div>
                <ul className="panel-category__states" aria-label={`Estados en ${meta.label}`}>
                  {estados.map((estado) => (
                    <li key={estado}>
                      <span className={`panel-dot panel-dot--${estado}`} aria-hidden="true" />
                      {estadoLabels[estado]}
                      <strong>{resumen.porEstado[estado]}</strong>
                    </li>
                  ))}
                </ul>
                <p className="panel-category__quality">
                  <span>Con fuente verificable</span>
                  <strong>{calidad}%</strong>
                  <Proporcion parte={resumen.conFuenteVerificable} total={resumen.activos} />
                </p>
                {resumen.incidencias > 0 ? (
                  <Tag tone="warning" icon="alert">
                    {resumen.incidencias === 1
                      ? '1 incidencia'
                      : `${resumen.incidencias} incidencias`}
                  </Tag>
                ) : (
                  <Tag tone="success" icon="verified">
                    Sin incidencias
                  </Tag>
                )}
                <ButtonLink
                  to={`/panel/servicios?categoria=${resumen.categoria}`}
                  variant="secondary"
                  size="sm"
                  iconEnd="arrow-right"
                  aria-label={`Ver servicios de ${meta.label}`}
                >
                  Ver servicios
                </ButtonLink>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
