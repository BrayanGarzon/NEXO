# PLANNER — NEXO JOVEN 360
## Fase 00: Fundación del repositorio y arquitectura base

**Objetivo:** generar una base de proyecto limpia, ejecutable, documentada y preparada para el desarrollo colaborativo de NEXO JOVEN 360 por tres integrantes.

### 1. Contexto del proyecto

NEXO JOVEN 360 es una plataforma web para jóvenes de Villavicencio que facilita el acceso a información confiable sobre servicios de apoyo, recursos educativos de bienestar, actividades juveniles y canales institucionales.

La identidad visual aprobada es editorial juvenil, cálida, contemporánea y atrevida. La referencia gráfica aprobada debe conservarse como guía de diseño. No se debe sustituir por una plantilla genérica ni reinventar la identidad visual.

### 2. Alcance de esta fase

Claude Code debe preparar exclusivamente la infraestructura inicial del proyecto:

- Estructura del monorepo.
- Frontend base.
- Backend base.
- Configuración de base de datos.
- Variables de entorno de ejemplo.
- Docker Compose para desarrollo local.
- Pruebas iniciales.
- Documentación técnica.
- Convenciones de Git y colaboración.
- Contratos iniciales de integración.

No implementar todavía el producto completo, el directorio real de servicios, el mapa 3D, la autenticación definitiva, los pagos ni las funcionalidades administrativas completas.

### 3. Stack tecnológico

**Frontend**
- React.
- TypeScript.
- Vite.
- React Router.
- Gestor de paquetes npm.
- ESLint y Prettier.
- Vitest para pruebas unitarias.

**Backend**
- Python.
- FastAPI.
- Pydantic.
- SQLAlchemy.
- Alembic.
- PostgreSQL.
- Pytest.

**Infraestructura**
- Docker Compose para el entorno local.
- Archivo `.env.example`.
- `.gitignore` completo.
- Documentación de ejecución.
- GitHub como repositorio colaborativo.

Utilizar versiones estables compatibles y registrar las dependencias en los archivos correspondientes. No incorporar dependencias innecesarias.

### 4. Estructura propuesta

```text
nexo-joven-360/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── features/
│   │   ├── services/
│   │   ├── types/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   └── pyproject.toml
├── docs/
│   ├── ARQUITECTURA.md
│   ├── API_CONTRACTS.md
│   ├── DISENO_VISUAL.md
│   ├── GIT_WORKFLOW.md
│   └── PLAN_PRUEBAS.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .env.example
├── .gitignore
├── compose.yaml
├── README.md
└── CONTRIBUTING.md
```

La estructura puede ajustarse si existe una razón técnica clara. No crear módulos vacíos innecesarios ni duplicar responsabilidades entre carpetas.

### 5. Frontend mínimo

Crear una aplicación React que:

- Arranque correctamente en desarrollo.
- Tenga navegación inicial con React Router.
- Incluya una página de inicio temporal identificada como estructura base.
- Disponga de una organización clara para componentes compartidos y funcionalidades.
- Incluya una hoja de estilos global y un lugar para los tokens de diseño.
- Muestre estados de error y una página de ruta no encontrada.
- Pueda ejecutar sus pruebas y el análisis estático.

No desarrollar todavía todas las pantallas de NEXO ni generar un nuevo concepto visual.

### 6. Backend mínimo

Crear una API FastAPI que:

- Arranque correctamente.
- Exponga un endpoint de salud `GET /health`.
- Exponga la documentación OpenAPI.
- Tenga configuración centralizada mediante variables de entorno.
- Separe rutas, esquemas, modelos, servicios y acceso a datos.
- Configure SQLAlchemy y Alembic.
- Pueda conectarse a PostgreSQL desde el entorno Docker.
- Incluya pruebas básicas del endpoint de salud y de la configuración de la API.

No crear modelos de negocio definitivos sin acordar primero los contratos y requisitos.

