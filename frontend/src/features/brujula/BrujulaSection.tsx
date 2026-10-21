import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { Button, ButtonLink } from '../../components/Button'
import { ChoiceTile } from '../../components/ChoiceTile'
import { Doodle } from '../../components/Doodle'
import { Icon } from '../../components/Icon'
import { ServiceThumb } from '../../components/illustrations/ServiceThumb'
import { DemoTag, Tag } from '../../components/Tag'
import { categories } from '../../content/categories'
import { getAllDemoServicesSync } from '../../services/catalog'
import { needOptions, preferenceOptions, steps } from './brujulaContent'
import { buildRoute } from './buildRoute'
import './BrujulaSection.css'

type Step = 0 | 1 | 2

export function BrujulaSection() {
  const [step, setStep] = useState<Step>(0)
  const [needId, setNeedId] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  // Al cambiar de paso, lleva el foco a su título (lectores de pantalla y teclado).
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    headingRef.current?.focus()
  }, [step])

  const need = needOptions.find((option) => option.id === needId)
  const preference = preferenceOptions.find((option) => option.id === preferenceId)

  function restart() {
    setNeedId(null)
    setPreferenceId(null)
    setStep(0)
  }

  return (
    <section id="brujula" className="brujula" aria-labelledby="brujula-title">
      <div className="container">
        <p className="section-eyebrow">
          <Icon name="compass" size={18} /> Brújula · orientación informativa
        </p>
        <ol className="stepper" aria-label="Pasos de Brújula">
          {steps.map((label, index) => (
            <li
              key={label}
              className={[
                'stepper__item',
                index === step && 'stepper__item--current',
                index < step && 'stepper__item--done',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={index === step ? 'step' : undefined}
            >
              <span className="stepper__number">{index + 1}</span>
              <span className="stepper__label">{label}</span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="brujula__step">
            <div className="brujula__intro">
              <h2 id="brujula-title" ref={headingRef} tabIndex={-1} className="brujula__title hand">
                Cuéntanos, ¿qué estás buscando hoy?
              </h2>
              <p>
                Selecciona la opción que más se acerca a lo que necesitas. No es un diagnóstico: es
                una guía para mostrarte información útil.
              </p>
              <div className="brujula__art" aria-hidden="true">
                <span className="brujula__compass">
                  <Icon name="compass" size={64} />
                </span>
                <Doodle name="sparkle" tone="amarillo" filled className="brujula__spark" />
                <Doodle name="leaf" tone="menta" className="brujula__leaf" />
              </div>
            </div>
            <form
              className="brujula__form"
              onSubmit={(event) => {
                event.preventDefault()
                if (need) setStep(1)
              }}
            >
              <fieldset className="brujula__fieldset">
                <legend className="visually-hidden">¿Qué estás buscando hoy?</legend>
                <div className="brujula__grid">
                  {needOptions.map((option) => (
                    <ChoiceTile
                      key={option.id}
                      name="necesidad"
                      value={option.id}
                      label={option.label}
                      icon={option.icon}
                      checked={needId === option.id}
                      onChange={setNeedId}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="brujula__actions">
                <Button type="submit" iconEnd="arrow-right" disabled={!need}>
                  Continuar
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 1 && need && (
          <div className="brujula__step">
            <div className="brujula__intro">
              <h2 id="brujula-title" ref={headingRef} tabIndex={-1} className="brujula__title hand">
                ¿Cómo te gustaría empezar?
              </h2>
              <p>
                Elegiste: <strong>{need.label}</strong>. Ahora dinos qué tipo de primer paso te
                resulta más cómodo.
              </p>
              <Annotation tone="amarillo" tilt={-3} className="brujula__note">
                Puedes cambiarlo cuando quieras
              </Annotation>
            </div>
            <form
              className="brujula__form"
              onSubmit={(event) => {
                event.preventDefault()
                if (preference) setStep(2)
              }}
            >
              <fieldset className="brujula__fieldset">
                <legend className="visually-hidden">¿Cómo te gustaría empezar?</legend>
                <div className="brujula__grid brujula__grid--two">
                  {preferenceOptions.map((option) => (
                    <ChoiceTile
                      key={option.id}
                      name="preferencia"
                      value={option.id}
                      label={option.label}
                      description={option.description}
                      icon={option.icon}
                      checked={preferenceId === option.id}
                      onChange={setPreferenceId}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="brujula__actions">
                <Button variant="secondary" iconStart="arrow-left" onClick={() => setStep(0)}>
                  Regresar
                </Button>
                <Button type="submit" iconEnd="arrow-right" disabled={!preference}>
                  Ver mi ruta
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && need && preference && (
          <Results
            headingRef={headingRef}
            needLabel={need.label}
            preferenceLabel={preference.label}
            result={buildRoute(need, preference, getAllDemoServicesSync())}
            onBack={() => setStep(1)}
            onRestart={restart}
          />
        )}
      </div>
    </section>
  )
}

interface ResultsProps {
  headingRef: RefObject<HTMLHeadingElement | null>
  needLabel: string
  preferenceLabel: string
  result: ReturnType<typeof buildRoute>
  onBack: () => void
  onRestart: () => void
}

function Results({
  headingRef,
  needLabel,
  preferenceLabel,
  result,
  onBack,
  onRestart,
}: ResultsProps) {
  return (
    <div className="brujula__results">
      <header className="results__header">
        <h2 id="brujula-title" ref={headingRef} tabIndex={-1} className="brujula__title hand">
          Tu ruta para empezar
        </h2>
        <p>
          Según lo que elegiste — <strong>{needLabel}</strong> · <strong>{preferenceLabel}</strong>{' '}
          — estas opciones pueden servirte.
        </p>
        <DemoTag />
      </header>

      {result.showUrgentHelp && (
        <aside className="results__urgent" aria-labelledby="ayuda-inmediata">
          <Icon name="heart" size={28} />
          <div>
            <h3 id="ayuda-inmediata">Si necesitas ayuda ahora mismo</h3>
            <p>
              No estás solo(a). Si sientes que estás en peligro, llama a la línea de emergencias{' '}
              <a href="tel:123">123</a> o acude al servicio de urgencias más cercano.
            </p>
          </div>
        </aside>
      )}

      {result.services.length > 0 ? (
        <ol className="results__list">
          {result.services.map((service, index) => {
            const category = categories[service.category]
            return (
              <li key={service.id} className="results__item">
                <span className="results__index" aria-hidden="true">
                  {index + 1}
                </span>
                <ServiceThumb icon={category.icon} tone={category.tone} />
                <div className="results__body">
                  <h3 className="results__name">{service.name}</h3>
                  <p>{service.summary}</p>
                  <p className="results__meta">
                    <Icon name="map-pin" size={16} /> Comuna {service.comuna} ·{' '}
                    {service.distanceKm.toLocaleString('es-CO')} km
                  </p>
                  <div className="results__tags">
                    <Tag tone="accent">{category.label}</Tag>
                    {service.verified && (
                      <Tag tone="success" icon="verified">
                        Servicio verificado
                      </Tag>
                    )}
                  </div>
                </div>
                <Link to={`/?servicio=${service.id}#territorio`} className="results__link">
                  Ver en el mapa <Icon name="arrow-right" size={18} />
                </Link>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="results__empty">
          Aún no tenemos servicios de demostración para esta combinación. Explora el mapa para ver
          todas las opciones.
        </p>
      )}

      <div className="brujula__actions brujula__actions--results">
        <Button variant="secondary" iconStart="arrow-left" onClick={onBack}>
          Cambiar respuestas
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          Empezar de nuevo
        </Button>
        <ButtonLink to="/#territorio" iconEnd="arrow-right">
          Explorar el mapa
        </ButtonLink>
      </div>
    </div>
  )
}
