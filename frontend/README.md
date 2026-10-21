# Frontend — NEXO JOVEN 360

Responsable: Brayan Garzón (Persona 1). Guía visual: [`docs/DISENO_VISUAL.md`](../docs/DISENO_VISUAL.md).

## Comandos

```bash
npm install
npm run dev           # http://localhost:5173
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

## Página única

La web pública es **una sola página** (`/`): el menú no cambia de pantalla, sino que desplaza la
vista a cada sección y resalta la que está visible.

| Ancla                | Sección                                                        | Estado                    |
| -------------------- | -------------------------------------------------------------- | ------------------------- |
| `#inicio`            | Hero, accesos principales y servicios destacados               | Alta fidelidad            |
| `#brujula`           | Brújula: orientación informativa en 3 pasos                    | Primera versión navegable |
| `#territorio`        | Nexo Territorio: búsqueda, filtros, mapa provisional y detalle | Layout y estados          |
| `#pausa`             | Espacio Pausa                                                  | Próximamente              |
| `#mi-siguiente-paso` | Mi siguiente paso                                              | Próximamente              |
| `#informacion`       | Qué es NEXO JOVEN 360                                          | Lista                     |

- Las rutas antiguas (`/brujula`, `/territorio`, …) redirigen a su sección y conservan los parámetros.
- Nexo Territorio lee `?q=`, `?categoria=`, `?servicio=` y `?verificados=1` en `/`
  (p. ej. `/?servicio=demo-liga-futbol#territorio`). En desarrollo, `?simular=error` muestra el
  estado de error.
- Cualquier otra ruta muestra la página 404.
- Navegación: `app/navigation.ts` (secciones) y `app/useSectionNavigation.ts` (scroll al ancla
  respetando `prefers-reduced-motion` y sección activa con `IntersectionObserver`).

## Organización

```text
src/
├── app/            # router, rutas y navegación principal
├── components/     # sistema visual compartido (Button, Card, Tag, Chip, SearchField, …)
├── content/        # contenido estático de interfaz (categorías)
├── features/       # home (página única), brujula, territorio, upcoming, informacion, not-found
├── layouts/        # MainLayout: encabezado, menú móvil y pie
├── mocks/          # DATOS DE DEMOSTRACIÓN (sintéticos)
├── services/       # cliente HTTP y acceso a datos (catalog.ts aún usa mocks)
├── styles/         # tokens.css (único origen de valores visuales) y global.css
├── test/           # configuración y utilidades de pruebas
└── types/          # api.ts (contratos aprobados) y catalog.ts (tipos provisionales)
```

## Datos de demostración

Mientras el contrato `/api/v1/services` no esté aprobado (tarea B2), `services/catalog.ts` devuelve
los datos sintéticos de `mocks/demoServices.ts`. La interfaz los marca con la etiqueta
"Datos de demostración". Para conectar la API real (tarea F6) solo hay que cambiar la
implementación de `services/catalog.ts` y mover los tipos aprobados a `types/api.ts`.

Brújula ofrece orientación **informativa**: no hace diagnósticos, evaluaciones clínicas ni
predicción de riesgos.
