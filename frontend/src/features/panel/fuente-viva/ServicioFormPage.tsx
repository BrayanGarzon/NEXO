import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { StatusMessage } from '../../../components/StatusMessage'
import { categories, categoryOrder } from '../../../content/categories'
import type { ServiceCategory } from '../../../types/catalog'
import { COMUNAS } from '../observatorio/indicadores'
import { PanelHeader } from '../PanelHeader'
import { actualizarServicio, crearServicio, obtenerServicio } from '../services/panelData'
import type { DatosServicio } from '../types'
import { useCarga } from '../useCarga'

const vacio: DatosServicio = {
  nombre: '',
  categoria: 'salud-mental',
  institucion: '',
  resumen: '',
  direccion: '',
  comuna: 1,
  horario: '',
  serviciosOfrecidos: [],
}

/** Fuente Viva — crear (`/panel/servicios/nuevo`) o editar (`/:id/editar`) un servicio. */
export function ServicioFormPage() {
  const { id } = useParams()
  const cargar = useCallback(
    async (signal: AbortSignal): Promise<DatosServicio> => {
      if (!id) return vacio
      const servicio = await obtenerServicio(id, { signal })
      return Object.fromEntries(
        (Object.keys(vacio) as (keyof DatosServicio)[]).map((clave) => [clave, servicio[clave]]),
      ) as DatosServicio
    },
    [id],
  )
  const { state, reintentar } = useCarga(cargar)
  const titulo = id ? 'Editar servicio' : 'Nuevo servicio'
  const volver = (
    <Link to={id ? `/panel/servicios/${id}` : '/panel/servicios'} className="panel-back">
      <Icon name="arrow-left" size={16} />
      {id ? 'Volver al servicio' : 'Servicios'}
    </Link>
  )

  return (
    <>
      <PanelHeader
        titulo={titulo}
        subtitulo={
          id
            ? 'Los cambios no modifican el estado del servicio.'
            : 'El servicio se crea como borrador.'
        }
        antes={volver}
      />
      {state.status === 'loading' && <StatusMessage kind="loading" title="Cargando…" />}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar este servicio"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && <Formulario id={id} inicial={state.data} />}
    </>
  )
}

function Formulario({ id, inicial }: { id?: string; inicial: DatosServicio }) {
  const campo = useId()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(inicial)
  const [ofrecidos, setOfrecidos] = useState(inicial.serviciosOfrecidos.join('\n'))
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function cambiar<K extends keyof DatosServicio>(clave: K, valor: DatosServicio[K]) {
    setDatos((actuales) => ({ ...actuales, [clave]: valor }))
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!datos.nombre.trim() || !datos.institucion.trim()) {
      setError('El nombre y la institución son obligatorios.')
      return
    }
    const limpio: DatosServicio = {
      ...datos,
      nombre: datos.nombre.trim(),
      institucion: datos.institucion.trim(),
      resumen: datos.resumen.trim(),
      direccion: datos.direccion.trim(),
      horario: datos.horario.trim(),
      serviciosOfrecidos: ofrecidos
        .split('\n')
        .map((linea) => linea.trim())
        .filter(Boolean),
    }
    setEnviando(true)
    setError(null)
    try {
      const guardado = id ? await actualizarServicio(id, limpio) : await crearServicio(limpio)
      navigate(`/panel/servicios/${guardado.id}`)
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo guardar el servicio.')
      setEnviando(false)
    }
  }

  return (
    <form className="panel-card panel-form" onSubmit={enviar} noValidate>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-nombre`}>Nombre *</label>
        <input
          id={`${campo}-nombre`}
          value={datos.nombre}
          onChange={(event) => cambiar('nombre', event.target.value)}
          required
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${campo}-categoria`}>Categoría</label>
        <select
          id={`${campo}-categoria`}
          value={datos.categoria}
          onChange={(event) => cambiar('categoria', event.target.value as ServiceCategory)}
        >
          {categoryOrder.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categories[categoria].label}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-field">
        <label htmlFor={`${campo}-institucion`}>Institución *</label>
        <input
          id={`${campo}-institucion`}
          value={datos.institucion}
          onChange={(event) => cambiar('institucion', event.target.value)}
          required
        />
      </div>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-resumen`}>Resumen</label>
        <textarea
          id={`${campo}-resumen`}
          rows={2}
          value={datos.resumen}
          onChange={(event) => cambiar('resumen', event.target.value)}
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${campo}-direccion`}>Dirección</label>
        <input
          id={`${campo}-direccion`}
          value={datos.direccion}
          onChange={(event) => cambiar('direccion', event.target.value)}
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${campo}-comuna`}>Comuna</label>
        <select
          id={`${campo}-comuna`}
          value={datos.comuna}
          onChange={(event) => cambiar('comuna', Number(event.target.value))}
        >
          {COMUNAS.map((comuna) => (
            <option key={comuna} value={comuna}>
              Comuna {comuna}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-horario`}>Horario</label>
        <input
          id={`${campo}-horario`}
          placeholder="Lun – Vie · 8:00 a. m. – 5:00 p. m."
          value={datos.horario}
          onChange={(event) => cambiar('horario', event.target.value)}
        />
      </div>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-ofrecidos`}>Servicios ofrecidos</label>
        <textarea
          id={`${campo}-ofrecidos`}
          rows={3}
          aria-describedby={`${campo}-ofrecidos-ayuda`}
          value={ofrecidos}
          onChange={(event) => setOfrecidos(event.target.value)}
        />
        <p id={`${campo}-ofrecidos-ayuda`} className="panel-hint">
          Uno por línea.
        </p>
      </div>
      {error && (
        <p className="panel-error panel-field--wide" role="alert">
          {error}
        </p>
      )}
      <div className="panel-form__actions panel-field--wide">
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear borrador'}
        </Button>
      </div>
    </form>
  )
}
