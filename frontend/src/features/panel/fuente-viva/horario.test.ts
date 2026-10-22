import { describe, expect, it } from 'vitest'
import {
  formatearDias,
  formatearFecha,
  formatearHora,
  formatearHorario,
  validarHorario,
} from './horario'

describe('horario', () => {
  it('formatea horas como en los datos del panel', () => {
    expect(formatearHora(8 * 60)).toBe('8:00 a. m.')
    expect(formatearHora(12 * 60)).toBe('12:00 m.')
    expect(formatearHora(12 * 60 + 30)).toBe('12:30 p. m.')
    expect(formatearHora(17 * 60 + 30)).toBe('5:30 p. m.')
  })

  it('resume los días seguidos, sueltos y la semana completa', () => {
    expect(formatearDias([0, 1, 2, 3, 4])).toBe('Lun – Vie')
    expect(formatearDias([1, 3])).toBe('Mar y Jue')
    expect(formatearDias([0, 2, 4])).toBe('Lun, Mié y Vie')
    expect(formatearDias([5])).toBe('Sáb')
    expect(formatearDias([0, 1, 2, 3, 4, 5, 6])).toBe('Todos los días')
  })

  it('formatea una fecha con su día de la semana', () => {
    expect(formatearFecha('2026-10-25')).toBe('Dom 25 oct 2026')
  })

  it('arma el texto completo y valida la selección', () => {
    const semanal = { tipo: 'semanal' as const, dias: [0, 1, 2, 3, 4], desde: 480, hasta: 1020 }
    expect(formatearHorario(semanal)).toBe('Lun – Vie · 8:00 a. m. – 5:00 p. m.')
    expect(validarHorario(semanal)).toBeNull()
    expect(validarHorario({ ...semanal, dias: [] })).toBe('Elige al menos un día.')
    expect(validarHorario({ ...semanal, hasta: 480 })).toBe(
      'La hora de fin debe ser posterior al inicio.',
    )
    expect(validarHorario({ tipo: 'fecha', fecha: '', desde: 480, hasta: 600 })).toBe(
      'Elige una fecha.',
    )
  })
})
