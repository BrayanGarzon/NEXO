# Contratos de integración

Este documento es la fuente de verdad del acuerdo entre frontend y backend.
**Cualquier cambio requiere un PR aprobado por los responsables de frontend y backend**; los
contratos de los paneles institucionales requieren además la aprobación de la Persona 3.

La especificación OpenAPI generada automáticamente está en `http://localhost:8000/docs`
(y en `/openapi.json`).

| Sección | Estado |
| ------- | ------ |
| [1. Convenciones generales](#1-convenciones-generales) | Propuestas, salvo el prefijo |
| [2. Endpoints implementados](#2-endpoints-implementados) | **Implementados y probados** |
| [3. Catálogo público](#3-catálogo-público-propuesta) | Propuesta, no implementada |
| [4. Paneles institucionales](#4-paneles-institucionales-propuesta) | Propuesta, no implementada |

> Solo la sección 2 describe una API que existe. Las secciones 3 y 4 son borradores para
> discutir: **no implementar en el backend hasta aprobarlas**. El frontend puede trabajar contra
> ellas con datos sintéticos.

## 1. Convenciones generales

| Tema | Propuesta | Estado |
| ---- | --------- | ------ |
| Prefijo | Rutas de negocio bajo `/api/v1`; rutas técnicas (`/health`) en la raíz | Aprobado en Fase 00 |
| Prefijo de paneles | `/api/v1/admin/…`, siempre autenticado | Pendiente |
| Formato | JSON, UTF-8, campos en `snake_case` | Pendiente |
| Fechas | ISO 8601 con zona horaria (`2026-10-20T15:00:00-05:00`); fechas sin hora como `YYYY-MM-DD` | Pendiente |
| Identificadores | UUID como texto | Pendiente |
| Paginación | `?page=1&page_size=20` → `{ "items": [], "total": 0, "page": 1, "page_size": 20 }` | Pendiente |
| Errores | `{ "detail": "mensaje" }` (formato de FastAPI); validación devuelve 422 | Pendiente |
| Autenticación | Por definir (decisión pendiente 3, tarea I5) | Pendiente |

## 2. Endpoints implementados

Verificados por `backend/tests/` (7 pruebas). Código: `backend/app/api/routes/health.py`.

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

Tipo en frontend: `HealthResponse` (`frontend/src/types/api.ts`), usado por
`frontend/src/services/health.ts`.

### `GET /health/db`

Comprobación de conectividad con PostgreSQL.

```json
200 OK                                  503 Service Unavailable
{ "status": "ok", "database": "up" }    { "status": "error", "database": "down" }
```

## 3. Catálogo público (propuesta)

| Recurso | Endpoints tentativos | Responsable de la propuesta |
| ------- | -------------------- | --------------------------- |
| Servicios de apoyo | `GET /api/v1/services`, `GET /api/v1/services/{id}` | Backend |
| Recursos de bienestar | `GET /api/v1/resources` | Backend |
| Actividades juveniles | `GET /api/v1/activities` | Backend |
| Canales institucionales | `GET /api/v1/channels` | Backend |

El catálogo público solo debe devolver servicios en estado `publicado`.

**Referencia para la discusión:** los campos que el frontend usa hoy con datos sintéticos están en
`frontend/src/types/catalog.ts` (`DemoService`). Son un punto de partida, **no** un contrato: por
ejemplo, `mapPosition` es una posición en el esquema provisional y deberá sustituirse por
coordenadas reales cuando se decida el mapa.

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
  categoria             "salud-mental" | "educacion" | "deporte" | "cultura" | "empleo" | "recreacion"
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
