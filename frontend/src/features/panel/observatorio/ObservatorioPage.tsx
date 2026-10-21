import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { Annotation } from '../../../components/Annotation'
import { Button } from '../../../components/Button'
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
import { Barras, Dona, Proporcion } from './Graficos'
import {
  calcularCalidad,
  calcularCobertura,
  calcularPorCategoria,
  calcularResumen,
  calcularVigencia,
  detectarIncidencias,
  ejecutarValidaciones,
  incidenciaLabels,
  porcentaje,
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
        nota={
          <Annotation tone="amarillo" tilt={4} className="panel-header__note">
            Datos claros para decisiones reales
          </Annotation>
        }
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
  const calidad = calcularCalidad(servicios, hoy)
  const totalCalidad = calidad.conFuenteVerificable + calidad.pendienteRevision + calidad.sinFuente
  const vigencia = calcularVigencia(servicios, hoy)
  const cobertura = calcularCobertura(servicios)
  const validaciones = ejecutarValidaciones(servicios, hoy)

  const segmentosCalidad = [
    {
      etiqueta: 'Con fuente verificable',
      valor: calidad.conFuenteVerificable,
      serie: 'panel-serie--ok',
    },
    {
      etiqueta: 'Pendiente de revisión',
      valor: calidad.pendienteRevision,
      serie: 'panel-serie--pendiente',
    },
    { etiqueta: 'Sin fuente', valor: calidad.sinFuente, serie: 'panel-serie--sin' },
  ]

  return (
    <div className="panel-dashboard">
      <ul className="panel-kpis" aria-label="Resumen del catálogo">
        {tarjetas.map((tarjeta) => (
          <li key={tarjeta.estado} className={`panel-kpi panel-kpi--${tarjeta.estado}`}>
            <span className="panel-kpi__icon">
              <Icon name={tarjeta.icono} size={20} />
            </span>
            <span className="panel-kpi__value">
              {tarjeta.estado === 'total' ? resumen.total : resumen.porEstado[tarjeta.estado]}
            </span>
            <span className="panel-kpi__label">{tarjeta.etiqueta}</span>
          </li>
        ))}
      </ul>

      <div className="panel-grid">
        <section className="panel-card" aria-labelledby="calidad-titulo">
          <h3 id="calidad-titulo">Calidad de la información</h3>
          <div className="panel-quality">
            <Dona
              segmentos={segmentosCalidad}
              centro={`${porcentaje(calidad.conFuenteVerificable, totalCalidad)}%`}
              detalle="con fuente verificable"
            />
            <ul className="panel-legend">
              {segmentosCalidad.map((segmento) => (
                <li key={segmento.etiqueta}>
                  <span className={`panel-legend__dot ${segmento.serie}`} aria-hidden="true" />
                  <span>{segmento.etiqueta}</span>
                  <strong>{porcentaje(segmento.valor, totalCalidad)}%</strong>
                  <span className="visually-hidden">({segmento.valor} servicios)</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="panel-hint">Servicios activos ({totalCalidad}); excluye los no vigentes.</p>
        </section>

        <section className="panel-card" aria-labelledby="categorias-titulo">
          <h3 id="categorias-titulo">Servicios por categoría</h3>
          <Barras
            datos={calcularPorCategoria(servicios).map(({ categoria, total }) => ({
              etiqueta: categories[categoria].label,
              valor: total,
              serie: `panel-serie--${categories[categoria].tone}`,
            }))}
          />
        </section>

        <section className="panel-card" aria-labelledby="actividad-titulo">
          <h3 id="actividad-titulo">Actividad reciente</h3>
          <ol className="panel-activity">
            {actividad.map((evento) => (
              <li key={evento.id}>
                <div>
                  <p className="panel-activity__title">{accionLabels[evento.accion]}</p>
                  <Link to={`/panel/servicios/${evento.servicioId}`}>{evento.servicioNombre}</Link>
                  <p className="panel-timeline__meta">
                    <time dateTime={evento.fecha}>{formatearFechaHora(evento.fecha)}</time>
                  </p>
                </div>
                {evento.estadoNuevo && <EstadoTag estado={evento.estadoNuevo} />}
              </li>
            ))}
          </ol>
        </section>

        <section className="panel-card" aria-labelledby="vigencia-titulo">
          <h3 id="vigencia-titulo">Vigencia de publicados</h3>
          <ul className="panel-stats">
            <li className="panel-stat panel-stat--ok">
              <strong>{vigencia.vigentes}</strong> Vigentes
            </li>
            <li className="panel-stat panel-stat--pendiente">
              <strong>{vigencia.porVencer}</strong> Por vencer (
              {configuracionActual().avisoPorVencerDias} días)
            </li>
            <li className="panel-stat panel-stat--sin">
              <strong>{vigencia.vencidos}</strong> Vencidos
            </li>
          </ul>
        </section>

        <Incidencias incidencias={detectarIncidencias(servicios, hoy)} />

        <section className="panel-card panel-grid__wide" aria-labelledby="cobertura-titulo">
          <h3 id="cobertura-titulo">Cobertura de fuentes</h3>
          <p className="panel-hint">Servicios publicados y cuántos tienen una fuente oficial.</p>
          <div className="panel-coverage">
            <TablaCobertura
              titulo="Por categoría"
              filas={cobertura.porCategoria.map((fila) => ({
                ...fila,
                nombre: categories[fila.categoria].label,
              }))}
            />
            <TablaCobertura
              titulo="Por comuna"
              filas={cobertura.porComuna.map((fila) => ({
                ...fila,
                nombre: `Comuna ${fila.comuna}`,
              }))}
            />
          </div>
        </section>

        <section className="panel-card panel-grid__wide" aria-labelledby="validaciones-titulo">
          <div className="panel-card__head">
            <h3 id="validaciones-titulo">Validaciones de calidad</h3>
            <Tag tone="demo">Conjunto sintético</Tag>
          </div>
          <div className="panel-table-scroll" tabIndex={0} role="region" aria-label="Validaciones">
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
    </div>
  )
}

function Incidencias({ incidencias }: { incidencias: ReturnType<typeof detectarIncidencias> }) {
  const [tipo, setTipo] = useState<TipoIncidencia | null>(null)
  const tipos = Object.keys(incidenciaLabels) as TipoIncidencia[]
  const visibles = incidencias.filter((incidencia) => !tipo || incidencia.tipo === tipo)

  return (
    <section className="panel-card panel-grid__span2" aria-labelledby="incidencias-titulo">
      <h3 id="incidencias-titulo">Incidencias</h3>
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
              <Link to={`/panel/servicios/${incidencia.servicioId}`}>{incidencia.nombre}</Link>
              <Tag tone="warning" icon="alert">
                {incidenciaLabels[incidencia.tipo]}
              </Tag>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TablaCobertura({
  titulo,
  filas,
}: {
  titulo: string
  filas: { nombre: string; publicados: number; conFuenteOficial: number }[]
}) {
  return (
    <table className="panel-table panel-table--compact">
      <caption>{titulo}</caption>
      <thead>
        <tr>
          <th scope="col">Grupo</th>
          <th scope="col">Publicados</th>
          <th scope="col">Con fuente oficial</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.nombre}>
            <th scope="row">{fila.nombre}</th>
            <td>{fila.publicados}</td>
            <td>
              <span className="panel-ratio-cell">
                {fila.conFuenteOficial}
                <Proporcion parte={fila.conFuenteOficial} total={fila.publicados} />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
