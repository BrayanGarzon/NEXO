/*
 * Gráficos ligeros del Observatorio en SVG/CSS (sin dependencias). Cada gráfico lleva su
 * lectura en texto (leyenda o etiquetas visibles) para no depender solo del color.
 */

export interface Segmento {
  etiqueta: string
  valor: number
  /** Clase de color definida en Panel.css (`panel-serie--…`). */
  serie: string
}

const RADIO = 42
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

export function Dona({
  segmentos,
  centro,
  detalle,
}: {
  segmentos: Segmento[]
  centro: string
  detalle: string
}) {
  const total = segmentos.reduce((suma, segmento) => suma + segmento.valor, 0)
  let acumulado = 0
  return (
    <svg className="panel-donut" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="panel-donut__track" cx="50" cy="50" r={RADIO} />
      {total > 0 &&
        segmentos.map((segmento) => {
          const largo = (segmento.valor / total) * CIRCUNFERENCIA
          const desplazamiento = -acumulado
          acumulado += largo
          return (
            <circle
              key={segmento.etiqueta}
              className={`panel-donut__segment ${segmento.serie}`}
              cx="50"
              cy="50"
              r={RADIO}
              strokeDasharray={`${largo} ${CIRCUNFERENCIA - largo}`}
              strokeDashoffset={desplazamiento}
            />
          )
        })}
      <text x="50" y="50" className="panel-donut__value">
        {centro}
      </text>
      <text x="50" y="62" className="panel-donut__label">
        {detalle}
      </text>
    </svg>
  )
}

export function Barras({ datos }: { datos: Segmento[] }) {
  const maximo = Math.max(1, ...datos.map((dato) => dato.valor))
  return (
    <ul className="panel-bars">
      {datos.map((dato) => (
        <li key={dato.etiqueta} className="panel-bars__item">
          <span className="panel-bars__label">{dato.etiqueta}</span>
          <span className="panel-bars__track" aria-hidden="true">
            <span
              className={`panel-bars__bar ${dato.serie}`}
              style={{ width: `${(dato.valor / maximo) * 100}%` }}
            />
          </span>
          <span className="panel-bars__value">{dato.valor}</span>
        </li>
      ))}
    </ul>
  )
}

/** Barra horizontal de proporción (p. ej. publicados con fuente oficial). */
export function Proporcion({ parte, total }: { parte: number; total: number }) {
  const ancho = total === 0 ? 0 : (parte / total) * 100
  return (
    <span className="panel-ratio" aria-hidden="true">
      <span className="panel-ratio__fill" style={{ width: `${ancho}%` }} />
    </span>
  )
}
