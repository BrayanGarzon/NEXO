# Arquitectura — NEXO JOVEN 360

> Revisado contra el código el 2026-10-21 (rama `feat/frontend-identidad-inicio`).

## Visión general

```text
Navegador ──► Frontend (React + Vite, :5173)
                 │  fetch JSON (VITE_API_BASE_URL) — hoy solo GET /health
                 ▼
              Backend (FastAPI, :8000) ──► PostgreSQL (:5432)
                                 SQLAlchemy + Alembic
```

Monorepo con dos aplicaciones independientes (`frontend/`, `backend/`) que solo se comunican por
HTTP/JSON según [`API_CONTRACTS.md`](API_CONTRACTS.md).

**Estado de la integración:** el único contrato implementado es `GET /health`. El catálogo de
servicios que muestra el frontend es **sintético** y no pasa por la API (ver "Frontend → Datos").

## Frontend (`frontend/`)

### Módulos

| Módulo | Ubicación | Responsabilidad |
| ------ | --------- | --------------- |
| Aplicación | `src/app/` | `App`, router (`createBrowserRouter`), `routes.tsx`, navegación por secciones (`navigation.ts`, `useSectionNavigation.ts`, `RedirectToSection.tsx`) |
| Sistema visual | `src/styles/`, `src/components/` | Tokens CSS y componentes compartidos: `Button`/`ButtonLink`, `Card`, `Tag`/`DemoTag`/`Chip`, `SearchField`, `ChoiceTile`, `StatusMessage`, `Icon`, `IconBadge`, `Annotation`, `Doodle`, `PhotoFrame`, `Logo`, ilustraciones |
| Layout público | `src/layouts/MainLayout.*` | Encabezado fijo, menú (con versión móvil), pie, enlace "Saltar al contenido" |
| Página única | `src/features/home/HomePage.tsx` | Compone todas las secciones públicas |
| Secciones | `src/features/{brujula,territorio,upcoming,informacion}/` | Una carpeta por sección; cada una exporta `…Section` con un `id` de ancla |
| Estados de ruta | `src/features/not-found/`, `src/components/RouteErrorBoundary.tsx` | 404 y error de ruta |
| Datos | `src/services/`, `src/mocks/`, `src/types/`, `src/content/` | Cliente HTTP, acceso al catálogo, datos sintéticos, tipos y contenido estático |

### Rutas

| Ruta | Elemento |
| ---- | -------- |
| `/` | `MainLayout` → `HomePage` (página única con anclas `#inicio`, `#brujula`, `#territorio`, `#pausa`, `#mi-siguiente-paso`, `#informacion`) |
| `/brujula`, `/territorio`, `/pausa`, `/mi-siguiente-paso`, `/informacion` | `RedirectToSection`: redirige a `/#<sección>` conservando `?…` |
| `/panel/*` | `panelRoutes` (`src/features/panel/`, Persona 3): panel institucional con layout propio, fuera de `MainLayout` |
| `*` | `NotFoundPage` |

El estado de Nexo Territorio vive en la URL (`?q=`, `?categoria=`, `?servicio=`, `?verificados=1`),
lo que permite enlazar desde Inicio y Brújula y compartir un resultado. El estado de Brújula es
local al componente y no se guarda ni se envía a ningún sitio.

### Datos

```text
Componentes ──► services/catalog.ts ──► mocks/demoServices.ts     (hoy)
                       └──────────────► services/apiClient.ts ──► API   (cuando se apruebe B2)
Componentes ──► services/health.ts ──► services/apiClient.ts ──► GET /health
```

- `services/apiClient.ts` es el único lugar que usa `fetch` (`apiGet`, `ApiError`).
- `services/catalog.ts` expone `listDemoServices`, `getFeaturedDemoServices` y
  `getAllDemoServicesSync`; simula 350 ms de latencia. Sustituir su implementación por llamadas a
  la API no debe cambiar los componentes.
- `types/api.ts` solo contiene tipos de contratos **implementados** (`HealthResponse`).
  `types/catalog.ts` contiene tipos **provisionales** (`DemoService`), que no son un contrato.

### Límites

- Los componentes no llaman a `fetch` ni importan `mocks/` directamente (salvo pruebas).
- Los valores visuales salen de `styles/tokens.css`; los componentes no definen colores sueltos.
- Lo reutilizable vive en `components/`; lo específico de una sección, en su carpeta de `features/`.
- Los paneles institucionales tendrán **su propio layout y rutas** (no forman parte de la página
  única pública). Ver [`PLAN_PERSONA_3.md`](PLAN_PERSONA_3.md).

## Backend (`backend/`)

| Módulo | Ubicación | Estado |
| ------ | --------- | ------ |
| Aplicación | `app/main.py` (`create_app`) | CORS configurable, router raíz |
| Rutas | `app/api/router.py`, `app/api/routes/health.py` | `GET /health`, `GET /health/db` |
| Configuración | `app/core/config.py` (`Settings`, `get_settings`) | Lee entorno y `.env` |
| Base de datos | `app/db/` (`base.py`, `session.py` → `get_db`) | Motor y sesión SQLAlchemy |
| Modelos | `app/models/` | Vacío (pendiente de B1–B3) |
| Esquemas | `app/schemas/health.py` | Respuestas de salud |
| Servicios | `app/services/health.py` | `is_database_available` |
| Migraciones | `migrations/versions/…0001_baseline.py` | Línea base vacía |
| Pruebas | `tests/` | 7 pruebas; la BD se sustituye por una sesión falsa |

Las rutas de negocio irán bajo `/api/v1` y los paneles institucionales bajo un prefijo protegido
(propuesta `/api/v1/admin`, ver [`API_CONTRACTS.md`](API_CONTRACTS.md)).

