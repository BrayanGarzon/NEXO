# Frontend — NEXO JOVEN 360

Responsable: Brayan Garzón (Persona 1). Guía visual: [`docs/DISENO_VISUAL.md`](../docs/DISENO_VISUAL.md).

## Comandos

```bash
npm install
npm run dev           # http://localhost:5173
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

## Página única

La web pública es **una sola página** (`/`): el menú no cambia de pantalla, sino que desplaza la
vista a cada sección y resalta la que está visible.

| Ancla                | Sección                                                             | Estado                    |
| -------------------- | ------------------------------------------------------------------- | ------------------------- |
| `#inicio`            | Hero y los cuatro accesos principales                               | Alta fidelidad            |
| `#brujula`           | Brújula: orientación informativa en 3 pasos                         | Primera versión navegable |
| `#territorio`        | Nexo Territorio: búsqueda, filtros, destacados, ciudad 3D y detalle | Primera versión 3D        |
| `#pausa`             | Espacio Pausa: respiración guiada y ejercicios por pasos            | Primera versión funcional |
| `#mi-siguiente-paso` | Mi siguiente paso: servicios guardados (localStorage)               | Primera versión funcional |
| `#informacion`       | Qué es NEXO JOVEN 360 y línea de emergencias; la sigue el pie de página        | Lista                     |

- Las rutas antiguas (`/brujula`, `/territorio`, …) redirigen a su sección y conservan los parámetros.
- Nexo Territorio lee `?q=`, `?categoria=`, `?servicio=` y `?verificados=1` en `/`
  (p. ej. `/?servicio=demo-liga-futbol#territorio`). En desarrollo, `?simular=error` muestra el
  estado de error.
- Cualquier otra ruta muestra la página 404.
- Navegación: `app/navigation.ts` (secciones) y `app/useSectionNavigation.ts` (scroll al ancla
  respetando `prefers-reduced-motion` y sección activa con `IntersectionObserver`).
- Cada sección ocupa al menos la pantalla bajo el encabezado (`global.css`), para que al navegar
  no asome la siguiente; la última comparte esa pantalla con el pie (`--site-footer-height`,
  medido en `MainLayout`). Es solo una altura mínima: nada se recorta.
- Las animaciones de aparición (opciones de Brújula, `app/useRevealOnView.ts`) y decorativas
  solo se activan sin `prefers-reduced-motion`.

## Organización

```text
src/
├── app/            # router, rutas y navegación principal
├── components/     # sistema visual compartido (Button, Card, Tag, Chip, SearchField, …)
├── content/        # contenido estático de interfaz (categorías)
├── features/       # home (página única), brujula, territorio (+ map3d), pausa, paso, informacion, not-found
│                   # panel/ es de la Persona 3 (Fuente Viva y Observatorio)
├── layouts/        # MainLayout: encabezado, menú móvil y pie
├── mocks/          # DATOS DE DEMOSTRACIÓN (sintéticos)
├── services/       # cliente HTTP, catálogo (aún con mocks) y servicios guardados (savedServices.ts)
├── styles/         # tokens.css (único origen de valores visuales) y global.css
├── test/           # configuración y utilidades de pruebas
└── types/          # api.ts (contratos aprobados) y catalog.ts (tipos provisionales)
```

## Datos de demostración

Mientras el contrato `/api/v1/services` no esté aprobado (tarea B2), `services/catalog.ts` devuelve
los datos sintéticos de `mocks/demoServices.ts`. La interfaz los marca con la etiqueta
"Datos de demostración". Para conectar la API real (tarea F6) solo hay que cambiar la
implementación de `services/catalog.ts` y mover los tipos aprobados a `types/api.ts`.

Brújula ofrece orientación **informativa**: no hace diagnósticos, evaluaciones clínicas ni
predicción de riesgos.

## Nexo Territorio: ciudad 3D ilustrativa

`features/territorio/TerritorioMap.tsx` muestra una **ciudad 3D ilustrativa** (Three.js +
React Three Fiber, en `features/territorio/map3d/`) y usa el mapa 2D (`MapCanvas.tsx`) como
alternativa. **No es cartografía:** manzanas, río, edificios y posiciones se generan a partir
de `mapPosition` del catálogo de demostración y no representan ubicaciones, distancias ni rutas
reales; el mapa lo indica siempre.

- La lógica de negocio no cambia: filtros, búsqueda y selección viven en `TerritorioSection`
  (y en la URL). El mapa recibe los servicios ya filtrados.
- El código 3D se carga en diferido (chunk aparte) solo si hay WebGL y la sección está cerca.
  Sin WebGL, si el contexto se pierde o si la escena falla, se usa la vista 2D con aviso.
- Interacción: arrastrar desplaza; rueda (tras hacer clic en el mapa o con Ctrl/⌘) y pellizco
  con dos dedos acercan; un dedo desplaza la página. Botones para acercar, alejar, restablecer y
  cambiar a 2D. Teclado sobre el mapa: flechas, `+`/`−` y `0`. Los marcadores son botones HTML
  proyectados sobre la escena (foco, lector de pantalla, `aria-pressed`).
- Rendimiento: dibujo bajo demanda (cero fotogramas en reposo), mallas instanciadas para
  edificios, árboles, carros y faroles, recursos compartidos que se liberan al desmontar, y
  calidad baja (sin sombras, menos resolución y vegetación) en móviles y equipos modestos.
- Vista inicial (y «restablecer»): la ciudad completa con río, bosque y montañas; en pantallas
  estrechas encuadra los servicios para que los pines no se amontonen. Los controles de la
  derecha nunca tapan un servicio. El aviso sobre la rueda aparece una sola vez por visita.
- `prefers-reduced-motion`: sin vuelos de cámara, pulso ni flotación de los pines.
- Distribución determinista y pura en `map3d/cityLayout.ts` (con pruebas).

## Mi siguiente paso: almacenamiento local

`services/savedServices.ts` guarda los ids de los servicios elegidos en `localStorage`
(clave `nexo:mi-siguiente-paso:v1`). No se envía nada a ningún servidor ni se identifica a la
persona. Si el navegador bloquea el almacenamiento, la lista funciona en memoria durante la visita.
Territorio (botón "Guardar") y Mi siguiente paso comparten la lista mediante `useSavedServices`.

## Sonido ambiental

`features/sonido/` añade al layout público un control flotante de sonido ambiental. El sonido se
**genera** con la Web Audio API (`ambientEngine.ts`, sin archivos de audio; ver
`docs/diseno/RECURSOS.md`). Está apagado por defecto y solo suena tras pulsar «Sonido»; permite
pausar, reanudar, ajustar el volumen (que se recuerda) y detenerlo. En pantallas estrechas el
volumen se abre sobre el control. Al salir de la web pública (por ejemplo, al panel) se detiene.

## Espacio Pausa

Respiración cuadrada (4 s inhala, 4 s sostén, 4 s exhala, 4 s pausa; 4 ciclos) con un temporizador
basado en `Date.now()` (`features/pausa/breathing.ts`, lógica pura con pruebas). La casilla
"Reducir movimiento" (activada por defecto si el sistema lo pide) fija el círculo y muestra una
barra de progreso. Los demás ejercicios se recorren paso a paso. Son herramientas educativas de
autocuidado; no evalúan ni sustituyen la atención profesional.
