import type { RouteObject } from 'react-router'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { MainLayout } from '../layouts/MainLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
