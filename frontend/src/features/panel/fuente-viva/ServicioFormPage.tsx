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
import { SelectorHorario } from './SelectorHorario'

const vacio: DatosServicio = {
  nombre: '',
  categoria: 'salud-mental',
  categoriaPersonalizada: '',
  motivoCreacion: '',
  institucion: '',
  resumen: '',
  direccion: '',
  comuna: 1,
  horario: '',
  serviciosOfrecidos: [],
}

const CLAVE_BORRADOR = 'nexo.panel.servicio-nuevo.borrador'

function esDatosServicio(valor: unknown): valor is DatosServicio {
  if (typeof valor !== 'object' || valor === null) return false
  const datos = valor as Record<string, unknown>
  return (
    typeof datos.nombre === 'string' &&
    categoryOrder.some((categoria) => categoria === datos.categoria) &&
    (datos.categoriaPersonalizada === undefined ||
      typeof datos.categoriaPersonalizada === 'string') &&
    typeof datos.motivoCreacion === 'string' &&
    typeof datos.institucion === 'string' &&
    typeof datos.resumen === 'string' &&
    typeof datos.direccion === 'string' &&
    typeof datos.comuna === 'number' &&
    typeof datos.horario === 'string' &&
    Array.isArray(datos.serviciosOfrecidos) &&
    datos.serviciosOfrecidos.every((servicio) => typeof servicio === 'string')
  )
}

function cargarBorrador(inicial: DatosServicio): {
  datos: DatosServicio
  ofrecidos: string
} {
  try {
    const guardado = localStorage.getItem(CLAVE_BORRADOR)
    if (!guardado) return { datos: inicial, ofrecidos: inicial.serviciosOfrecidos.join('\n') }

    const borrador: unknown = JSON.parse(guardado)
    if (
      typeof borrador === 'object' &&
      borrador !== null &&
      'datos' in borrador &&
      'ofrecidos' in borrador &&
      esDatosServicio(borrador.datos) &&
      typeof borrador.ofrecidos === 'string'
    ) {
      return {
        datos:
          borrador.datos.categoria === 'otra'
            ? { ...borrador.datos, categoria: inicial.categoria, categoriaPersonalizada: '' }
            : borrador.datos,
        ofrecidos: borrador.ofrecidos,
      }
    }
  } catch (causa) {
    // Un borrador corrupto no debe impedir que se abra el formulario.
    console.error('No se pudo recuperar el borrador del servicio.', causa)
  }

  return { datos: inicial, ofrecidos: inicial.serviciosOfrecidos.join('\n') }
}

function guardarBorrador(datos: DatosServicio, ofrecidos: string): string | null {
  try {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ datos, ofrecidos }))
    return null
  } catch (causa) {
    return causa instanceof Error
      ? `No pudimos guardar el borrador en este navegador: ${causa.message}`
      : 'No pudimos guardar el borrador en este navegador.'
  }
}

/** Fuente Viva — crear (`/panel/servicios/nuevo`) o editar (`/:id/editar`) un servicio. */
export function ServicioFormPage() {
  const { id } = useParams()
  const cargar = useCallback(
    async (signal: AbortSignal): Promise<DatosServicio> => {
      if (!id) return vacio
      const servicio = await obtenerServicio(id, { signal })
      return {
        ...Object.fromEntries(
          (Object.keys(vacio) as (keyof DatosServicio)[]).map((clave) => [clave, servicio[clave]]),
        ),
        motivoCreacion: servicio.motivoCreacion ?? '',
      } as DatosServicio
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
  const [borradorInicial] = useState(() =>
    id
      ? { datos: inicial, ofrecidos: inicial.serviciosOfrecidos.join('\n') }
      : cargarBorrador(inicial),
  )
  const [datos, setDatos] = useState(borradorInicial.datos)
  const [ofrecidos, setOfrecidos] = useState(borradorInicial.ofrecidos)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function cambiar<K extends keyof DatosServicio>(clave: K, valor: DatosServicio[K]) {
    const actualizados = { ...datos, [clave]: valor }
    if (!id) setError(guardarBorrador(actualizados, ofrecidos))
    setDatos(actualizados)
  }

  function cambiarOfrecidos(valor: string) {
    if (!id) setError(guardarBorrador(datos, valor))
    setOfrecidos(valor)
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!datos.nombre.trim() || !datos.institucion.trim() || !datos.motivoCreacion.trim()) {
      setError('El nombre, la institución y el motivo de creación son obligatorios.')
      return
    }
    if (datos.categoria === 'otra' && !datos.categoriaPersonalizada?.trim()) {
      setError('Especifica la categoría del servicio.')
      return
    }
    const limpio: DatosServicio = {
      ...datos,
      nombre: datos.nombre.trim(),
      categoriaPersonalizada: datos.categoriaPersonalizada?.trim() ?? '',
      institucion: datos.institucion.trim(),
      motivoCreacion: datos.motivoCreacion.trim(),
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
      if (!id) localStorage.removeItem(CLAVE_BORRADOR)
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
          {categoryOrder
            .filter((categoria) => id || categoria !== 'otra')
            .map((categoria) => (
              <option key={categoria} value={categoria}>
                {categories[categoria].label}
              </option>
            ))}
        </select>
      </div>
      {datos.categoria === 'otra' && (
        <div className="panel-field">
          <label htmlFor={`${campo}-categoria-personalizada`}>¿Cuál es la categoría? *</label>
          <input
            id={`${campo}-categoria-personalizada`}
            value={datos.categoriaPersonalizada ?? ''}
            onChange={(event) => cambiar('categoriaPersonalizada', event.target.value)}
            required
          />
        </div>
      )}
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
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-motivo-creacion`}>Motivo de creación *</label>
        <textarea
          id={`${campo}-motivo-creacion`}
          rows={3}
          value={datos.motivoCreacion}
          onChange={(event) => cambiar('motivoCreacion', event.target.value)}
          required
        />
        <p className="panel-hint">
          Explica qué necesidad busca atender este servicio y por qué se incorpora al catálogo.
        </p>
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
        <SelectorHorario
          id={`${campo}-horario`}
          value={datos.horario}
          onChange={(valor) => cambiar('horario', valor)}
        />
      </div>
      <div className="panel-field panel-field--wide">
        <label htmlFor={`${campo}-ofrecidos`}>Servicios ofrecidos</label>
        <textarea
          id={`${campo}-ofrecidos`}
          rows={3}
          aria-describedby={`${campo}-ofrecidos-ayuda`}
          value={ofrecidos}
          onChange={(event) => cambiarOfrecidos(event.target.value)}
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
