# Contratos de integración

Este documento es la fuente de verdad del acuerdo entre frontend y backend.
**Cualquier cambio requiere un PR aprobado por los responsables de frontend y backend**; los
contratos de los paneles institucionales requieren además la aprobación de la Persona 3.

La especificación OpenAPI generada automáticamente está en `http://localhost:8000/docs`
(y en `/openapi.json`).

| Sección | Estado |
| ------- | ------ |
| [1. Convenciones generales](#1-convenciones-generales) | Acordadas para el catálogo v1; paneles pendientes |
| [2. Endpoints técnicos](#2-endpoints-técnicos) | **Implementados y probados** |
| [3. Catálogo público `/api/v1`](#3-catálogo-público-apiv1) | **Implementado y probado (solo lectura)** |
| [4. Paneles institucionales](#4-paneles-institucionales-propuesta) | Propuesta, no implementada |

> Las secciones 2 y 3 describen una API que **existe y está probada** (`backend/tests/`, 48
> pruebas). La sección 4 es un borrador: **no implementar en el backend hasta aprobarla**. El
> frontend puede trabajar contra ella con datos sintéticos.
>
> **Tarea B2 (v1).** El catálogo de la sección 3 lo redactó Backend (Camilo) sobre el modelo de
> datos ([`MODELO_DATOS.md`](MODELO_DATOS.md)) y queda **pendiente de aprobación de los tres**.
> Hasta aprobarlo, el frontend trabaja con *mocks* que respeten este contrato (F5) y el backend
> no cambia las firmas publicadas.

## 1. Convenciones generales

| Tema | Acuerdo | Estado |
| ---- | ------- | ------ |
| Prefijo | Rutas de negocio bajo `/api/v1`; rutas técnicas (`/health`) en la raíz | Aprobado en Fase 00 |
| Prefijo de paneles | `/api/v1/admin/…`, siempre autenticado | Pendiente |
| Formato | JSON, UTF-8, campos en `snake_case` | v1 (implementado) |
| Fechas | ISO 8601 con zona horaria (`2026-10-20T15:00:00-05:00`); fechas sin hora como `YYYY-MM-DD` | v1 (implementado) |
| Identificadores | UUID como texto | v1 (implementado) |
| Paginación | `?page=1&page_size=20` → envoltorio `{ items, total, page, page_size }` | v1 (implementado) |
| Orden de paginación | `page` ≥ 1 (def. 1); `page_size` entre 1 y 100 (def. 20) | v1 (implementado) |
| Búsqueda | `?q=texto` (coincidencia parcial, sin distinción de mayúsculas) donde se indique | v1 (implementado) |
| Errores | `{ "detail": "mensaje" }`; validación 422; no encontrado 404; error interno 500 | v1 (implementado) |
| Autenticación | No requerida para `/api/v1` (catálogo de solo lectura); paneles por definir (tarea I5) | Catálogo: v1 · Paneles: pendiente |

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

## 2. Endpoints técnicos

Verificados por `backend/tests/`. Código: `backend/app/api/routes/health.py`.

### `GET /health`

Comprobación de vida. No consulta la base de datos.

```json
200 OK
{ "status": "ok", "service": "NEXO JOVEN 360 API", "version": "0.1.0", "environment": "development" }
```

Tipo en frontend: `HealthResponse` (`frontend/src/types/api.ts`), usado por
`frontend/src/services/health.ts`.

### `GET /health/db`

Comprobación de conectividad con PostgreSQL.

```json
200 OK                                  503 Service Unavailable
{ "status": "ok", "database": "up" }    { "status": "error", "database": "down" }
```

## 3. Catálogo público `/api/v1`

Implementado y probado (`backend/app/api/routes/`, `backend/tests/`). Todos los endpoints son
**solo lectura** (GET) en v1. Los campos de cada objeto corresponden a
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

### Vocabularios

Los valores permitidos de `category`, `modality`, `status`, `kind`, `format`, `topic` están en
[`MODELO_DATOS.md` → Vocabularios controlados](MODELO_DATOS.md#vocabularios-controlados). El
frontend puede tiparlos como uniones de literales en `src/types/api.ts`.

> **Punto de coordinación con la sección 4:** el catálogo público expone `status`
> `activo`/`inactivo`, mientras que el panel institucional (sección 4) propone estados
> `borrador`/`en_revision`/`publicado`/`no_vigente`. Al aprobar el panel debe decidirse cómo se
> proyecta el estado administrativo sobre el catálogo público (p. ej. que solo los servicios
> `publicado` aparezcan como `activo`).

### Pendiente (fuera del catálogo v1)

- Escritura (POST/PUT/DELETE) y autenticación: ver sección 4.
- Endpoint de taxonomías (`GET /api/v1/categories`) si el frontend lo necesita para filtros.
- Ordenación configurable (`?sort=`).

## 4. Paneles institucionales (propuesta)

Borrador para **Fuente Viva** (gestión y verificación del catálogo) y **Observatorio** (calidad y
mantenimiento de la información). Alcance funcional en [`PLAN_PERSONA_3.md`](PLAN_PERSONA_3.md).

**Restricciones de privacidad (no negociables):**

- Los paneles trabajan sobre **servicios e instituciones**, nunca sobre personas jóvenes.
- No se registran perfiles, respuestas de Brújula, historiales clínicos ni datos de salud de
  personas.
- Las métricas del Observatorio son sobre el catálogo (fuentes, vigencia, estados), no sobre
  usuarios.
- En desarrollo y pruebas se usan **datos sintéticos**.

### 4.1 Modelo propuesto

```text
ServicioAdmin
  id                    uuid
  nombre                string
  categoria             "salud-mental" | "educacion" | "deporte" | "cultura" | "empleo" | "recreacion" | "otra"
  categoria_otro        string | null       detalle requerido cuando categoria = "otra"
  motivo_creacion       string              justificación de la necesidad que atiende el servicio
  institucion           string            (o institucion_id cuando exista el recurso)
  resumen               string
  direccion             string
  comuna                integer 1–8
  horario               string
  servicios_ofrecidos   string[]
  estado                "borrador" | "en_revision" | "publicado" | "no_vigente"
  fuentes               Fuente[]
  ultima_revision       date | null       última verificación contra una fuente
  vigente_hasta         date | null       fecha a partir de la cual debe revisarse
  actualizado_en        datetime
  actualizado_por       string            (identificador del usuario institucional)

Fuente
  id                    uuid
  tipo                  "oficial" | "institucional" | "otra"
  titulo                string
  url                   string | null
  fecha_consulta        date              cuándo se consultó la fuente
  notas                 string | null

EventoRevision
  id                    uuid
  servicio_id           uuid
  accion                "creado" | "enviado_a_revision" | "devuelto" | "publicado"
                        | "marcado_no_vigente" | "fuente_actualizada" | "editado"
  estado_anterior       estado | null
  estado_nuevo          estado | null
  comentario            string | null
  autor                 string
  fecha                 datetime
```

Estados y transiciones propuestas (coinciden con las etiquetas del moodboard: Borrador,
En revisión, Publicado, No vigente):

```text
borrador ──► en_revision ──► publicado ──► no_vigente
   ▲             │               │              │
   └── devuelto ─┘               └► en_revision ◄┘   (nueva versión / reactivación)
```

Regla propuesta: un servicio solo pasa a `publicado` si tiene al menos una fuente con
`fecha_consulta`. El plazo máximo de antigüedad de esa fuente es la decisión pendiente 9.

### 4.2 Fuente Viva

| Método y ruta | Uso |
| ------------- | --- |
| `GET /api/v1/admin/services?estado=&categoria=&q=&page=&page_size=` | Tabla de servicios con filtros |
| `POST /api/v1/admin/services` | Crear servicio (estado inicial `borrador`) |
| `GET /api/v1/admin/services/{id}` | Detalle con fuentes |
| `PATCH /api/v1/admin/services/{id}` | Editar campos (no cambia `estado`) |
| `POST /api/v1/admin/services/{id}/transiciones` | `{ "a": "<estado>", "comentario": "…" }`; 409 si la transición no está permitida |
| `GET /api/v1/admin/services/{id}/historial` | Lista de `EventoRevision` |
| `POST /api/v1/admin/services/{id}/fuentes` | Añadir fuente |
| `PATCH /api/v1/admin/services/{id}/fuentes/{fuente_id}` | Actualizar fuente (p. ej. nueva `fecha_consulta`) |
| `DELETE /api/v1/admin/services/{id}/fuentes/{fuente_id}` | Quitar fuente |

### 4.3 Observatorio

| Método y ruta | Respuesta propuesta |
| ------------- | ------------------- |
| `GET /api/v1/admin/observatorio/resumen` | `{ "total", "por_estado": {estado: n}, "por_categoria": {categoria: n}, "calidad": { "con_fuente_verificable", "pendiente_revision", "sin_fuente" } }` (conteos; el frontend calcula porcentajes) |
| `GET /api/v1/admin/observatorio/vigencia` | `{ "vigentes", "por_vencer_30_dias", "vencidos" }` según `vigente_hasta` |
| `GET /api/v1/admin/observatorio/cobertura` | Por categoría y comuna: servicios publicados y servicios con fuente oficial |
| `GET /api/v1/admin/observatorio/incidencias?tipo=` | Lista `{ "servicio_id", "nombre", "tipo", "detectada_en" }`; `tipo` ∈ `sin_fuente`, `fuente_antigua`, `vencido`, `campos_incompletos`, `en_revision_prolongada` |
| `GET /api/v1/admin/observatorio/actividad?limit=10` | Últimos `EventoRevision` (actividad reciente) |
| `GET /api/v1/admin/observatorio/validaciones` | Resultado de la última ejecución de reglas de calidad sobre el conjunto de datos: `{ "ejecutado_en", "conjunto": "sintetico" \| "real", "reglas": [{ "nombre", "aprobados", "fallidos" }] }` |

### 4.4 Puntos a acordar antes de implementar

1. Nombres de campos en español (como arriba) o en inglés: debe ser uniforme con el catálogo
   público.
2. Si `institucion` es texto libre o un recurso propio (`/api/v1/admin/institutions`).
3. Roles y permisos: quién crea, quién revisa, quién publica (tarea I5).
4. Plazos de vigencia y de antigüedad de fuentes (decisión pendiente 9).
5. Si el Observatorio calcula los indicadores en cada petición o a partir de ejecuciones
   programadas.
6. Proyección de estados administrativos (sección 4.1) sobre el `status` del catálogo público
   (sección 3): qué estados se consideran visibles públicamente.
