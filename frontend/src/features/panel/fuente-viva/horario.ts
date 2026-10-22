/*
 * Texto de horario de un servicio, con el formato que ya usan los datos del panel:
 * «Lun – Vie · 8:00 a. m. – 5:00 p. m.», «Mar y Jue · …», «Sáb 25 oct 2026 · …».
 */

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

const DIAS_FECHA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Horas cada 30 minutos entre las 5:00 y las 23:00, en minutos desde medianoche. */
export const HORAS = Array.from({ length: 37 }, (_, i) => 5 * 60 + i * 30)

/** 480 → «8:00 a. m.»; 720 → «12:00 m.»; 1050 → «5:30 p. m.» */
export function formatearHora(minutos: number) {
  const hora = Math.floor(minutos / 60)
  const min = String(minutos % 60).padStart(2, '0')
  if (hora === 12 && min === '00') return '12:00 m.'
  const hora12 = hora % 12 === 0 ? 12 : hora % 12
  return `${hora12}:${min} ${hora < 12 ? 'a. m.' : 'p. m.'}`
}

/** Índices de días (0 = lunes) → «Lun – Vie», «Mar y Jue», «Lun, Mié y Vie», «Todos los días». */
export function formatearDias(dias: number[]) {
  const orden = [...new Set(dias)].sort((a, b) => a - b)
  if (orden.length === 7) return 'Todos los días'
  const seguidos = orden.every((dia, i) => i === 0 || dia === orden[i - 1] + 1)
  if (orden.length >= 3 && seguidos) return `${DIAS[orden[0]]} – ${DIAS[orden.at(-1)!]}`
  const nombres = orden.map((dia) => DIAS[dia])
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

/** «2026-10-25» → «Dom 25 oct 2026» (sin depender de la zona horaria del navegador). */
export function formatearFecha(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()
  return `${DIAS_FECHA[diaSemana]} ${dia} ${MESES[mes - 1]} ${anio}`
}

export type SeleccionHorario =
  | { tipo: 'semanal'; dias: number[]; desde: number; hasta: number }
  | { tipo: 'fecha'; fecha: string; desde: number; hasta: number }

/** Mensaje de error, o `null` si la selección es válida. */
export function validarHorario(seleccion: SeleccionHorario): string | null {
  if (seleccion.tipo === 'semanal' && seleccion.dias.length === 0) return 'Elige al menos un día.'
  if (seleccion.tipo === 'fecha' && !seleccion.fecha) return 'Elige una fecha.'
  if (seleccion.hasta <= seleccion.desde) return 'La hora de fin debe ser posterior al inicio.'
  return null
}

export function formatearHorario(seleccion: SeleccionHorario) {
  const cuando =
    seleccion.tipo === 'semanal' ? formatearDias(seleccion.dias) : formatearFecha(seleccion.fecha)
  return `${cuando} · ${formatearHora(seleccion.desde)} – ${formatearHora(seleccion.hasta)}`
}
