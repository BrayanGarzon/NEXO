# Plan de pruebas

## Niveles

| Nivel | Herramienta | Ubicación | Responsable |
| ----- | ----------- | --------- | ----------- |
| Unitarias / componentes (frontend) | Vitest + Testing Library | `frontend/src/**/*.test.tsx` | Brayan Garzón |
| Unitarias / API (backend) | Pytest + TestClient | `backend/tests/` | Camilo Clavijo |
| Migraciones | Alembic (upgrade/downgrade en CI) | `.github/workflows/ci.yml` | Camilo Clavijo |
| Extremo a extremo | Pendiente (propuesta: Playwright) | Pendiente | Camila |
| Análisis estático | ESLint, Prettier, `tsc`, Ruff | CI | Todos |

## Pruebas existentes (Fase 00)

### Frontend
- La ruta `/` muestra la página base y el título.
- Una ruta desconocida muestra la página 404.
- `ApiStatus` muestra "API disponible" cuando `/health` responde 200.
- `ApiStatus` muestra "API no disponible" cuando `/health` falla.

### Backend
- `GET /health` responde 200 con el esquema esperado.
- `GET /health/db` responde 200 si la BD está disponible y 503 si no.
- `/openapi.json` y `/docs` están expuestos.
- CORS permite el origen configurado.
- La configuración se lee de variables de entorno.

## Verificación manual de la Fase 00

1. `cp .env.example .env && docker compose up -d --build`
2. `docker compose ps` → `db` en estado *healthy*.
3. `curl localhost:8000/health` → `"status":"ok"`.
4. `curl localhost:8000/health/db` → `"database":"up"`.
5. `docker compose exec backend alembic current` → `0001 (head)`.
6. Abrir http://localhost:5173 → página base con "API disponible".
7. Abrir http://localhost:5173/no-existe → página "Página no encontrada".

## Criterios

- Toda funcionalidad nueva incluye pruebas del nivel correspondiente.
- Un PR no se fusiona con CI en rojo.
- No se declara que una prueba pasa si no se ejecutó.
