import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { PERFIL_DEMO } from './mocks/datosSinteticos'
import { rolDescripciones, rolLabels } from './usuarios/permisos'

const iniciales = PERFIL_DEMO.nombre
  .split(' ')
  .map((parte) => parte[0])
  .join('')

/** Botón «Admin» del encabezado que abre una ventana con el perfil y el cierre de sesión. */
export function PanelPerfil() {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const ventana = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const tituloId = useId()

  useEffect(() => {
    if (!abierto) return
    ventana.current?.focus()

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
    return () => {
      document.removeEventListener('pointerdown', alPulsar)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  // Todavía no hay inicio de sesión: cerrar sesión lleva al sitio público.
  function cerrarSesion() {
    setAbierto(false)
    navigate('/')
  }

  return (
    <div className="panel-perfil" ref={contenedor}>
      <button
        ref={boton}
        type="button"
        className="panel-user"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label="Admin, ver perfil"
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="panel-user__avatar" aria-hidden="true">
          {iniciales}
        </span>
        <span className="panel-user__name">Admin</span>
        <Icon name="chevron-down" size={20} className="panel-user__chevron" />
      </button>

      {abierto && (
        <div
          ref={ventana}
          className="panel-perfil__ventana"
          role="dialog"
          aria-labelledby={tituloId}
          tabIndex={-1}
        >
          <div className="panel-perfil__cabecera">
            <span className="panel-user__avatar panel-user__avatar--grande" aria-hidden="true">
              {iniciales}
            </span>
            <div>
              <p id={tituloId} className="panel-perfil__nombre">
                {PERFIL_DEMO.nombre}
              </p>
              <p className="panel-perfil__correo">{PERFIL_DEMO.correo}</p>
            </div>
          </div>
          <dl className="panel-perfil__datos">
            <div>
              <dt>Rol</dt>
              <dd>{rolLabels[PERFIL_DEMO.rol]}</dd>
            </div>
            <div>
              <dt>Institución</dt>
              <dd>{PERFIL_DEMO.institucion}</dd>
            </div>
          </dl>
          <p className="panel-perfil__nota">{rolDescripciones[PERFIL_DEMO.rol]}</p>
          <Button variant="secondary" iconStart="arrow-left" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  )
}
