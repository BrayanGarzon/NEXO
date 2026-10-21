# NEXO JOVEN 360

Plataforma web para jóvenes de Villavicencio que facilita el acceso a información confiable sobre
servicios de apoyo, recursos educativos de bienestar, actividades juveniles y canales
institucionales. Su objetivo es que una persona joven encuentre, en un solo lugar y con lenguaje
cercano, a dónde acudir y cuál puede ser su siguiente paso.

> **Estado (2026-10-21):** frontend público en primera versión navegable con **datos de
> demostración**; backend con endpoints técnicos de salud; base de datos sin modelos de negocio.
> Detalle completo en [`docs/ESTADO_PROYECTO.md`](docs/ESTADO_PROYECTO.md).

## Funcionalidades

### Disponibles (frontend público, página única en `/`)

| Sección | Qué hace | Datos |
| ------- | -------- | ----- |
| Inicio | Hero editorial, buscador, cuatro accesos y servicios destacados | Demostración |
| Brújula | Orientación **informativa** en 3 pasos (qué buscas → cómo empezar → tu ruta) | Demostración |
| Nexo Territorio | Búsqueda, filtros por categoría y verificación, mapa provisional y detalle | Demostración |
| Espacio Pausa / Mi siguiente paso | Tarjetas "próximamente" | — |
| Información | Qué es NEXO JOVEN 360, principios y línea de emergencias 123 | Estático |

El menú desplaza la vista a cada sección y resalta la visible. Las rutas antiguas (`/brujula`,
`/territorio?servicio=…`) redirigen a su sección. Brújula no diagnostica, no evalúa y no predice
riesgos.

### Provisionales

- **Catálogo de servicios:** sintético (`frontend/src/mocks/demoServices.ts`), marcado en pantalla
  como "Datos de demostración". No hay contrato de API aprobado para servicios.
- **Mapa:** esquema ilustrado, no cartografía. El mapa 3D y su proveedor están por decidir.
- **Fotografía:** ilustraciones propias hasta contar con fotos con licencia.

### Pendientes

- API de negocio (`/api/v1/…`), modelo de datos y migraciones (backend).
- Paneles institucionales **Fuente Viva** y **Observatorio** (ver
  [`docs/PLAN_PERSONA_3.md`](docs/PLAN_PERSONA_3.md)) y su autenticación.
- Espacio Pausa y Mi siguiente paso.
- Pruebas de extremo a extremo.

## Tecnologías

| Capa | Tecnologías (versiones declaradas en el repositorio) |
| ---- | ---------------------------------------------------- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 8, Vitest 5 + Testing Library, ESLint 10, Prettier 3 |
| Backend | Python 3.12, FastAPI, Pydantic 2 + pydantic-settings, SQLAlchemy 2.1, Alembic, psycopg 3, Pytest, Ruff |
| Base de datos | PostgreSQL 17 (`postgres:17-alpine`) |
| Infraestructura | Docker Compose (desarrollo local), GitHub Actions (CI) |

El frontend no usa librerías de estado global, de *data fetching* ni de componentes: el sistema
visual es propio (`frontend/src/components/`, `frontend/src/styles/tokens.css`).

## Requisitos previos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Docker Compose v2
  (para levantar todo junto)
- Sin Docker (opcional): Node.js **22.12 o superior** con npm, y Python **3.12 o superior**

## Instalación y ejecución

### Opción A — Todo con Docker

```bash
git clone https://github.com/BrayanGarzon/NEXO.git
cd NEXO
cp .env.example .env
docker compose up -d --build
```

| Servicio | URL |
| -------- | --- |
| Frontend | http://localhost:5173 |
| API — salud | http://localhost:8000/health |
| API — salud de BD | http://localhost:8000/health/db |
| API — documentación | http://localhost:8000/docs |
| PostgreSQL | `localhost:5432` (o el valor de `POSTGRES_PORT`) |

El backend aplica las migraciones (`alembic upgrade head`) al arrancar. `frontend/` y `backend/` se
montan como volúmenes, así que los cambios se recargan en caliente.

```bash
docker compose ps                                         # estado
docker compose logs -f backend                            # registros (backend, frontend o db)
docker compose exec backend alembic current               # migración aplicada
docker compose exec db psql -U nexo -d nexo_joven_360     # consola SQL
docker compose down                                       # detener (conserva datos)
docker compose down -v                                    # detener y BORRAR la base de datos
```

### Opción B — Solo el frontend (suficiente para ver la web pública)

El frontend funciona sin backend: usa datos de demostración. En el pie de página, en desarrollo,
aparecerá "API no disponible".

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Opción C — Backend sin Docker

```bash
docker compose up -d db            # PostgreSQL en Docker
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload      # http://localhost:8000
```

El backend lee el `.env` de la raíz del proyecto.

## Variables de entorno

Todas están en [`.env.example`](.env.example). Crea tu copia local con `cp .env.example .env`.
**Nunca subas `.env`**: está excluido en `.gitignore`.

| Variable | Uso | Valor por defecto |
| -------- | --- | ----------------- |
| `POSTGRES_DB` | Nombre de la base de datos | `nexo_joven_360` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `nexo` |
| `POSTGRES_PASSWORD` | Contraseña (solo desarrollo local) | `nexo_local_dev` |
| `POSTGRES_PORT` | Puerto expuesto en tu máquina | `5432` |
| `APP_ENV` | Entorno de la API (`development`, `test`, `production`) | `development` |
| `APP_DEBUG` | Modo depuración de FastAPI | `true` |
| `DATABASE_URL` | Conexión SQLAlchemy (en Docker se sobrescribe con el host `db`) | `postgresql+psycopg://…@localhost:5432/…` |
| `CORS_ORIGINS` | Lista JSON de orígenes permitidos | `["http://localhost:5173"]` |
| `BACKEND_PORT` | Puerto expuesto de la API | `8000` |
| `VITE_API_BASE_URL` | URL de la API que usa el frontend | `http://localhost:8000` |
| `FRONTEND_PORT` | Puerto expuesto del frontend | `5173` |

