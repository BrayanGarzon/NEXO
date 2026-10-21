import { aFechaIso, sumarDias } from '../fechas'
import type {
  AccionRevision,
  EstadoServicio,
  EventoRevision,
  FechaIso,
  Fuente,
  ServicioAdmin,
  UsuarioInstitucional,
} from '../types'

/*
 * DATOS SINTÉTICOS del panel institucional. No corresponden a servicios, instituciones ni
 * personas reales, y no contienen datos de personas jóvenes ni de salud.
 *
 * Las fechas se calculan respecto a `hoy` para que el Observatorio muestre siempre una
 * mezcla realista de servicios vigentes, por vencer y vencidos.
 */

export const USUARIO_DEMO = 'María González'

interface Semilla {
  id: string
  nombre: string
  categoria: ServicioAdmin['categoria']
  institucion: string
  resumen: string
  direccion: string
  comuna: number
  horario: string
  serviciosOfrecidos: string[]
  estado: EstadoServicio
  /** Fuentes con su antigüedad en días. */
  fuentes: (Omit<Fuente, 'id' | 'fechaConsulta'> & { haceDias: number })[]
  /** Días desde la última modificación. */
  actualizadoHaceDias: number
  /** Para publicados: días que faltan para el vencimiento (negativo si ya venció). */
  venceEnDias?: number
}

