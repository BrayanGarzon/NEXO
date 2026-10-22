import type { FechaIso } from './types'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MS_POR_DIA = 24 * 60 * 60 * 1000

function dosDigitos(valor: number) {
  return String(valor).padStart(2, '0')
}

/** Fecha local en formato `AAAA-MM-DD`. */
export function aFechaIso(fecha: Date): FechaIso {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`
}

export function hoyIso(): FechaIso {
  return aFechaIso(new Date())
}

/** Interpreta `AAAA-MM-DD` (o el inicio de una fecha ISO con hora) como fecha local. */
function desdeIso(valor: string): Date {
  const [anio, mes, dia] = valor.slice(0, 10).split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export function sumarDias(fecha: FechaIso, dias: number): FechaIso {
  const resultado = desdeIso(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return aFechaIso(resultado)
}

/** Días completos entre dos fechas (positivo si `hasta` es posterior a `desde`). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((desdeIso(hasta).getTime() - desdeIso(desde).getTime()) / MS_POR_DIA)
}

/** "15 oct 2026", como en el moodboard. */
export function formatearFecha(valor: string | null): string {
  if (!valor) return 'Sin fecha'
  const fecha = desdeIso(valor)
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
}

/** "15 oct 2026, 09:30" para fechas con hora. */
export function formatearFechaHora(valor: string): string {
  const fecha = new Date(valor)
  return `${formatearFecha(aFechaIso(fecha))}, ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
}
