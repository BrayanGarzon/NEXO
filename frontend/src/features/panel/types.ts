import type { ServiceCategory } from '../../types/catalog'

/*
 * Tipos PROVISIONALES del panel institucional (Fuente Viva y Observatorio).
 *
 * Reflejan la propuesta de docs/API_CONTRACTS.md §4.1 (en camelCase). No son un contrato:
 * cuando se apruebe, se ajustarán los nombres y el acceso a datos pasará a la API.
 */

export type EstadoServicio = 'borrador' | 'en_revision' | 'publicado' | 'no_vigente'

export type TipoFuente = 'oficial' | 'institucional' | 'otra'

/** Fecha sin hora en formato `AAAA-MM-DD`. */
export type FechaIso = string

export interface Fuente {
  id: string
  tipo: TipoFuente
  titulo: string
  url: string | null
  /** Cuándo se consultó la fuente. */
  fechaConsulta: FechaIso
  notas: string | null
}

export interface ServicioAdmin {
  id: string
  nombre: string
  categoria: ServiceCategory
  categoriaPersonalizada?: string
  motivoCreacion?: string
  institucion: string
  resumen: string
  direccion: string
  comuna: number
  horario: string
  serviciosOfrecidos: string[]
  estado: EstadoServicio
  fuentes: Fuente[]
  /** Última verificación contra una fuente (al publicar). */
  ultimaRevision: FechaIso | null
  /** Fecha a partir de la cual el servicio publicado debe revisarse. */
  vigenteHasta: FechaIso | null
  /** Fecha y hora ISO de la última modificación. */
  actualizadoEn: string
  actualizadoPor: string
}

export type AccionRevision =
  | 'creado'
  | 'enviado_a_revision'
  | 'devuelto'
  | 'publicado'
  | 'marcado_no_vigente'
  | 'fuente_actualizada'
  | 'editado'

export interface EventoRevision {
  id: string
  servicioId: string
  accion: AccionRevision
  estadoAnterior: EstadoServicio | null
  estadoNuevo: EstadoServicio | null
  comentario: string | null
  autor: string
  /** Fecha y hora ISO. */
  fecha: string
}

/** Campos editables de un servicio (el estado solo cambia mediante transiciones). */
export type DatosServicio = Pick<
  ServicioAdmin,
  | 'nombre'
  | 'categoria'
  | 'categoriaPersonalizada'
  | 'institucion'
  | 'resumen'
  | 'direccion'
  | 'comuna'
  | 'horario'
  | 'serviciosOfrecidos'
> & { motivoCreacion: string }

export type DatosFuente = Omit<Fuente, 'id'>

/** Fuente junto con el servicio al que respalda (vista Fuentes). */
export interface FuenteConServicio extends Fuente {
  servicioId: string
  servicioNombre: string
  servicioEstado: EstadoServicio
}

/*
 * Personal institucional con acceso al panel. Nunca personas jóvenes ni usuarias de la web
 * pública. Roles PROVISIONALES hasta aprobar el documento de autenticación y roles (tarea I5).
 */
export type RolUsuario = 'administrador' | 'editor' | 'revisor'

export interface UsuarioInstitucional {
  id: string
  nombre: string
  correo: string
  institucion: string
  rol: RolUsuario
  activo: boolean
  /** Fecha y hora ISO; `null` si aún no ha aceptado la invitación. */
  ultimoAcceso: string | null
}

export type DatosUsuario = Pick<UsuarioInstitucional, 'nombre' | 'correo' | 'institucion' | 'rol'>
