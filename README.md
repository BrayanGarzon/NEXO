# NEXO JOVEN 360

Plataforma web para jóvenes de Villavicencio que facilita el acceso a información
confiable sobre servicios de apoyo, recursos educativos de bienestar, actividades
juveniles y canales institucionales.

> **Estado:** Fase 00 — fundación del repositorio. Solo existe la infraestructura base;
> el producto todavía no está implementado. Ver [`PLANNER.md`](PLANNER.md).

## Tecnologías

| Capa           | Tecnologías                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, React Router, ESLint, Prettier, Vitest            |
| Backend        | Python 3.12, FastAPI, Pydantic, SQLAlchemy 2, Alembic, Pytest, Ruff           |
| Base de datos  | PostgreSQL 17                                                                 |
| Infraestructura| Docker Compose (desarrollo local), GitHub Actions (CI)                        |

## Requisitos previos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose v2)
- Para ejecutar sin Docker (opcional):
  - Node.js **22.12 o superior** y npm
  - Python **3.12 o superior**

## Inicio rápido (Docker)

```bash
git clone <URL-DEL-REPOSITORIO> nexo-joven-360
cd nexo-joven-360
cp .env.example .env
docker compose up -d --build
```

| Servicio            | URL                              |
| ------------------- | -------------------------------- |
| Frontend            | http://localhost:5173            |
| API — salud         | http://localhost:8000/health     |
| API — salud de BD   | http://localhost:8000/health/db  |
| API — documentación | http://localhost:8000/docs       |
| PostgreSQL          | `localhost:5432`                 |

El backend aplica las migraciones (`alembic upgrade head`) automáticamente al arrancar.
El código de `frontend/` y `backend/` se monta como volumen, así que los cambios se
recargan en caliente.

### Comandos útiles de Docker

```bash
docker compose ps                    # estado de los servicios
docker compose logs -f backend       # registros (backend, frontend o db)
docker compose exec backend alembic current       # versión de migración aplicada
docker compose exec db psql -U nexo -d nexo_joven_360   # consola SQL
docker compose down                  # detener (conserva los datos)
docker compose down -v               # detener y BORRAR el volumen de la base de datos
```

## Variables de entorno

Todas están documentadas en [`.env.example`](.env.example). Para crear tu archivo local:

```bash
cp .env.example .env
```

| Variable             | Uso                                                              | Valor por defecto |
| -------------------- | ---------------------------------------------------------------- | ----------------- |
| `POSTGRES_DB`        | Nombre de la base de datos                                       | `nexo_joven_360`  |
| `POSTGRES_USER`      | Usuario de PostgreSQL                                            | `nexo`            |
| `POSTGRES_PASSWORD`  | Contraseña de PostgreSQL (solo desarrollo local)                 | `nexo_local_dev`  |
| `POSTGRES_PORT`      | Puerto expuesto en tu máquina                                    | `5432`            |
| `APP_ENV`            | Entorno de la API (`development`, `test`, `production`)          | `development`     |
| `APP_DEBUG`          | Modo depuración de FastAPI                                       | `true`            |
| `DATABASE_URL`       | Conexión SQLAlchemy (en Docker se sobrescribe con el host `db`)  | `postgresql+psycopg://…@localhost:5432/…` |
| `CORS_ORIGINS`       | Lista JSON de orígenes permitidos                                | `["http://localhost:5173"]` |
| `BACKEND_PORT`       | Puerto expuesto de la API                                        | `8000`            |
| `VITE_API_BASE_URL`  | URL de la API que usa el frontend                                | `http://localhost:8000` |
| `FRONTEND_PORT`      | Puerto expuesto del frontend                                     | `5173`            |

**Nunca subas `.env` al repositorio.** Está excluido en `.gitignore`.

> Si el puerto 5432 ya está ocupado en tu máquina (por otro PostgreSQL), cambia
> `POSTGRES_PORT` (p. ej. `5433`) y el puerto dentro de `DATABASE_URL` en tu `.env`.

## Ejecución sin Docker (opcional)

Útil para depurar desde el editor. PostgreSQL puede seguir corriendo en Docker:

```bash
docker compose up -d db
```

### Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload      # http://localhost:8000
```

El backend lee el `.env` de la raíz del proyecto.

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

## Pruebas y calidad

```bash
# Frontend
cd frontend
npm run lint          # ESLint
npm run format:check  # Prettier
npm run typecheck     # TypeScript
npm test              # Vitest

# Backend
cd backend
ruff check .          # lint
ruff format --check . # formato
pytest                # pruebas
```

Dentro de Docker: `docker compose exec backend pytest`.

GitHub Actions ejecuta todas estas comprobaciones en cada pull request
(ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Migraciones

```bash
cd backend
alembic upgrade head                              # aplicar
alembic revision --autogenerate -m "descripcion"  # crear a partir de los modelos
alembic downgrade -1                              # revertir la última
```

Los modelos nuevos deben importarse en `backend/app/models/__init__.py` para que la
autogeneración los detecte. Ver [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Estructura de carpetas

```text
.
├── frontend/                 # React + Vite (Brayan Garzón)
│   └── src/
│       ├── app/              # App, router y definición de rutas
│       ├── components/       # componentes compartidos
│       ├── layouts/          # estructuras de página
│       ├── features/         # funcionalidades por dominio (home, not-found, …)
│       ├── services/         # cliente HTTP y llamadas a la API
│       ├── types/            # tipos compartidos (espejo de los contratos)
│       ├── styles/           # tokens de diseño y estilos globales
│       └── test/             # configuración de pruebas
├── backend/                  # FastAPI (Camilo Clavijo)
│   ├── app/
│   │   ├── api/routes/       # endpoints HTTP
│   │   ├── core/             # configuración
│   │   ├── db/               # motor, sesión y base declarativa
│   │   ├── models/           # modelos ORM
│   │   ├── schemas/          # esquemas Pydantic (entrada/salida)
│   │   ├── services/         # lógica de negocio
│   │   └── main.py
│   ├── migrations/           # Alembic
│   └── tests/
├── docs/                     # arquitectura, contratos, diseño, Git, pruebas
├── .github/                  # CI, plantillas de PR e issues
├── compose.yaml
├── .env.example
├── CONTRIBUTING.md
└── PLANNER.md
```

## Colaboración

El trabajo se organiza en tres áreas (frontend, backend, integración) con ramas y pull
requests. **No se desarrolla directamente sobre `main`.**

- Flujo de ramas y commits: [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)
- Reglas de contribución y responsabilidades: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Contratos de integración: [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md)
- Guía visual: [`docs/DISENO_VISUAL.md`](docs/DISENO_VISUAL.md)
- Plan de pruebas: [`docs/PLAN_PRUEBAS.md`](docs/PLAN_PRUEBAS.md)
- Tareas asignadas por integrante: [`docs/TAREAS.md`](docs/TAREAS.md)

## Pendientes de la Fase 00

Las decisiones que deben aprobar los tres integrantes están en
[`docs/ARQUITECTURA.md#decisiones-pendientes`](docs/ARQUITECTURA.md#decisiones-pendientes).
