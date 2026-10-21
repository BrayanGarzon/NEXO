import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Ocurrió un error inesperado.'

  return (
    <section className="status-page container" role="alert">
      <h1>Algo salió mal</h1>
      <p>{message}</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}
