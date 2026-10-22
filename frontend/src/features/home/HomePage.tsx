import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { Doodle } from '../../components/Doodle'
import { LlanoScene } from '../../components/illustrations/LlanoScene'
import { PhotoFrame } from '../../components/PhotoFrame'
import { SearchField } from '../../components/SearchField'
import { BrujulaSection } from '../brujula/BrujulaSection'
import { InformacionSection } from '../informacion/InformacionSection'
import { TerritorioSection } from '../territorio/TerritorioSection'
import { PasoSection } from '../paso/PasoSection'
import { PausaSection } from '../pausa/PausaSection'
import { quickLinks } from './homeContent'
import { ModuleCards } from './ModuleCards'
import './HomePage.css'

/**
 * Página única de NEXO JOVEN 360: todas las secciones públicas en un solo recorrido.
 * El menú navega entre ellas con anclas (ver app/navigation.ts).
 */
export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(value: string) {
    navigate(value ? `/?q=${encodeURIComponent(value)}#territorio` : '/#territorio')
  }

  return (
    <>
      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <Doodle name="leaf" tone="menta" className="hero__leaf hero__leaf--left" />
        <div className="hero__inner container">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title hand">
              Tu bienestar mental <span className="marker">también construye</span> una mejor{' '}
              <span className="hero__title-end">
                versión
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

        <ModuleCards />
      </section>

      <BrujulaSection />
      <TerritorioSection />
      <PausaSection />
      <PasoSection />
      <InformacionSection />
    </>
  )
}
