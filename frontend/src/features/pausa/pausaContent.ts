import type { IconName } from '../../components/Icon'
import type { BreathPhase } from './breathing'

/*
 * Contenido de Espacio Pausa. Son herramientas EDUCATIVAS de autocuidado: no evalúan,
 * no diagnostican y no sustituyen la atención profesional.
 */

/** Respiración cuadrada: cuatro tiempos iguales. */
export const breathingPhases: BreathPhase[] = [
  { id: 'inhala', label: 'Inhala', seconds: 4 },
  { id: 'sosten', label: 'Sostén', seconds: 4 },
  { id: 'exhala', label: 'Exhala', seconds: 4 },
  { id: 'pausa', label: 'Pausa', seconds: 4 },
]

export const breathingCycles = 4

interface BaseExercise {
  id: string
  title: string
  icon: IconName
  intro: string
}

export interface BreathingExercise extends BaseExercise {
  kind: 'breathing'
}

export interface StepsExercise extends BaseExercise {
  kind: 'steps'
  steps: string[]
}

export type Exercise = BreathingExercise | StepsExercise

export const exercises: Exercise[] = [
  {
    id: 'respiracion',
    kind: 'breathing',
    title: 'Ejercicios de respiración',
    icon: 'cloud',
    intro:
      'Respiración cuadrada: inhala, sostén, exhala y descansa, cuatro segundos cada uno. Hazlo sentado o sentada, sin forzar el aire.',
  },
  {
    id: 'sonidos',
    kind: 'steps',
    title: 'Sonidos de la naturaleza',
    icon: 'leaf',
    intro: 'Una escucha atenta de lo que suena a tu alrededor. No necesitas audífonos.',
    steps: [
      'Busca una posición cómoda y, si te sientes bien así, cierra los ojos o baja la mirada.',
      'Escucha y nombra en silencio tres sonidos cercanos: tu respiración, la ropa, una silla.',
      'Ahora tres sonidos lejanos: el viento, pájaros, la calle, la lluvia.',
      'Elige un sonido y quédate con él unas cuantas respiraciones.',
      'Abre los ojos despacio y nota cómo te sientes ahora.',
    ],
  },
  {
    id: 'estiramiento',
    kind: 'steps',
    title: 'Estiramiento rápido',
    icon: 'users',
    intro: 'Cinco movimientos suaves para soltar tensión. Si algo duele, detente.',
    steps: [
      'Sube los hombros hacia las orejas, sostén un momento y suéltalos. Repite tres veces.',
      'Inclina la cabeza hacia un lado, sin forzar, y luego hacia el otro.',
      'Entrelaza los dedos y estira los brazos hacia arriba durante tres respiraciones.',
      'Gira con suavidad el tronco a cada lado manteniendo la espalda recta.',
      'Abre y cierra las manos varias veces y mueve las muñecas en círculos.',
    ],
  },
  {
    id: 'consejos',
    kind: 'steps',
    title: 'Consejos de bienestar',
    icon: 'sparkle',
    intro: 'Pequeños hábitos que ayudan en el día a día.',
    steps: [
      'Toma agua con frecuencia, sobre todo en los días de calor.',
      'Haz pausas de pantalla: cada hora, mira algo lejano durante un minuto.',
      'Muévete un poco cada día: caminar también cuenta.',
      'Procura dormir en horarios parecidos, también los fines de semana.',
      'Habla con alguien de confianza cuando algo te pese. Pedir apoyo es un paso valiente.',
    ],
  },
  {
    id: 'gratitud',
    kind: 'steps',
    title: 'Ejercicio de gratitud',
    icon: 'heart',
    intro: 'Un momento para notar lo que sí está bien. No se guarda nada.',
    steps: [
      'Piensa en algo pequeño que haya salido bien hoy.',
      'Recuerda a una persona que te haya ayudado y por qué.',
      'Nombra algo de ti que valoras.',
      'Piensa en un lugar de tu ciudad que te guste.',
      'Si quieres, escríbelo o compártelo con alguien.',
    ],
  },
]
