import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { SearchField } from '../../../components/SearchField'
import { StatusMessage } from '../../../components/StatusMessage'
import { Chip } from '../../../components/Tag'
import { categories } from '../../../content/categories'
import { EstadoTag } from '../EstadoTag'
import { formatearFecha } from '../fechas'
import { PanelHeader } from '../PanelHeader'
import { PanelIcon } from '../PanelIcon'
import { estadoLabels, estados } from '../reglas'
import { listarServicios } from '../services/panelData'
import type { EstadoServicio, ServicioAdmin } from '../types'
import { useCarga } from '../useCarga'
import { filtrarServicios } from './filtrarServicios'

function esEstado(valor: string | null): valor is EstadoServicio {
  return estados.includes(valor as EstadoServicio)
}

/** Fuente Viva — listado de servicios (panel 06 del moodboard). */
export function ServiciosPage() {
  const [params, setParams] = useSearchParams()
  const estadoParam = params.get('estado')
  const estado = esEstado(estadoParam) ? estadoParam : null
  const consulta = params.get('q') ?? ''

  const cargar = useCallback((signal: AbortSignal) => listarServicios({ signal }), [])
  const { state, reintentar } = useCarga(cargar)

  function cambiarFiltro(clave: 'estado' | 'q', valor: string | null) {
    setParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales)
        if (valor) siguientes.set(clave, valor)
        else siguientes.delete(clave)
        return siguientes
      },
      { replace: clave === 'q' },
    )
  }

  const servicios = state.status === 'ready' ? state.data : []
  const visibles = filtrarServicios(servicios, estado, consulta)
  const conteo = (valor: EstadoServicio | null) => filtrarServicios(servicios, valor, '').length

  return (
    <>
      <PanelHeader titulo="Servicios" subtitulo="Gestiona la información de los servicios." />

      <div className="panel-toolbar">
        <div className="panel-toolbar__search">
          <SearchField
            label="Buscar servicios"
            placeholder="Buscar servicios…"
            value={consulta}
            onChange={(valor) => cambiarFiltro('q', valor)}
          />
        </div>
        <div className="panel-toolbar__filters" role="group" aria-label="Filtrar por estado">
          <Chip selected={estado === null} onClick={() => cambiarFiltro('estado', null)}>
            Todos
            {state.status === 'ready' && <span className="panel-count">{conteo(null)}</span>}
          </Chip>
          {estados.map((valor) => (
            <Chip
              key={valor}
              selected={estado === valor}
              onClick={() => cambiarFiltro('estado', valor)}
            >
              <span className={`panel-dot panel-dot--${valor}`} aria-hidden="true" />
              {estadoLabels[valor]}
              {state.status === 'ready' && <span className="panel-count">{conteo(valor)}</span>}
            </Chip>
          ))}
        </div>
        <ButtonLink to="/panel/servicios/nuevo" variant="accent" iconStart="plus">
          Nuevo servicio
        </ButtonLink>
      </div>

      {state.status === 'loading' && <StatusMessage kind="loading" title="Cargando servicios…" />}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar los servicios"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && visibles.length === 0 && (
        <StatusMessage
          kind="empty"
          title="No hay servicios con esos filtros"
          description="Prueba con otra búsqueda o con otro estado."
        />
      )}
      {state.status === 'ready' && visibles.length > 0 && (
        <TablaServicios servicios={visibles} total={servicios.length} />
      )}
    </>
  )
}

function TablaServicios({ servicios, total }: { servicios: ServicioAdmin[]; total: number }) {
  const titulo = `${servicios.length} de ${total} servicios`
  return (
    <section className="panel-card panel-table-card" aria-labelledby="tabla-servicios-titulo">
      <h3 id="tabla-servicios-titulo" className="visually-hidden">
        {titulo}
      </h3>
      <div className="panel-table-scroll" tabIndex={0} role="region" aria-label={titulo}>
        <table className="panel-table panel-table--cards">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col">Institución</th>
              <th scope="col">Estado</th>
              <th scope="col">Última actualización</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => {
              const categoria = categories[servicio.categoria]
              return (
                <tr key={servicio.id}>
                  <th scope="row">
                    <span className={`panel-cat-icon panel-cat-icon--${categoria.tone}`}>
                      <Icon name={categoria.icon} size={16} />
                    </span>
                    <Link to={`/panel/servicios/${servicio.id}`} className="panel-table__name">
                      {servicio.nombre}
                    </Link>
                  </th>
                  <td data-label="Categoría">{categoria.label}</td>
                  <td data-label="Institución">{servicio.institucion}</td>
                  <td data-label="Estado">
                    <EstadoTag estado={servicio.estado} />
                  </td>
                  <td data-label="Actualizado">{formatearFecha(servicio.actualizadoEn)}</td>
                  <td className="panel-table__actions">
                    <div className="panel-actions">
                      <Link
                        to={`/panel/servicios/${servicio.id}/editar`}
                        className="panel-icon-button"
                        aria-label={`Editar ${servicio.nombre}`}
                        title="Editar"
                      >
                        <PanelIcon name="pencil" size={18} />
                      </Link>
                      <Link
                        to={`/panel/servicios/${servicio.id}#revision`}
                        className="panel-icon-button"
                        aria-label={`Revisar ${servicio.nombre}`}
                        title="Revisar y publicar"
                      >
                        <PanelIcon name="shield" size={18} />
                      </Link>
                      <Link
                        to={`/panel/servicios/${servicio.id}#historial`}
                        className="panel-icon-button"
                        aria-label={`Historial de ${servicio.nombre}`}
                        title="Historial"
                      >
                        <PanelIcon name="history" size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
