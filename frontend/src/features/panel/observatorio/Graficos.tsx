import { Link } from 'react-router'

/*
 * Gráficos ligeros del Observatorio en SVG/CSS (sin dependencias). Cada gráfico lleva su
 * lectura en texto (leyenda o etiquetas visibles) para no depender solo del color.
 */

export interface Segmento {
  etiqueta: string
  valor: number
  porcentaje?: number
  href?: string
  /** Clase de color definida en Panel.css (`panel-serie--…`). */
  serie: string
}

export interface FilaCoberturaGrafica {
  nombre: string
  publicados: number
  conFuenteOficial: number
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

export function Barras({ datos, className }: { datos: Segmento[]; className?: string }) {
  const maximo = Math.max(1, ...datos.map((dato) => dato.valor))
  return (
    <ul className={className ? `panel-bars ${className}` : 'panel-bars'}>
      {datos.map((dato) => (
        <li key={dato.etiqueta} className="panel-bars__item">
          <span className="panel-bars__label">
            {dato.href ? <Link to={dato.href}>{dato.etiqueta}</Link> : dato.etiqueta}
          </span>
          <span className="panel-bars__track" aria-hidden="true">
            <span
              className={`panel-bars__bar ${dato.serie}`}
              style={{
                width: `${dato.porcentaje ?? (dato.valor / maximo) * 100}%`,
              }}
            />
          </span>
          <span className="panel-bars__value">
            {dato.porcentaje === undefined ? dato.valor : `${dato.valor} · ${dato.porcentaje}%`}
          </span>
        </li>
      ))}
    </ul>
  )
}

function crearArcoTorta(inicio: number, fin: number) {
  const radio = 46
  const centroX = 50
  const centroY = 48
  const xInicio = centroX + radio * Math.cos(inicio)
  const yInicio = centroY + radio * Math.sin(inicio)
  const xFin = centroX + radio * Math.cos(fin)
  const yFin = centroY + radio * Math.sin(fin)
  const arcoGrande = fin - inicio > Math.PI ? 1 : 0

  return `M ${centroX} ${centroY} L ${xInicio} ${yInicio} A ${radio} ${radio} 0 ${arcoGrande} 1 ${xFin} ${yFin} Z`
}

export function TortaCobertura({
  filas,
  grupo,
}: {
  filas: FilaCoberturaGrafica[]
  grupo: 'categoria' | 'comuna'
}) {
  const total = filas.reduce((suma, fila) => suma + fila.publicados, 0)
  const filasPublicadas = filas.filter((fila) => fila.publicados > 0)
  const porciones = filasPublicadas.map((fila, indice) => {
    const proporcion = fila.publicados / total
    const anteriores = filasPublicadas
      .slice(0, indice)
      .reduce((suma, anterior) => suma + anterior.publicados, 0)
    const inicio = -Math.PI / 2 + (anteriores / total) * Math.PI * 2
    const fin = inicio + proporcion * Math.PI * 2
    const anguloMedio = (inicio + fin) / 2
    const porcentaje = Math.round(proporcion * 100)
    const radioEtiqueta = 26

    return {
      fila,
      indice,
      porcentaje,
      d:
        proporcion === 1
          ? 'M 50 2 A 46 46 0 1 1 50 94 A 46 46 0 1 1 50 2 Z'
          : crearArcoTorta(inicio, fin),
      xEtiqueta: 50 + Math.cos(anguloMedio) * radioEtiqueta,
      yEtiqueta: 48 + Math.sin(anguloMedio) * radioEtiqueta,
    }
  })

  return (
    <div className={`panel-coverage-chart panel-coverage-chart--${grupo}`}>
      <div className="panel-coverage-chart__visual">
        <svg
          className="panel-coverage-chart__pie"
          viewBox="0 0 100 110"
          role="img"
          aria-label={`Distribución de ${total} servicios publicados por ${grupo}`}
        >
          <ellipse className="panel-coverage-chart__shadow" cx="50" cy="55" rx="46" ry="46" />
          {[2, 4, 6].map((profundidad) => (
            <g
              key={profundidad}
              className={`panel-coverage-chart__depth panel-coverage-chart__depth--${profundidad}`}
              transform={`translate(0 ${profundidad})`}
            >
              {porciones.map(({ fila, indice, d }) => (
                <path
                  key={fila.nombre}
                  d={d}
                  className={`panel-coverage-chart__slice panel-coverage-chart__slice--${(indice % 8) + 1}`}
                />
              ))}
            </g>
          ))}
          {porciones.map(({ fila, indice, d }) => {
            const conFuente = Math.min(fila.conFuenteOficial, fila.publicados)
            return (
              <g key={fila.nombre}>
                <path
                  d={d}
                  className={`panel-coverage-chart__slice panel-coverage-chart__slice--${(indice % 8) + 1}`}
                >
                  <title>{`${fila.nombre}: ${fila.publicados} publicados, ${conFuente} con fuente oficial`}</title>
                </path>
              </g>
            )
          })}
          {porciones.map(({ fila, porcentaje, xEtiqueta, yEtiqueta }) => (
            <text
              key={fila.nombre}
              className="panel-coverage-chart__percentage"
              x={xEtiqueta}
              y={yEtiqueta}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {porcentaje}%
            </text>
          ))}
        </svg>
        <div className="panel-coverage-chart__total">
          <strong>{total}</strong>
          <span>publicados</span>
        </div>
      </div>
      <ul
        className="panel-coverage-chart__rows"
        aria-label={`Detalle de servicios publicados por ${grupo}`}
      >
        {filas.map((fila) => {
          const conFuente = Math.min(fila.conFuenteOficial, fila.publicados)
          const porcentaje = total ? Math.round((fila.publicados / total) * 100) : 0
          const indicePorcion = filasPublicadas.indexOf(fila)
          return (
            <li
              key={fila.nombre}
              className={`panel-coverage-chart__row ${
                indicePorcion < 0
                  ? 'panel-coverage-chart__row--sin-porcion'
                  : `panel-coverage-chart__row--porcion-${(indicePorcion % 8) + 1}`
              }`}
            >
              <span className="panel-coverage-chart__key" aria-hidden="true" />
              <span className="panel-coverage-chart__name">{fila.nombre}</span>
              <span className="panel-coverage-chart__value">
                <strong>
                  {fila.publicados} · {porcentaje}%
                </strong>
                <span>{conFuente} con fuente oficial</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
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
