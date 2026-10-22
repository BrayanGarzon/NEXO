import { Component, type ReactNode } from 'react'

interface MapErrorBoundaryProps {
  onError: () => void
  children: ReactNode
}

/**
 * Si la ciudad 3D falla (no se descarga el módulo, WebGL rechaza el contexto, error al
 * dibujar…), avisa para pasar a la vista 2D en lugar de romper la sección.
 */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
