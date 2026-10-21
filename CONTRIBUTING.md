# Guía de contribución

## Responsabilidades

| Integrante | Nombre         | Área                              | Carpetas principales                              |
| ---------- | -------------- | --------------------------------- | ------------------------------------------------- |
| Persona 1  | Brayan Garzón  | Frontend                          | `frontend/`                                       |
| Persona 2  | Camilo Clavijo | Backend                           | `backend/`                                        |
| Persona 3  | Elizabeth      | Integración y panel institucional | `docs/`, `.github/`, `compose.yaml`, pruebas E2E  |

La propiedad detallada de cada archivo y las tareas asignadas están en
[`docs/TAREAS.md`](docs/TAREAS.md).

- Cada integrante es responsable de revisar los PR que toquen su área.
- **La Persona 3 (Elizabeth) no modifica archivos de `frontend/` o `backend/` sin coordinarlo
  antes** con la persona responsable (issue o comentario en el PR).
- Los archivos compartidos (`docs/API_CONTRACTS.md`, `.env.example`, `compose.yaml`,
  `frontend/src/types/api.ts`, `backend/app/schemas/`) requieren la aprobación de los
  integrantes afectados.

## Flujo de trabajo

1. Crear o tomar un issue.
2. Actualizar `main` y crear una rama: `git switch -c feat/descripcion-corta`.
3. Hacer commits pequeños siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/).
4. Ejecutar lint y pruebas localmente antes de subir.
5. Abrir un pull request hacia `main` completando la plantilla.
6. Al menos **una aprobación** y CI en verde para fusionar.
7. Fusionar con **squash merge** y borrar la rama.

Detalles en [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).

## Reglas

- No subir secretos ni archivos `.env`. Toda variable nueva se documenta en `.env.example`.
- Todo cambio de contrato de API se actualiza primero en `docs/API_CONTRACTS.md`.
- Cambios visuales deben respetar la referencia gráfica aprobada
  ([`docs/DISENO_VISUAL.md`](docs/DISENO_VISUAL.md)) e incluir capturas en el PR.
- Toda funcionalidad nueva incluye pruebas.
- No añadir dependencias sin justificarlo en el PR.
