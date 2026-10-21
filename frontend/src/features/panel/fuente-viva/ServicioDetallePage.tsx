import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Button, ButtonLink } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { StatusMessage } from '../../../components/StatusMessage'
import { Tag } from '../../../components/Tag'
import { categories } from '../../../content/categories'
import { EstadoTag } from '../EstadoTag'
import { formatearFecha, formatearFechaHora, hoyIso } from '../fechas'
import { PanelHeader } from '../PanelHeader'
import { PanelIcon } from '../PanelIcon'
import {
  accionLabels,
  estadoLabels,
  fuenteVigente,
  motivoBloqueo,
  tipoFuenteLabels,
  transicionesDesde,
} from '../reglas'
import {
  agregarFuente,
  cambiarEstado,
  listarHistorial,
  obtenerServicio,
  quitarFuente,
} from '../services/panelData'
import type { DatosFuente, EventoRevision, ServicioAdmin, TipoFuente } from '../types'
import { useCarga } from '../useCarga'

interface Detalle {
  servicio: ServicioAdmin
  historial: EventoRevision[]
}

/** Fuente Viva — detalle, fuentes, revisión e historial de un servicio. */
export function ServicioDetallePage() {
  const { id = '' } = useParams()
  const { hash } = useLocation()

  const cargar = useCallback(
    async (signal: AbortSignal): Promise<Detalle> => {
      const [servicio, historial] = await Promise.all([
        obtenerServicio(id, { signal }),
        listarHistorial(id, { signal }),
      ])
      return { servicio, historial }
    },
    [id],
  )
  const { state, reintentar, actualizar } = useCarga(cargar)

  // Lleva a la sección pedida desde la tabla (#revision, #historial) cuando ya hay datos.
  useEffect(() => {
    if (state.status === 'ready' && hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
    }
  }, [state.status, hash])

  /** Tras una acción: muestra el servicio devuelto y recarga el historial. */
  const aplicar = useCallback(
    async (servicio: ServicioAdmin) => {
      actualizar({ servicio, historial: await listarHistorial(servicio.id) })
    },
    [actualizar],
  )

  const volver = (
    <Link to="/panel/servicios" className="panel-back">
      <Icon name="arrow-left" size={16} />
      Servicios
    </Link>
  )

  if (state.status === 'loading') {
    return (
      <>
        <PanelHeader titulo="Servicio" antes={volver} />
        <StatusMessage kind="loading" title="Cargando servicio…" />
      </>
    )
  }
  if (state.status === 'error') {
    return (
      <>
        <PanelHeader titulo="Servicio" antes={volver} />
        <StatusMessage
          kind="error"
          title="No pudimos cargar este servicio"
          description="Puede que no exista o que haya un problema temporal."
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      </>
    )
  }

  const { servicio, historial } = state.data
  const categoria = categories[servicio.categoria]

  return (
    <>
      <PanelHeader titulo={servicio.nombre} subtitulo={servicio.institucion} antes={volver}>
        <div className="panel-header__tags">
          <EstadoTag estado={servicio.estado} />
          <Tag icon={categoria.icon}>{categoria.label}</Tag>
        </div>
      </PanelHeader>

      <div className="panel-detail">
        <div className="panel-detail__main">
          <section className="panel-card" aria-labelledby="datos-titulo">
            <div className="panel-card__head">
              <h3 id="datos-titulo">Datos del servicio</h3>
              <ButtonLink
                to={`/panel/servicios/${servicio.id}/editar`}
                variant="secondary"
                size="sm"
              >
                Editar
              </ButtonLink>
            </div>
            <dl className="panel-dl">
              <Dato titulo="Resumen" valor={servicio.resumen} />
              <Dato titulo="Dirección" valor={servicio.direccion} />
              <Dato titulo="Comuna" valor={`Comuna ${servicio.comuna}`} />
              <Dato titulo="Horario" valor={servicio.horario} />
              <Dato titulo="Servicios ofrecidos" valor={servicio.serviciosOfrecidos.join(' · ')} />
              <Dato titulo="Última revisión" valor={formatearFecha(servicio.ultimaRevision)} />
              <Dato titulo="Vigente hasta" valor={formatearFecha(servicio.vigenteHasta)} />
            </dl>
          </section>

          <Fuentes servicio={servicio} onCambio={aplicar} />
        </div>

        <div className="panel-detail__side">
          <Revision servicio={servicio} onCambio={aplicar} />
          <Historial eventos={historial} />
        </div>
      </div>
    </>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="panel-dl__row">
      <dt>{titulo}</dt>
      <dd>{valor.trim() ? valor : <span className="panel-missing">Sin completar</span>}</dd>
    </div>
  )
}

