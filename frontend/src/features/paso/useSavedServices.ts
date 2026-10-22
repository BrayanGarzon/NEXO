import { useSyncExternalStore } from 'react'
import {
  getSavedServices,
  removeSavedService,
  saveService,
  subscribeSavedServices,
} from '../../services/savedServices'

/** Lista de servicios guardados, compartida por Territorio y Mi siguiente paso. */
export function useSavedServices() {
  const saved = useSyncExternalStore(subscribeSavedServices, getSavedServices, getSavedServices)
  return {
    saved,
    isSaved: (id: string) => saved.some((item) => item.id === id),
    save: saveService,
    remove: removeSavedService,
  }
}
