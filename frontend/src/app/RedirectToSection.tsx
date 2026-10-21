import { Navigate, useLocation } from 'react-router'

/** Redirige las rutas antiguas (/brujula, /territorio…) a su sección de la página única. */
export function RedirectToSection({ id }: { id: string }) {
  const { search } = useLocation()
  return <Navigate replace to={{ pathname: '/', search, hash: id }} />
}