interface SeccionProps {
  servicio: ServicioAdmin
  onCambio: (servicio: ServicioAdmin) => Promise<void>
}

function Fuentes({ servicio, onCambio }: SeccionProps) {
  const [error, setError] = useState<string | null>(null)
  const hoy = hoyIso()

  async function quitar(fuenteId: string, titulo: string) {
    if (!window.confirm(`¿Quitar la fuente «${titulo}»?`)) return
    setError(null)
    try {
      await onCambio(await quitarFuente(servicio.id, fuenteId))
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo quitar la fuente.')
    }
  }

  return (
    <section className="panel-card" aria-labelledby="fuentes-titulo">
      <div className="panel-card__head">
        <h3 id="fuentes-titulo">Fuentes</h3>
        <span className="panel-muted">
          {servicio.fuentes.length === 1 ? '1 fuente' : `${servicio.fuentes.length} fuentes`}
        </span>
      </div>

      {servicio.fuentes.length === 0 ? (
        <p className="panel-callout">
          Este servicio no tiene fuentes. Añade al menos una para poder publicarlo.
        </p>
      ) : (
        <ul className="panel-sources">
          {servicio.fuentes.map((fuente) => (
            <li key={fuente.id} className="panel-source">
              <div className="panel-source__body">
                <p className="panel-source__title">
                  {fuente.url ? (
                    <a href={fuente.url} target="_blank" rel="noreferrer">
                      {fuente.titulo}
                      <span className="visually-hidden"> (abre en una pestaña nueva)</span>
                    </a>
                  ) : (
                    fuente.titulo
                  )}
                </p>
                <p className="panel-source__meta">
                  <Tag tone={fuente.tipo === 'oficial' ? 'success' : 'neutral'}>
                    {tipoFuenteLabels[fuente.tipo]}
                  </Tag>
                  <span>Consultada el {formatearFecha(fuente.fechaConsulta)}</span>
                  {!fuenteVigente(fuente.fechaConsulta, hoy) && (
                    <Tag tone="warning" icon="alert">
                      Antigua
                    </Tag>
                  )}
                </p>
                {fuente.notas && <p className="panel-source__notes">{fuente.notas}</p>}
              </div>
              <button
                type="button"
                className="panel-icon-button"
                onClick={() => quitar(fuente.id, fuente.titulo)}
                aria-label={`Quitar la fuente ${fuente.titulo}`}
                title="Quitar"
              >
                <PanelIcon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      <NuevaFuente servicio={servicio} onCambio={onCambio} />
    </section>
  )
}

const fuenteVacia = (): DatosFuente => ({
  tipo: 'oficial',
  titulo: '',
  url: null,
  fechaConsulta: hoyIso(),
  notas: null,
})

function NuevaFuente({ servicio, onCambio }: SeccionProps) {
  const id = useId()
  const [abierta, setAbierta] = useState(false)
  const [datos, setDatos] = useState<DatosFuente>(fuenteVacia)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!datos.titulo.trim() || !datos.fechaConsulta) {
      setError('Indica al menos el título y la fecha de consulta.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await onCambio(
        await agregarFuente(servicio.id, {
          ...datos,
          titulo: datos.titulo.trim(),
          url: datos.url?.trim() || null,
          notas: datos.notas?.trim() || null,
        }),
      )
      setDatos(fuenteVacia())
      setAbierta(false)
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo añadir la fuente.')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierta) {
    return (
      <Button variant="secondary" size="sm" iconStart="plus" onClick={() => setAbierta(true)}>
        Añadir fuente
      </Button>
    )
  }

  return (
    <form className="panel-form panel-form--inline" onSubmit={enviar} aria-label="Nueva fuente">
      <div className="panel-field">
        <label htmlFor={`${id}-titulo`}>Título *</label>
        <input
          id={`${id}-titulo`}
          value={datos.titulo}
          onChange={(event) => setDatos({ ...datos, titulo: event.target.value })}
          required
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-tipo`}>Tipo</label>
        <select
          id={`${id}-tipo`}
          value={datos.tipo}
          onChange={(event) => setDatos({ ...datos, tipo: event.target.value as TipoFuente })}
        >
          {(Object.keys(tipoFuenteLabels) as TipoFuente[]).map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipoFuenteLabels[tipo]}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-url`}>Enlace</label>
        <input
          id={`${id}-url`}
          type="url"
          placeholder="https://…"
          value={datos.url ?? ''}
          onChange={(event) => setDatos({ ...datos, url: event.target.value })}
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-fecha`}>Fecha de consulta *</label>
        <input
          id={`${id}-fecha`}
          type="date"
          max={hoyIso()}
          value={datos.fechaConsulta}
          onChange={(event) => setDatos({ ...datos, fechaConsulta: event.target.value })}
          required
        />
      </div>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${id}-notas`}>Notas</label>
        <input
          id={`${id}-notas`}
          value={datos.notas ?? ''}
          onChange={(event) => setDatos({ ...datos, notas: event.target.value })}
        />
      </div>
      {error && (
        <p className="panel-error panel-field--wide" role="alert">
          {error}
        </p>
      )}
      <div className="panel-form__actions panel-field--wide">
        <Button type="submit" size="sm" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar fuente'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setAbierta(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function Revision({ servicio, onCambio }: SeccionProps) {
  const id = useId()
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  async function transicionar(a: ServicioAdmin['estado']) {
    setEnviando(true)
    setMensaje(null)
    try {
      await onCambio(await cambiarEstado(servicio.id, a, comentario))
      setComentario('')
      setMensaje({ tipo: 'ok', texto: `El servicio ahora está «${estadoLabels[a]}».` })
    } catch (causa) {
      setMensaje({
        tipo: 'error',
        texto: causa instanceof Error ? causa.message : 'No se pudo cambiar el estado.',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="revision" className="panel-card" aria-labelledby="revision-titulo">
      <h3 id="revision-titulo">Revisión y publicación</h3>
      <p className="panel-muted">
        Estado actual: <EstadoTag estado={servicio.estado} />
      </p>
      <div className="panel-field">
        <label htmlFor={`${id}-comentario`}>Comentario (opcional)</label>
        <textarea
          id={`${id}-comentario`}
          rows={3}
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
        />
      </div>
      <div className="panel-transitions">
        {transicionesDesde(servicio.estado).map((transicion) => {
          const bloqueo = motivoBloqueo(servicio, transicion.a)
          return (
            <div key={transicion.a} className="panel-transition">
              <Button
                variant={transicion.a === 'publicado' ? 'primary' : 'secondary'}
                size="sm"
                disabled={enviando || bloqueo !== null}
                aria-describedby={bloqueo ? `${id}-${transicion.a}-bloqueo` : undefined}
                onClick={() => transicionar(transicion.a)}
              >
                {transicion.etiqueta}
              </Button>
              {bloqueo && (
                <p id={`${id}-${transicion.a}-bloqueo`} className="panel-hint">
                  {bloqueo}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <div aria-live="polite">
        {mensaje && (
          <p className={mensaje.tipo === 'ok' ? 'panel-success' : 'panel-error'}>{mensaje.texto}</p>
        )}
      </div>
    </section>
  )
}

function Historial({ eventos }: { eventos: EventoRevision[] }) {
  return (
    <section id="historial" className="panel-card" aria-labelledby="historial-titulo">
      <h3 id="historial-titulo">Historial</h3>
      {eventos.length === 0 ? (
        <p className="panel-muted">Sin eventos todavía.</p>
      ) : (
        <ol className="panel-timeline">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <p className="panel-timeline__title">
                {accionLabels[evento.accion]}
                {evento.estadoNuevo && evento.estadoNuevo !== evento.estadoAnterior && (
                  <EstadoTag estado={evento.estadoNuevo} />
                )}
              </p>
              {evento.comentario && <p className="panel-timeline__comment">{evento.comentario}</p>}
              <p className="panel-timeline__meta">
                {evento.autor} ·{' '}
                <time dateTime={evento.fecha}>{formatearFechaHora(evento.fecha)}</time>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
