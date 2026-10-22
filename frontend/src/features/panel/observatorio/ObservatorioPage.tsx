import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink } from '../../../components/Button'
import { Icon, type IconName } from '../../../components/Icon'
import { StatusMessage } from '../../../components/StatusMessage'
import { Chip, Tag } from '../../../components/Tag'
import { categories } from '../../../content/categories'
import { EstadoTag } from '../EstadoTag'
import { formatearFechaHora, hoyIso } from '../fechas'
import { PanelHeader } from '../PanelHeader'
import { accionLabels, configuracionActual } from '../reglas'
import { cargarObservatorio, type DatosObservatorio } from '../services/panelData'
import type { EstadoServicio } from '../types'
import { useCarga } from '../useCarga'
import { Barras, TortaCobertura } from './Graficos'
import {
  calcularCobertura,
  calcularPorCategoria,
  calcularResumen,
  calcularVigencia,
  detectarIncidencias,
  ejecutarValidaciones,
  incidenciaLabels,
  type TipoIncidencia,
} from './indicadores'

const LIMITE_ACTIVIDAD = 6

/** Observatorio — calidad y mantenimiento de la información (panel 07 del moodboard). */
export function ObservatorioPage() {
  const cargar = useCallback(
    (signal: AbortSignal) => cargarObservatorio(LIMITE_ACTIVIDAD, { signal }),
    [],
  )
  const { state, reintentar } = useCarga(cargar)

  return (
    <>
      <PanelHeader
        titulo="Resumen general"
        subtitulo="Estado del catálogo y calidad de la información."
      />
      {state.status === 'loading' && (
        <StatusMessage kind="loading" title="Calculando indicadores…" />
      )}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar el Observatorio"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && <Tablero datos={state.data} />}
    </>
  )
}

/** Qué hacer con cada tipo de incidencia. */
const incidenciaAcciones: Record<TipoIncidencia, string> = {
  sin_fuente: 'Añade al menos una fuente que respalde la información.',
  fuente_antigua: 'Vuelve a consultar la fuente y actualiza su fecha de consulta.',
  vencido: 'Verifica que la información siga vigente y renueva su revisión.',
  campos_incompletos: 'Completa los datos que faltan del servicio.',
  en_revision_prolongada: 'Revísalo y publícalo o devuélvelo a borrador.',
}

const tarjetas: { estado: EstadoServicio | 'total'; etiqueta: string; icono: IconName }[] = [
  { estado: 'total', etiqueta: 'Servicios totales', icono: 'book' },
  { estado: 'publicado', etiqueta: 'Publicados', icono: 'verified' },
  { estado: 'en_revision', etiqueta: 'En revisión', icono: 'clock' },
  { estado: 'no_vigente', etiqueta: 'No vigentes', icono: 'alert' },
]

