import { hoyIso, sumarDias } from '../fechas'
import { crearDatosSinteticos, USUARIO_DEMO, type DatosPanel } from '../mocks/datosSinteticos'
import {
  aplicarConfiguracion,
  CONFIGURACION_POR_DEFECTO,
  configuracionActual,
  motivoBloqueo,
  transicionesDesde,
  type ConfiguracionPanel,
} from '../reglas'
import type {
  AccionRevision,
  DatosFuente,
  DatosServicio,
  EstadoServicio,
  DatosUsuario,
  EventoRevision,
  FuenteConServicio,
  RolUsuario,
  ServicioAdmin,
  UsuarioInstitucional,
} from '../types'

/*
 * Acceso a datos del panel institucional.
 *
 * PROVISIONAL: trabaja en memoria sobre datos sintéticos (se pierden al recargar la página).
 * Las firmas siguen docs/API_CONTRACTS.md §4.2 para que, cuando exista la API, solo cambie
 * este archivo y no los componentes.
 */

const LATENCIA_SIMULADA_MS = 250

let datos: DatosPanel = crearDatosSinteticos()
let secuencia = 0

/** Restaura los datos sintéticos y la configuración iniciales (pruebas y Configuración). */
export function reiniciarDatosPanel(hoy?: Date) {
  datos = crearDatosSinteticos(hoy)
  secuencia = 0
  aplicarConfiguracion(CONFIGURACION_POR_DEFECTO)
}

export class ErrorPanel extends Error {}

interface Opciones {
  signal?: AbortSignal
}

function nuevoId(prefijo: string) {
  secuencia += 1
  return `${prefijo}-${Date.now().toString(36)}-${secuencia}`
}

function copia<T>(valor: T): T {
  return structuredClone(valor)
}

/** Simula la latencia de red y devuelve una copia para que nadie mute el almacén. */
function responder<T>(producir: () => T, { signal }: Opciones = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        resolve(copia(producir()))
      } catch (error) {
        reject(error)
      }
    }, LATENCIA_SIMULADA_MS)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Cancelado', 'AbortError'))
    })
  })
}

function buscar(id: string): ServicioAdmin {
  const servicio = datos.servicios.find((item) => item.id === id)
  if (!servicio) throw new ErrorPanel('El servicio no existe.')
  return servicio
}

function registrar(
  servicio: ServicioAdmin,
  accion: AccionRevision,
  estadoAnterior: EstadoServicio | null,
  comentario: string | null = null,
) {
  const fecha = new Date().toISOString()
  servicio.actualizadoEn = fecha
  servicio.actualizadoPor = USUARIO_DEMO
  datos.eventos.push({
    id: nuevoId('ev'),
    servicioId: servicio.id,
    accion,
    estadoAnterior,
    estadoNuevo: servicio.estado,
    comentario,
    autor: USUARIO_DEMO,
    fecha,
  })
}

function porFechaDesc(a: { fecha: string }, b: { fecha: string }) {
  return b.fecha.localeCompare(a.fecha)
}

export function listarServicios(opciones?: Opciones): Promise<ServicioAdmin[]> {
  return responder(
    () => [...datos.servicios].sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn)),
    opciones,
  )
}

export function obtenerServicio(id: string, opciones?: Opciones): Promise<ServicioAdmin> {
  return responder(() => buscar(id), opciones)
}

export function crearServicio(nuevo: DatosServicio): Promise<ServicioAdmin> {
  return responder(() => {
    const servicio: ServicioAdmin = {
      ...nuevo,
      id: nuevoId('sv'),
      estado: 'borrador',
      fuentes: [],
      ultimaRevision: null,
      vigenteHasta: null,
      actualizadoEn: '',
      actualizadoPor: USUARIO_DEMO,
    }
    datos.servicios.push(servicio)
    registrar(servicio, 'creado', null)
    return servicio
  })
}

export function actualizarServicio(id: string, cambios: DatosServicio): Promise<ServicioAdmin> {
  return responder(() => {
    const servicio = buscar(id)
    Object.assign(servicio, cambios)
    registrar(servicio, 'editado', servicio.estado)
    return servicio
  })
}

