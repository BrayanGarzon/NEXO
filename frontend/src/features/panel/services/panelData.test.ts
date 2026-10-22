import { beforeEach, describe, expect, it } from 'vitest'
import { CONFIGURACION_POR_DEFECTO, configuracionActual } from '../reglas'
import {
  cambiarActivoUsuario,
  cambiarRolUsuario,
  eliminarServicio,
  guardarConfiguracion,
  invitarUsuario,
  listarFuentes,
  listarHistorial,
  listarServicios,
  listarUsuarios,
  marcarFuenteConsultada,
  reiniciarDatosPanel,
} from './panelData'

describe('capa de datos del panel', () => {
  beforeEach(() => reiniciarDatosPanel())

  describe('usuarios institucionales', () => {
    it('registra una invitación con correo normalizado', async () => {
      const usuario = await invitarUsuario({
        nombre: 'Ana Pérez',
        correo: ' Ana.Perez@Example.org ',
        institucion: 'Biblioteca (ejemplo)',
        rol: 'revisor',
      })
      expect(usuario).toMatchObject({ correo: 'ana.perez@example.org', activo: true })
      expect(usuario.ultimoAcceso).toBeNull()
      expect(await listarUsuarios()).toHaveLength(7)
    })

    it('rechaza correos inválidos o repetidos', async () => {
      const base = { nombre: 'X', institucion: 'Y', rol: 'editor' as const }
      await expect(invitarUsuario({ ...base, correo: 'sin-arroba' })).rejects.toThrow(
        'correo válido',
      )
      await expect(
        invitarUsuario({ ...base, correo: 'maria.gonzalez@example.org' }),
      ).rejects.toThrow('Ya existe')
    })

    it('mantiene siempre al menos un administrador activo', async () => {
      await expect(cambiarActivoUsuario('us-maria', false)).rejects.toThrow('administrador')
      await expect(cambiarRolUsuario('us-maria', 'editor')).rejects.toThrow('administrador')

      await cambiarRolUsuario('us-andres', 'administrador')
      await expect(cambiarActivoUsuario('us-maria', false)).resolves.toMatchObject({
        activo: false,
      })
    })
  })

  describe('fuentes', () => {
    it('marca una fuente como consultada hoy', async () => {
      const [masAntigua] = await listarFuentes()
      const actualizada = await marcarFuenteConsultada(masAntigua.servicioId, masAntigua.id)
      const hoy = new Date()
      const esperado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      expect(actualizada.fechaConsulta).toBe(esperado)
    })
  })

  describe('servicios no vigentes', () => {
    it('elimina el servicio no vigente junto con su historial', async () => {
      await eliminarServicio('sv-taller-programacion')
      expect(await listarServicios()).not.toContainEqual(
        expect.objectContaining({ id: 'sv-taller-programacion' }),
      )
      expect(await listarHistorial('sv-taller-programacion')).toEqual([])
    })

    it('impide eliminar un servicio vigente', async () => {
      await expect(eliminarServicio('sv-liga-futbol')).rejects.toThrow(
        'Solo se pueden eliminar servicios no vigentes.',
      )
      expect(await listarServicios()).toContainEqual(
        expect.objectContaining({ id: 'sv-liga-futbol' }),
      )
    })
  })

  describe('configuración', () => {
    it('guarda plazos válidos y los aplica a las reglas', async () => {
      await guardarConfiguracion({ ...CONFIGURACION_POR_DEFECTO, avisoPorVencerDias: 45 })
      expect(configuracionActual().avisoPorVencerDias).toBe(45)
    })

    it('rechaza valores fuera de rango o incoherentes', async () => {
      await expect(
        guardarConfiguracion({ ...CONFIGURACION_POR_DEFECTO, plazoVigenciaDias: 5 }),
      ).rejects.toThrow('entre 30 y 730')
      await expect(
        guardarConfiguracion({
          ...CONFIGURACION_POR_DEFECTO,
          plazoVigenciaDias: 60,
          avisoPorVencerDias: 60,
        }),
      ).rejects.toThrow('menor que el plazo')
      expect(configuracionActual()).toEqual(CONFIGURACION_POR_DEFECTO)
    })

    it('reiniciar los datos restablece la configuración', async () => {
      await guardarConfiguracion({ ...CONFIGURACION_POR_DEFECTO, revisionProlongadaDias: 30 })
      reiniciarDatosPanel()
      expect(configuracionActual()).toEqual(CONFIGURACION_POR_DEFECTO)
    })
  })
})
