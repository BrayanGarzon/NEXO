# Plan de trabajo — Persona 3 (Elizabeth): paneles institucionales

Alcance y reglas para desarrollar **Fuente Viva** y **Observatorio** sin bloquear ni romper la
web pública. Corresponden a las tareas **I7** e **I8** de [`TAREAS.md`](TAREAS.md), que son la
**prioridad actual** de la Persona 3. Las tareas originales I1–I6 (GitHub, datos reales, QA y
pruebas E2E, documento de autenticación) quedan postergadas hasta terminar el panel.

| | |
| --- | --- |
| Rama | `feat/panel-admin` |
| Carpeta (propiedad exclusiva) | `frontend/src/features/panel/` |
| Punto de entrada | `frontend/src/features/panel/panelRoutes.tsx` (ya registrado en `app/routes.tsx`) |
| URL en desarrollo | http://localhost:5173/panel |
| Datos | Sintéticos |
| Orden | I7 Fuente Viva → I8 Observatorio |

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

Todo el panel se puede construir sin esperar al backend ni a la autenticación:

1. **Layout de panel** con barra lateral y encabezado, según el moodboard (inicio de I7).
2. **Datos sintéticos del panel** (servicios con estado, fuentes, fechas de consulta y eventos de
   revisión) en `features/panel/mocks/`, servidos por un módulo propio en `features/panel/services/`
   (mismo patrón que `frontend/src/services/catalog.ts`), para cambiar después a la API sin tocar
   los componentes.
3. **Fuente Viva (I7)** y luego **Observatorio (I8)**, que calcula sus indicadores sobre esos
   mismos datos.
4. **Revisar la propuesta de contratos** (§4 de `API_CONTRACTS.md`) con Camilo a medida que el
   panel revele campos necesarios.

**Postergado** (después del panel): documento de autenticación y roles (I5), pruebas E2E con
Playwright (I4, I6), configuración de GitHub (I1), verificación de clon limpio (I2) y datos reales
(I3).

### Ubicación de archivos

La Persona 3 es responsable exclusiva de `frontend/src/features/panel/`. Hoy contiene un punto
de entrada temporal (`panelRoutes.tsx` + `PanelPlaceholder.tsx`) que ella sustituye. Estructura
sugerida:

```text
frontend/src/features/panel/
├── panelRoutes.tsx                     # YA EXISTE: rutas /panel/… (editar libremente)
├── PanelPlaceholder.tsx                # YA EXISTE: marcador temporal (borrar al tener el layout)
├── PanelLayout.tsx / .css              # barra lateral + encabezado
├── fuente-viva/                        # I7
├── observatorio/                       # I8
├── mocks/                              # datos sintéticos del panel
├── services/                           # acceso a datos (mocks → API)
└── types.ts                            # tipos provisionales del panel
```

Rutas propuestas (fuera de la página única pública):

| Ruta | Pantalla |
| ---- | -------- |
| `/panel` | Redirige a `/panel/observatorio` |
| `/panel/observatorio` | Resumen del Observatorio |
| `/panel/servicios` | Listado de Fuente Viva |
| `/panel/servicios/:id` | Detalle, fuentes, revisión e historial |

Las rutas hijas se declaran dentro de `panelRoutes` (por ejemplo con `children` y un
`<Outlet />` en `PanelLayout`). Como la ruta es `/panel/*`, cualquier URL del panel llega a su
código sin tocar `app/routes.tsx`.

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

Tampoco hace falta editar `frontend/src/app/routes.tsx`: ya registra `panelRoutes` como ruta
hermana de la página pública (fuera de `MainLayout`). Si su PR solo cambia archivos dentro de
`frontend/src/features/panel/`, no puede entrar en conflicto con el trabajo de Brayan ni de
Camilo.

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

El trabajo de QA completo (E2E, accesibilidad a fondo) está **postergado**. Para esta fase, el
mínimo en el PR es:

- [ ] `npm run format:check`, `lint`, `typecheck`, `test` y `build` en verde (CI en verde).
- [ ] Una prueba sencilla por vista que compruebe que se muestra (p. ej. `/panel/servicios`
      muestra la tabla y `/panel/observatorio` muestra el resumen).
- [ ] Capturas de escritorio y móvil de cada vista, junto al panel correspondiente del moodboard.
- [ ] Declaración en el PR: "Usa solo datos sintéticos; no incluye datos de personas ni de salud".
- [ ] La web pública sigue intacta: las pruebas existentes pasan sin modificarlas.

Recomendable si hay tiempo: probar las transiciones de estado (permitida y rechazada) y el
cálculo de porcentajes del Observatorio, que son lógica pura y fácil de probar.

## 8. Integración mediante pull request

Una sola rama para el panel: **`feat/panel-admin`** (detalles en
[`GIT_WORKFLOW.md`](GIT_WORKFLOW.md)).

| Paso | Qué | Cuándo |
| ---- | --- | ------ |
| 1 | Descargar `feat/panel-admin` (ya creada; parte de la rama del frontend, que trae los componentes y `panelRoutes`) | Ya |
| 2 | Abrir un PR **en borrador** (*Draft*) hacia `main` | Con el primer commit, para que el equipo vea el avance y CI lo valide |
| 3 | I7 Fuente Viva | Commits pequeños en la misma rama |
| 4 | I8 Observatorio | Ídem |
| 5 | Marcar el PR como listo (*Ready for review*) | Con las dos vistas y las evidencias de §7; revisa Brayan |
| 6 | Squash merge y borrar la rama | Tras la aprobación |
| 7 | Sustituir mocks por la API | Más adelante, en otra rama, cuando se aprueben los contratos |

Cómo empezar:

```bash
git fetch origin
git switch feat/panel-admin                   # crea la rama local a partir de origin/feat/panel-admin
cd frontend && npm install && npm run dev     # abrir http://localhost:5173/panel
```

> **Por qué la rama no sale de `main`:** cuando se creó, `main` aún no tenía el sistema visual ni
> `panelRoutes` (están en el PR `feat/frontend-identidad-inicio`). Para que `feat/panel-admin`
> no arrastre esos commits en su propio PR, **el PR del frontend debe fusionarse con
> *Create a merge commit*** (no con *squash*). Así, al hacer `git rebase origin/main`, Git
> reconoce esos commits como ya integrados y el PR del panel solo muestra el trabajo de
> Elizabeth. Si se fusionara con *squash* antes de que ella empiece, basta con recrear la rama:
> `git switch main && git pull && git branch -f feat/panel-admin main`.

Mientras trabaja, si `main` avanza:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```
