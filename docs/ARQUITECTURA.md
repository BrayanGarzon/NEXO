# Arquitectura — NEXO JOVEN 360

## Visión general

```text
Navegador ──► Frontend (React + Vite, :5173)
                 │  fetch JSON (VITE_API_BASE_URL)
                 ▼
              Backend (FastAPI, :8000) ──► PostgreSQL (:5432)
                                 SQLAlchemy + Alembic
```

Monorepo con dos aplicaciones independientes (`frontend/`, `backend/`) que solo se
comunican por HTTP/JSON según los contratos de [`API_CONTRACTS.md`](API_CONTRACTS.md).

## Decisiones iniciales (Fase 00)

| #  | Decisión | Motivo |
| -- | -------- | ------ |
| 1  | Monorepo `frontend/` + `backend/` | Un solo repositorio, CI y documentación compartidos; equipo pequeño. |
| 2  | React Router en modo *data router* (`createBrowserRouter`) | Permite `errorElement` por ruta y cargar datos por ruta en el futuro. |
| 3  | Frontend organizado por *features* | Cada funcionalidad (directorio, actividades…) vive en `src/features/<nombre>`; lo reutilizable sube a `components/`. |
| 4  | Tokens de diseño como variables CSS en `styles/tokens.css` | Sin dependencias extra; un único lugar para aplicar la identidad visual aprobada. |
| 5  | Sin librería de estado global ni de *data fetching* | Innecesario en esta fase; se evaluará cuando existan pantallas reales. |
| 6  | Backend por capas: `routes` → `services` → `db/models`; `schemas` para E/S | Separa HTTP, lógica de negocio y persistencia. |
| 7  | Configuración con `pydantic-settings` (`app/core/config.py`) | Un único punto, validado y tipado, leído de variables de entorno / `.env`. |
| 8  | SQLAlchemy 2 síncrono + `psycopg` 3 | Más simple de mantener; suficiente para la carga prevista. |
| 9  | Alembic toma la URL de `DATABASE_URL` (no de `alembic.ini`) | Evita duplicar credenciales. |
| 10 | Migración base vacía `0001` | Verifica la cadena de migraciones sin crear modelos de negocio no aprobados. |
| 11 | `GET /health` (vida) y `GET /health/db` (conectividad BD) separados | El primero no falla si cae la BD; el segundo sirve para diagnóstico. |
| 12 | Rutas de negocio bajo `/api/v1` | Versionado explícito desde el inicio. |
| 13 | Ruff para lint y formato de Python | Una sola herramienta rápida. |
| 14 | PostgreSQL 17 (imagen `postgres:17-alpine`), Python 3.12, Node 22 | Versiones estables con soporte prolongado. |
| 15 | Docker Compose con *hot reload* (volúmenes montados) | Mismo entorno para los tres integrantes. |

## Convenciones de código

### Frontend
- Componentes en `PascalCase.tsx`, exportaciones con nombre (sin `export default`).
- Las llamadas HTTP solo se hacen desde `src/services/`; los componentes no usan `fetch` directamente.
- Los tipos de respuesta de la API viven en `src/types/api.ts` y reflejan `API_CONTRACTS.md`.
- Estilos con variables de `tokens.css`; nada de colores o tamaños sueltos.
- Pruebas junto al archivo: `Componente.test.tsx`.

### Backend
- Un archivo de rutas por recurso en `app/api/routes/`, registrado en `app/api/router.py`.
- Las rutas no contienen lógica de negocio: delegan en `app/services/`.
- Esquemas Pydantic separados del modelo ORM (`schemas/` vs `models/`).
- Cada modelo nuevo se importa en `app/models/__init__.py` y se acompaña de su migración.
- Pruebas en `backend/tests/test_<modulo>.py`.

## Decisiones pendientes

Deben aprobarse por los tres integrantes (abrir un issue con la plantilla *Decisión pendiente*):

1. **Contratos de API del producto**: recursos, campos y paginación (ver `API_CONTRACTS.md`).
2. **Modelo de datos** de servicios, recursos, actividades y entidades institucionales.
3. **Autenticación** del panel institucional (proveedor, sesiones vs. JWT, roles).
4. **Referencia gráfica**: incorporar al repositorio los archivos aprobados y los tokens definitivos (ver `DISENO_VISUAL.md`).
5. **Herramienta de pruebas E2E** (p. ej. Playwright) y su ubicación en el repositorio.
6. **Hosting y despliegue** (fuera del alcance de la Fase 00).
7. **Mapa 3D**: tecnología y fuente de datos geográficos.
8. **Usuarios de GitHub** de cada integrante para configurar `CODEOWNERS` y la protección de `main`.
