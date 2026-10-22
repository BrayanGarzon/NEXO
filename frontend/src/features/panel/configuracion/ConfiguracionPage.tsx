import { useCallback, useId, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { StatusMessage } from '../../../components/StatusMessage'
import { PanelHeader } from '../PanelHeader'
import { CONFIGURACION_POR_DEFECTO, type ConfiguracionPanel } from '../reglas'
import {
  guardarConfiguracion,
  LIMITES_CONFIGURACION,
  obtenerConfiguracion,
  reiniciarDatosPanel,
} from '../services/panelData'
import { useCarga } from '../useCarga'

const campos: { clave: keyof ConfiguracionPanel; etiqueta: string; ayuda: string }[] = [
  {
    clave: 'plazoVigenciaDias',
    etiqueta: 'Vigencia de un servicio publicado',
    ayuda: 'Al publicar, el servicio queda vigente durante estos días; después debe revisarse.',
  },
  {
    clave: 'antiguedadMaximaFuenteDias',
    etiqueta: 'Antigüedad máxima de una fuente',
    ayuda: 'Una fuente consultada hace más días se marca como antigua.',
  },
  {
    clave: 'avisoPorVencerDias',
    etiqueta: 'Aviso «por vencer»',
    ayuda: 'Días antes del vencimiento en que el Observatorio avisa.',
  },
  {
    clave: 'revisionProlongadaDias',
    etiqueta: 'Revisión prolongada',
    ayuda: 'Un servicio en revisión más días que estos aparece como incidencia.',
  },
]

/** Configuración — plazos de vigencia y calidad que usan Fuente Viva y el Observatorio. */
export function ConfiguracionPage() {
  const cargar = useCallback((signal: AbortSignal) => obtenerConfiguracion({ signal }), [])
  const { state, reintentar } = useCarga(cargar)

  return (
    <>
      <PanelHeader
        titulo="Configuración"
        subtitulo="Plazos que usan Fuente Viva y el Observatorio para medir la calidad."
      />
      <p className="panel-callout">
        Valores provisionales hasta acordar la decisión pendiente 9 (vigencia y antigüedad de
        fuentes). Los cambios se aplican de inmediato al panel.
      </p>
      {state.status === 'loading' && (
        <StatusMessage kind="loading" title="Cargando configuración…" />
      )}
      {state.status === 'error' && (
        <StatusMessage
          kind="error"
          title="No pudimos cargar la configuración"
          action={
            <Button variant="secondary" iconStart="refresh" onClick={reintentar}>
              Reintentar
            </Button>
          }
        />
      )}
      {state.status === 'ready' && <FormularioPlazos inicial={state.data} />}
      <DatosDemostracion onRestablecido={reintentar} />
    </>
  )
}

function FormularioPlazos({ inicial }: { inicial: ConfiguracionPanel }) {
  const id = useId()
  const [valores, setValores] = useState<Record<keyof ConfiguracionPanel, string>>(() =>
    textos(inicial),
  )
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGuardando(true)
    setMensaje(null)
    try {
      const guardada = await guardarConfiguracion(
        Object.fromEntries(
          Object.entries(valores).map(([clave, valor]) => [clave, Number(valor)]),
        ) as unknown as ConfiguracionPanel,
      )
      setValores(textos(guardada))
      setMensaje({ tipo: 'ok', texto: 'Configuración guardada.' })
    } catch (causa) {
      setMensaje({
        tipo: 'error',
        texto: causa instanceof Error ? causa.message : 'No se pudo guardar.',
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form
      className="panel-card panel-form"
      onSubmit={guardar}
      aria-labelledby={`${id}-titulo`}
      noValidate
    >
      <h3 id={`${id}-titulo`} className="panel-field--wide">
        Plazos de calidad
      </h3>
      {campos.map((campo) => {
        const [minimo, maximo] = LIMITES_CONFIGURACION[campo.clave]
        return (
          <div key={campo.clave} className="panel-field">
            <label htmlFor={`${id}-${campo.clave}`}>{campo.etiqueta} (días)</label>
            <input
              id={`${id}-${campo.clave}`}
              type="number"
              inputMode="numeric"
              min={minimo}
              max={maximo}
              step={1}
              required
              value={valores[campo.clave]}
              aria-describedby={`${id}-${campo.clave}-ayuda`}
              onChange={(event) => setValores({ ...valores, [campo.clave]: event.target.value })}
            />
            <p id={`${id}-${campo.clave}-ayuda`} className="panel-hint">
              {campo.ayuda} Entre {minimo} y {maximo}. Por defecto:{' '}
              {CONFIGURACION_POR_DEFECTO[campo.clave]}.
            </p>
          </div>
        )
      })}
      <div className="panel-field--wide" aria-live="polite">
        {mensaje && (
          <p className={mensaje.tipo === 'ok' ? 'panel-success' : 'panel-error'}>{mensaje.texto}</p>
        )}
      </div>
      <div className="panel-form__actions panel-field--wide">
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar configuración'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setValores(textos(CONFIGURACION_POR_DEFECTO))
            setMensaje(null)
          }}
        >
          Usar valores por defecto
        </Button>
      </div>
    </form>
  )
}

function textos(configuracion: ConfiguracionPanel) {
  return Object.fromEntries(
    Object.entries(configuracion).map(([clave, valor]) => [clave, String(valor)]),
  ) as Record<keyof ConfiguracionPanel, string>
}

function DatosDemostracion({ onRestablecido }: { onRestablecido: () => void }) {
  const [hecho, setHecho] = useState(false)
  return (
    <section className="panel-card" aria-labelledby="demo-titulo">
      <h3 id="demo-titulo">Datos de demostración</h3>
      <p className="panel-muted">
        Mientras no exista la API, el panel trabaja con datos sintéticos en memoria: los cambios se
        pierden al recargar la página. Puedes devolverlos ahora a su estado inicial, junto con la
        configuración.
      </p>
      <div className="panel-form__actions">
        <Button
          variant="secondary"
          iconStart="refresh"
          onClick={() => {
            if (!window.confirm('¿Restablecer los datos de demostración y la configuración?')) {
              return
            }
            reiniciarDatosPanel()
            setHecho(true)
            onRestablecido()
          }}
        >
          Restablecer datos de demostración
        </Button>
      </div>
      <div aria-live="polite">
        {hecho && <p className="panel-success">Datos y configuración restablecidos.</p>}
      </div>
    </section>
  )
}
