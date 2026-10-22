# Estado del proyecto

> Corte: **2026-10-21**. La primera versión del frontend ya está en `main` (PR #4); este
> documento describe además la iteración visual siguiente, todavía sin fusionar.
> Actualizar este documento en cada PR que cambie el estado de un módulo.
>
> **Para revisión:** las filas de Backend, Paneles y Pruebas E2E se actualizaron a partir del
> historial de `main` y de `origin/feat/panel-admin`; Camilo y Elizabeth deben confirmarlas.

## Resumen

| Área | Estado |
| ---- | ------ |
| Frontend público | Primera versión navegable (página única), con datos de demostración |
| Paneles institucionales | Entrada `/panel` en `main` (PR #3); Fuente Viva y Observatorio con datos sintéticos en `feat/panel-admin`, sin fusionar ([`PLAN_PERSONA_3.md`](PLAN_PERSONA_3.md)) |
| Backend | API v1 de solo lectura, modelo, migración y datos semilla (B1–B6, PR #5); el frontend aún no la consume (F5/F6) |
| Base de datos | Tablas de negocio con migración Alembic (PR #5) |
| Contratos de negocio | [`API_CONTRACTS.md`](API_CONTRACTS.md) redactado (B2); pendiente de aprobación de los tres |
| Pruebas E2E | Playwright (diseño adaptable del panel) en `feat/panel-admin`, sin fusionar |

## Implementado

### Frontend (`frontend/`)

- **Sistema visual** según el moodboard aprobado: tokens de color (con derivados accesibles),
  tipografía (Manrope, Inter, Caveat alojadas localmente), espaciado, radios, sombras y
  componentes compartidos. Decisiones en [`DISENO_VISUAL.md`](DISENO_VISUAL.md) §9.
- **Página única** en `/` con secciones ancladas:
  - **Inicio:** hero, buscador, accesos rápidos y los cuatro módulos, visibles completos en la
    primera pantalla de escritorio (de 600 a 1080 px de alto; el título y la ilustración se
    ajustan a la altura de la ventana).
  - **Brújula:** 3 pasos (necesidad → cómo empezar → ruta con hasta 3 servicios); regresar y
    empezar de nuevo; ayuda inmediata (línea 123) ante "momento difícil". No diagnostica.
    Opciones más amplias, aparición escalonada al entrar en pantalla, realce al pasar el cursor
    (solo con puntero) y selección marcada con color, borde e icono de verificación.
  - **Nexo Territorio:** búsqueda sin tildes, filtros por categoría y "solo verificados",
    servicios destacados (con "Ver todos" al listado completo), mapa esquemático con
    marcadores, detalle del servicio, estados de carga, vacío y error con reintento. Estado en
    la URL.
  - **Espacio Pausa:** respiración guiada (4 ciclos de 16 s con fases anunciadas a lectores de
    pantalla), pausa, reinicio, opción "Reducir movimiento" y cuatro ejercicios por pasos
    (sonidos, estiramiento, consejos, gratitud). Educativo, no clínico.
  - **Mi siguiente paso:** guardar y quitar servicios desde el detalle de Territorio; lista con
    "Ver" y "Quitar"; pestaña de acciones sugeridas; estado vacío ilustrado (maceta con brote)
    y detalles botánicos decorativos. Persistencia en `localStorage` (solo en el navegador).
  - **Información:** descripción, principios y línea 123 integrada con el estilo visual; la
    sección y el pie comparten la última pantalla.
- **Navegación:** menú con scroll suave y sección resaltada; menú móvil; "Saltar al contenido";
  rutas antiguas redirigidas; 404. Cada sección ocupa al menos la pantalla bajo el encabezado,
  para que al navegar no asome la siguiente.
- **Sonido ambiental opcional:** control flotante en la web pública (no en los paneles).
  Apagado por defecto; suena solo tras pulsar «Sonido»; pausa, reanudación, volumen (se
  recuerda) y detención inmediata. El sonido se **genera** con la Web Audio API (brisa suave),
  sin archivos de audio ni licencias de terceros (ver
  [`diseno/RECURSOS.md`](diseno/RECURSOS.md)).

### Backend (`backend/`)

- FastAPI con configuración centralizada, CORS, `GET /health` y `GET /health/db`.
- SQLAlchemy y Alembic configurados; migración `0001` vacía.

### Infraestructura

- Docker Compose (`db`, `backend`, `frontend`) con *hot reload*.
- GitHub Actions: jobs `Frontend` y `Backend`.
- Plantillas de PR e issues.

## Verificado (2026-10-21, en local)

| Comprobación | Resultado |
| ------------ | --------- |
| `npm run format:check` | ✓ |
| `npm run lint` | ✓ |
| `npm run typecheck` | ✓ |
| `npm test` | ✓ 77 pruebas en 19 archivos |
| `npm run build` | ✓ (JS ≈ 113 kB gzip, CSS ≈ 8 kB gzip) |
| `ruff check .` / `ruff format --check .` | ✓ |
| `pytest` | ✓ 7 pruebas (sin PostgreSQL: usan una sesión falsa) |
| Navegador real (Chrome, DevTools Protocol) | ✓ 21/21: menú y scroll, sección activa, buscador → Territorio, Brújula → detalle, rutas antiguas, 404, movimiento reducido, sin desborde a 320/390/768 px, sin errores de consola |

Iteración posterior (misma fecha): verificación en Chrome de Escape en el menú móvil, cero
solapamientos de etiquetas del mapa en 120 combinaciones (12 anchos de 320 a 1440 px × sin
selección y cada uno de los 9 servicios seleccionados), Espacio Pausa en tiempo real (fases,
pausa, reducir movimiento, pasos), Mi siguiente paso (guardar, persistir tras recargar, quitar,
ver) y sin scroll horizontal a 320/390 px.

Iteración visual (misma fecha, sin fusionar): `format:check`, `lint`, `typecheck`, 94 pruebas
en 22 archivos y `build` correctos. En Chrome real: los cuatro accesos de Inicio completos de
1080 a 600 px de alto; navegación del menú a las seis secciones a 1440, 1280, 768, 390 y 320 px
(cada sección a 80 px del borde, la siguiente fuera de pantalla, menú resaltado, sin scroll
horizontal); Brújula con ratón y teclado; Mi siguiente paso vacío y con servicios; sonido
(ningún contexto de audio sin interacción, activación con clic real, pausa, reanudación,
volumen, continuidad al navegar, detención al ir al panel, vuelve apagado); y "reducir
movimiento" sin animaciones y con salto instantáneo.

Durante esta verificación se detectaron y corrigieron tres fallos de navegación: desfase de
95 px al llegar a una sección, resaltado incorrecto de "Mi siguiente paso" y menú sin resaltar
tras redirigir una ruta antigua. Además, el scroll ahora espera a que carguen las fuentes.

## No verificado

| Qué | Motivo |
| --- | ------ |
| `docker compose up` completo y `GET /health/db` con PostgreSQL real | Docker no estaba en ejecución en esta sesión |
| Migraciones `upgrade → downgrade → upgrade` | Requieren PostgreSQL; solo se ejecutan en CI |
| Resultado de GitHub Actions | No se ha publicado la rama; nunca se ha confirmado una ejecución de CI en GitHub |
| Navegadores distintos de Chrome (Safari, Firefox) y dispositivos reales | Solo se usó Chrome con emulación de viewport |
| Lectores de pantalla | No se probaron con VoiceOver/NVDA |
| Revisión visual del equipo frente al moodboard | Pendiente de aprobación humana |

## Datos sintéticos

| Qué | Dónde |
| --- | ----- |
| 9 servicios de ejemplo (nombres, instituciones, direcciones y horarios ficticios) | `frontend/src/mocks/demoServices.ts` |
| Servicios destacados y listado de Territorio, resultados de Brújula, Mi siguiente paso | Leen los datos anteriores mediante `frontend/src/services/catalog.ts` |
| Latencia simulada (350 ms) y error simulado (`?simular=error`, solo en desarrollo) | `frontend/src/services/catalog.ts`, `TerritorioSection.tsx` |

En pantalla se marcan con la etiqueta "Datos de demostración". "Servicio verificado" en estos
datos es también ficticio.

## Provisional

- Tipos del catálogo (`frontend/src/types/catalog.ts`): no son un contrato.
- Mapa de Territorio: esquema ilustrado; posiciones de marcadores en porcentaje, no coordenadas.
  Las etiquetas de comuna tienen posiciones calculadas para no solaparse con los marcadores
  actuales: si cambian los mocks, hay que recalcularlas (`MapCanvas.tsx`).
- Ilustraciones en lugar de fotografías (hero y miniaturas).
- Paleta: valores del documento de diseño; diferencias menores con las etiquetas del moodboard
  pendientes de confirmar ([`DISENO_VISUAL.md`](DISENO_VISUAL.md) §9).
- Botón "Cómo llegar" del detalle: deshabilitado hasta tener direcciones reales.
- "Sonidos de la naturaleza" (Espacio Pausa) sigue siendo una escucha guiada sin audio: no hay
  grabaciones con licencia. El sonido ambiental del layout es generado, no una grabación.
- Estado de la API en el pie de página: visible solo en desarrollo.

## Riesgos y bloqueos

| Riesgo / bloqueo | Impacto | Acción propuesta |
| ---------------- | ------- | ---------------- |
| Contratos de API sin aprobar (B2) | Frontend y paneles no pueden integrarse con el backend | Reunión de los tres sobre `API_CONTRACTS.md` §3–4 |
| Autenticación sin definir | Los paneles no pueden publicarse | Priorizar I5 |
| CI nunca verificada en GitHub | Un PR podría fallar por diferencias de entorno (Node 22 en CI, Node 24 en local) | Revisar el primer PR |
| `main` sin protección y sin `CODEOWNERS` (I1 postergada) | Riesgo de commits directos | Activar la protección de `main` en GitHub aunque I1 completa espere (5 minutos, *Settings → Branches*) |
| Iteración visual del frontend y `feat/panel-admin` sin fusionar | Conflictos si otros parten de `main` antiguo | Abrir y fusionar ambos PR pronto (con *merge commit*) |
| Archivos de otros responsables modificados en la iteración visual (`README.md`, `docs/ARQUITECTURA.md`, `docs/PLAN_PRUEBAS.md` → Elizabeth) y filas de estado de Backend/Paneles/E2E en este documento | Requieren su aprobación | Pedir su revisión en el PR |
| Sin fotografías con licencia | La fidelidad con el moodboard queda incompleta | Conseguirlas y registrarlas en `docs/diseno/RECURSOS.md` |

## Próximos pasos recomendados

1. **Todos:** revisar y fusionar el PR de la iteración visual del frontend; aprobar los
   contratos (B2) para conectar el catálogo público y los paneles.
2. **Elizabeth:** I7 Fuente Viva e I8 Observatorio con datos sintéticos en `feat/panel-admin`
   (prioridad). I1–I6 (GitHub, datos reales, QA, E2E, autenticación) quedan para después.
3. **Camilo:** B1 (modelo de datos, incluyendo fuentes y eventos de revisión) y B2 (contratos).
4. **Brayan:** PR de la iteración visual; aprobación de la paleta y fotografías con licencia
   (F1, F4); apoyar al panel con los componentes que falten. F5/F6 pueden empezar cuando se
   apruebe el contrato B2 (la API v1 ya está en `main`); el mapa 3D sigue pendiente de decisión.