const semillas: Semilla[] = [
  {
    id: 'sv-orientacion-juvenil',
    nombre: 'Centro de Orientación Juvenil',
    categoria: 'salud-mental',
    institucion: 'Secretaría de Salud (ejemplo)',
    resumen: 'Orientación psicológica, talleres grupales y acompañamiento familiar.',
    direccion: 'Dirección de ejemplo 1',
    comuna: 3,
    horario: 'Lun – Vie · 8:00 a. m. – 5:00 p. m.',
    serviciosOfrecidos: ['Orientación psicológica', 'Talleres grupales'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Portal de la Secretaría (ejemplo)',
        url: 'https://example.org/secretaria-salud',
        notas: null,
        haceDias: 6,
      },
    ],
    actualizadoHaceDias: 6,
    venceEnDias: 174,
  },
  {
    id: 'sv-manejo-estres',
    nombre: 'Programa de Manejo del Estrés',
    categoria: 'salud-mental',
    institucion: 'Institución educativa (ejemplo)',
    resumen: 'Taller grupal con herramientas para reconocer y regular el estrés.',
    direccion: 'Dirección de ejemplo 2',
    comuna: 5,
    horario: 'Mar y Jue · 3:00 p. m. – 5:00 p. m.',
    serviciosOfrecidos: ['Taller grupal', 'Material de lectura'],
    estado: 'en_revision',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Folleto del programa (ejemplo)',
        url: null,
        notas: 'Entregado en la sede.',
        haceDias: 7,
      },
    ],
    actualizadoHaceDias: 7,
  },
  {
    id: 'sv-liga-futbol',
    nombre: 'Liga Juvenil de Fútbol',
    categoria: 'deporte',
    institucion: 'Programa municipal (ejemplo)',
    resumen: 'Entrenamientos y torneos por comuna para jóvenes de 14 a 28 años.',
    direccion: 'Cancha de ejemplo',
    comuna: 4,
    horario: 'Sáb · 8:00 a. m. – 12:00 m.',
    serviciosOfrecidos: ['Entrenamientos', 'Torneo intercomunas'],
    estado: 'borrador',
    fuentes: [],
    actualizadoHaceDias: 9,
  },
  {
    id: 'sv-casa-juventud',
    nombre: 'Casa de la Juventud',
    categoria: 'cultura',
    institucion: 'Alcaldía (ejemplo)',
    resumen: 'Talleres de arte, música y espacios de encuentro juvenil.',
    direccion: 'Dirección de ejemplo 3',
    comuna: 1,
    horario: 'Lun – Sáb · 9:00 a. m. – 7:00 p. m.',
    serviciosOfrecidos: ['Talleres de arte', 'Sala de ensayo'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Agenda cultural (ejemplo)',
        url: 'https://example.org/agenda-cultural',
        notas: null,
        haceDias: 11,
      },
    ],
    actualizadoHaceDias: 11,
    venceEnDias: 169,
  },
  {
    id: 'sv-linea-escucha',
    nombre: 'Línea de Escucha Joven',
    categoria: 'salud-mental',
    institucion: 'Secretaría de Salud (ejemplo)',
    resumen: 'Orientación telefónica y por chat en horario extendido.',
    direccion: 'Atención remota',
    comuna: 2,
    horario: 'Todos los días · 7:00 a. m. – 10:00 p. m.',
    serviciosOfrecidos: ['Orientación telefónica', 'Chat'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Directorio de líneas (ejemplo)',
        url: 'https://example.org/lineas',
        notas: null,
        haceDias: 40,
      },
      {
        tipo: 'otra',
        titulo: 'Publicación en redes (ejemplo)',
        url: 'https://example.org/redes',
        notas: null,
        haceDias: 60,
      },
    ],
    actualizadoHaceDias: 40,
    venceEnDias: 18,
  },
  {
    id: 'sv-preicfes',
    nombre: 'Preicfes Comunitario',
    categoria: 'educacion',
    institucion: 'Biblioteca pública (ejemplo)',
    resumen: 'Clases gratuitas de preparación para pruebas de Estado.',
    direccion: 'Dirección de ejemplo 4',
    comuna: 6,
    horario: 'Lun, Mié y Vie · 2:00 p. m. – 5:00 p. m.',
    serviciosOfrecidos: ['Clases de matemáticas', 'Simulacros'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Convocatoria de la biblioteca (ejemplo)',
        url: 'https://example.org/biblioteca',
        notas: null,
        haceDias: 200,
      },
    ],
    actualizadoHaceDias: 200,
    venceEnDias: -20,
  },
  {
    id: 'sv-becas',
    nombre: 'Orientación para Becas y Créditos',
    categoria: 'educacion',
    institucion: 'Secretaría de Educación (ejemplo)',
    resumen: 'Asesoría para postularse a becas y créditos educativos.',
    direccion: 'Dirección de ejemplo 5',
    comuna: 3,
    horario: 'Lun – Vie · 8:00 a. m. – 12:00 m.',
    serviciosOfrecidos: ['Asesoría individual', 'Charlas informativas'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Portal de becas (ejemplo)',
        url: 'https://example.org/becas',
        notas: null,
        haceDias: 20,
      },
    ],
    actualizadoHaceDias: 20,
    venceEnDias: 160,
  },
  {
    id: 'sv-empleo-joven',
    nombre: 'Ruta de Empleo Joven',
    categoria: 'empleo',
    institucion: 'Agencia de empleo (ejemplo)',
    resumen: 'Hoja de vida, entrevistas simuladas y vacantes para primer empleo.',
    direccion: 'Dirección de ejemplo 6',
    comuna: 2,
    horario: 'Lun – Vie · 7:30 a. m. – 4:30 p. m.',
    serviciosOfrecidos: ['Taller de hoja de vida', 'Bolsa de empleo'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Boletín de la agencia (ejemplo)',
        url: 'https://example.org/agencia',
        notas: null,
        haceDias: 400,
      },
    ],
    actualizadoHaceDias: 30,
    venceEnDias: 150,
  },
  {
    id: 'sv-emprendimiento',
    nombre: 'Laboratorio de Emprendimiento',
    categoria: 'empleo',
    institucion: 'Cámara de comercio (ejemplo)',
    resumen: 'Mentorías y capital semilla para ideas de negocio juveniles.',
    direccion: 'Dirección de ejemplo 7',
    comuna: 7,
    horario: 'Mié · 4:00 p. m. – 7:00 p. m.',
    serviciosOfrecidos: ['Mentorías', 'Convocatorias'],
    estado: 'en_revision',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Convocatoria (ejemplo)',
        url: 'https://example.org/convocatoria',
        notas: null,
        haceDias: 25,
      },
    ],
    actualizadoHaceDias: 25,
  },
  {
    id: 'sv-escuela-natacion',
    nombre: 'Escuela de Natación',
    categoria: 'deporte',
    institucion: 'Instituto de deporte (ejemplo)',
    resumen: 'Clases de natación por niveles.',
    direccion: 'Piscina de ejemplo',
    comuna: 8,
    horario: 'Mar – Sáb · 6:00 a. m. – 9:00 a. m.',
    serviciosOfrecidos: ['Nivel inicial', 'Nivel avanzado'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Programación deportiva (ejemplo)',
        url: 'https://example.org/deporte',
        notas: null,
        haceDias: 15,
      },
    ],
    actualizadoHaceDias: 15,
    venceEnDias: 165,
  },
  {
    id: 'sv-festival-musica',
    nombre: 'Festival Juvenil de Música',
    categoria: 'recreacion',
    institucion: 'Corporación cultural (ejemplo)',
    resumen: 'Convocatoria anual para bandas y solistas jóvenes.',
    direccion: '',
    comuna: 1,
    horario: '',
    serviciosOfrecidos: [],
    estado: 'borrador',
    fuentes: [
      {
        tipo: 'otra',
        titulo: 'Afiche de la convocatoria (ejemplo)',
        url: null,
        notas: null,
        haceDias: 3,
      },
    ],
    actualizadoHaceDias: 3,
  },
  {
    id: 'sv-ciclopaseo',
    nombre: 'Ciclopaseo Nocturno',
    categoria: 'recreacion',
    institucion: 'Programa municipal (ejemplo)',
    resumen: 'Recorridos guiados en bicicleta por la ciudad.',
    direccion: 'Punto de encuentro de ejemplo',
    comuna: 5,
    horario: 'Vie · 7:00 p. m. – 9:00 p. m.',
    serviciosOfrecidos: ['Recorrido guiado', 'Préstamo de cascos'],
    estado: 'publicado',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Calendario de actividades (ejemplo)',
        url: 'https://example.org/calendario',
        notas: null,
        haceDias: 8,
      },
    ],
    actualizadoHaceDias: 8,
    venceEnDias: 172,
  },
  {
    id: 'sv-semillero-teatro',
    nombre: 'Semillero de Teatro',
    categoria: 'cultura',
    institucion: 'Casa de la cultura (ejemplo)',
    resumen: 'Formación en actuación y montaje de obras.',
    direccion: 'Dirección de ejemplo 8',
    comuna: 4,
    horario: 'Sáb · 2:00 p. m. – 6:00 p. m.',
    serviciosOfrecidos: ['Formación actoral'],
    estado: 'en_revision',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Programación de la casa de la cultura (ejemplo)',
        url: null,
        notas: null,
        haceDias: 2,
      },
    ],
    actualizadoHaceDias: 2,
  },
  {
    id: 'sv-taller-programacion',
    nombre: 'Taller de Programación Básica',
    categoria: 'educacion',
    institucion: 'Fundación tecnológica (ejemplo)',
    resumen: 'Curso corto de programación para principiantes.',
    direccion: 'Dirección de ejemplo 9',
    comuna: 7,
    horario: 'Sáb · 9:00 a. m. – 12:00 m.',
    serviciosOfrecidos: ['Curso introductorio'],
    estado: 'no_vigente',
    fuentes: [
      {
        tipo: 'institucional',
        titulo: 'Anuncio del curso (ejemplo)',
        url: 'https://example.org/curso',
        notas: 'La convocatoria cerró.',
        haceDias: 90,
      },
    ],
    actualizadoHaceDias: 45,
  },
  {
    id: 'sv-feria-empleo',
    nombre: 'Feria de Primer Empleo',
    categoria: 'empleo',
    institucion: 'Agencia de empleo (ejemplo)',
    resumen: 'Feria anual con empresas que contratan jóvenes sin experiencia.',
    direccion: 'Recinto ferial de ejemplo',
    comuna: 2,
    horario: 'Evento de un día',
    serviciosOfrecidos: ['Entrevistas en sitio'],
    estado: 'no_vigente',
    fuentes: [
      {
        tipo: 'oficial',
        titulo: 'Comunicado de la feria (ejemplo)',
        url: 'https://example.org/feria',
        notas: null,
        haceDias: 120,
      },
    ],
    actualizadoHaceDias: 60,
  },
]

