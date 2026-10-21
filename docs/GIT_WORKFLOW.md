# Flujo de Git

## Ramas

- `main`: siempre estable y desplegable. **Prohibido hacer commits directos.**
- Ramas de trabajo cortas creadas desde `main`:

| Prefijo | Uso | Ejemplo |
| ------- | --- | ------- |
| `feat/` | Nueva funcionalidad | `feat/frontend-foundation` |
| `fix/` | Corrección de errores | `fix/health-cors` |
| `chore/` | Configuración, dependencias, infraestructura | `chore/repository-foundation` |
| `docs/` | Solo documentación | `docs/api-contracts` |
| `test/` | Solo pruebas | `test/e2e-home` |

Ramas iniciales de la Fase 00:

- `chore/repository-foundation` — estructura, CI y documentación (Camila).
- `feat/frontend-foundation` — trabajo de frontend sobre la base (Brayan Garzón).
- `feat/backend-foundation` — trabajo de backend sobre la base (Camilo Clavijo).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/es/), en español, en imperativo:

```text
feat(frontend): agrega tarjeta de servicio
fix(backend): corrige validación de fechas
docs: actualiza contrato de actividades
chore(ci): cachea dependencias de npm
```

## Ciclo de trabajo

```bash
git switch main
git pull
git switch -c feat/mi-cambio
# ... trabajo y commits ...
git fetch origin
git rebase origin/main            # mantener la rama al día
git push -u origin feat/mi-cambio
# abrir el pull request en GitHub
```

## Pull requests

- Completar la plantilla (objetivo, módulos, pruebas, capturas, riesgos).
- CI en verde y al menos una aprobación de otro integrante.
- Cambios en archivos compartidos o contratos: aprobación de los integrantes afectados.
- Fusionar con **squash merge**; borrar la rama al terminar.

## Configuración recomendada en GitHub

En *Settings → Branches → Add branch protection rule* para `main`:

- Require a pull request before merging (1 aprobación).
- Require status checks to pass: `Frontend`, `Backend`.
- Require branches to be up to date before merging.
- Do not allow bypassing the above settings.

Cuando se conozcan los usuarios de GitHub, añadir `.github/CODEOWNERS` para asignar
revisores automáticamente por carpeta.
