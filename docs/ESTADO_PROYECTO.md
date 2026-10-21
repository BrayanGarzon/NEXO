# Estado del proyecto

> Corte: **2026-10-21**, rama `feat/frontend-identidad-inicio` (aún no fusionada en `main`).
> Actualizar este documento en cada PR que cambie el estado de un módulo.

## Resumen

| Área | Estado |
| ---- | ------ |
| Frontend público | Primera versión navegable (página única), con datos de demostración |
| Paneles institucionales | No iniciados; plan en [`PLAN_PERSONA_3.md`](PLAN_PERSONA_3.md) |
| Backend | Solo endpoints técnicos (`/health`, `/health/db`) |
| Base de datos | PostgreSQL configurado; sin tablas de negocio |
| Contratos de negocio | Solo propuestas ([`API_CONTRACTS.md`](API_CONTRACTS.md) §3–4) |
| Pruebas E2E | No configuradas |

## Implementado

### Frontend (`frontend/`)

- **Sistema visual** según el moodboard aprobado: tokens de color (con derivados accesibles),
  tipografía (Manrope, Inter, Caveat alojadas localmente), espaciado, radios, sombras y
  componentes compartidos. Decisiones en [`DISENO_VISUAL.md`](DISENO_VISUAL.md) §9.
- **Página única** en `/` con secciones ancladas:
  - **Inicio:** hero, buscador, accesos rápidos, cuatro módulos y servicios destacados.
  - **Brújula:** 3 pasos (necesidad → cómo empezar → ruta con hasta 3 servicios); regresar y
    empezar de nuevo; ayuda inmediata (línea 123) ante "momento difícil". No diagnostica.
  - **Nexo Territorio:** búsqueda sin tildes, filtros por categoría y "solo verificados", mapa
    esquemático con marcadores, detalle del servicio, estados de carga, vacío y error con
    reintento. Estado en la URL.
  - **Espacio Pausa / Mi siguiente paso:** tarjetas "próximamente".
  - **Información:** descripción, principios y línea 123.
- **Navegación:** menú con scroll suave y sección resaltada; menú móvil; "Saltar al contenido";
  rutas antiguas redirigidas; 404.

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
| `npm test` | ✓ 40 pruebas en 11 archivos |
| `npm run build` | ✓ (JS ≈ 113 kB gzip, CSS ≈ 8 kB gzip) |
| `ruff check .` / `ruff format --check .` | ✓ |
| `pytest` | ✓ 7 pruebas (sin PostgreSQL: usan una sesión falsa) |
| Navegador real (Chrome, DevTools Protocol) | ✓ 21/21: menú y scroll, sección activa, buscador → Territorio, Brújula → detalle, rutas antiguas, 404, movimiento reducido, sin desborde a 320/390/768 px, sin errores de consola |

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
| Servicios destacados, resultados de Brújula, Territorio | Leen los datos anteriores mediante `frontend/src/services/catalog.ts` |
| Latencia simulada (350 ms) y error simulado (`?simular=error`, solo en desarrollo) | `frontend/src/services/catalog.ts`, `TerritorioSection.tsx` |

En pantalla se marcan con la etiqueta "Datos de demostración". "Servicio verificado" en estos
datos es también ficticio.

## Provisional

- Tipos del catálogo (`frontend/src/types/catalog.ts`): no son un contrato.
- Mapa de Territorio: esquema ilustrado; posiciones de marcadores en porcentaje, no coordenadas.
  En pantallas estrechas algunas etiquetas de comuna quedan bajo los marcadores.
- Ilustraciones en lugar de fotografías (hero y miniaturas).
- Paleta: valores del documento de diseño; diferencias menores con las etiquetas del moodboard
  pendientes de confirmar ([`DISENO_VISUAL.md`](DISENO_VISUAL.md) §9).
- Botones "Cómo llegar" y "Guardar" del detalle: deshabilitados.
- Estado de la API en el pie de página: visible solo en desarrollo.

## Riesgos y bloqueos

| Riesgo / bloqueo | Impacto | Acción propuesta |
| ---------------- | ------- | ---------------- |
| Contratos de API sin aprobar (B2) | Frontend y paneles no pueden integrarse con el backend | Reunión de los tres sobre `API_CONTRACTS.md` §3–4 |
| Autenticación sin definir | Los paneles no pueden publicarse | Priorizar I5 |
| CI nunca verificada en GitHub | Un PR podría fallar por diferencias de entorno (Node 22 en CI, Node 24 en local) | Revisar el primer PR |
| `main` sin protección y sin `CODEOWNERS` | Riesgo de commits directos | Tarea I1 |
| Rama de frontend con 11+ commits sin fusionar | Conflictos si otros parten de `main` antiguo | Abrir y fusionar el PR pronto |
| Archivos de otros responsables modificados en esta entrega (`README.md`, `docs/ARQUITECTURA.md`, `docs/GIT_WORKFLOW.md`, `docs/PLAN_PRUEBAS.md` → Elizabeth; `docs/API_CONTRACTS.md` → Camilo) | Requieren su aprobación | Pedir su revisión en el PR |
| Sin fotografías con licencia | La fidelidad con el moodboard queda incompleta | Conseguirlas y registrarlas en `docs/diseno/RECURSOS.md` |

## Próximos pasos recomendados

1. **Todos:** revisar y fusionar el PR del frontend; acordar los contratos (catálogo público y
   paneles).
2. **Elizabeth:** I1 (protección de `main`, `CODEOWNERS`), I5 (`PANEL_INSTITUCIONAL.md`), layout
   de panel y Observatorio/Fuente Viva con datos sintéticos; I4 (Playwright).
3. **Camilo:** B1 (modelo de datos, incluyendo fuentes y eventos de revisión) y B2 (contratos).
4. **Brayan:** fotografías con licencia, Espacio Pausa, Mi siguiente paso; apoyar al panel con
   los componentes que falten.
