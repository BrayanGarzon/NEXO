# Backend — NEXO JOVEN 360

API FastAPI (solo lectura en v1). La puesta en marcha con Docker está en el
[README principal](../README.md); aquí se documenta el trabajo diario del backend.

## Estructura

```text
app/
  api/routes/   un archivo por recurso (entities, services, resources, activities, channels, health)
  schemas/      esquemas Pydantic de E/S + enums de vocabulario; common.py = Page y paginación
  models/       modelos ORM (heredan de UUIDAuditBase); se registran en models/__init__.py
  services/     lógica de consulta/filtrado; common.py = paginate()
  core/         config (pydantic-settings) y errors.py (manejo uniforme de errores)
  db/           base, session, seed.py y seed_data.py (datos de ejemplo provisionales)
migrations/     Alembic (toma la URL de DATABASE_URL)
tests/          pytest; SQLite en memoria vía fixtures api_client / db_session
```

Contratos y modelo: [`../docs/API_CONTRACTS.md`](../docs/API_CONTRACTS.md) y
[`../docs/MODELO_DATOS.md`](../docs/MODELO_DATOS.md).

## Desarrollo local sin Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Base de datos: PostgreSQL (vía ../compose.yaml) o SQLite para pruebas rápidas.
export DATABASE_URL="postgresql+psycopg://nexo:nexo_local_dev@localhost:5432/nexo_joven_360"

alembic upgrade head          # aplica las migraciones
python -m app.db.seed         # carga datos (docs/contenido/ si existe; si no, ejemplo)
python -m app.db.seed --reset # recarga desde cero

uvicorn app.main:app --reload # API en http://localhost:8000  (docs en /docs)
```

## Calidad

```bash
ruff check .          # lint
ruff format --check . # formato
pytest                # pruebas (no requieren PostgreSQL; usan SQLite)

# Ciclo de migraciones (lo mismo que ejecuta CI)
alembic upgrade head && alembic downgrade base && alembic upgrade head
```

## Datos semilla

`python -m app.db.seed` prefiere los archivos reales de `docs/contenido/*.json` (tarea I3). El
formato esperado está en [`../docs/MODELO_DATOS.md`](../docs/MODELO_DATOS.md#formato-de-docscontenido-para-i3--b5).
Mientras I3 no exista, se usa `app/db/seed_data.py` (ejemplo provisional). La carga es
idempotente: repetirla no duplica filas.
