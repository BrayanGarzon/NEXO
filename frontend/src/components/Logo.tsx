import './Logo.css'

/** Marca NEXO JOVEN 360: símbolo + logotipo. */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? 'logo logo--inverse' : 'logo'}>
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <circle cx="20" cy="20" r="19" className="logo__ring" />
        <path d="M7 27l8-11 5 6 4-5 9 10a17 17 0 0 1-26 0z" className="logo__peak" />
        <path d="M6 29c5-3 10-3 14 0s9 3 14 0a17 17 0 0 1-28 0z" className="logo__wave" />
        <circle cx="27" cy="12" r="3" className="logo__sun" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">NEXO</span>
        <span className="logo__sub">JOVEN 360</span>
      </span>
    </span>
  )
}