/** Historial típico según el estado al que llegó cada servicio. */
const rutas: Record<EstadoServicio, AccionRevision[]> = {
  borrador: ['creado'],
  en_revision: ['creado', 'enviado_a_revision'],
  publicado: ['creado', 'enviado_a_revision', 'publicado'],
  no_vigente: ['creado', 'enviado_a_revision', 'publicado', 'marcado_no_vigente'],
}

const estadoTras: Partial<Record<AccionRevision, EstadoServicio>> = {
  creado: 'borrador',
  enviado_a_revision: 'en_revision',
  publicado: 'publicado',
  marcado_no_vigente: 'no_vigente',
}

function fechaHora(fecha: FechaIso, hora: number) {
  return new Date(`${fecha}T${String(hora).padStart(2, '0')}:15:00`).toISOString()
}

export interface DatosPanel {
  servicios: ServicioAdmin[]
  eventos: EventoRevision[]
  usuarios: UsuarioInstitucional[]
}

/** Personal institucional de ejemplo (correos en example.org, que no existe). */
const usuariosSemilla: (Omit<UsuarioInstitucional, 'ultimoAcceso'> & {
  accesoHaceDias: number | null
})[] = [
  {
    id: 'us-maria',
    nombre: USUARIO_DEMO,
    correo: 'maria.gonzalez@example.org',
    institucion: 'Secretaría de Juventud (ejemplo)',
    rol: 'administrador',
    activo: true,
    accesoHaceDias: 0,
  },
  {
    id: 'us-andres',
    nombre: 'Andrés Rojas',
    correo: 'andres.rojas@example.org',
    institucion: 'Secretaría de Salud (ejemplo)',
    rol: 'editor',
    activo: true,
    accesoHaceDias: 1,
  },
  {
    id: 'us-laura',
    nombre: 'Laura Méndez',
    correo: 'laura.mendez@example.org',
    institucion: 'Secretaría de Educación (ejemplo)',
    rol: 'revisor',
    activo: true,
    accesoHaceDias: 3,
  },
  {
    id: 'us-jorge',
    nombre: 'Jorge Castaño',
    correo: 'jorge.castano@example.org',
    institucion: 'Instituto de deporte (ejemplo)',
    rol: 'editor',
    activo: true,
    accesoHaceDias: 12,
  },
  {
    id: 'us-paula',
    nombre: 'Paula Herrera',
    correo: 'paula.herrera@example.org',
    institucion: 'Casa de la cultura (ejemplo)',
    rol: 'editor',
    activo: false,
    accesoHaceDias: 95,
  },
  {
    id: 'us-camila',
    nombre: 'Camila Ortiz',
    correo: 'camila.ortiz@example.org',
    institucion: 'Agencia de empleo (ejemplo)',
    rol: 'revisor',
    activo: true,
    accesoHaceDias: null,
  },
]

