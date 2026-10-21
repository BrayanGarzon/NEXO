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

## Rutas públicas

| Ruta                 | Pantalla                                                       | Estado                    |
| -------------------- | -------------------------------------------------------------- | ------------------------- |
| `/`                  | Inicio                                                         | Alta fidelidad            |
| `/brujula`           | Brújula: orientación informativa en 3 pasos                    | Primera versión navegable |
| `/territorio`        | Nexo Territorio: búsqueda, filtros, mapa provisional y detalle | Layout y estados          |
| `/pausa`             | Espacio Pausa                                                  | Página "próximamente"     |
| `/mi-siguiente-paso` | Mi siguiente paso                                              | Página "próximamente"     |
| `/informacion`       | Información                                                    | Página "próximamente"     |
| `*`                  | 404                                                            | Lista                     |

`/territorio` acepta `?q=`, `?categoria=`, `?servicio=` y `?verificados=1`, que usan Inicio y Brújula
para abrir resultados concretos. En desarrollo, `?simular=error` muestra el estado de error.

## Organización

```text
src/
├── app/            # router, rutas y navegación principal
├── components/     # sistema visual compartido (Button, Card, Tag, Chip, SearchField, …)
├── content/        # contenido estático de interfaz (categorías)
├── features/       # home, brujula, territorio, coming-soon, not-found
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
