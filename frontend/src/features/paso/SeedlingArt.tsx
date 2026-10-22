/** Ilustración del estado vacío: un brote en su maceta (decorativa, elaboración propia). */
export function SeedlingArt() {
  return (
    <svg className="seedling-art" viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <ellipse className="seedling-art__ground" cx="80" cy="128" rx="58" ry="8" />
      <path className="seedling-art__stem" d="M80 92V54c0-10 2-18 8-26" />
      <path
        className="seedling-art__leaf seedling-art__leaf--left"
        d="M80 66c-4-16-18-24-36-22 2 16 16 26 36 22z"
      />
      <path
        className="seedling-art__leaf seedling-art__leaf--right"
        d="M84 48c4-16 18-24 34-22-2 16-16 25-34 22z"
      />
      <path className="seedling-art__pot" d="M50 90h60l-8 38H58z" />
      <path className="seedling-art__rim" d="M46 84h68v10H46z" />
      <path
        className="seedling-art__spark"
        d="M128 70c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z"
      />
      <circle className="seedling-art__dot" cx="34" cy="84" r="4" />
    </svg>
  )
}