### 7. Base de datos y Docker

Preparar PostgreSQL mediante Docker Compose.

La configuración debe permitir iniciar el entorno local, comprobar la disponibilidad de la base de datos y ejecutar las migraciones.

Incluir:
- Variables de entorno de ejemplo.
- Credenciales exclusivamente locales para desarrollo.
- Volumen persistente de base de datos.
- Healthcheck.
- Política de reinicio apropiada.
- Instrucciones para detener el entorno y consultar los registros.

No subir secretos reales al repositorio. Documentar cómo crear el archivo `.env` local.

### 8. Organización del trabajo para tres integrantes

Preparar GitHub para trabajar mediante ramas y pull requests.

**Persona 1 — Frontend**
- Responsable de la interfaz React, componentes compartidos, navegación y sistema visual.

**Persona 2 — Backend**
- Responsable de FastAPI, modelos de datos, base de datos, migraciones y contratos de API.

**Persona 3 — Integración y panel institucional**
- Responsable de integración, pruebas de extremo a extremo, documentación operativa y futuras funcionalidades administrativas, coordinando con los responsables de frontend y backend.

La tercera persona no debe modificar archivos de los otros integrantes sin coordinación. Los tres deben acordar los contratos de integración y respetar la estructura compartida.

Crear ramas de trabajo como:

- `feat/frontend-foundation`
- `feat/backend-foundation`
- `chore/repository-foundation`

No desarrollar directamente sobre `main`.

### 9. Calidad y automatización

Configurar GitHub Actions para comprobar en los pull requests:

- Instalación de dependencias del frontend.
- Lint y pruebas del frontend.
- Instalación de dependencias del backend.
- Pruebas del backend.
- Verificaciones de formato o calidad que correspondan.

Evitar flujos complejos de despliegue continuo en esta fase.

Crear una plantilla de pull request con:
- Objetivo del cambio.
- Archivos o módulos afectados.
- Pruebas realizadas.
- Capturas de pantalla cuando haya cambios visuales.
- Posibles riesgos de integración.

### 10. Documentación obligatoria

El README debe explicar:

- Propósito del proyecto.
- Tecnologías utilizadas.
- Requisitos previos.
- Instalación local.
- Configuración de variables de entorno.
- Ejecución del frontend y backend.
- Arranque de PostgreSQL.
- Ejecución de pruebas.
- Estructura de carpetas.
- Flujo de colaboración y pull requests.

Documentar también las decisiones arquitectónicas iniciales y los contratos de integración que todavía estén pendientes de aprobación.

### 11. Criterios de aceptación

La fase se considera terminada cuando:

1. El repositorio tiene una estructura coherente.
2. El frontend arranca y muestra la página base.
3. El backend arranca y responde en `/health`.
4. PostgreSQL se inicia mediante Docker Compose.
5. Las migraciones están configuradas y documentadas.
6. Las pruebas iniciales pasan.
7. GitHub Actions ejecuta las comprobaciones básicas.
8. No hay secretos ni archivos locales sensibles en el repositorio.
9. Un segundo desarrollador puede clonar el proyecto y ejecutarlo siguiendo el README.
10. Se documentan los pendientes y las decisiones que deben aprobar los tres integrantes.

### 12. Entrega final de Claude Code

Al finalizar, presentar:

- Árbol final de archivos.
- Resumen de las decisiones técnicas.
- Comandos exactos para ejecutar el proyecto.
- Resultado de las pruebas ejecutadas.
- Variables de entorno requeridas.
- Limitaciones y tareas pendientes.
- Lista de archivos creados o modificados.

No afirmar que las pruebas pasan si no se ejecutaron. No subir el código a GitHub ni realizar operaciones remotas sin autorización explícita del usuario.

**Resultado esperado:** un repositorio base funcional y mantenible, listo para ser publicado en GitHub y para que los tres integrantes desarrollen sus módulos de manera independiente.