# Contratos de integración

Este documento es la fuente de verdad del acuerdo entre frontend y backend.
**Cualquier cambio requiere un PR aprobado por los responsables de frontend y backend.**

La especificación OpenAPI generada automáticamente está en `http://localhost:8000/docs`
(y en `/openapi.json`). Este documento recoge además lo que aún está en discusión.

## Convenciones generales (propuestas)

| Tema | Propuesta | Estado |
| ---- | --------- | ------ |
| Prefijo | Rutas de negocio bajo `/api/v1`; rutas técnicas (`/health`) en la raíz | Aprobado en Fase 00 |
| Formato | JSON, UTF-8, campos en `snake_case` | Pendiente |
| Fechas | ISO 8601 con zona horaria (`2026-10-20T15:00:00-05:00`) | Pendiente |
| Identificadores | UUID como texto | Pendiente |
| Paginación | `?page=1&page_size=20` → `{ "items": [], "total": 0, "page": 1, "page_size": 20 }` | Pendiente |
| Errores | `{ "detail": "mensaje" }` (formato estándar de FastAPI); validación devuelve 422 | Pendiente |
| Autenticación | Por definir | Pendiente |

## Endpoints implementados

### `GET /health`

Comprobación de vida. No consulta la base de datos.

```json
200 OK
{
  "status": "ok",
  "service": "NEXO JOVEN 360 API",
  "version": "0.1.0",
  "environment": "development"
}
```

Tipo en frontend: `HealthResponse` (`frontend/src/types/api.ts`).

### `GET /health/db`

Comprobación de conectividad con PostgreSQL.

```json
200 OK                                  503 Service Unavailable
{ "status": "ok", "database": "up" }    { "status": "error", "database": "down" }
```

## Recursos previstos (pendientes de aprobación)

Borradores para discutir; **no implementar hasta aprobarlos**.

| Recurso | Endpoints tentativos | Responsable de la propuesta |
| ------- | -------------------- | --------------------------- |
| Servicios de apoyo | `GET /api/v1/services`, `GET /api/v1/services/{id}` | Backend |
| Recursos de bienestar | `GET /api/v1/resources` | Backend |
| Actividades juveniles | `GET /api/v1/activities` | Backend |
| Canales institucionales | `GET /api/v1/channels` | Backend |
| Panel institucional | Por definir (requiere autenticación) | Integración |
