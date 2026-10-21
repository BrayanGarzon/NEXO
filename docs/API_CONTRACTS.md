# Contratos de integración

Este documento es la fuente de verdad del acuerdo entre frontend y backend.
**Cualquier cambio requiere un PR aprobado por los responsables de frontend y backend.**

La especificación OpenAPI generada automáticamente está en `http://localhost:8000/docs`
(y en `/openapi.json`). Este documento recoge además lo que aún está en discusión.

> **Tarea B2 (v1).** Contrato redactado por Backend (Camilo) sobre el modelo de datos
> ([`MODELO_DATOS.md`](MODELO_DATOS.md)). **Pendiente de aprobación de los tres.** Hasta que se
> apruebe, el frontend trabaja con *mocks* que respeten este contrato (F5) y el backend no
> cambia las firmas publicadas.

## Convenciones generales

| Tema | Acuerdo v1 | Estado |
| ---- | ---------- | ------ |
| Prefijo | Rutas de negocio bajo `/api/v1`; rutas técnicas (`/health`) en la raíz | Aprobado en Fase 00 |
| Formato | JSON, UTF-8, campos en `snake_case` | Propuesto v1 |
| Fechas | ISO 8601 con zona horaria (`2026-10-20T15:00:00-05:00`) | Propuesto v1 |
| Identificadores | UUID como texto | Propuesto v1 |
| Paginación | `?page=1&page_size=20` → envoltorio `{ items, total, page, page_size }` | Propuesto v1 |
| Orden | `page` ≥ 1 (def. 1); `page_size` entre 1 y 100 (def. 20) | Propuesto v1 |
| Búsqueda | `?q=texto` (coincidencia parcial, sin distinción de mayúsculas) donde se indique | Propuesto v1 |
| Errores | `{ "detail": "mensaje" }`; validación 422; no encontrado 404; error interno 500 | Propuesto v1 |
| Autenticación | No requerida para `/api/v1` (solo lectura). Panel institucional: por definir | Propuesto v1 |

### Envoltorio de paginación

Toda ruta de listado responde:

```json
{
  "items": [ /* objetos del recurso */ ],
  "total": 128,
  "page": 1,
  "page_size": 20
}
```

### Formato de error

```json
404 Not Found            422 Unprocessable Entity (validación)
{ "detail": "Servicio   { "detail": [ { "loc": [...], "msg": "...", "type": "..." } ] }
  no encontrado" }
```

## Endpoints técnicos

### `GET /health`

Comprobación de vida. No consulta la base de datos.

```json
200 OK
{ "status": "ok", "service": "NEXO JOVEN 360 API", "version": "0.1.0", "environment": "development" }
```

### `GET /health/db`

Comprobación de conectividad con PostgreSQL.

```json
200 OK                                  503 Service Unavailable
{ "status": "ok", "database": "up" }    { "status": "error", "database": "down" }
```

## Endpoints de negocio `/api/v1`

Todos son **solo lectura** (GET) en v1. Los campos de cada objeto corresponden a
[`MODELO_DATOS.md`](MODELO_DATOS.md). Todos los objetos incluyen `id`, `created_at`, `updated_at`.

### Servicios de apoyo

| Método | Ruta | Parámetros | Respuesta |
| ------ | ---- | ---------- | --------- |
| GET | `/api/v1/services` | `q`, `category`, `modality`, `is_free`, `entity_id`, `page`, `page_size` | `Page<Service>` |
| GET | `/api/v1/services/{id}` | — | `Service` · 404 si no existe |

```json
// Service
{
  "id": "e8b0...-...", "title": "Orientación psicológica gratuita",
  "slug": "orientacion-psicologica-gratuita", "summary": "Atención en salud mental para jóvenes.",
  "description": "…", "category": "salud_mental", "modality": "presencial",
  "is_free": true, "address": "Cra 00 #00-00", "latitude": 4.142, "longitude": -73.629,
  "status": "activo", "entity_id": "a1c2...-...",
  "created_at": "2026-10-21T10:00:00-05:00", "updated_at": "2026-10-21T10:00:00-05:00"
}
```

### Recursos de bienestar

| Método | Ruta | Parámetros | Respuesta |
| ------ | ---- | ---------- | --------- |
| GET | `/api/v1/resources` | `q`, `format`, `topic`, `page`, `page_size` | `Page<Resource>` |
| GET | `/api/v1/resources/{id}` | — | `Resource` · 404 si no existe |

```json
// Resource
{
  "id": "…", "title": "Guía de autocuidado emocional", "slug": "guia-autocuidado-emocional",
  "summary": "…", "format": "guia", "topic": "salud_mental", "url": "https://…",
  "body": null, "source": "Secretaría de Salud", "published_at": "2026-09-01",
  "created_at": "…", "updated_at": "…"
}
```

### Actividades juveniles

| Método | Ruta | Parámetros | Respuesta |
| ------ | ---- | ---------- | --------- |
| GET | `/api/v1/activities` | `q`, `category`, `entity_id`, `upcoming` (bool), `page`, `page_size` | `Page<Activity>` |
| GET | `/api/v1/activities/{id}` | — | `Activity` · 404 si no existe |

`upcoming=true` devuelve solo actividades con `start_at` ≥ ahora.

```json
// Activity
{
  "id": "…", "title": "Feria de empleo juvenil", "slug": "feria-empleo-juvenil",
  "summary": "…", "description": "…", "category": "feria", "location": "Parque …",
  "latitude": 4.15, "longitude": -73.63, "start_at": "2026-11-05T09:00:00-05:00",
  "end_at": "2026-11-05T17:00:00-05:00", "is_free": true, "registration_url": "https://…",
  "status": "programada", "entity_id": "…", "created_at": "…", "updated_at": "…"
}
```

### Canales institucionales

| Método | Ruta | Parámetros | Respuesta |
| ------ | ---- | ---------- | --------- |
| GET | `/api/v1/channels` | `entity_id`, `kind`, `is_emergency`, `page`, `page_size` | `Page<Channel>` |

```json
// Channel
{
  "id": "…", "entity_id": "…", "kind": "whatsapp", "label": "Línea de escucha",
  "value": "+57 300 000 0000", "is_emergency": true, "created_at": "…", "updated_at": "…"
}
```

### Entidades

| Método | Ruta | Parámetros | Respuesta |
| ------ | ---- | ---------- | --------- |
| GET | `/api/v1/entities` | `q`, `kind`, `verified`, `page`, `page_size` | `Page<Entity>` |
| GET | `/api/v1/entities/{id}` | — | `Entity` · 404 si no existe |

```json
// Entity
{
  "id": "…", "name": "Secretaría de Salud de Villavicencio", "slug": "secretaria-salud",
  "kind": "publica", "description": "…", "website": "https://…", "verified": true,
  "created_at": "…", "updated_at": "…"
}
```

## Vocabularios

Los valores permitidos de `category`, `modality`, `status`, `kind`, `format`, `topic` están en
[`MODELO_DATOS.md` → Vocabularios controlados](MODELO_DATOS.md#vocabularios-controlados). El
frontend puede tiparlos como uniones de literales en `src/types/api.ts`.

## Pendiente (fuera de v1)

- Escritura (POST/PUT/DELETE) y autenticación del panel institucional.
- Endpoint de taxonomías (`GET /api/v1/categories`) si el frontend lo necesita para filtros.
- Ordenación configurable (`?sort=`).
