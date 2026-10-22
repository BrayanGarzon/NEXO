import type { ThumbTone } from '../../../components/illustrations/ServiceThumb'

/*
 * Colores de la ciudad 3D. Derivan de la paleta de marca (styles/tokens.css):
 * petróleo #163B3A, marfil #F7F4ED, coral #FF8F70, lila #8876F6, amarillo #FFD66B,
 * menta #D5EFE5 y sus variantes suaves. Three.js no lee variables CSS, por eso se repiten aquí.
 */
export const cityColors = {
  ground: '#cdebdc',
  island: '#9fd2bb',
  islandSide: '#5f9e86',
  lot: '#ece6da',
  park: '#a9dcc0',
  road: '#2f4a48',
  roadLine: '#ffd66b',
  sidewalk: '#f7f4ed',
  crosswalk: '#f7f4ed',
  water: '#b8c4fb',
  waterEdge: '#8876f6',
  bridge: '#f7f4ed',
  bridgeRail: '#ff8f70',
  field: '#7cc49b',
  fieldLine: '#f7f4ed',
  court: '#ff8f70',
  plaza: '#f7f4ed',
  trunk: '#7a5b45',
  hubPad: '#f7f4ed',
} as const

/** Fachadas: marfil, menta, amarillo suave, coral suave, lila suave, arena y blanco. */
export const facadeColors = [
  '#f7f4ed',
  '#d5efe5',
  '#fff3cf',
  '#ffe0d4',
  '#e6e1fe',
  '#ece6da',
  '#ffffff',
]

/** Techos con los acentos de la marca. */
export const roofColors = ['#163b3a', '#ff8f70', '#8876f6', '#ffd66b', '#1e6b4f']

/** Copas de árbol: verdes de la marca y un toque coral y lila (florecidos). */
export const treeColors = ['#1e6b4f', '#2f8a65', '#5fb38a', '#ff8f70']

/** Colinas y cordillera del fondo: verdes de la marca. */
export const hillColors = ['#5f9e86', '#2f8a65', '#7cc49b']

/** Flores de parques y plazas. */
export const flowerColors = ['#ff8f70', '#ffd66b', '#8876f6']

export const benchColor = '#b98b63'

/** Carros: acentos de la marca. */
export const carColors = ['#ff8f70', '#8876f6', '#ffd66b', '#f7f4ed', '#2f8a65']

/** Color del marcador según el tono de la categoría (igual que .map-pin--*). */
export const markerColors: Record<ThumbTone, string> = {
  lila: '#6b57e8',
  menta: '#163b3a',
  amarillo: '#ffd66b',
  coral: '#ff8f70',
}
