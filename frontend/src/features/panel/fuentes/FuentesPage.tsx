import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { SearchField } from '../../../components/SearchField'
import { StatusMessage } from '../../../components/StatusMessage'
import { Chip, Tag } from '../../../components/Tag'
import { EstadoTag } from '../EstadoTag'
import { formatearFecha, hoyIso } from '../fechas'
import { normalizar } from '../fuente-viva/filtrarServicios'
import { PanelHeader } from '../PanelHeader'
import { configuracionActual, fuenteVigente, tipoFuenteLabels } from '../reglas'
import { listarFuentes, marcarFuenteConsultada } from '../services/panelData'
import type { FuenteConServicio, TipoFuente } from '../types'
import { useCarga } from '../useCarga'

type FiltroVigencia = 'todas' | 'vigentes' | 'antiguas'

const tipos = Object.keys(tipoFuenteLabels) as TipoFuente[]

/** Fuentes — todas las fuentes que respaldan el catálogo y su antigüedad. */
export function FuentesPage() {
  const cargar = useCallback((signal: AbortSignal) => listarFuentes({ signal }), [])
  const { state, reintentar, actualizar } = useCarga(cargar)
  const [consulta, setConsulta] = useState('')
  const [tipo, setTipo] = useState<TipoFuente | null>(null)
  const [vigencia, setVigencia] = useState<FiltroVigencia>('todas')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const hoy = hoyIso()

  const fuentes = state.status === 'ready' ? state.data : []
  const q = normalizar(consulta.trim())
  const visibles = fuentes.filter((fuente) => {
    const vigente = fuenteVigente(fuente.fechaConsulta, hoy)
    return (
      (!tipo || fuente.tipo === tipo) &&
      (vigencia === 'todas' || (vigencia === 'vigentes') === vigente) &&
      (!q || normalizar(`${fuente.titulo} ${fuente.servicioNombre}`).includes(q))
    )
  })
  const antiguas = fuentes.filter((fuente) => !fuenteVigente(fuente.fechaConsulta, hoy)).length

  async function marcar(fuente: FuenteConServicio) {
    setMensaje(null)
    try {
      const actualizada = await marcarFuenteConsultada(fuente.servicioId, fuente.id)
      actualizar(fuentes.map((item) => (item.id === actualizada.id ? actualizada : item)))
      setMensaje({ tipo: 'ok', texto: `«${fuente.titulo}» quedó consultada hoy.` })
    } catch (causa) {
      setMensaje({
        tipo: 'error',
        texto: causa instanceof Error ? causa.message : 'No se pudo actualizar la fuente.',
      })
    }
  }

  return (
    <>
      <PanelHeader
        titulo="Fuentes"
        subtitulo="Todas las fuentes que respaldan la información del catálogo."
      />
      {state.status === 'loading' && <StatusMessage kind="loading" title="Cargando fuentes…" />}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar las fuentes"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && (
        <>
          <ul className="panel-kpis" aria-label="Resumen de fuentes">
            <li className="panel-kpi panel-kpi--total">
              <span className="panel-kpi__icon">
                <Icon name="book" size={20} />
              </span>
              <span className="panel-kpi__value">{fuentes.length}</span>
              <span className="panel-kpi__label">Fuentes</span>
            </li>
            <li className="panel-kpi panel-kpi--publicado">
              <span className="panel-kpi__icon">
                <Icon name="verified" size={20} />
              </span>
              <span className="panel-kpi__value">
                {fuentes.filter((fuente) => fuente.tipo === 'oficial').length}
              </span>
              <span className="panel-kpi__label">Oficiales</span>
            </li>
            <li className="panel-kpi panel-kpi--en_revision">
              <span className="panel-kpi__icon">
                <Icon name="clock" size={20} />
              </span>
              <span className="panel-kpi__value">{antiguas}</span>
              <span className="panel-kpi__label">
                Antiguas (más de {configuracionActual().antiguedadMaximaFuenteDias} días)
              </span>
            </li>
            <li className="panel-kpi panel-kpi--no_vigente">
              <span className="panel-kpi__icon">
                <Icon name="building" size={20} />
              </span>
              <span className="panel-kpi__value">
                {new Set(fuentes.map((fuente) => fuente.servicioId)).size}
              </span>
              <span className="panel-kpi__label">Servicios con fuentes</span>
            </li>
          </ul>

          <div className="panel-toolbar">
            <div className="panel-toolbar__search">
              <SearchField
                label="Buscar fuentes"
                placeholder="Buscar fuente o servicio…"
                value={consulta}
                onChange={setConsulta}
              />
            </div>
            <div className="panel-toolbar__filters" role="group" aria-label="Filtrar por tipo">
              <Chip selected={tipo === null} onClick={() => setTipo(null)}>
                Todos los tipos
              </Chip>
              {tipos.map((valor) => (
                <Chip key={valor} selected={tipo === valor} onClick={() => setTipo(valor)}>
                  {tipoFuenteLabels[valor]}
                </Chip>
              ))}
            </div>
            <div
              className="panel-toolbar__filters"
              role="group"
              aria-label="Filtrar por antigüedad"
            >
              {(
                [
                  ['todas', 'Todas'],
                  ['vigentes', 'Vigentes'],
                  ['antiguas', 'Antiguas'],
                ] as const
              ).map(([valor, etiqueta]) => (
                <Chip key={valor} selected={vigencia === valor} onClick={() => setVigencia(valor)}>
                  {etiqueta}
                </Chip>
              ))}
            </div>
          </div>

          <div aria-live="polite">
            {mensaje && (
              <p className={mensaje.tipo === 'ok' ? 'panel-success' : 'panel-error'}>
                {mensaje.texto}
              </p>
            )}
          </div>

          {visibles.length === 0 ? (
            <StatusMessage
              kind="empty"
              title="No hay fuentes con esos filtros"
              description="Prueba con otra búsqueda, tipo o antigüedad."
            />
          ) : (
            <section className="panel-card panel-table-card" aria-label="Listado de fuentes">
              <div className="panel-table-scroll">
                <table className="panel-table panel-table--cards panel-table--wrap">
                  <thead>
                    <tr>
                      <th scope="col">Fuente</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Servicio</th>
                      <th scope="col">Consultada</th>
                      <th scope="col">Antigüedad</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((fuente) => {
                      const vigente = fuenteVigente(fuente.fechaConsulta, hoy)
                      return (
                        <tr key={fuente.id}>
                          <th scope="row">
                            {fuente.url ? (
                              <a href={fuente.url} target="_blank" rel="noreferrer">
                                {fuente.titulo}
                                <span className="visually-hidden">
                                  {' '}
                                  (abre en una pestaña nueva)
                                </span>
                              </a>
                            ) : (
                              fuente.titulo
                            )}
                          </th>
                          <td data-label="Tipo">
                            <Tag tone={fuente.tipo === 'oficial' ? 'success' : 'neutral'}>
                              {tipoFuenteLabels[fuente.tipo]}
                            </Tag>
                          </td>
                          <td data-label="Servicio">
                            <span className="panel-cell-stack">
                              <Link to={`/panel/servicios/${fuente.servicioId}`}>
                                {fuente.servicioNombre}
                              </Link>
                              <EstadoTag estado={fuente.servicioEstado} />
                            </span>
                          </td>
                          <td data-label="Consultada">{formatearFecha(fuente.fechaConsulta)}</td>
                          <td data-label="Antigüedad">
                            {vigente ? (
                              <Tag tone="success">Vigente</Tag>
                            ) : (
                              <Tag tone="warning" icon="alert">
                                Antigua
                              </Tag>
                            )}
                          </td>
                          <td className="panel-table__cell-action">
                            <Button
                              variant="secondary"
                              size="sm"
                              iconStart="refresh"
                              disabled={fuente.fechaConsulta === hoy}
                              aria-label={
                                fuente.fechaConsulta === hoy
                                  ? `«${fuente.titulo}» ya se consultó hoy`
                                  : `Marcar «${fuente.titulo}» como consultada hoy`
                              }
                              onClick={() => marcar(fuente)}
                            >
                              {fuente.fechaConsulta === hoy
                                ? 'Consultada hoy'
                                : 'Marcar consultada'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