/** Equivale a `POST /admin/services/{id}/transiciones`; rechaza las no permitidas (409). */
export function cambiarEstado(
  id: string,
  a: EstadoServicio,
  comentario: string,
): Promise<ServicioAdmin> {
  return responder(() => {
    const servicio = buscar(id)
    const bloqueo = motivoBloqueo(servicio, a)
    if (bloqueo) throw new ErrorPanel(bloqueo)

    const transicion = transicionesDesde(servicio.estado).find((item) => item.a === a)!
    const anterior = servicio.estado
    servicio.estado = a
    if (a === 'publicado') {
      const hoy = hoyIso()
      servicio.ultimaRevision = hoy
      servicio.vigenteHasta = sumarDias(hoy, configuracionActual().plazoVigenciaDias)
    }
    registrar(servicio, transicion.accion, anterior, comentario.trim() || null)
    return servicio
  })
}

export function agregarFuente(id: string, fuente: DatosFuente): Promise<ServicioAdmin> {
  return responder(() => {
    const servicio = buscar(id)
    servicio.fuentes.push({ ...fuente, id: nuevoId('f') })
    registrar(servicio, 'fuente_actualizada', servicio.estado, `Fuente añadida: ${fuente.titulo}`)
    return servicio
  })
}

export function quitarFuente(id: string, fuenteId: string): Promise<ServicioAdmin> {
  return responder(() => {
    const servicio = buscar(id)
    const fuente = servicio.fuentes.find((item) => item.id === fuenteId)
    if (!fuente) throw new ErrorPanel('La fuente no existe.')
    servicio.fuentes = servicio.fuentes.filter((item) => item.id !== fuenteId)
    registrar(servicio, 'fuente_actualizada', servicio.estado, `Fuente quitada: ${fuente.titulo}`)
    return servicio
  })
}

export function listarHistorial(id: string, opciones?: Opciones): Promise<EventoRevision[]> {
  return responder(
    () => datos.eventos.filter((evento) => evento.servicioId === id).sort(porFechaDesc),
    opciones,
  )
}

export interface DatosObservatorio {
  servicios: ServicioAdmin[]
  actividad: (EventoRevision & { servicioNombre: string })[]
}

/** Todo lo que necesita el Observatorio en una sola carga. */
export function cargarObservatorio(
  limiteActividad: number,
  opciones?: Opciones,
): Promise<DatosObservatorio> {
  return responder(() => {
    const nombres = new Map(datos.servicios.map((servicio) => [servicio.id, servicio.nombre]))
    return {
      servicios: datos.servicios,
      actividad: [...datos.eventos]
        .sort(porFechaDesc)
        .slice(0, limiteActividad)
        .map((evento) => ({ ...evento, servicioNombre: nombres.get(evento.servicioId) ?? '' })),
    }
  }, opciones)
}

// ---------- Fuentes ----------

/** Todas las fuentes del catálogo con el servicio al que respaldan. */
export function listarFuentes(opciones?: Opciones): Promise<FuenteConServicio[]> {
  return responder(
    () =>
      datos.servicios
        .flatMap((servicio) =>
          servicio.fuentes.map((fuente) => ({
            ...fuente,
            servicioId: servicio.id,
            servicioNombre: servicio.nombre,
            servicioEstado: servicio.estado,
          })),
        )
        .sort((a, b) => a.fechaConsulta.localeCompare(b.fechaConsulta)),
    opciones,
  )
}

/** Registra que la fuente se volvió a consultar hoy (`PATCH …/fuentes/{id}`). */
export function marcarFuenteConsultada(servicioId: string, fuenteId: string) {
  return responder(() => {
    const servicio = buscar(servicioId)
    const fuente = servicio.fuentes.find((item) => item.id === fuenteId)
    if (!fuente) throw new ErrorPanel('La fuente no existe.')
    fuente.fechaConsulta = hoyIso()
    registrar(
      servicio,
      'fuente_actualizada',
      servicio.estado,
      `Fuente consultada: ${fuente.titulo}`,
    )
    return {
      ...fuente,
      servicioId,
      servicioNombre: servicio.nombre,
      servicioEstado: servicio.estado,
    }
  })
}

