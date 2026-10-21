import type { RouteObject } from 'react-router'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'
import { BrujulaPage } from '../features/brujula/BrujulaPage'
import { ComingSoonPage } from '../features/coming-soon/ComingSoonPage'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { TerritorioPage } from '../features/territorio/TerritorioPage'
import { MainLayout } from '../layouts/MainLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'brujula', element: <BrujulaPage /> },
      { path: 'territorio', element: <TerritorioPage /> },
      {
        path: 'pausa',
        element: (
          <ComingSoonPage
            title="Un momento para ti"
            description="Ejercicios de respiración, sonidos de la naturaleza y pausas guiadas para reconectarte. Estamos construyendo este espacio."
            note="Un respiro también es avance"
            icon="feather"
            tone="amarillo"
          />
        ),
      },
      {
        path: 'mi-siguiente-paso',
        element: (
          <ComingSoonPage
            title="Mi siguiente paso"
            description="Aquí podrás guardar los servicios y actividades que te interesan y organizar tus opciones."
            note="Organiza tu propio camino"
            icon="steps"
            tone="coral"
          />
        ),
      },
      {
        path: 'informacion',
        element: (
          <ComingSoonPage
            title="Información"
            description="Qué es NEXO JOVEN 360, de dónde vienen los datos y cómo se verifican los servicios."
            note="Información clara y confiable"
            icon="info"
            tone="menta"
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