## Dependencias entre frontend y backend

| El frontend necesita | Del backend | Estado |
| -------------------- | ----------- | ------ |
| Comprobación de salud | `GET /health` | Implementado y usado (pie de página, solo en desarrollo) |
| Catálogo público de servicios | `GET /api/v1/services`, `GET /api/v1/services/{id}` | Propuesta pendiente de B2; frontend con mocks |
| Gestión de servicios (Fuente Viva) | `/api/v1/admin/services…` | Propuesta en `API_CONTRACTS.md` |
| Indicadores (Observatorio) | `/api/v1/admin/observatorio/…` | Propuesta en `API_CONTRACTS.md` |
| Autenticación de paneles | Por definir | Decisión pendiente 3 |

Ninguna parte depende hoy de que el backend esté encendido: el frontend funciona con datos de
demostración.

## Decisiones

### Fase 00

| # | Decisión | Motivo |
| -- | -------- | ------ |
| 1 | Monorepo `frontend/` + `backend/` | Un solo repositorio, CI y documentación compartidos; equipo pequeño. |
| 2 | React Router en modo *data router* (`createBrowserRouter`) | Permite `errorElement` por ruta y cargar datos por ruta en el futuro. |
| 3 | Frontend organizado por *features* | Cada funcionalidad vive en `src/features/<nombre>`; lo reutilizable sube a `components/`. |
| 4 | Tokens de diseño como variables CSS en `styles/tokens.css` | Sin dependencias extra; un único lugar para la identidad visual. |
| 5 | Sin librería de estado global ni de *data fetching* | Innecesario por ahora; se reevaluará con datos reales. |
| 6 | Backend por capas: `routes` → `services` → `db/models`; `schemas` para E/S | Separa HTTP, lógica de negocio y persistencia. |
| 7 | Configuración con `pydantic-settings` (`app/core/config.py`) | Un único punto, validado y tipado. |
| 8 | SQLAlchemy 2 síncrono + `psycopg` 3 | Más simple de mantener; suficiente para la carga prevista. |
| 9 | Alembic toma la URL de `DATABASE_URL` | Evita duplicar credenciales. |
| 10 | Migración base vacía `0001` | Verifica la cadena sin crear modelos no aprobados. |
| 11 | `GET /health` y `GET /health/db` separados | El primero no falla si cae la BD. |
| 12 | Rutas de negocio bajo `/api/v1` | Versionado explícito. |
| 13 | Ruff para lint y formato de Python | Una sola herramienta. |
| 14 | PostgreSQL 17, Python 3.12, Node 22 | Versiones estables con soporte prolongado. |
| 15 | Docker Compose con *hot reload* | Mismo entorno para los tres integrantes. |

### Fase 01 (frontend)

| # | Decisión | Motivo |
| -- | -------- | ------ |
| 16 | La web pública es una **página única** con secciones ancladas | Pedido del equipo: recorrer todo sin cambiar de pantalla. Las rutas antiguas redirigen. |
| 17 | Sección activa con `IntersectionObserver`; scroll al ancla tras cargar fuentes, respetando `prefers-reduced-motion` | Resaltado fiable sin dependencias; evita desfases por el cambio de fuente. |
| 18 | Fuentes alojadas en `public/fonts/` (OFL) | Sin peticiones a terceros en tiempo de ejecución. |
| 19 | Catálogo detrás de `services/catalog.ts` con datos sintéticos marcados en pantalla | Avanzar la interfaz sin inventar un contrato; cambio a API localizado en un archivo. |
| 20 | Estado de Territorio en la URL | Enlaces directos a un servicio o búsqueda. |
| 21 | Paneles institucionales fuera de la página única, con layout propio | Público distinto (personal institucional) y futura autenticación. |

## Convenciones de código

### Frontend
- Componentes en `PascalCase.tsx`, exportaciones con nombre (sin `export default`).
- CSS junto al componente (`Componente.css`) usando solo variables de `tokens.css`.
- Las llamadas HTTP solo se hacen desde `src/services/`.
- Tipos de API implementada en `src/types/api.ts`, reflejo de `API_CONTRACTS.md`.
- Pruebas junto al archivo: `Componente.test.tsx`.
- Un solo `h1` en la página única (el del hero); las secciones usan `h2`.

### Backend
- Un archivo de rutas por recurso en `app/api/routes/`, registrado en `app/api/router.py`.
- Las rutas no contienen lógica de negocio: delegan en `app/services/`.
- Esquemas Pydantic separados del modelo ORM (`schemas/` vs `models/`).
- Cada modelo nuevo se importa en `app/models/__init__.py` y se acompaña de su migración.
- Pruebas en `backend/tests/test_<modulo>.py`.

## Decisiones pendientes

Deben aprobarse por los tres integrantes (issue con la plantilla *Decisión pendiente*):

1. **Contratos de API del producto**: catálogo público y paneles (ver `API_CONTRACTS.md`).
2. **Modelo de datos** de servicios, fuentes, instituciones, actividades y eventos de revisión.
3. **Autenticación y roles** del panel institucional (proveedor, sesiones vs. JWT, roles).
   Propuesta en [`PANEL_INSTITUCIONAL.md`](PANEL_INSTITUCIONAL.md) (tarea I5).
4. **Fotografías con licencia** para reemplazar las ilustraciones provisionales
   (la referencia gráfica ya está en `docs/diseno/`).
5. **Herramienta de pruebas E2E** (propuesta: Playwright) y su ubicación.
6. **Hosting y despliegue**.
7. **Mapa 3D**: tecnología y fuente de datos geográficos.
8. **Usuarios de GitHub** para `CODEOWNERS` y la protección de `main`.
9. **Umbrales de calidad** del Observatorio (vigencia de una fuente, frecuencia de revisión).
