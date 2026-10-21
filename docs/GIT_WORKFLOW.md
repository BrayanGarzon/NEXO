# Flujo de Git

Flujo simple y común para los tres integrantes. Las reglas de propiedad de archivos están en
[`TAREAS.md`](TAREAS.md).

## Reglas básicas

1. **`main` contiene solo cambios integrados y verificados.** Prohibido hacer commits directos.
2. **Cada tarea va en su propia rama** creada desde `main` actualizado.
3. **Todo entra por pull request** con CI en verde y al menos una aprobación de otra persona.
4. **No se versionan secretos ni artefactos generados**: `.env`, `node_modules/`, `frontend/dist/`,
   `.venv/`, cachés (`__pycache__/`, `.pytest_cache/`, `.ruff_cache/`), `*.tsbuildinfo`,
   `.DS_Store`. Ya están en `.gitignore`; no forzar su inclusión (`git add -f`).
5. **No se editan archivos de otra persona sin coordinarlo** (issue o comentario en su PR).

## Ramas

| Prefijo | Uso | Ejemplo |
| ------- | --- | ------- |
| `feat/` | Nueva funcionalidad | `feat/panel-fuente-viva` |
| `fix/` | Corrección de errores | `fix/scroll-anclas` |
| `chore/` | Configuración, dependencias, infraestructura | `chore/ci-playwright` |
| `docs/` | Solo documentación | `docs/panel-institucional` |
| `test/` | Solo pruebas | `test/e2e-pagina-unica` |

Ramas cortas: una tarea (un ID de `TAREAS.md` o un issue) por rama. Al fusionarse, se borran.

> Las ramas iniciales de la Fase 00 (`feat/frontend-foundation`, `feat/backend-foundation`,
> `chore/repository-foundation`) quedaron en el commit de fundación y ya no se usan como base.
> Las nuevas ramas salen siempre de `main`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/es/), en español y en imperativo:

```text
feat(frontend): agrega tarjeta de servicio
fix(backend): corrige validación de fechas
docs: actualiza contrato de actividades
chore(ci): cachea dependencias de npm
```

Commits pequeños y con un solo propósito. Antes de confirmar, revisa qué incluyes:

```bash
git status
git diff                 # cambios sin preparar
git add <archivos>       # añade solo lo tuyo; evita "git add ." si hay cambios ajenos
git diff --staged        # lo que entrará en el commit
git commit
```

## Ciclo de trabajo

```bash
# 1. Partir de main actualizado
git switch main
git pull

# 2. Crear la rama de la tarea
git switch -c feat/mi-cambio

# 3. Trabajar, ejecutar las comprobaciones y confirmar
git add <archivos>
git commit -m "feat(frontend): …"

# 4. Publicar la rama y abrir el pull request hacia main
git push -u origin feat/mi-cambio
```

Luego, en GitHub: **Compare & pull request** → base `main` → completa la plantilla.

## Mantener la rama al día con `main`

Hazlo antes de abrir el PR y cada vez que `main` avance mientras tu PR está abierto.

```bash
git fetch origin
git rebase origin/main              # reaplica tus commits sobre main
# Si la rama ya estaba publicada:
git push --force-with-lease         # nunca "--force" a secas
```

Si prefieres no reescribir la historia (o otra persona trabaja en tu rama), usa merge:

```bash
git fetch origin
git merge origin/main
git push
```

## Resolver conflictos

1. Git indica los archivos en conflicto (`git status` → *both modified*).
2. Abre cada archivo y busca las marcas `<<<<<<<`, `=======` y `>>>>>>>`. Conserva lo correcto de
   ambos lados y borra las marcas.
3. Si el conflicto está en un archivo de otra persona, **pregúntale** antes de decidir.
4. Ejecuta las comprobaciones (abajo) para confirmar que todo sigue funcionando.
5. Marca como resuelto y continúa:

```bash
git add <archivo>
git rebase --continue      # o "git commit" si usabas merge
# Para cancelar y volver al estado anterior:
git rebase --abort         # o "git merge --abort"
```

En `package-lock.json` no edites el conflicto a mano: toma la versión de `main` y regenera el
archivo con tus dependencias:

```bash
git checkout origin/main -- frontend/package-lock.json
cd frontend && npm install && cd ..
git add frontend/package-lock.json
```

## Pull requests

### Comprobaciones obligatorias

GitHub Actions ejecuta estos jobs en cada PR ([`ci.yml`](../.github/workflows/ci.yml)); deben
estar en verde. Ejecútalos también en local antes de subir:

| Job | Comandos |
| --- | -------- |
| `Frontend` | `cd frontend && npm ci && npm run format:check && npm run lint && npm run typecheck && npm test && npm run build` |
| `Backend` | `cd backend && pip install -e ".[dev]" && ruff check . && ruff format --check . && pytest`, y migraciones `alembic upgrade head → downgrade base → upgrade head` |

### Contenido del PR

- Completar la plantilla: objetivo, módulos, pruebas ejecutadas (solo las que realmente se
  ejecutaron), capturas y riesgos.
- Cambios visuales: capturas de escritorio y móvil (ver `DISENO_VISUAL.md` §7).
- Datos: indicar si se usan datos sintéticos.
- Cambios en contratos (`API_CONTRACTS.md`) o archivos compartidos: aprobación de los integrantes
  afectados.

### Revisión y fusión

- Al menos una aprobación de una persona distinta del autor.
- Fusionar con **squash merge** y borrar la rama.
- Después de fusionar, cada integrante actualiza su `main` local (`git switch main && git pull`).

## Configuración recomendada en GitHub

En *Settings → Branches → Add branch protection rule* para `main`:

- Require a pull request before merging (1 aprobación).
- Require status checks to pass: `Frontend`, `Backend`.
- Require branches to be up to date before merging.
- Do not allow bypassing the above settings.

Cuando se conozcan los usuarios de GitHub, añadir `.github/CODEOWNERS` para asignar revisores por
carpeta.
