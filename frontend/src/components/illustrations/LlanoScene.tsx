import { useId } from 'react'
import './illustrations.css'

/*
 * Ilustración provisional del piedemonte llanero (Villavicencio, "Puerta del Llano").
 * Sustituye a la fotografía del moodboard hasta contar con fotos con licencia.
 */
export function LlanoScene() {
  const sky = useId()
  return (
    <svg
      className="illus"
      viewBox="0 0 400 440"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="illus__sky-top" />
          <stop offset="0.75" className="illus__sky-bottom" />
        </linearGradient>
      </defs>
      <rect width="400" height="440" fill={`url(#${sky})`} />
      <circle cx="268" cy="150" r="54" className="illus__sun" />
      <path
        className="illus__far"
        d="M0 250 52 186l40 30 58-80 54 66 34-30 62 62 44-40 56 50v196H0z"
      />
      <path className="illus__mid" d="M0 280c60-30 120-34 190-12s140 20 210-10v182H0z" />
      <path className="illus__plain" d="M0 318c80-22 170-22 250-4 60 12 110 10 150 0v126H0z" />
      <path
        className="illus__river"
        d="M120 440c20-40 90-56 120-76s14-40 60-46c-30 12-22 30-48 48s-80 34-84 74z"
      />
      <g className="illus__palm">
        <path d="M70 330c2-40 0-80-8-112" />
        <path d="M62 218c-20-6-36 2-46 14M62 218c-6-18-22-26-38-24M62 218c10-18 28-22 44-16M62 218c20-2 34 10 38 24M62 218c-2-16 6-30 18-36" />
      </g>
      <g className="illus__palm illus__palm--far">
        <path d="M330 320c0-26-2-50-8-70" />
        <path d="M322 250c-12-4-22 2-28 10M322 250c-4-12-14-16-24-14M322 250c6-12 18-14 28-10M322 250c12 0 20 6 24 16" />
      </g>
      <g className="illus__birds">
        <path className="illus__bird illus__bird--one" d="M150 104l10 8 10-8" />
        <path className="illus__bird illus__bird--two" d="M184 86l8 6 8-6" />
        <path className="illus__bird illus__bird--three" d="M120 132l7 5 7-5" />
      </g>
    </svg>
  )
}