// ---------- Usuarios institucionales ----------

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function listarUsuarios(opciones?: Opciones): Promise<UsuarioInstitucional[]> {
  return responder(
    () => [...datos.usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    opciones,
  )
}

function buscarUsuario(id: string) {
  const usuario = datos.usuarios.find((item) => item.id === id)
  if (!usuario) throw new ErrorPanel('El usuario no existe.')
  return usuario
}

/** Debe quedar siempre al menos un administrador activo. */
function comprobarAdministradores(cambiado: UsuarioInstitucional) {
  const quedan = datos.usuarios.some(
    (usuario) => usuario.activo && usuario.rol === 'administrador' && usuario !== cambiado,
  )
  if (!quedan) throw new ErrorPanel('Debe quedar al menos un administrador activo.')
}

export function invitarUsuario(nuevo: DatosUsuario): Promise<UsuarioInstitucional> {
  return responder(() => {
    const correo = nuevo.correo.trim().toLowerCase()
    if (!nuevo.nombre.trim() || !nuevo.institucion.trim()) {
      throw new ErrorPanel('El nombre y la institución son obligatorios.')
    }
    if (!CORREO_VALIDO.test(correo)) throw new ErrorPanel('Escribe un correo válido.')
    if (datos.usuarios.some((usuario) => usuario.correo === correo)) {
      throw new ErrorPanel('Ya existe un usuario con ese correo.')
    }
    const usuario: UsuarioInstitucional = {
      id: nuevoId('us'),
      nombre: nuevo.nombre.trim(),
      correo,
      institucion: nuevo.institucion.trim(),
      rol: nuevo.rol,
      activo: true,
      ultimoAcceso: null,
    }
    datos.usuarios.push(usuario)
    return usuario
  })
}

export function cambiarRolUsuario(id: string, rol: RolUsuario): Promise<UsuarioInstitucional> {
  return responder(() => {
    const usuario = buscarUsuario(id)
    if (usuario.rol === 'administrador' && rol !== 'administrador')
      comprobarAdministradores(usuario)
    usuario.rol = rol
    return usuario
  })
}

export function cambiarActivoUsuario(id: string, activo: boolean): Promise<UsuarioInstitucional> {
  return responder(() => {
    const usuario = buscarUsuario(id)
    if (!activo && usuario.rol === 'administrador') comprobarAdministradores(usuario)
    usuario.activo = activo
    return usuario
  })
}

// ---------- Configuración ----------

export const LIMITES_CONFIGURACION: Record<keyof ConfiguracionPanel, [number, number]> = {
  plazoVigenciaDias: [30, 730],
  antiguedadMaximaFuenteDias: [30, 1095],
  avisoPorVencerDias: [1, 90],
  revisionProlongadaDias: [1, 90],
}

export function obtenerConfiguracion(opciones?: Opciones): Promise<ConfiguracionPanel> {
  return responder(() => configuracionActual(), opciones)
}

export function guardarConfiguracion(nueva: ConfiguracionPanel): Promise<ConfiguracionPanel> {
  return responder(() => {
    for (const [clave, [minimo, maximo]] of Object.entries(LIMITES_CONFIGURACION)) {
      const valor = nueva[clave as keyof ConfiguracionPanel]
      if (!Number.isInteger(valor) || valor < minimo || valor > maximo) {
        throw new ErrorPanel(
          `Revisa los valores: deben ser días enteros entre ${minimo} y ${maximo}.`,
        )
      }
    }
    if (nueva.avisoPorVencerDias >= nueva.plazoVigenciaDias) {
      throw new ErrorPanel('El aviso «por vencer» debe ser menor que el plazo de vigencia.')
    }
    aplicarConfiguracion(nueva)
    return configuracionActual()
  })
}
