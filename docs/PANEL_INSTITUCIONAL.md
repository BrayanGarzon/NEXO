# Panel institucional: requisitos, autenticación y roles

Documento de la tarea **I5** de [`TAREAS.md`](TAREAS.md). Reúne los requisitos del panel
institucional (Fuente Viva, Observatorio y vistas de gestión) y **propone** cómo autenticar al
personal y qué puede hacer cada rol. Es solo un documento: no hay código de autenticación todavía.

| | |
| --- | --- |
| Responsable | Elizabeth (Persona 3) |
| Estado | **Propuesta**: requiere la aprobación de Brayan y Camilo (decisión pendiente 3) |
| Relacionado | [`API_CONTRACTS.md` §4](API_CONTRACTS.md#4-paneles-institucionales-propuesta), [`MODELO_DATOS.md`](MODELO_DATOS.md), [`PLAN_PERSONA_3.md`](PLAN_PERSONA_3.md) |
| Implementación de referencia | `frontend/src/features/panel/` (datos sintéticos, sin login) |

Las palabras **debe** y **no debe** marcan requisitos. **Propuesta** marca lo que el equipo
tiene que aprobar o cambiar.

## 1. Qué es el panel y quién lo usa

El panel es la parte privada de NEXO JOVEN 360 desde la que el personal institucional mantiene
el catálogo de servicios para jóvenes de Villavicencio y vigila su calidad.

| Quién | Para qué entra |
| ----- | -------------- |
| Personal de la Secretaría de Juventud | Coordinar el catálogo, gestionar usuarios y plazos, publicar |
| Personal de instituciones aliadas | Mantener al día la información de los servicios de su institución |
| Personas que revisan | Verificar fuentes y decidir qué se publica |

**Nunca** entran personas jóvenes. El panel no tiene registro abierto: solo se accede por
invitación.

## 2. Requisitos funcionales

Estado actual: todo lo marcado como *Hecho* funciona en `feat/panel-admin` con datos sintéticos
en memoria. Falta conectarlo a la API.

| Id | Requisito | Vista | Estado |
| -- | --------- | ----- | ------ |
| RF1 | Listar servicios con búsqueda y filtros por estado y categoría | Servicios | Hecho |
| RF2 | Crear y editar servicios (nombre, categoría, institución, dirección, comuna, horario, servicios ofrecidos) | Servicios | Hecho |
| RF3 | Añadir, actualizar y quitar fuentes con tipo y fecha de consulta | Detalle de servicio | Hecho |
| RF4 | Cambiar el estado según la máquina de estados (`API_CONTRACTS.md` §4.1), con comentario | Detalle de servicio | Hecho |
| RF5 | No permitir publicar un servicio sin al menos una fuente | Detalle de servicio | Hecho |
| RF6 | Historial de revisión por servicio (quién, qué, cuándo) | Detalle de servicio | Hecho |
| RF7 | Resumen, calidad, vigencia, cobertura, incidencias, actividad y validaciones | Observatorio | Hecho |
| RF8 | Categorías con su número de servicios por estado | Categorías | Hecho |
| RF9 | Listado global de fuentes con filtros por tipo y antigüedad | Fuentes | Hecho |
| RF10 | Invitar personal, cambiar su rol y desactivarlo | Usuarios | Hecho (sin envío real) |
| RF11 | Ajustar los plazos de vigencia y antigüedad | Configuración | Hecho |
| RF12 | Iniciar y cerrar sesión; ver el propio perfil | Ingreso, menú «Admin» | Perfil y botón hechos; **sesión pendiente (este documento)** |
| RF13 | Que cada persona solo pueda hacer lo que permite su rol, **comprobado en el servidor** | Todas | Pendiente (este documento) |
| RF14 | Registrar quién hizo cada cambio con su identificador real, no con un nombre de texto | Todas | Pendiente (este documento) |

## 3. Requisitos no funcionales

| Id | Requisito |
| -- | --------- |
| RNF1 | **Privacidad.** El panel trabaja sobre servicios e instituciones. No debe guardar perfiles de jóvenes, respuestas de Brújula ni datos de salud. Del personal guarda solo nombre, correo, institución y rol. |
| RNF2 | **Habeas data.** El tratamiento de los datos del personal debe ajustarse a la Ley 1581 de 2012: finalidad informada al invitar, acceso y corrección del propio perfil, y baja a petición. |
| RNF3 | **Mínimo privilegio.** Cada rol tiene solo los permisos que necesita (§6). La interfaz oculta lo que no se puede hacer, pero **la API es la que decide**. |
| RNF4 | **Trazabilidad.** Cada cambio de servicio, fuente, usuario o configuración debe quedar registrado con autor y fecha. |
| RNF5 | **Accesibilidad.** WCAG 2.2 nivel AA, igual que la web pública: teclado completo, foco visible, contraste y etiquetas. |
| RNF6 | **Diseño adaptable.** Usable en celular, tablet y escritorio. Hoy está cubierto por las pruebas de `e2e/` en 7 tamaños. |
| RNF7 | **Datos de prueba.** En desarrollo y en pruebas solo se usan datos sintéticos, y en pantalla se marcan con «Datos de demostración». |

## 4. Autenticación: opciones

Lo que hay que resolver: cómo demuestra el personal quién es, cómo se mantiene la sesión entre
el frontend (Vite/React) y la API (FastAPI) y cómo entra la primera persona.

| Opción | Cómo funciona | A favor | En contra |
| ------ | ------------- | ------- | --------- |
| **A. Sesión en el servidor con cookie** | La API guarda las sesiones en PostgreSQL y entrega una cookie `HttpOnly` | Simple. JavaScript no puede leer la cookie. Cerrar sesión y desactivar a alguien surte efecto al instante. No añade servicios externos | Frontend y API deben compartir dominio o subdominio. Hay que protegerse de CSRF |
| B. JWT en el navegador | La API firma un token que el frontend guarda y envía en cada petición | No guarda estado en el servidor | Un token robado sirve hasta que caduca. Guardarlo en `localStorage` lo expone a XSS. Revocarlo exige una lista negra, es decir, volver a guardar estado |
| C. Proveedor externo (OIDC) | Ingreso con Google Workspace, Microsoft Entra o Keycloak de la Alcaldía | No hay que guardar contraseñas. Puede dar ingreso único con el correo institucional | Depende de que la Alcaldía tenga un proveedor y nos dé acceso. Las instituciones aliadas pueden no tener cuenta en él. Más configuración |

### Propuesta: opción A, preparada para pasar a C

1. **Sesión en el servidor con cookie.** Es lo más sencillo de hacer bien con lo que ya tenemos
   (FastAPI + PostgreSQL) y no depende de terceros.
2. Si más adelante la Alcaldía ofrece un proveedor OIDC, se añade como **otra forma de
   iniciar sesión** que termina creando la misma sesión. Roles, permisos y auditoría no
   cambian.

## 5. Detalle de la propuesta

### 5.1 Ingreso

- Ingreso con **correo y contraseña**. No hay registro abierto: solo se entra con una
  invitación (§5.3).
- Contraseñas guardadas con **Argon2id** (biblioteca `argon2-cffi`; dependencia nueva que se
  justifica en el PR). Mínimo 12 caracteres, sin reglas de composición, y se rechazan las de una
  lista de contraseñas comunes.
- El mensaje de error **no debe** revelar si el correo existe: siempre «Correo o contraseña
  incorrectos».
- **Límite de intentos:** 5 fallos seguidos por correo bloquean el ingreso 15 minutos. El
  bloqueo se registra en la auditoría.
- **Segundo factor (TOTP)**: recomendado para el rol administrador en una segunda fase; no es
  necesario para el primer piloto con datos sintéticos.

### 5.2 Sesión

| Aspecto | Propuesta |
| ------- | --------- |
| Identificador | 32 bytes aleatorios. En la base de datos se guarda **solo su hash** (SHA-256) |
| Cookie | `nexo_sesion`; `HttpOnly`, `Secure` (fuera de desarrollo), `SameSite=Lax`, `Path=/api` |
| Caducidad por inactividad | 2 horas |
| Caducidad absoluta | 12 horas (una jornada) |
| Cierre de sesión | Borra la sesión en el servidor y la cookie |
| Al desactivar a alguien o cambiarle el rol | Se cierran todas sus sesiones |
| CSRF | `SameSite=Lax` y, además, las peticiones que modifican datos (`POST`, `PATCH`, `PUT`, `DELETE`) deben llevar la cabecera `X-Requested-With: nexo-panel`; la API rechaza con 403 las que no la llevan. Un formulario de otro sitio no puede enviar esa cabecera |
| CORS | `CORS_ORIGINS` ya existe en `backend/app/core/config.py`. Para el panel se añade `allow_credentials=True`, siempre con orígenes explícitos y nunca `*` |
| Dominio | El frontend y la API deben servirse desde el mismo sitio (p. ej. `nexo…` y `api.nexo…`, o la API bajo `/api` en el mismo dominio). Depende de la decisión pendiente 6 (hosting) |

En desarrollo hoy no hay proxy: el frontend llama a la API en otro puerto
(`VITE_API_BASE_URL`). Propuesta: añadir en `frontend/vite.config.ts` un proxy `/api` → API,
coordinándolo con Brayan, para que frontend y API compartan origen como en producción.

### 5.3 Invitaciones y alta del personal

1. Un administrador invita desde la vista Usuarios (nombre, correo, institución y rol). La
   cuenta queda **pendiente**, sin contraseña.
2. La API crea un **enlace de un solo uso** que caduca a las **72 horas**. En la base de datos
   se guarda solo el hash del token.
3. **Primera fase, sin servicio de correo:** la API devuelve el enlace y el administrador lo
   copia y lo envía por el canal institucional. **Más adelante:** se envía por correo cuando se
   decida el proveedor (va con la decisión pendiente 6).
4. La persona abre el enlace, lee la finalidad del tratamiento de sus datos (RNF2), elige su
   contraseña y entra.
5. **Restablecer la contraseña** sigue el mismo flujo: un administrador genera un enlace nuevo.
   No hay restablecimiento por cuenta propia hasta que exista el envío de correo.

**Primer administrador:** se crea con una orden de consola en el servidor
(`python -m app.cli crear-admin --correo …`) que imprime el enlace de invitación. Así no hay
usuarios ni contraseñas por defecto en el código ni en las migraciones.

### 5.4 Respuestas de la API

| Situación | Código | Cuerpo (formato de `API_CONTRACTS.md` §1) |
| --------- | ------ | ----------------------------------------- |
| Sin sesión o sesión caducada | 401 | `{ "detail": "Sesión no válida" }` |
| Con sesión, pero el rol no lo permite | 403 | `{ "detail": "No tienes permiso para esta acción" }` |
| Falta la cabecera anti-CSRF | 403 | `{ "detail": "Petición no permitida" }` |
| Demasiados intentos de ingreso | 429 | `{ "detail": "Demasiados intentos. Prueba en 15 minutos" }` |

Ante un 401, el frontend lleva a `/panel/ingresar` y, tras ingresar, vuelve a la página donde
estaba.

## 6. Roles y permisos

Tres roles. Coinciden con los que ya muestra la vista Usuarios
(`frontend/src/features/panel/usuarios/permisos.ts`).

| Rol | Para quién | En una frase |
| --- | ---------- | ------------ |
| `administrador` | Coordinación en la Secretaría de Juventud | Gestiona usuarios, configuración y todo el catálogo |
| `editor` | Personal de cada institución | Crea y edita servicios y fuentes, y los envía a revisión |
| `revisor` | Quien verifica la información | Revisa y decide si se publica, se devuelve o deja de estar vigente |

### 6.1 Matriz

| Acción | Administrador | Editor | Revisor |
| ------ | :-----------: | :----: | :-----: |
| Ver el panel, el Observatorio, Categorías y Fuentes | ✓ | ✓ | ✓ |
| Crear y editar servicios | ✓ | ✓ ¹ | — |
| Añadir, quitar y actualizar fuentes | ✓ | ✓ ¹ | — |
| Enviar a revisión | ✓ | ✓ ¹ | — |
| Publicar, devolver o marcar como no vigente | ✓ ² | — | ✓ ² |
| Invitar, cambiar el rol y desactivar personal | ✓ | — | — |
| Cambiar la configuración (plazos) | ✓ | — | — |
| Ver y corregir el propio perfil; cerrar sesión | ✓ | ✓ | ✓ |

¹ **Propuesta: solo en servicios de su propia institución.** Así una institución aliada no
puede cambiar la información de otra. Para eso, cada usuario y cada servicio se enlazan con una
fila de `entities` (§7).

² **Propuesta: principio de cuatro ojos.** Nadie puede publicar un cambio que envió a revisión
él mismo. Si el equipo es pequeño y esto bloquea el trabajo, se puede permitir al administrador
publicar lo suyo con un comentario obligatorio, que queda en el historial.

### 6.2 Reglas

- Cada persona tiene **un solo rol**. Si alguien necesita editar y revisar, se le da
  `administrador` o se crean dos cuentas. Propuesta: un solo rol, para que la matriz se
  mantenga simple.
- Debe quedar **al menos un administrador activo**. La API rechaza quitar el rol o desactivar al
  último.
- Un administrador no puede desactivarse a sí mismo.
- Los permisos se comprueban **en cada endpoint** con una dependencia de FastAPI, p. ej.
  `Depends(requiere("servicios:publicar"))`. La interfaz usa `GET /api/v1/auth/me` solo para
  ocultar botones.

## 7. Cambios propuestos al modelo y a la API

Siguen las convenciones de [`MODELO_DATOS.md`](MODELO_DATOS.md): nombres en inglés y
`snake_case`, UUID como texto, `created_at`/`updated_at` y vocabularios como texto validado en
Pydantic. **Esto difiere del borrador de `API_CONTRACTS.md` §4.1, que usa nombres en español:**
es el punto 1 de §4.4 y conviene cerrarlo junto con este documento.

### 7.1 Tablas nuevas

```text
staff_users                         (personal institucional)
  id               uuid
  name             text
  email            text, único, en minúsculas
  entity_id        uuid → entities.id      institución a la que pertenece
  role             "administrador" | "editor" | "revisor"
  status           "pendiente" | "activo" | "inactivo"
  password_hash    text | null             null mientras la invitación está pendiente
  failed_logins    integer                 se pone a 0 al ingresar
  locked_until     timestamptz | null
  last_login_at    timestamptz | null
  created_at, updated_at

staff_sessions
  id               uuid
  user_id          uuid → staff_users.id
  token_hash       text, único             SHA-256 del valor de la cookie
  expires_at       timestamptz             caducidad absoluta
  last_seen_at     timestamptz             para la caducidad por inactividad
  created_at

staff_invitations
  id               uuid
  user_id          uuid → staff_users.id
  token_hash       text, único
  expires_at       timestamptz
  used_at          timestamptz | null
  created_by       uuid → staff_users.id
  created_at

audit_events                        (amplía EventoRevision a todo el panel)
  id               uuid
  actor_id         uuid → staff_users.id
  action           texto (vocab): "login", "login_fallido", "logout", "usuario_invitado",
                   "rol_cambiado", "usuario_desactivado", "configuracion_cambiada", …
  target_type      "service" | "source" | "staff_user" | "settings" | null
  target_id        uuid | null
  detail           jsonb | null            p. ej. { "rol_anterior": "editor", "rol_nuevo": "revisor" }
  created_at
```

**Lo que no se guarda:** ni la IP ni el navegador de cada sesión, salvo que se apruebe para
investigar incidentes (RNF1). Los eventos de revisión de servicios (`EventoRevision`) pueden
quedar en su propia tabla o como `audit_events` con `target_type = "service"`. Eso lo decide
Camilo en el modelo.

`services` ya tiene `entity_id`, pero es opcional. Para limitar a los editores a su
institución (§6.1 ¹), un servicio gestionado desde el panel debe tenerlo. Además, se añade
`updated_by uuid → staff_users.id` en lugar del texto `actualizado_por` del borrador, lo que
resuelve RF14.

### 7.2 Endpoints nuevos

| Método y ruta | Uso | Quién |
| ------------- | --- | ----- |
| `POST /api/v1/auth/login` | `{ email, password }` → crea la sesión (cookie) y devuelve el perfil | Público |
| `POST /api/v1/auth/logout` | Cierra la sesión actual | Con sesión |
| `GET /api/v1/auth/me` | Perfil y lista de permisos: `{ id, name, email, entity, role, permissions: [...] }` | Con sesión |
| `PATCH /api/v1/auth/me` | Corregir el propio nombre | Con sesión |
| `GET /api/v1/auth/invitations/{token}` | Comprueba el enlace y devuelve nombre y correo | Público |
| `POST /api/v1/auth/invitations/{token}` | `{ password }` → activa la cuenta e inicia sesión | Público |
| `GET /api/v1/admin/users` | Listado con filtros (`role`, `status`, `q`) | Administrador |
| `POST /api/v1/admin/users` | Invitar; devuelve el enlace en la primera fase | Administrador |
| `PATCH /api/v1/admin/users/{id}` | Cambiar `role` o `status` | Administrador |
| `POST /api/v1/admin/users/{id}/invitation` | Generar un enlace nuevo (reenvío o restablecer contraseña) | Administrador |
| `GET /api/v1/admin/settings` · `PUT /api/v1/admin/settings` | Plazos de la vista Configuración | Todos leen · Administrador escribe |

Todas las rutas `/api/v1/admin/…` de `API_CONTRACTS.md` §4.2 y §4.3 pasan a exigir sesión.

## 8. Cambios en el frontend

Todo queda dentro de `frontend/src/features/panel/`, sin tocar la web pública:

1. Nueva ruta `/panel/ingresar` y página para aceptar la invitación, `/panel/invitacion/:token`.
2. Un guardián en `PanelLayout` que consulta `GET /auth/me`. Si recibe 401, lleva al ingreso.
3. Un contexto de sesión que sustituye `PERFIL_DEMO` en el menú «Admin». «Cerrar sesión» llama
   a `POST /auth/logout`; hoy solo lleva al inicio.
4. `services/panelData.ts` pasa a usar `fetch` con `credentials: 'include'` y la cabecera
   anti-CSRF.
5. Los botones de acciones no permitidas se ocultan según `permissions`. La matriz de la vista
   Usuarios pasa de ser «provisional» a leerse de la API.

## 9. Fuera de alcance

- Registro abierto o ingreso de personas jóvenes.
- Ingreso con redes sociales.
- Métricas de uso del panel por persona.
- Varios roles por persona y roles personalizados.

## 10. Decisiones que debe aprobar el equipo

| # | Decisión | Propuesta | Quién |
| - | -------- | --------- | ----- |
| 1 | Mecanismo de autenticación (decisión pendiente 3) | Sesión en el servidor con cookie (§4) | Los tres |
| 2 | Idioma de campos del panel (`API_CONTRACTS.md` §4.4.1) | Inglés, como el catálogo ya implementado | Camilo y Elizabeth |
| 3 | Editores limitados a su institución | Sí (§6.1 ¹) | Los tres |
| 4 | Principio de cuatro ojos al publicar | Sí, con excepción para el administrador y comentario obligatorio (§6.1 ²) | Los tres |
| 5 | Caducidad de la sesión | 2 h de inactividad, 12 h absoluta | Elizabeth y Camilo |
| 6 | Invitación sin correo en la primera fase | El administrador copia el enlace | Los tres |
| 7 | Segundo factor para administradores | En una segunda fase | Los tres |
| 8 | Dependencia `argon2-cffi` | Sí | Camilo |
| 9 | Mismo sitio para frontend y API | Sí; se concreta con la decisión pendiente 6 (hosting) | Los tres |

## 11. Orden de implementación sugerido

| Paso | Qué | Quién |
| ---- | --- | ----- |
| 1 | Aprobar este documento y cerrar §4.4 de `API_CONTRACTS.md` | Los tres |
| 2 | Tablas `staff_users`, `staff_sessions`, `staff_invitations` y `audit_events`; migración | Camilo |
| 3 | `/api/v1/auth/*`, orden `crear-admin` y dependencia `requiere(permiso)` con pruebas | Camilo, con revisión de Elizabeth |
| 4 | Ingreso, invitación, guardián y contexto de sesión en el panel | Elizabeth |
| 5 | Proteger `/api/v1/admin/*` y conectar Fuente Viva y Observatorio a la API | Camilo y Elizabeth |
| 6 | Pruebas de extremo a extremo: ingreso, permiso denegado y cierre de sesión (tarea I6) | Elizabeth |
