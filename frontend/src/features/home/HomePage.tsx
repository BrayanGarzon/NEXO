import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { ButtonLink } from '../../components/Button'
import { Doodle } from '../../components/Doodle'
import { LlanoScene } from '../../components/illustrations/LlanoScene'
import { PhotoFrame } from '../../components/PhotoFrame'
import { SearchField } from '../../components/SearchField'
import { FeaturedServices } from './FeaturedServices'
import { quickLinks } from './homeContent'
import { ModuleCards } from './ModuleCards'
import './HomePage.css'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(value: string) {
    navigate(value ? `/territorio?q=${encodeURIComponent(value)}` : '/territorio')
  }

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <Doodle name="leaf" tone="menta" className="hero__leaf hero__leaf--left" />
        <div className="hero__inner container">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title hand">
              Tu bienestar <span className="marker">también construye</span> una mejor{' '}
              <span className="hero__title-end">
                Villavicencio
                <Doodle name="heart" tone="lila" className="hero__heart" />
              </span>
            </h1>
            <p className="hero__lead">
              Explora, conéctate y da tu siguiente paso con información confiable y cercana.
            </p>
            <div className="hero__search">
              <SearchField
                label="Buscar servicios, actividades u orientación"
                placeholder="¿Qué te gustaría explorar hoy?"
                value={query}
                onChange={setQuery}
                onSubmit={handleSearch}
                size="lg"
              />
            </div>
            <ul className="hero__quick" aria-label="Accesos rápidos">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hero__quick-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__visual">
            <Doodle name="sun" tone="amarillo" className="hero__sun" />
            <PhotoFrame
              className="hero__photo"
              alt="Ilustración del piedemonte llanero al atardecer, con palmas de moriche y un río"
              fallback={<LlanoScene />}
            />
            <Annotation tone="menta" tilt={6} className="hero__note hero__note--top">
              Pequeños pasos también cuentan
            </Annotation>
            <Annotation tone="lila" tilt={-5} size="lg" className="hero__note hero__note--bottom">
              Aquí también puedes ser tú
            </Annotation>
            <Doodle name="sparkle" tone="coral" filled className="hero__sparkle" />
          </div>
        </div>
      </section>

      <ModuleCards />
      <FeaturedServices />

      <section className="nudge container" aria-labelledby="nudge-title">
        <div className="nudge__card">
          <div className="nudge__copy">
            <h2 id="nudge-title" className="nudge__title hand">
              ¿No sabes por dónde empezar?
            </h2>
            <p>
              Responde dos preguntas sencillas en Brújula y te mostramos opciones de apoyo,
              actividades y espacios que pueden servirte. Sin registros y sin diagnósticos.
            </p>
          </div>
          <ButtonLink to="/brujula" variant="secondary" iconEnd="arrow-right">
            Abrir Brújula
          </ButtonLink>
          <Doodle name="arrow" tone="amarillo" className="nudge__arrow" />
        </div>
      </section>
    </>
  )
}