export function crearDatosSinteticos(hoy: Date = new Date()): DatosPanel {
  const hoyIso = aFechaIso(hoy)
  const eventos: EventoRevision[] = []

  const servicios = semillas.map((semilla): ServicioAdmin => {
    const { fuentes, actualizadoHaceDias, venceEnDias, ...datos } = semilla
    const actualizado = sumarDias(hoyIso, -actualizadoHaceDias)
    const pasos = rutas[semilla.estado]

    let anterior: EstadoServicio | null = null
    pasos.forEach((accion, indice) => {
      // El último paso ocurre en la fecha de actualización; los anteriores, días antes.
      const dia = sumarDias(actualizado, -(pasos.length - 1 - indice) * 2)
      const nuevo = estadoTras[accion] ?? null
      eventos.push({
        id: `${semilla.id}-ev${indice + 1}`,
        servicioId: semilla.id,
        accion,
        estadoAnterior: anterior,
        estadoNuevo: nuevo,
        comentario: null,
        autor: USUARIO_DEMO,
        fecha: fechaHora(dia, 9 + indice),
      })
      anterior = nuevo
    })

    const publicadoAlgunaVez = semilla.estado === 'publicado' || semilla.estado === 'no_vigente'
    return {
      ...datos,
      fuentes: fuentes.map(({ haceDias, ...fuente }, indice) => ({
        ...fuente,
        id: `${semilla.id}-f${indice + 1}`,
        fechaConsulta: sumarDias(hoyIso, -haceDias),
      })),
      ultimaRevision: publicadoAlgunaVez ? actualizado : null,
      vigenteHasta: venceEnDias === undefined ? null : sumarDias(hoyIso, venceEnDias),
      actualizadoEn: fechaHora(actualizado, 9 + pasos.length - 1),
      actualizadoPor: USUARIO_DEMO,
    }
  })

  const usuarios = usuariosSemilla.map(({ accesoHaceDias, ...usuario }) => ({
    ...usuario,
    ultimoAcceso: accesoHaceDias === null ? null : fechaHora(sumarDias(hoyIso, -accesoHaceDias), 8),
  }))

  return { servicios, eventos, usuarios }
}
