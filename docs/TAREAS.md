# Asignación de tareas — Fase 01

Reparto de trabajo entre los tres integrantes después de la Fase 00 (fundación).
El objetivo es que **nadie edite los mismos archivos que otra persona al mismo tiempo**:
cada archivo o carpeta tiene un único responsable, y lo que se comparte se hace mediante
entregables (documentos, contratos, datos) que el resto solo lee.

## Equipo

| Rol | Integrante | Rama base |
| --- | ---------- | --------- |
| Persona 1 — Frontend | **Brayan Garzón** | `feat/frontend-foundation` |
| Persona 2 — Backend | **Camilo Clavijo** | `feat/backend-foundation` |
| Persona 3 — Integración y panel institucional | **Elizabeth** | `chore/repository-foundation` |

## Propiedad de archivos

Solo el responsable modifica estos archivos. Si otra persona necesita un cambio, abre un
issue o lo pide en el PR del responsable; no lo edita directamente.

| Archivos / carpetas | Responsable |
| ------------------- | ----------- |
| `frontend/**` | Brayan |
| `docs/DISENO_VISUAL.md`, `docs/diseno/**` | Brayan |
| `backend/**` | Camilo |
| `docs/API_CONTRACTS.md`, `docs/MODELO_DATOS.md` | Camilo (redacta; aprueban los tres) |
| `.github/**`, `compose.yaml`, `.env.example` | Elizabeth |
| `e2e/**` (pruebas de extremo a extremo) | Elizabeth |
| `docs/contenido/**` (datos reales de servicios) | Elizabeth |
| `README.md`, `CONTRIBUTING.md`, `docs/ARQUITECTURA.md`, `docs/GIT_WORKFLOW.md`, `docs/PLAN_PRUEBAS.md`, `docs/PANEL_INSTITUCIONAL.md`, `docs/TAREAS.md` | Elizabeth |

> Variables de entorno nuevas: quien las necesite las pide en un issue, y Elizabeth las
> añade a `.env.example` y `compose.yaml`. Así esos archivos nunca se editan desde dos ramas.

## Tareas

Cada tarea se trabaja en su propia rama (`feat/…`, `fix/…`, `docs/…`) creada desde `main`
y se integra con un pull request. Los identificadores (F1, B1, I1…) se usan en los nombres
de los issues y de los PR.

### Brayan Garzón — Frontend

| ID | Tarea | Archivos | Depende de |
| -- | ----- | -------- | ---------- |
| F1 | Incorporar la referencia gráfica aprobada a `docs/diseno/` y definir los tokens definitivos (color, tipografía, espaciado) | `docs/diseno/`, `docs/DISENO_VISUAL.md`, `frontend/src/styles/tokens.css` | — |
| F2 | Layout definitivo: encabezado, navegación y pie de página adaptables y accesibles | `frontend/src/layouts/`, `frontend/src/styles/global.css` | F1 |
| F3 | Componentes compartidos: botón, tarjeta, etiqueta y estados de carga / vacío / error, con pruebas | `frontend/src/components/` | F1 |
| F4 | Página de inicio con contenido estático según la referencia | `frontend/src/features/home/` | F2, F3 |
| F5 | Pantallas de listado y detalle de servicios usando datos simulados (*mocks*) que respeten el contrato | `frontend/src/features/services/`, `frontend/src/app/routes.tsx` | B2 aprobado |
| F6 | Tipos y cliente de la API según los contratos aprobados; sustituir los *mocks* por la API real | `frontend/src/types/api.ts`, `frontend/src/services/` | B2 aprobado, B4 |

### Camilo Clavijo — Backend

| ID | Tarea | Archivos | Depende de |
| -- | ----- | -------- | ---------- |
| B1 | Proponer el modelo de datos (servicios, recursos, actividades, canales, entidades) | `docs/MODELO_DATOS.md` | I3 (datos de ejemplo) |
| B2 | Redactar los contratos de API v1 (campos, paginación, errores, fechas) y pedir aprobación a los tres | `docs/API_CONTRACTS.md` | B1 |
| B3 | Modelos SQLAlchemy, esquemas Pydantic y migraciones Alembic | `backend/app/models/`, `backend/app/schemas/`, `backend/migrations/` | B2 aprobado |
| B4 | Endpoints de solo lectura `/api/v1/…` con paginación y pruebas | `backend/app/api/`, `backend/app/services/`, `backend/tests/` | B3 |
| B5 | Script de datos semilla para desarrollo que carga los datos de `docs/contenido/` | `backend/app/db/seed.py` | B3, I3 |
| B6 | Manejo de errores uniforme y validación según el contrato | `backend/app/core/`, `backend/app/main.py` | B2 aprobado |

### Elizabeth — Integración y panel institucional

| ID | Tarea | Archivos | Depende de |
| -- | ----- | -------- | ---------- |
| I1 | Configurar GitHub: invitar colaboradores, proteger `main`, crear etiquetas, crear un issue por cada tarea de este documento y añadir `CODEOWNERS` | `.github/` | — |
| I2 | Comprobar la puesta en marcha desde un clon limpio siguiendo el README y corregir la documentación | `README.md`, `CONTRIBUTING.md` | — |
| I3 | Recopilar información real de servicios de apoyo, recursos, actividades y canales de Villavicencio en formato estructurado (JSON o CSV) con fuente y fecha | `docs/contenido/` | — |
| I4 | Configurar pruebas de extremo a extremo (propuesta: Playwright) y su job en CI; primera prueba: la página de inicio carga | `e2e/`, `.github/workflows/` | — |
| I5 | Requisitos del panel institucional y propuesta de autenticación y roles (solo documento, sin código) | `docs/PANEL_INSTITUCIONAL.md` | — |
| I6 | Pruebas de extremo a extremo del flujo de servicios cuando frontend y backend estén conectados | `e2e/` | F6, B4 |

## Orden sugerido

```text
Etapa 1 (en paralelo, sin dependencias)
  Brayan: F1 → F2, F3      Camilo: espera I3 y avanza B1      Elizabeth: I1, I2, I3, I4, I5

Etapa 2 (contratos)
  Camilo: B2  ──►  revisión y aprobación de los tres
  Brayan: F4                Elizabeth: revisa B2 y lo contrasta con I3 e I5

Etapa 3 (implementación en paralelo sobre el contrato aprobado)
  Brayan: F5 (con mocks)    Camilo: B3 → B4, B5, B6         Elizabeth: mantiene CI y e2e

Etapa 4 (integración)
  Brayan: F6                Elizabeth: I6                       Camilo: corrige lo que detecten las pruebas
```

## Puntos de coordinación

- **Contrato de API (B2):** es el único punto en el que deben estar de acuerdo los tres. Hasta
  que se apruebe, el frontend trabaja con *mocks* y el backend no crea endpoints de negocio.
- **Datos reales (I3 → B1, B5):** Elizabeth entrega los datos y Camilo solo los lee; si falta un
  campo, Camilo abre un issue en lugar de editar `docs/contenido/`.
- **Cambios en archivos ajenos:** se piden con un issue que mencione al responsable.
- **Revisión de PR:** cada PR lo revisa al menos una persona distinta del autor; los PR que
  afectan el contrato los aprueban los tres.