function Tablero({ datos }: { datos: DatosObservatorio }) {
  const { servicios, actividad } = datos
  const hoy = hoyIso()
  const resumen = calcularResumen(servicios)
  const cobertura = calcularCobertura(servicios)
  const distribucion = calcularPorCategoria(servicios)
  const totalDistribucion = distribucion.reduce((suma, fila) => suma + fila.total, 0)
  const validaciones = ejecutarValidaciones(servicios, hoy)
  const vigencia = calcularVigencia(servicios, hoy)
  const avisoDias = configuracionActual().avisoPorVencerDias

  return (
    <div className="panel-dashboard">
      <ul className="panel-kpis" aria-label="Resumen del catálogo">
        {tarjetas.map((tarjeta) => (
          <li key={tarjeta.estado}>
            <Link
              to={
                tarjeta.estado === 'total'
                  ? '/panel/servicios'
                  : `/panel/servicios?estado=${tarjeta.estado}`
              }
              className={`panel-kpi panel-kpi--${tarjeta.estado}`}
            >
              <span className="panel-kpi__icon">
                <Icon name={tarjeta.icono} size={20} />
              </span>
              <span className="panel-kpi__value">
                {tarjeta.estado === 'total' ? resumen.total : resumen.porEstado[tarjeta.estado]}
              </span>
              <span className="panel-kpi__label">{tarjeta.etiqueta}</span>
              <Icon name="chevron-right" size={18} className="panel-kpi__arrow" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="panel-grid">
        <section className="panel-card panel-grid__wide" aria-labelledby="vigencia-titulo">
          <h3 id="vigencia-titulo">Vigencia de los servicios publicados</h3>
          <p className="panel-hint">
            Según la fecha de vigencia de cada servicio publicado y el aviso configurado.
          </p>
          <ul className="panel-vigencia" aria-label="Vigencia de los servicios publicados">
            <li className="panel-vigencia__item panel-vigencia__item--vigentes">
              <span className="panel-vigencia__value">{vigencia.vigentes}</span>
              <span className="panel-vigencia__label">Vigentes</span>
            </li>
            <li className="panel-vigencia__item panel-vigencia__item--por-vencer">
              <span className="panel-vigencia__value">{vigencia.porVencer}</span>
              <span className="panel-vigencia__label">Por vencer ({avisoDias} días)</span>
            </li>
            <li className="panel-vigencia__item panel-vigencia__item--vencidos">
              <span className="panel-vigencia__value">{vigencia.vencidos}</span>
              <span className="panel-vigencia__label">Vencidos</span>
            </li>
          </ul>
        </section>

        <Incidencias incidencias={detectarIncidencias(servicios, hoy)} />

        <div className="panel-grid__wide panel-category-charts">
          <section className="panel-card" aria-labelledby="categorias-grafica-titulo">
            <h3 id="categorias-grafica-titulo">Servicios por categoría</h3>
            <p className="panel-hint">
              Cantidad y porcentaje sobre el total de {totalDistribucion} servicios. Selecciona una
              categoría para revisar sus servicios.
            </p>
            <Barras
              datos={distribucion.map(({ categoria, total, porcentaje: participacion }) => ({
                etiqueta: categories[categoria].label,
                valor: total,
                porcentaje: participacion,
                href: `/panel/servicios?categoria=${categoria}`,
                serie: `panel-serie--${categories[categoria].tone}`,
              }))}
            />
          </section>

          <section className="panel-card" aria-labelledby="categorias-titulo">
            <h3 id="categorias-titulo">Distribución de servicios por categoría</h3>
            <p className="panel-hint">
              Participación de cada categoría sobre el total de {totalDistribucion} servicios, en
              cualquier estado. Selecciona una categoría para revisar sus servicios.
            </p>
            <div role="region" aria-label="Gráfica de distribución por categoría">
              <Barras
                className="panel-bars--wide"
                datos={distribucion.map(({ categoria, total, porcentaje: participacion }) => ({
                  etiqueta: categories[categoria].label,
                  valor: total,
                  porcentaje: participacion,
                  href: `/panel/servicios?categoria=${categoria}`,
                  serie: `panel-serie--${categories[categoria].tone}`,
                }))}
              />
            </div>
          </section>
        </div>

        <div className="panel-grid__wide panel-activity-validation">
          <section className="panel-card" aria-labelledby="actividad-titulo">
            <h3 id="actividad-titulo">Actividad reciente</h3>
            <p className="panel-hint">Últimos cambios de estado en los servicios.</p>
            <ol className="panel-activity">
              {actividad.map((evento) => (
                <li key={evento.id}>
                  <div>
                    <p className="panel-activity__title">{accionLabels[evento.accion]}</p>
                    <Link to={`/panel/servicios/${evento.servicioId}`}>
                      {evento.servicioNombre}
                    </Link>
                    <p className="panel-timeline__meta">
                      <time dateTime={evento.fecha}>{formatearFechaHora(evento.fecha)}</time>
                    </p>
                  </div>
                  {evento.estadoNuevo && <EstadoTag estado={evento.estadoNuevo} />}
                </li>
              ))}
            </ol>
          </section>

          <section className="panel-card" aria-labelledby="validaciones-titulo">
            <div className="panel-card__head">
              <h3 id="validaciones-titulo">Validaciones de calidad</h3>
              <Tag tone="demo">Conjunto sintético</Tag>
            </div>
            <p className="panel-hint">
              Reglas automáticas sobre los servicios activos. Cada fallo aparece en «Necesitan
              atención».
            </p>
            <div
              className="panel-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Validaciones"
            >
              <table className="panel-table">
                <thead>
                  <tr>
                    <th scope="col">Regla</th>
                    <th scope="col">Aprobados</th>
                    <th scope="col">Fallidos</th>
                  </tr>
                </thead>
                <tbody>
                  {validaciones.map((regla) => (
                    <tr key={regla.nombre}>
                      <th scope="row">{regla.nombre}</th>
                      <td>{regla.aprobados}</td>
                      <td>
                        {regla.fallidos > 0 ? (
                          <Tag tone="warning">{regla.fallidos}</Tag>
                        ) : (
                          <Tag tone="success">0</Tag>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="panel-hint">
              Ejecutadas el {formatearFechaHora(new Date().toISOString())}.
            </p>
          </section>
        </div>

        <section className="panel-card panel-grid__wide" aria-labelledby="cobertura-titulo">
          <h3 id="cobertura-titulo">Cobertura de fuentes</h3>
          <p className="panel-hint">Servicios publicados y cuántos tienen una fuente oficial.</p>
          <div className="panel-coverage">
            <section className="panel-coverage__chart" aria-labelledby="cobertura-categoria-titulo">
              <h4 id="cobertura-categoria-titulo">Por categoría</h4>
              <TortaCobertura
                grupo="categoria"
                filas={cobertura.porCategoria.map((fila) => ({
                  ...fila,
                  nombre: categories[fila.categoria].label,
                }))}
              />
            </section>
            <section className="panel-coverage__chart" aria-labelledby="cobertura-comuna-titulo">
              <h4 id="cobertura-comuna-titulo">Por comuna</h4>
              <TortaCobertura
                grupo="comuna"
                filas={cobertura.porComuna.map((fila) => ({
                  ...fila,
                  nombre: `Comuna ${fila.comuna}`,
                }))}
              />
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}

function Incidencias({ incidencias }: { incidencias: ReturnType<typeof detectarIncidencias> }) {
  const [tipo, setTipo] = useState<TipoIncidencia | null>(null)
  const tipos = Object.keys(incidenciaLabels) as TipoIncidencia[]
  const visibles = incidencias.filter((incidencia) => !tipo || incidencia.tipo === tipo)

  if (incidencias.length === 0) {
    return (
      <section className="panel-card panel-grid__wide" aria-labelledby="incidencias-titulo">
        <h3 id="incidencias-titulo">Necesitan atención</h3>
        <p className="panel-all-clear">
          <Icon name="verified" size={20} />
          Todo en orden: ningún servicio necesita atención.
        </p>
      </section>
    )
  }

  return (
    <section className="panel-card panel-grid__wide" aria-labelledby="incidencias-titulo">
      <h3 id="incidencias-titulo">Necesitan atención</h3>
      <p className="panel-hint">
        {incidencias.length === 1
          ? 'Hay 1 problema por resolver.'
          : `Hay ${incidencias.length} problemas por resolver.`}{' '}
        Abre cada servicio para corregirlo.
      </p>
      <div className="panel-chips" role="group" aria-label="Filtrar incidencias">
        <Chip selected={tipo === null} onClick={() => setTipo(null)}>
          Todas <span className="panel-count">{incidencias.length}</span>
        </Chip>
        {tipos.map((valor) => (
          <Chip key={valor} selected={tipo === valor} onClick={() => setTipo(valor)}>
            {incidenciaLabels[valor]}
            <span className="panel-count">
              {incidencias.filter((incidencia) => incidencia.tipo === valor).length}
            </span>
          </Chip>
        ))}
      </div>
      {visibles.length === 0 ? (
        <p className="panel-muted">Sin incidencias de este tipo.</p>
      ) : (
        <ul className="panel-issues">
          {visibles.map((incidencia) => (
            <li key={`${incidencia.servicioId}-${incidencia.tipo}`}>
              <div className="panel-issues__info">
                <span className="panel-issues__name">{incidencia.nombre}</span>
                <span className="panel-issues__action">{incidenciaAcciones[incidencia.tipo]}</span>
              </div>
              <div className="panel-issues__review">
                <Tag tone="warning" icon="alert">
                  {incidenciaLabels[incidencia.tipo]}
                </Tag>
                <ButtonLink
                  to={`/panel/servicios/${incidencia.servicioId}`}
                  variant="secondary"
                  size="sm"
                  iconEnd="arrow-right"
                  aria-label={`Revisar ${incidencia.nombre}`}
                >
                  Revisar
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
