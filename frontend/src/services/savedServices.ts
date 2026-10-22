/*
 * Servicios guardados por la persona en "Mi siguiente paso".
 *
 * Se guardan SOLO en este navegador (localStorage): no se envían a ningún servidor y no
 * identifican a nadie. Si el almacenamiento no está disponible (modo privado, bloqueo),
 * la lista funciona en memoria durante la visita.
 */

export interface SavedService {
  id: string
  /** Fecha ISO en la que se guardó. */
  savedAt: string
}

export const SAVED_SERVICES_KEY = 'nexo:mi-siguiente-paso:v1'

type Listener = () => void
const listeners = new Set<Listener>()
const EMPTY: SavedService[] = []

function isSavedService(value: unknown): value is SavedService {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SavedService).id === 'string' &&
    typeof (value as SavedService).savedAt === 'string'
  )
}

function readStorage(): SavedService[] {
  try {
    const raw = window.localStorage.getItem(SAVED_SERVICES_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSavedService) : EMPTY
  } catch {
    return EMPTY
  }
}

let current: SavedService[] = readStorage()

function commit(next: SavedService[]) {
  current = next
  try {
    window.localStorage.setItem(SAVED_SERVICES_KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento disponible: se mantiene en memoria.
  }
  listeners.forEach((listener) => listener())
}

// Sincroniza con otras pestañas del mismo navegador.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== SAVED_SERVICES_KEY && event.key !== null) return
    current = readStorage()
    listeners.forEach((listener) => listener())
  })
}

export function subscribeSavedServices(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Lista actual, de la más reciente a la más antigua. */
export function getSavedServices() {
  return current
}

export function saveService(id: string, now = new Date()) {
  if (current.some((item) => item.id === id)) return
  commit([{ id, savedAt: now.toISOString() }, ...current])
}

export function removeSavedService(id: string) {
  if (!current.some((item) => item.id === id)) return
  commit(current.filter((item) => item.id !== id))
}

/** Vuelve a leer el almacenamiento (útil en pruebas y tras cambios externos). */
export function reloadSavedServices() {
  current = readStorage()
  listeners.forEach((listener) => listener())
}