> Si el puerto 5432 ya está ocupado (otro PostgreSQL), cambia `POSTGRES_PORT` (p. ej. `5433`) y el
> puerto dentro de `DATABASE_URL` en tu `.env`.

## Calidad: lint, tipos, pruebas y build

Son los mismos comandos que ejecuta GitHub Actions en cada pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

```bash
# Frontend
cd frontend
npm run format:check   # Prettier
npm run lint           # ESLint
npm run typecheck      # TypeScript (tsc -b)
npm test               # Vitest
npm run build          # build de producción en frontend/dist/

# Backend
cd backend
ruff check .           # lint
ruff format --check .  # formato
pytest                 # pruebas
alembic upgrade head && alembic downgrade base && alembic upgrade head   # requiere PostgreSQL
```

Dentro de Docker: `docker compose exec backend pytest`. Más detalle en
[`docs/PLAN_PRUEBAS.md`](docs/PLAN_PRUEBAS.md).

## Estructura de carpetas

```text
.
├── frontend/                     # React + Vite — Persona 1 (Brayan Garzón)
│   ├── public/fonts/             # Manrope, Inter y Caveat (OFL, alojadas localmente)
│   └── src/
│       ├── app/                  # router, rutas, navegación por secciones
│       ├── components/           # sistema visual compartido (Button, Card, Tag, Icon, …)
│       ├── content/              # contenido estático de interfaz (categorías)
│       ├── features/             # home (página única), brujula, territorio, upcoming,
│       │                         # informacion, not-found
│       ├── layouts/              # MainLayout: encabezado, menú y pie
│       ├── mocks/                # datos de demostración (sintéticos)
│       ├── services/             # cliente HTTP y acceso a datos
│       ├── styles/               # tokens.css y global.css
│       ├── test/                 # configuración y utilidades de pruebas
│       └── types/                # api.ts (contratos aprobados) y catalog.ts (provisional)
├── backend/                      # FastAPI — Persona 2 (Camilo Clavijo)
│   ├── app/
│   │   ├── api/routes/           # endpoints HTTP (hoy: health)
│   │   ├── core/                 # configuración
│   │   ├── db/                   # motor, sesión y base declarativa
│   │   ├── models/               # modelos ORM (vacío: pendiente de contrato)
│   │   ├── schemas/              # esquemas Pydantic
│   │   ├── services/             # lógica de negocio
│   │   └── main.py
│   ├── migrations/               # Alembic (0001: línea base vacía)
│   └── tests/
├── docs/                         # estado, arquitectura, contratos, diseño, Git, pruebas, tareas
│   └── diseno/                   # moodboard aprobado y registro de recursos
├── .github/                      # CI, plantillas de PR e issues
├── compose.yaml
├── .env.example
├── CONTRIBUTING.md
└── PLANNER.md                    # planificación de la Fase 00
```

## Estado por componente

| Componente | Estado |
| ---------- | ------ |
| Frontend público | Funcional con datos de demostración; ver [`frontend/README.md`](frontend/README.md) |
| Paneles institucionales | No implementados; alcance en [`docs/PLAN_PERSONA_3.md`](docs/PLAN_PERSONA_3.md) |
| Backend | `GET /health` y `GET /health/db`; sin endpoints de negocio |
| Base de datos | PostgreSQL configurado; migración base `0001` sin tablas de negocio |
| Autenticación | Sin definir |
| CI | Configurada (jobs `Frontend` y `Backend`) |

## Colaboración

| Persona | Integrante | Área |
| ------- | ---------- | ---- |
| 1 | Brayan Garzón | Frontend público y sistema visual |
| 2 | Camilo Clavijo | Backend, modelo de datos y contratos de API |
| 3 | Elizabeth | Integración, pruebas E2E y paneles institucionales |

Resumen del flujo (detalle en [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)):

1. `main` solo recibe cambios integrados y verificados, **nunca commits directos**.
2. Cada tarea va en su propia rama creada desde `main` (`feat/…`, `fix/…`, `docs/…`).
3. Los cambios entran por pull request con CI en verde y al menos una aprobación.
4. Los archivos tienen un responsable ([`docs/TAREAS.md`](docs/TAREAS.md)); los cambios en archivos
   ajenos se coordinan con su responsable.

## Documentación

| Documento | Contenido |
| --------- | --------- |
| [`docs/ESTADO_PROYECTO.md`](docs/ESTADO_PROYECTO.md) | Qué está hecho, verificado, provisional y pendiente |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Módulos, límites y decisiones |
| [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) | Contratos implementados y propuestas |
| [`docs/DISENO_VISUAL.md`](docs/DISENO_VISUAL.md) | Identidad visual aprobada y tokens |
| [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) | Ramas, commits y pull requests |
| [`docs/PLAN_PRUEBAS.md`](docs/PLAN_PRUEBAS.md) | Niveles de prueba y verificación |
| [`docs/TAREAS.md`](docs/TAREAS.md) | Tareas y propiedad de archivos |
| [`docs/PLAN_PERSONA_3.md`](docs/PLAN_PERSONA_3.md) | Plan de Fuente Viva y Observatorio |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Reglas de contribución |
