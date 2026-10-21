# Plan de trabajo — Persona 3 (Elizabeth): paneles institucionales

Alcance y reglas para desarrollar **Fuente Viva** y **Observatorio** sin bloquear ni romper la
web pública. Complementa las tareas I1–I6 de [`TAREAS.md`](TAREAS.md); la tarea I5
(`docs/PANEL_INSTITUCIONAL.md`: requisitos, autenticación y roles) sigue siendo de la Persona 3.

## 1. Punto de partida

- **Referencia visual ya aprobada:** paneles 06 y 07 de
  [`docs/diseno/nexo-joven-moodboard.png`](diseno/nexo-joven-moodboard.png). Deben respetarse:
  - barra lateral verde petróleo con el logo y las entradas *Dashboard, Servicios, Verificación,
    Categorías, Fuentes, Usuarios, Configuración*;
  - encabezado con título de página, subtítulo y usuario institucional;
  - área de contenido sobre marfil, más sobria que la web pública, con la misma identidad
    (tokens, tipografía, etiquetas de estado y notas manuscritas puntuales).
- **Contratos:** no hay API para los paneles. Hay una **propuesta** en
  [`API_CONTRACTS.md` §4](API_CONTRACTS.md#4-paneles-institucionales-propuesta).
- **Autenticación:** sin definir (decisión pendiente 3). Los paneles se construyen primero sin
  login real.
- **Datos:** solo sintéticos.

## 2. Alcance de cada panel

### Fuente Viva — gestión y verificación de servicios

Panel 06 del moodboard ("Servicios — Gestiona la información de los servicios").

| Pantalla / función | Contenido mínimo |
| ------------------ | ---------------- |
| Listado de servicios | Búsqueda; filtros por estado (*Todos, Borrador, En revisión, Publicado, No vigente*); tabla con Nombre, Categoría, Institución, Estado, Última actualización y Acciones; botón "Nuevo servicio" |
| Detalle / edición | Datos del servicio (nombre, categoría, institución, dirección, comuna, horario, servicios ofrecidos) |
| Fuentes | Lista de fuentes del servicio con tipo (oficial / institucional / otra), título, enlace y **fecha de consulta**; añadir, editar y quitar |
| Revisión y publicación | Cambiar estado según las transiciones de `API_CONTRACTS.md` §4.1, con comentario; no permitir publicar sin al menos una fuente |
| Historial | Eventos de revisión del servicio (quién, qué, cuándo) |
| Estados de interfaz | Carga, vacío, error y confirmación de acciones |

### Observatorio — calidad y mantenimiento de la información

Panel 07 del moodboard ("Resumen general — Estado del catálogo y calidad de la información").

| Bloque | Contenido mínimo |
| ------ | ---------------- |
| Resumen | Tarjetas: servicios totales, publicados, en revisión y no vigentes |
| Calidad de la información | Con fuente verificable / pendiente de revisión / sin fuente (dona + leyenda con %) |
| Servicios por categoría | Barras por categoría |
| Vigencia | Vigentes, por vencer (30 días) y vencidos |
| Cobertura de fuentes | Por categoría y comuna: publicados y con fuente oficial |
| Incidencias | Lista filtrable: sin fuente, fuente antigua, vencido, campos incompletos, revisión prolongada |
| Actividad reciente | Últimos eventos de revisión con su etiqueta de estado |
| Validaciones | Resultado de las reglas de calidad ejecutadas sobre el **conjunto sintético** (reglas, aprobados, fallidos, fecha) |

### Fuera de alcance (obligatorio)

- **Ningún perfil de personas jóvenes**, ni respuestas de Brújula, ni historiales clínicos, ni
  datos reales de salud.
- Métricas sobre usuarios o comportamiento de navegación.
- Autenticación real hasta que se apruebe I5 / decisión pendiente 3.
- Las entradas *Usuarios* y *Configuración* del menú lateral: solo como enlaces deshabilitados o
  "próximamente" hasta definir roles.

## 3. Qué puede hacer la Persona 3 de forma independiente

Sin esperar al backend:

1. **Documento I5** (`docs/PANEL_INSTITUCIONAL.md`): roles (p. ej. gestor, revisor,
   administrador), quién puede crear/revisar/publicar y propuesta de autenticación.
2. **Layout de panel** con barra lateral y encabezado, según el moodboard.
3. **Pantallas de Fuente Viva y Observatorio con datos sintéticos** detrás de un módulo de
   servicios (mismo patrón que `frontend/src/services/catalog.ts`), para cambiar después a la API
   sin tocar los componentes.
4. **Pruebas** de componentes y flujos con Vitest + Testing Library.
5. **E2E (I4)** con Playwright sobre la web pública: convertir en pruebas automáticas la
   verificación manual de `PLAN_PRUEBAS.md` (menú, scroll, rutas antiguas, responsive).
6. **Revisión de la propuesta de contratos** (§4 de `API_CONTRACTS.md`) junto con Camilo.

### Ubicación propuesta de archivos

Para que nadie edite los mismos archivos a la vez, la Persona 3 sería responsable de:

```text
frontend/src/features/panel/            # todo lo de los paneles
├── PanelLayout.tsx / .css              # barra lateral + encabezado
├── panelRoutes.tsx                     # rutas /panel/…
├── fuente-viva/                        # pantallas de Fuente Viva
├── observatorio/                       # pantallas de Observatorio
├── mocks/                              # datos sintéticos de los paneles
├── services/                           # acceso a datos (mocks → API)
└── types.ts                            # tipos provisionales de los paneles
e2e/                                    # Playwright (I4, I6)
docs/PANEL_INSTITUCIONAL.md             # I5
```

Rutas propuestas (fuera de la página única pública):

| Ruta | Pantalla |
| ---- | -------- |
| `/panel` | Redirige a `/panel/observatorio` |
| `/panel/observatorio` | Resumen del Observatorio |
| `/panel/servicios` | Listado de Fuente Viva |
| `/panel/servicios/:id` | Detalle, fuentes, revisión e historial |

> Hay que actualizar `TAREAS.md` (archivo de la Persona 3) para registrar la propiedad de
> `frontend/src/features/panel/**` y `e2e/**`, y añadir las tareas del panel (sugerencia: I7
> Fuente Viva, I8 Observatorio).

## 4. Componentes compartidos que debe reutilizar

Disponibles en `frontend/src/components/` (responsable: Brayan) y tokens en
`frontend/src/styles/tokens.css`:

| Necesidad en el panel | Reutilizar |
| --------------------- | ---------- |
| Botones ("Nuevo servicio", "Guardar", acciones) | `Button`, `ButtonLink` (variantes `primary`, `secondary`, `accent`, `ghost`) |
| Etiquetas de estado | `Tag` (tonos `neutral`, `success`, `accent`, `warning`, `demo`); `DemoTag` para marcar datos sintéticos |
| Filtros por estado o categoría | `Chip` (con `aria-pressed`) |
| Buscador de la tabla | `SearchField` |
| Tarjetas de indicadores y bloques | `Card` (tonos `surface`, `lila`, `menta`, `amarillo`, `coral`, `petroleo`) |
| Carga, vacío y error | `StatusMessage` |
| Iconos | `Icon` (lista en `Icon.tsx`), `IconBadge` |
| Logo en la barra lateral | `Logo` con `inverse` |
| Nota manuscrita del moodboard | `Annotation` |
| Categorías (nombre, icono, color) | `frontend/src/content/categories.ts` |

Si falta algo (p. ej. un tono `danger` para *No vigente*, una tabla, o gráficos), **pídelo con un
issue a Brayan** o propón el componente nuevo dentro de `features/panel/` y, si resulta
reutilizable, se mueve a `components/` en un PR coordinado. Para la dona y las barras, preferir
SVG/CSS propios; si se propone una librería de gráficos, justificarla en el PR (CONTRIBUTING:
"No añadir dependencias sin justificarlo").

## 5. Qué no debe modificar en la web pública

Sin coordinar con Brayan, **no editar**:

- `frontend/src/features/{home,brujula,territorio,upcoming,informacion,not-found}/`
- `frontend/src/layouts/MainLayout.*`
- `frontend/src/app/navigation.ts`, `useSectionNavigation.ts`, `RedirectToSection.tsx`
- `frontend/src/components/**` y `frontend/src/styles/**`
- `frontend/src/mocks/demoServices.ts`, `frontend/src/services/catalog.ts`,
  `frontend/src/types/catalog.ts`

Único punto de contacto previsto: **una línea en `frontend/src/app/routes.tsx`** para registrar
`panelRoutes` como ruta hermana de la página pública (no dentro de `MainLayout`). Se hace en el
primer PR del panel, con revisión de Brayan.

## 6. Contratos que deben acordarse antes de integrar el backend

Con Camilo (backend) y Brayan (frontend), según `API_CONTRACTS.md` §4.4:

1. Modelo de `ServicioAdmin`, `Fuente` y `EventoRevision` (nombres de campos e idioma).
2. Máquina de estados y regla de publicación (fuente mínima obligatoria).
3. Endpoints de Fuente Viva (`/api/v1/admin/services…`) y de Observatorio
   (`/api/v1/admin/observatorio/…`).
4. Roles, permisos y autenticación (I5).
5. Umbrales de vigencia y antigüedad de fuentes (decisión pendiente 9).
6. Relación con el catálogo público: solo los servicios `publicado` aparecen en `/api/v1/services`.

Hasta su aprobación, los tipos del panel son provisionales (en `features/panel/types.ts`), igual
que `types/catalog.ts` en la web pública.

## 7. Pruebas y evidencias a entregar

En cada PR:

- [ ] `npm run format:check`, `lint`, `typecheck`, `test` y `build` en verde (y CI en verde).
- [ ] Pruebas de componentes/flujos: filtros de la tabla, transición de estado (permitida y
      rechazada), alta y edición de fuentes, publicación bloqueada sin fuente, cálculo de
      porcentajes del Observatorio, estados de carga/vacío/error.
- [ ] Pruebas de accesibilidad básicas: nombres accesibles de acciones de la tabla, foco visible,
      navegación por teclado de la barra lateral.
- [ ] Capturas de escritorio y móvil de cada pantalla, junto al panel correspondiente del
      moodboard.
- [ ] Declaración en el PR: "Usa solo datos sintéticos; no incluye datos de personas ni de salud".
- [ ] La web pública sigue intacta: las pruebas existentes pasan sin modificarlas.

## 8. Integración mediante pull request

Orden sugerido, un PR por paso (detalles de comandos en [`GIT_WORKFLOW.md`](GIT_WORKFLOW.md)):

| # | Rama | Contenido | Revisa |
| - | ---- | --------- | ------ |
| 1 | `docs/panel-institucional` | I5 + actualización de `TAREAS.md` (propiedad y tareas I7/I8) | Brayan y Camilo |
| 2 | `feat/panel-layout` | `PanelLayout`, `panelRoutes` y la línea en `routes.tsx` | Brayan |
| 3 | `feat/panel-observatorio` | Observatorio con datos sintéticos | Brayan |
| 4 | `feat/panel-fuente-viva` | Fuente Viva con datos sintéticos | Brayan |
| 5 | `test/e2e-pagina-unica` | Playwright + job de CI (I4) | Brayan y Camilo |
| 6 | (tras aprobar contratos) | Sustituir mocks por la API | Camilo |

Cómo empezar:

```bash
git switch main
git pull
cd frontend && npm install && npm run dev     # verificar que la web pública arranca
cd ..
git switch -c docs/panel-institucional
```
