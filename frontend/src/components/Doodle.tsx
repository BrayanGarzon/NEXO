import './Doodle.css'

/*
 * Ilustraciones decorativas de trazo manual (siempre aria-hidden).
 * El color se controla con la clase de tono (currentColor).
 */
const doodles = {
  sun: (
    <>
      <path d="M30 58a22 22 0 0 1 44 0" />
      <path d="M52 22V6M30 30 20 18M74 30l10-12M18 50H4M100 50H86" />
    </>
  ),
  heart: (
    <path d="M50 86C22 66 8 50 12 32c3-14 22-20 34-6 2 3 3 5 4 8 2-6 6-11 12-14 14-6 28 4 26 20-2 18-20 32-38 46z" />
  ),
  sparkle: <path d="M50 10c3 22 10 34 40 40-30 6-37 18-40 40-3-22-10-34-40-40 30-6 37-18 40-40z" />,
  squiggle: <path d="M6 60c10-20 20-20 28 0s18 20 28 0 20-20 32 0" />,
  leaf: (
    <>
      <path d="M50 96C48 60 52 30 72 6" />
      <path d="M52 70c-18-2-30-12-34-28 16 0 30 8 34 28zM54 50c14-4 24-14 26-30-14 4-24 14-26 30zM56 32C44 28 38 18 38 6c12 4 18 14 18 26z" />
    </>
  ),
  arrow: <path d="M10 80C30 40 60 24 88 22M74 10l14 12-16 10" />,
} as const

export type DoodleName = keyof typeof doodles
export type DoodleTone = 'lila' | 'coral' | 'amarillo' | 'menta' | 'petroleo'

interface DoodleProps {
  name: DoodleName
  tone?: DoodleTone
  filled?: boolean
  className?: string
}

export function Doodle({ name, tone = 'lila', filled = false, className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={['doodle', `doodle--${tone}`, filled && 'doodle--filled', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      focusable="false"
    >
      {doodles[name]}
    </svg>
  )
}
