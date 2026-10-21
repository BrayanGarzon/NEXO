import { diasEntre } from './fechas'
import type { AccionRevision, EstadoServicio, FechaIso, ServicioAdmin, TipoFuente } from './types'

/*
 * Reglas del flujo de revisión (docs/API_CONTRACTS.md §4.1).
 *
 * Los plazos son PROVISIONALES hasta resolver la decisión pendiente 9 (vigencia y antigüedad
 * de fuentes). Se pueden ajustar desde la vista Configuración; las funciones de este módulo
 * y los indicadores del Observatorio leen siempre la configuración vigente.
 */
export interface ConfiguracionPanel {
  /** Días que un servicio publicado se considera vigente. */
  plazoVigenciaDias: number
  /** Días tras los cuales una fuente se considera antigua. */
  antiguedadMaximaFuenteDias: number
  /** Días antes del vencimiento en que un servicio aparece «por vencer». */
  avisoPorVencerDias: number
  /** Días en revisión a partir de los cuales la revisión se considera prolongada. */
  revisionProlongadaDias: number
}

export const CONFIGURACION_POR_DEFECTO: ConfiguracionPanel = {
  plazoVigenciaDias: 180,
  antiguedadMaximaFuenteDias: 365,
  avisoPorVencerDias: 30,
  revisionProlongadaDias: 14,
}

let configuracion: ConfiguracionPanel = { ...CONFIGURACION_POR_DEFECTO }

export function configuracionActual(): ConfiguracionPanel {
  return configuracion
}

/** Solo la usa la capa de datos (services/panelData.ts). */
export function aplicarConfiguracion(nueva: ConfiguracionPanel) {
  configuracion = { ...nueva }
}

export const estados: EstadoServicio[] = ['borrador', 'en_revision', 'publicado', 'no_vigente']

export const estadoLabels: Record<EstadoServicio, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  no_vigente: 'No vigente',
}

export const tipoFuenteLabels: Record<TipoFuente, string> = {
  oficial: 'Oficial',
  institucional: 'Institucional',
  otra: 'Otra',
}

export const accionLabels: Record<AccionRevision, string> = {
  creado: 'Se creó el servicio',
  enviado_a_revision: 'Se envió a revisión',
  devuelto: 'Se devolvió a borrador',
  publicado: 'Se publicó',
  marcado_no_vigente: 'Se marcó como no vigente',
  fuente_actualizada: 'Se actualizaron las fuentes',
  editado: 'Se editaron los datos',
}

export interface Transicion {
  a: EstadoServicio
  accion: AccionRevision
  /** Texto del botón. */
  etiqueta: string
}

const transiciones: Record<EstadoServicio, Transicion[]> = {
  borrador: [{ a: 'en_revision', accion: 'enviado_a_revision', etiqueta: 'Enviar a revisión' }],
  en_revision: [
    { a: 'publicado', accion: 'publicado', etiqueta: 'Publicar' },
    { a: 'borrador', accion: 'devuelto', etiqueta: 'Devolver a borrador' },
  ],
  publicado: [
    { a: 'en_revision', accion: 'enviado_a_revision', etiqueta: 'Abrir nueva revisión' },
    { a: 'no_vigente', accion: 'marcado_no_vigente', etiqueta: 'Marcar como no vigente' },
  ],
  no_vigente: [{ a: 'en_revision', accion: 'enviado_a_revision', etiqueta: 'Reactivar y revisar' }],
}

export function transicionesDesde(estado: EstadoServicio): Transicion[] {
  return transiciones[estado]
}

/** Una fuente cuenta como verificable si se consultó dentro del plazo de antigüedad. */
export function fuenteVigente(fechaConsulta: FechaIso, hoy: FechaIso): boolean {
  return diasEntre(fechaConsulta, hoy) <= configuracion.antiguedadMaximaFuenteDias
}

export function tieneFuenteVerificable(servicio: ServicioAdmin, hoy: FechaIso): boolean {
  return servicio.fuentes.some((fuente) => fuenteVigente(fuente.fechaConsulta, hoy))
}

/**
 * Devuelve el motivo por el que la transición no se permite, o `null` si es válida.
 * Regla de publicación: al menos una fuente con fecha de consulta.
 */
export function motivoBloqueo(servicio: ServicioAdmin, a: EstadoServicio): string | null {
  if (!transiciones[servicio.estado].some((transicion) => transicion.a === a)) {
    return `No se puede pasar de «${estadoLabels[servicio.estado]}» a «${estadoLabels[a]}».`
  }
  if (a === 'publicado' && !servicio.fuentes.some((fuente) => fuente.fechaConsulta)) {
    return 'Para publicar, añade al menos una fuente con su fecha de consulta.'
  }
  return null
}
