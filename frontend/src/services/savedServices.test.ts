import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SAVED_SERVICES_KEY,
  getSavedServices,
  reloadSavedServices,
  removeSavedService,
  saveService,
  subscribeSavedServices,
} from './savedServices'

describe('savedServices', () => {
  beforeEach(() => {
    localStorage.clear()
    reloadSavedServices()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('guarda en localStorage, sin duplicados y con lo más reciente primero', () => {
    saveService('a', new Date('2026-10-21T10:00:00Z'))
    saveService('b', new Date('2026-10-21T11:00:00Z'))
    saveService('a')
    expect(getSavedServices().map((item) => item.id)).toEqual(['b', 'a'])
    expect(JSON.parse(localStorage.getItem(SAVED_SERVICES_KEY)!)).toHaveLength(2)
  })

  it('elimina y notifica a los suscriptores', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSavedServices(listener)
    saveService('a')
    removeSavedService('a')
    expect(getSavedServices()).toEqual([])
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
  })

  it('recupera la lista guardada al recargar', () => {
    localStorage.setItem(
      SAVED_SERVICES_KEY,
      JSON.stringify([{ id: 'x', savedAt: '2026-10-21T10:00:00.000Z' }]),
    )
    reloadSavedServices()
    expect(getSavedServices()).toEqual([{ id: 'x', savedAt: '2026-10-21T10:00:00.000Z' }])
  })

  it('ignora datos corruptos o con formato inesperado', () => {
    localStorage.setItem(SAVED_SERVICES_KEY, '{no es json')
    reloadSavedServices()
    expect(getSavedServices()).toEqual([])

    localStorage.setItem(
      SAVED_SERVICES_KEY,
      JSON.stringify([{ id: 1 }, { id: 'ok', savedAt: 'x' }]),
    )
    reloadSavedServices()
    expect(getSavedServices().map((item) => item.id)).toEqual(['ok'])
  })

  it('sigue funcionando en memoria si el almacenamiento falla', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bloqueado', 'SecurityError')
    })
    saveService('a')
    expect(getSavedServices().map((item) => item.id)).toEqual(['a'])
  })

  it('se sincroniza con cambios hechos en otra pestaña', () => {
    localStorage.setItem(
      SAVED_SERVICES_KEY,
      JSON.stringify([{ id: 'otra', savedAt: '2026-10-21T10:00:00.000Z' }]),
    )
    window.dispatchEvent(new StorageEvent('storage', { key: SAVED_SERVICES_KEY }))
    expect(getSavedServices().map((item) => item.id)).toEqual(['otra'])
  })
})
