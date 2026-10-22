import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import {
  DIAS,
  HORAS,
  formatearHora,
  formatearHorario,
  validarHorario,
  type SeleccionHorario,
} from './horario'

interface SelectorHorarioProps {
  id: string
  value: string
  onChange: (valor: string) => void
}

const atajos = [
  { etiqueta: 'Lun a Vie', dias: [0, 1, 2, 3, 4] },
  { etiqueta: 'Lun a Sáb', dias: [0, 1, 2, 3, 4, 5] },
  { etiqueta: 'Todos', dias: [0, 1, 2, 3, 4, 5, 6] },
]

/** Campo de horario: se puede escribir o elegir días/fecha y horas en un desplegable. */
export function SelectorHorario({ id, value, onChange }: SelectorHorarioProps) {
  const [abierto, setAbierto] = useState(false)
  const [colocarArriba, setColocarArriba] = useState(false)
  const [tipo, setTipo] = useState<SeleccionHorario['tipo']>('semanal')
  const [dias, setDias] = useState<number[]>([0, 1, 2, 3, 4])
  const [fecha, setFecha] = useState('')
  const [desde, setDesde] = useState(8 * 60)
  const [hasta, setHasta] = useState(17 * 60)
  const contenedor = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const ventana = useRef<HTMLDivElement>(null)
  const tituloId = useId()

  const seleccion: SeleccionHorario =
    tipo === 'semanal' ? { tipo, dias, desde, hasta } : { tipo, fecha, desde, hasta }
  const error = validarHorario(seleccion)

  useEffect(() => {
    if (!abierto) return
    ventana.current?.focus({ preventScroll: true })

    let frame = requestAnimationFrame(() => {
      const botonRect = boton.current?.getBoundingClientRect()
      const ventanaRect = ventana.current?.getBoundingClientRect()
      if (!botonRect || !ventanaRect) return

      const espacioAbajo = window.innerHeight - botonRect.bottom
      const espacioArriba = botonRect.top
      setColocarArriba(espacioAbajo < ventanaRect.height && espacioArriba > espacioAbajo)
    })

    function reubicar() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const botonRect = boton.current?.getBoundingClientRect()
        const ventanaRect = ventana.current?.getBoundingClientRect()
        if (!botonRect || !ventanaRect) return

        const espacioAbajo = window.innerHeight - botonRect.bottom
        const espacioArriba = botonRect.top
        setColocarArriba(espacioAbajo < ventanaRect.height && espacioArriba > espacioAbajo)
      })
    }

    function alPulsar(evento: PointerEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    document.addEventListener('pointerdown', alPulsar)
    document.addEventListener('keydown', alTeclear)
    window.addEventListener('resize', reubicar)
    window.addEventListener('scroll', reubicar, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', alPulsar)
      document.removeEventListener('keydown', alTeclear)
      window.removeEventListener('resize', reubicar)
      window.removeEventListener('scroll', reubicar, true)
    }
  }, [abierto])

  function alternarDia(dia: number) {
    setDias((actuales) =>
      actuales.includes(dia) ? actuales.filter((d) => d !== dia) : [...actuales, dia],
    )
  }

  function aplicar() {
    if (error) return
    onChange(formatearHorario(seleccion))
    setAbierto(false)
    boton.current?.focus()
  }

  return (
    <div className="panel-horario" ref={contenedor}>
      <div className="panel-horario__campo">
        <input
          id={id}
          value={value}
          placeholder="Lun – Vie · 8:00 a. m. – 5:00 p. m."
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          ref={boton}
          type="button"
          className="panel-horario__abrir"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          onClick={() => setAbierto((valor) => !valor)}
        >
          <Icon name="clock" size={18} />
          Elegir
        </button>
      </div>

      {abierto && (
        <div
          ref={ventana}
          className={
            colocarArriba
              ? 'panel-horario__ventana panel-horario__ventana--arriba'
              : 'panel-horario__ventana'
          }
          role="dialog"
          aria-labelledby={tituloId}
          tabIndex={-1}
        >
          <p id={tituloId} className="panel-horario__titulo">
            Elegir horario
          </p>

          <div className="panel-horario__tipos" role="group" aria-label="Tipo de horario">
            <button
              type="button"
              aria-pressed={tipo === 'semanal'}
              onClick={() => setTipo('semanal')}
            >
              Días de la semana
            </button>
            <button type="button" aria-pressed={tipo === 'fecha'} onClick={() => setTipo('fecha')}>
              Fecha
            </button>
          </div>

          {tipo === 'semanal' ? (
            <>
              <div className="panel-horario__dias" role="group" aria-label="Días">
                {DIAS.map((dia, indice) => (
                  <button
                    key={dia}
                    type="button"
                    aria-pressed={dias.includes(indice)}
                    aria-label={dia}
                    onClick={() => alternarDia(indice)}
                  >
                    {dia.slice(0, 1)}
                  </button>
                ))}
              </div>
              <div className="panel-horario__atajos">
                {atajos.map((atajo) => (
                  <button key={atajo.etiqueta} type="button" onClick={() => setDias(atajo.dias)}>
                    {atajo.etiqueta}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="panel-field">
              <label htmlFor={`${id}-fecha`}>Fecha</label>
              <input
                id={`${id}-fecha`}
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
          )}

          <div className="panel-horario__horas">
            <div className="panel-field">
              <label htmlFor={`${id}-desde`}>Desde</label>
              <select
                id={`${id}-desde`}
                value={desde}
                onChange={(event) => setDesde(Number(event.target.value))}
              >
                {HORAS.map((minutos) => (
                  <option key={minutos} value={minutos}>
                    {formatearHora(minutos)}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-field">
              <label htmlFor={`${id}-hasta`}>Hasta</label>
              <select
                id={`${id}-hasta`}
                value={hasta}
                onChange={(event) => setHasta(Number(event.target.value))}
              >
                {HORAS.map((minutos) => (
                  <option key={minutos} value={minutos}>
                    {formatearHora(minutos)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p
            className={
              error ? 'panel-horario__vista panel-horario__vista--error' : 'panel-horario__vista'
            }
            aria-live="polite"
          >
            {error ?? formatearHorario(seleccion)}
          </p>

          <div className="panel-horario__acciones">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAbierto(false)
                boton.current?.focus()
              }}
            >
              Cancelar
            </Button>
            <Button size="sm" disabled={Boolean(error)} onClick={aplicar}>
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
