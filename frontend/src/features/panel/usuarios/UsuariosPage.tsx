import { useCallback, useId, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { SearchField } from '../../../components/SearchField'
import { StatusMessage } from '../../../components/StatusMessage'
import { Chip, Tag } from '../../../components/Tag'
import { formatearFechaHora } from '../fechas'
import { normalizar } from '../fuente-viva/filtrarServicios'
import { PanelHeader } from '../PanelHeader'
import {
  cambiarActivoUsuario,
  cambiarRolUsuario,
  invitarUsuario,
  listarUsuarios,
} from '../services/panelData'
import type { DatosUsuario, RolUsuario, UsuarioInstitucional } from '../types'
import { useCarga } from '../useCarga'
import { permisos, rolDescripciones, rolLabels, roles } from './permisos'

type Mensaje = { tipo: 'ok' | 'error'; texto: string } | null

function textoError(causa: unknown, porDefecto: string) {
  return causa instanceof Error ? causa.message : porDefecto
}

/** Usuarios — personal institucional con acceso al panel (nunca personas jóvenes). */
export function UsuariosPage() {
  const cargar = useCallback((signal: AbortSignal) => listarUsuarios({ signal }), [])
  const { state, reintentar, actualizar } = useCarga(cargar)
  const [consulta, setConsulta] = useState('')
  const [rol, setRol] = useState<RolUsuario | null>(null)
  const [invitando, setInvitando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const usuarios = state.status === 'ready' ? state.data : []
  const q = normalizar(consulta.trim())
  const visibles = usuarios.filter(
    (usuario) =>
      (!rol || usuario.rol === rol) &&
      (!q || normalizar(`${usuario.nombre} ${usuario.correo} ${usuario.institucion}`).includes(q)),
  )

  function reemplazar(actualizado: UsuarioInstitucional) {
    actualizar(usuarios.map((item) => (item.id === actualizado.id ? actualizado : item)))
  }

  async function cambiarRol(usuario: UsuarioInstitucional, nuevo: RolUsuario) {
    setMensaje(null)
    try {
      reemplazar(await cambiarRolUsuario(usuario.id, nuevo))
      setMensaje({ tipo: 'ok', texto: `Rol de ${usuario.nombre}: ${rolLabels[nuevo]}.` })
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: textoError(causa, 'No se pudo cambiar el rol.') })
    }
  }

  async function alternarActivo(usuario: UsuarioInstitucional) {
    setMensaje(null)
    try {
      const actualizado = await cambiarActivoUsuario(usuario.id, !usuario.activo)
      reemplazar(actualizado)
      setMensaje({
        tipo: 'ok',
        texto: `El acceso de ${usuario.nombre} quedó ${actualizado.activo ? 'activado' : 'desactivado'}.`,
      })
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: textoError(causa, 'No se pudo cambiar el acceso.') })
    }
  }

  return (
    <>
      <PanelHeader titulo="Usuarios" subtitulo="Personal institucional con acceso al panel." />
      <p className="panel-callout">
        Roles provisionales: todavía no hay inicio de sesión, así que los permisos se muestran pero
        no se aplican. Se definirán en el documento de autenticación y roles (tarea I5).
      </p>

      {state.status === 'loading' && <StatusMessage kind="loading" title="Cargando usuarios…" />}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar los usuarios"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && (
        <>
          <div className="panel-toolbar">
            <div className="panel-toolbar__search">
              <SearchField
                label="Buscar usuarios"
                placeholder="Buscar nombre, correo o institución…"
                value={consulta}
                onChange={setConsulta}
              />
            </div>
            <div className="panel-toolbar__filters" role="group" aria-label="Filtrar por rol">
              <Chip selected={rol === null} onClick={() => setRol(null)}>
                Todos <span className="panel-count">{usuarios.length}</span>
              </Chip>
              {roles.map((valor) => (
                <Chip key={valor} selected={rol === valor} onClick={() => setRol(valor)}>
                  {rolLabels[valor]}
                  <span className="panel-count">
                    {usuarios.filter((usuario) => usuario.rol === valor).length}
                  </span>
                </Chip>
              ))}
            </div>
            {!invitando && (
              <Button variant="accent" iconStart="plus" onClick={() => setInvitando(true)}>
                Invitar usuario
              </Button>
            )}
          </div>

          {invitando && (
            <FormularioInvitacion
              onCancelar={() => setInvitando(false)}
              onInvitado={(usuario) => {
                actualizar([...usuarios, usuario])
                setInvitando(false)
                setMensaje({
                  tipo: 'ok',
                  texto: `Invitación registrada para ${usuario.correo} (en modo demostración no se envía ningún correo).`,
                })
              }}
            />
          )}

          <div aria-live="polite">
            {mensaje && (
              <p className={mensaje.tipo === 'ok' ? 'panel-success' : 'panel-error'}>
                {mensaje.texto}
              </p>
            )}
          </div>

          {visibles.length === 0 ? (
            <StatusMessage kind="empty" title="No hay usuarios con esos filtros" />
          ) : (
            <section className="panel-card panel-table-card" aria-label="Listado de usuarios">
              <div className="panel-table-scroll">
                <table className="panel-table panel-table--cards panel-table--wrap">
                  <thead>
                    <tr>
                      <th scope="col">Nombre</th>
                      <th scope="col">Institución</th>
                      <th scope="col">Rol</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Último acceso</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((usuario) => (
                      <tr key={usuario.id}>
                        <th scope="row">
                          <span className="panel-person">
                            <span className="panel-person__name">{usuario.nombre}</span>
                            <span className="panel-person__mail">{usuario.correo}</span>
                          </span>
                        </th>
                        <td data-label="Institución">{usuario.institucion}</td>
                        <td data-label="Rol">
                          <label className="visually-hidden" htmlFor={`rol-${usuario.id}`}>
                            Rol de {usuario.nombre}
                          </label>
                          <select
                            id={`rol-${usuario.id}`}
                            className="panel-select"
                            value={usuario.rol}
                            onChange={(event) =>
                              cambiarRol(usuario, event.target.value as RolUsuario)
                            }
                          >
                            {roles.map((valor) => (
                              <option key={valor} value={valor}>
                                {rolLabels[valor]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Estado">
                          {!usuario.activo ? (
                            <span className="tag panel-tag--danger">Inactivo</span>
                          ) : usuario.ultimoAcceso ? (
                            <Tag tone="success">Activo</Tag>
                          ) : (
                            <Tag tone="warning">Invitación pendiente</Tag>
                          )}
                        </td>
                        <td data-label="Último acceso">
                          {usuario.ultimoAcceso ? formatearFechaHora(usuario.ultimoAcceso) : '—'}
                        </td>
                        <td className="panel-table__cell-action">
                          <Button
                            variant={usuario.activo ? 'ghost' : 'secondary'}
                            size="sm"
                            aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} a ${usuario.nombre}`}
                            onClick={() => alternarActivo(usuario)}
                          >
                            {usuario.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <section className="panel-card" aria-labelledby="permisos-titulo">
        <h3 id="permisos-titulo">Permisos por rol</h3>
        <ul className="panel-roles">
          {roles.map((valor) => (
            <li key={valor}>
              <strong>{rolLabels[valor]}:</strong> {rolDescripciones[valor]}
            </li>
          ))}
        </ul>
        <div className="panel-table-scroll" tabIndex={0} role="region" aria-label="Permisos">
          <table className="panel-table panel-table--compact panel-table--matrix">
            <thead>
              <tr>
                <th scope="col">Acción</th>
                {roles.map((valor) => (
                  <th key={valor} scope="col">
                    {rolLabels[valor]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permisos.map((permiso) => (
                <tr key={permiso.accion}>
                  <th scope="row">{permiso.accion}</th>
                  {roles.map((valor) => (
                    <td
                      key={valor}
                      data-label={rolLabels[valor]}
                      className={permiso.roles.includes(valor) ? undefined : 'panel-matrix__no'}
                    >
                      {permiso.roles.includes(valor) ? (
                        <span className="panel-check" aria-label="Sí">
                          ✓
                        </span>
                      ) : (
                        <span className="panel-muted" aria-label="No">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

const invitacionVacia: DatosUsuario = { nombre: '', correo: '', institucion: '', rol: 'editor' }

function FormularioInvitacion({
  onCancelar,
  onInvitado,
}: {
  onCancelar: () => void
  onInvitado: (usuario: UsuarioInstitucional) => void
}) {
  const id = useId()
  const [datos, setDatos] = useState(invitacionVacia)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      onInvitado(await invitarUsuario(datos))
    } catch (causa) {
      setError(textoError(causa, 'No se pudo enviar la invitación.'))
      setEnviando(false)
    }
  }

  return (
    <form
      className="panel-card panel-form"
      onSubmit={enviar}
      aria-label="Invitar usuario"
      noValidate
    >
      <div className="panel-field">
        <label htmlFor={`${id}-nombre`}>Nombre *</label>
        <input
          id={`${id}-nombre`}
          value={datos.nombre}
          onChange={(event) => setDatos({ ...datos, nombre: event.target.value })}
          required
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-correo`}>Correo institucional *</label>
        <input
          id={`${id}-correo`}
          type="email"
          value={datos.correo}
          onChange={(event) => setDatos({ ...datos, correo: event.target.value })}
          required
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-institucion`}>Institución *</label>
        <input
          id={`${id}-institucion`}
          value={datos.institucion}
          onChange={(event) => setDatos({ ...datos, institucion: event.target.value })}
          required
        />
      </div>
      <div className="panel-field">
        <label htmlFor={`${id}-rol`}>Rol</label>
        <select
          id={`${id}-rol`}
          value={datos.rol}
          onChange={(event) => setDatos({ ...datos, rol: event.target.value as RolUsuario })}
        >
          {roles.map((valor) => (
            <option key={valor} value={valor}>
              {rolLabels[valor]}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="panel-error panel-field--wide" role="alert">
          {error}
        </p>
      )}
      <div className="panel-form__actions panel-field--wide">
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Registrar invitación'}
        </Button>
        <Button variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
