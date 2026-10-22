/** Nivel gráfico de la ciudad 3D según el dispositivo. */
export interface MapQuality {
  level: 'alta' | 'baja'
  /** Rango de densidad de píxeles del lienzo. */
  dpr: [number, number]
  shadows: boolean
  antialias: boolean
  /** Proporción de árboles que se dibujan (0–1). */
  treeDensity: number
}

export interface DeviceHints {
  coarsePointer: boolean
  width: number
  deviceMemory?: number
  cores?: number
}

export function readDeviceHints(): DeviceHints {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return {
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    width: window.innerWidth,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
  }
}

/**
 * Móviles, pantallas estrechas o equipos modestos usan la calidad baja: sin sombras,
 * menos resolución y menos árboles.
 */
export function chooseQuality(hints: DeviceHints): MapQuality {
  const modest =
    hints.coarsePointer ||
    hints.width < 900 ||
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 4) ||
    (hints.cores !== undefined && hints.cores <= 4)
  return modest
    ? { level: 'baja', dpr: [1, 1.5], shadows: false, antialias: false, treeDensity: 0.65 }
    : { level: 'alta', dpr: [1, 2], shadows: true, antialias: true, treeDensity: 1 }
}
