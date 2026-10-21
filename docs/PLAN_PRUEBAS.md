# Plan de pruebas

## Niveles

| Nivel | Herramienta | Ubicación | Responsable |
| ----- | ----------- | --------- | ----------- |
| Unitarias / componentes (frontend) | Vitest + Testing Library (jsdom) | `frontend/src/**/*.test.ts(x)` | Brayan Garzón |
| Unitarias / API (backend) | Pytest + TestClient | `backend/tests/` | Camilo Clavijo |
| Migraciones | Alembic (upgrade/downgrade en CI) | `.github/workflows/ci.yml` | Camilo Clavijo |
| Extremo a extremo | Pendiente (propuesta: Playwright, tarea I4) | Pendiente (`e2e/`) | Elizabeth |
| Análisis estático | ESLint, Prettier, `tsc`, Ruff | CI | Todos |

## Pruebas existentes

### Frontend — 40 pruebas en 11 archivos

| Archivo | Qué cubre |
| ------- | --------- |
| `app/routes.test.tsx` | La página única renderiza todas las secciones y un solo `h1`; las rutas antiguas redirigen a su sección conservando parámetros; 404 |
| `app/useSectionNavigation.test.tsx` | Sección activa: franja de lectura, preferencia por el enlace pulsado cuando dos secciones comparten fila, huecos entre secciones, observación tras redirigir |
| `layouts/MainLayout.test.tsx` | El menú lleva a la sección y desplaza la vista; menú móvil abre y cierra; Inicio activo al cargar; enlace "Saltar al contenido" |
| `features/home/HomePage.test.tsx` | Accesos a secciones; servicios destacados marcados como demostración; el buscador filtra Territorio sin salir de la página |
| `features/home/ApiStatus.test.tsx` | Estado de la API con `/health` correcto y con error |
| `features/brujula/BrujulaSection.test.tsx` | Flujo completo de 3 pasos, regresar, empezar de nuevo, enlace "Ver en el mapa"; ayuda inmediata (123) ante "momento difícil" |
| `features/brujula/buildRoute.test.ts` | Filtro por necesidad, prioridad por modalidad, máximo 3 resultados, ayuda inmediata |
| `features/territorio/TerritorioSection.test.tsx` | Carga, filtros, detalle por selección y por URL, estado vacío, error y reintento |
| `features/territorio/filterServices.test.ts` | Búsqueda sin tildes, combinación de filtros, sin resultados |
| `components/Button.test.tsx`, `components/Tag.test.tsx` | Tipo y variante del botón, enlace accesible, `DemoTag`, `aria-pressed` del chip |

### Backend — 7 pruebas

- `GET /health` responde 200 con el esquema esperado.
- `GET /health/db` responde 200 si la BD está disponible y 503 si no (con una sesión falsa: **no
  requiere PostgreSQL**).
- `/openapi.json` y `/docs` están expuestos.
- CORS permite el origen configurado.
- La configuración se lee de variables de entorno.

## Verificación en navegador real (2026-10-21)

Además de las pruebas automatizadas, se verificó la página única en Chrome (headless, controlado
por el protocolo DevTools con tiempo real y viewports emulados). Resultado: **21/21
comprobaciones**:

- Al cargar, el menú marca "Inicio".
- Cada entrada del menú desplaza la sección justo debajo del encabezado y la resalta (incluido
  "Mi siguiente paso", que comparte fila con "Espacio Pausa").
- El scroll manual resalta la sección visible.
- El buscador del Inicio filtra Territorio y desplaza a la sección.
- "Ver en el mapa" (Brújula) abre el detalle en Territorio.
- Rutas antiguas `/brujula`, `/territorio?servicio=…`, `/pausa` e `/informacion` → sección
  correcta y menú resaltado.
- Ruta inexistente → 404.
- Con `prefers-reduced-motion`, el salto es inmediato.
- Sin scroll horizontal a 320, 390 y 768 px; en móvil el menú abre, navega y se cierra.
- Sin errores de JavaScript en consola.

Esta verificación **no está automatizada en CI**; la tarea I4 (Playwright) debería convertirla en
pruebas E2E.

## Verificación manual del entorno completo

1. `cp .env.example .env && docker compose up -d --build`
2. `docker compose ps` → `db` en estado *healthy*.
3. `curl localhost:8000/health` → `"status":"ok"`.
4. `curl localhost:8000/health/db` → `"database":"up"`.
5. `docker compose exec backend alembic current` → `0001 (head)`.
6. Abrir http://localhost:5173 → página única; en el pie, "API disponible".
7. Abrir http://localhost:5173/no-existe → "Página no encontrada".

## Criterios

- Toda funcionalidad nueva incluye pruebas del nivel correspondiente.
- Un PR no se fusiona con CI en rojo.
- No se declara que una prueba pasa si no se ejecutó.
- Las pruebas usan datos sintéticos; nunca datos reales de personas.
