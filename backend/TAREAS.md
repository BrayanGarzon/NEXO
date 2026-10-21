# Tareas del Backend — Persona 2 (Camilo Clavijo)

Estado de las tareas B1–B6 definidas en [`../docs/TAREAS.md`](../docs/TAREAS.md).
Rama de trabajo: `feat/backend-foundation`.

| ID | Tarea | Estado | Entregable principal |
| -- | ----- | ------ | -------------------- |
| B1 | Modelo de datos | ✅ Hecho (pendiente aprobación de los tres) | [`../docs/MODELO_DATOS.md`](../docs/MODELO_DATOS.md) |
| B2 | Contrato de API v1 | ✅ Redactado (pendiente aprobación de los tres) | [`../docs/API_CONTRACTS.md`](../docs/API_CONTRACTS.md) |
| B3 | Modelos ORM, esquemas y migración | ✅ Hecho | `app/models/`, `app/schemas/`, `migrations/` |
| B4 | Endpoints `/api/v1` solo lectura con pruebas | ✅ Hecho | `app/api/routes/`, `app/services/`, `tests/` |
| B5 | Datos semilla | ✅ Hecho (usa ejemplo hasta que llegue I3) | `app/db/seed.py`, `app/db/seed_data.py` |
| B6 | Manejo de errores uniforme | ✅ Hecho | `app/core/errors.py` |

## Detalle

### B1 — Modelo de datos
Entidades: `entities`, `services`, `resources`, `activities`, `channels`. UUID como texto,
auditoría (`created_at`/`updated_at`), vocabularios controlados y relaciones por `entity_id`.
Incluye el formato esperado de `docs/contenido/` (I3).

### B2 — Contrato de API v1
Convenciones (JSON `snake_case`, fechas ISO 8601, UUID texto), envoltorio de paginación
`{items, total, page, page_size}`, formato de error `{detail}` y las firmas de los 9 endpoints.

### B3 — ORM + migraciones
SQLAlchemy 2 (`Mapped`/`mapped_column`), esquemas Pydantic v2 separados del ORM, y una migración
Alembic (`modelos de negocio v1`) verificada con el ciclo upgrade → downgrade → upgrade.

### B4 — Endpoints de negocio
`GET /api/v1/{entities,services,resources,activities,channels}` (+ detalle `/{id}` donde aplica),
con paginación, filtros por recurso, búsqueda `q` y 404 `{detail}` en los detalles.

### B5 — Datos semilla
`python -m app.db.seed` (idempotente). Prefiere `docs/contenido/*.json` (I3) y si no existe usa
`app/db/seed_data.py` (ejemplo provisional de Villavicencio).

### B6 — Errores
Manejo uniforme: `NotFoundError` → 404, validación → 422, no controlado → 500, todos con
`{"detail": ...}`.

## Verificación

```bash
cd backend
ruff check . && ruff format --check .
pytest                                   # 48 pruebas (SQLite en memoria)
alembic upgrade head && alembic downgrade base && alembic upgrade head
```

## Pendientes / dependencias

- **I3 (Elizabeth):** datos reales en `docs/contenido/`. El seed los tomará automáticamente.
- **Aprobación de B2:** el contrato debe aprobarlo frontend + backend + integración antes de
  congelarse; hasta entonces el frontend usa *mocks*.
- **Integración (I6):** pruebas e2e del flujo de servicios cuando frontend y backend estén
  conectados (depende de F6 y B4).
