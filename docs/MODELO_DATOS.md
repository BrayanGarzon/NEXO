# Modelo de datos — NEXO JOVEN 360 (v1)

> **Tarea B1.** Propuesta redactada por Backend (Camilo). **Pendiente de aprobación de los tres.**
> Este documento define las entidades, campos y relaciones del dominio. Es la base de los
> contratos de API ([`API_CONTRACTS.md`](API_CONTRACTS.md)) y de los modelos ORM
> (`backend/app/models/`).
>
> **Dependencia con I3:** los datos reales de Villavicencio (`docs/contenido/`, a cargo de
> Elizabeth) **validan y afinan** este modelo. Si al cargarlos falta un campo o sobra uno, se
> ajusta aquí mediante PR. El formato de intercambio esperado está en la sección
> [Formato de `docs/contenido/`](#formato-de-docscontenido-para-i3--b5).

## Principios

1. **Identificadores UUID como texto** (`VARCHAR(36)`). Portable entre PostgreSQL y SQLite
   (pruebas), y coincide con el contrato (`UUID como texto`).
2. **Auditoría en todas las tablas:** `created_at` y `updated_at` (`TIMESTAMP WITH TIME ZONE`,
   `now()` por defecto; `updated_at` se actualiza en cada escritura).
3. **Vocabularios controlados como texto, no como `ENUM` de base de datos.** Añadir un valor
   nuevo no requiere migración de tipo; la validación se hace en la capa Pydantic. Los valores
   permitidos se listan abajo y se versionan en este documento.
4. **`slug` único y estable** por recurso para URLs legibles y enlaces desde el frontend.
5. **Geolocalización opcional** (`latitude`, `longitude`) preparada para el mapa futuro; nunca
   obligatoria, porque no todos los servicios son presenciales.
6. **Solo lectura en v1.** La escritura (panel institucional) se define en una fase posterior
   (ver [`PANEL_INSTITUCIONAL.md`](PANEL_INSTITUCIONAL.md)).

## Diagrama de relaciones

```text
                         ┌────────────────┐
                         │    entities    │  (organizaciones / instituciones)
                         └──────┬─────────┘
            ┌───────────────────┼────────────────────┐
            │ 1:N               │ 1:N                 │ 1:N
     ┌──────▼──────┐     ┌──────▼───────┐      ┌──────▼───────┐
     │  services   │     │  activities  │      │   channels   │
     └─────────────┘     └──────────────┘      └──────────────┘

     ┌─────────────┐
     │  resources  │  (contenido educativo; independiente de entities)
     └─────────────┘
```

- Una **entidad** ofrece 0..N **servicios**, organiza 0..N **actividades** y expone 0..N
  **canales** de contacto.
- Un **recurso** educativo es independiente (su origen se guarda como texto en `source`).

## Entidades

Tipos comunes a todas las tablas: `id UUID(texto)`, `created_at`, `updated_at`.

### `entities` — organizaciones e instituciones

| Campo | Tipo | Nulo | Notas |
| ----- | ---- | ---- | ----- |
| `name` | texto | no | Nombre oficial. |
| `slug` | texto | no | Único. |
| `kind` | texto (vocab) | no | `publica`, `ong`, `privada`, `educativa`, `comunitaria`. |
| `description` | texto | sí | |
| `website` | texto | sí | URL. |
| `verified` | booleano | no | Validada por el equipo institucional. Por defecto `false`. |

### `services` — servicios de apoyo

| Campo | Tipo | Nulo | Notas |
| ----- | ---- | ---- | ----- |
| `title` | texto | no | |
| `slug` | texto | no | Único. |
| `summary` | texto | no | Resumen corto para tarjetas. |
| `description` | texto largo | sí | |
| `category` | texto (vocab) | no | Ver [categorías de servicios](#vocabularios-controlados). |
| `modality` | texto (vocab) | no | `presencial`, `virtual`, `mixto`. |
| `is_free` | booleano | no | Por defecto `true`. |
| `comuna` | entero | sí | Comuna de Villavicencio (1–8). |
| `schedule` | texto | sí | Horario de atención en texto libre. Máx. 200 caracteres. |
| `offerings` | lista de texto (JSON) | no | Servicios ofrecidos. Por defecto lista vacía `[]`. |
| `verified` | booleano | no | Verificado por una fuente oficial. Por defecto `false`. |
| `address` | texto | sí | Dirección si es presencial. |
| `latitude` | decimal | sí | |
| `longitude` | decimal | sí | |
| `status` | texto (vocab) | no | `activo`, `inactivo`. Por defecto `activo`. |
| `entity_id` | FK → `entities.id` | sí | Organización que lo presta. |

### `resources` — recursos educativos de bienestar

| Campo | Tipo | Nulo | Notas |
| ----- | ---- | ---- | ----- |
| `title` | texto | no | |
| `slug` | texto | no | Único. |
| `summary` | texto | no | |
| `format` | texto (vocab) | no | `articulo`, `video`, `guia`, `pdf`, `podcast`, `enlace`. |
| `topic` | texto (vocab) | no | Mismo vocabulario que `category` de servicios. |
| `url` | texto | sí | Enlace externo al contenido. |
| `body` | texto largo | sí | Contenido propio (si no es enlace). |
| `source` | texto | sí | Origen / autor institucional. |
| `published_at` | fecha | sí | |

### `activities` — actividades juveniles

| Campo | Tipo | Nulo | Notas |
| ----- | ---- | ---- | ----- |
| `title` | texto | no | |
| `slug` | texto | no | Único. |
| `summary` | texto | no | |
| `description` | texto largo | sí | |
| `category` | texto (vocab) | no | `taller`, `feria`, `convocatoria`, `voluntariado`, `cultural`, `deportivo`, `formativo`. |
| `location` | texto | sí | |
| `latitude` | decimal | sí | |
| `longitude` | decimal | sí | |
| `start_at` | fecha-hora | no | Inicio. |
| `end_at` | fecha-hora | sí | Fin. |
| `is_free` | booleano | no | Por defecto `true`. |
| `registration_url` | texto | sí | Inscripción. |
| `status` | texto (vocab) | no | `programada`, `en_curso`, `finalizada`, `cancelada`. Por defecto `programada`. |
| `entity_id` | FK → `entities.id` | sí | Organizador. |

### `channels` — canales institucionales de contacto

| Campo | Tipo | Nulo | Notas |
| ----- | ---- | ---- | ----- |
| `entity_id` | FK → `entities.id` | no | Dueño del canal. |
| `kind` | texto (vocab) | no | `telefono`, `whatsapp`, `correo`, `web`, `presencial`, `red_social`. |
| `label` | texto | no | Etiqueta visible (p. ej. «Línea de emergencia»). |
| `value` | texto | no | Número, correo o URL. |
| `is_emergency` | booleano | no | Línea de atención urgente. Por defecto `false`. |

## Vocabularios controlados

Valores válidos (en `snake_case`). Añadir un valor es un cambio de este documento + validación
Pydantic; **no** requiere migración de base de datos.

- **Categorías de servicios / temas de recursos (`category` / `topic`):**
  `salud_mental`, `salud_sexual`, `empleo`, `educacion`, `juridico`, `prevencion_consumo`,
  `violencia_genero`, `discapacidad`, `emprendimiento`, `deporte_cultura`.
- **Categorías de actividades:** `taller`, `feria`, `convocatoria`, `voluntariado`, `cultural`,
  `deportivo`, `formativo`.
- **Modalidad:** `presencial`, `virtual`, `mixto`.
- **Estado de servicio:** `activo`, `inactivo`.
- **Estado de actividad:** `programada`, `en_curso`, `finalizada`, `cancelada`.
- **Tipo de entidad:** `publica`, `ong`, `privada`, `educativa`, `comunitaria`.
- **Formato de recurso:** `articulo`, `video`, `guia`, `pdf`, `podcast`, `enlace`.
- **Tipo de canal:** `telefono`, `whatsapp`, `correo`, `web`, `presencial`, `red_social`.

## Formato de `docs/contenido/` (para I3 → B5)

El script de datos semilla (B5) espera, **cuando Elizabeth entregue I3**, un archivo JSON por
recurso en `docs/contenido/`, con `fuente` y `fecha` a nivel de archivo:

```jsonc
// docs/contenido/entities.json
{
  "fuente": "Alcaldía de Villavicencio - Secretaría de ...",
  "fecha": "2026-10-21",
  "items": [
    { "name": "...", "slug": "...", "kind": "publica", "description": "...",
      "website": "https://...", "verified": true }
  ]
}
```

Cada archivo (`entities.json`, `services.json`, `resources.json`, `activities.json`,
`channels.json`) contiene un array `items` cuyos objetos usan exactamente los campos de las
tablas de arriba. Las relaciones se referencian por `slug` (p. ej. un servicio trae
`entity_slug`), no por UUID, porque los UUID los genera el seed.

> Mientras I3 no exista, el seed usa un conjunto de ejemplo reducido en
> `backend/app/db/seed_data.py` para desarrollo y pruebas, claramente marcado como provisional.
