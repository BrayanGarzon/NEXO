# Mapa 3D de Villavicencio (beta) — Unreal Engine

Feature `feat/mapa-3d-unreal`. Propuesta para la **decisión pendiente n.º 7** de
`docs/ARQUITECTURA.md` (mapa 3D: tecnología y fuente de datos geográficos). Estado: **beta**.

## Cómo se conecta Unreal con NEXO

Unreal ya no exporta a la web (HTML5 se retiró en UE 4.24), así que el mapa se ve en el
navegador mediante **Pixel Streaming**: Unreal se ejecuta en una máquina con GPU y envía
el video por WebRTC; el navegador devuelve clics y mensajes.

```text
┌──────────── Navegador (React / Vite) ────────────┐
│ Sección Territorio                               │
│  └─ <MapaUnreal/>  ← lib-pixelstreamingfrontend  │
│        ▲ video WebRTC      │ emitUIInteraction   │
└────────┼───────────────────┼─────────────────────┘
         │                   ▼
   Servidor de señalización (Wilbur, Node, puerto 80/8888)
         ▲
         │
┌────────┴──────── Unreal Engine 5.8 ──────────────┐
│ Cesium for Unreal → terreno + edificios OSM      │
│ Marcadores (CesiumGlobeAnchor) por lat/lng       │
│ Módulo HTTP → GET /api/v1/services, /activities  │
└──────────────────────────────────────────────────┘
         │
         ▼
  Backend FastAPI (ya expone latitude / longitude)
```

- **Datos geográficos**: plugin gratuito **Cesium for Unreal** con *Cesium World Terrain* y
  *Cesium OSM Buildings* (cobertura mundial, incluye Villavicencio). Las *Google
  Photorealistic 3D Tiles* son opcionales: verificar su cobertura en la ciudad antes de usarlas.
- **Origen del georreferenciador** (`CesiumGeoreference`): latitud `4.1420`, longitud
  `-73.6266`, altura ≈ `467 m` (centro de Villavicencio).
- **Marcadores**: Unreal lee los servicios y actividades del backend (ya tienen
  `latitude`/`longitude`; los que vienen en `null` no se dibujan) y crea un actor por punto.
- **Animaciones beta**: vuelo de cámara al seleccionar un servicio, marcadores con pulso y
  recorrido inicial sobre la ciudad (Sequencer).

## Protocolo de mensajes navegador ↔ Unreal (borrador)

JSON enviado con `emitUIInteraction` (navegador → Unreal):

```json
{ "type": "focus_service", "service_id": "<uuid>" }
{ "type": "filter", "category": "salud", "verified_only": true }
{ "type": "reset_camera" }
```

JSON enviado con *Send Pixel Streaming Response* (Unreal → navegador):

```json
{ "type": "ready" }
{ "type": "service_selected", "service_id": "<uuid>" }
```

Los campos siguen las convenciones de la API (snake_case, UUID).

## Requisitos

| Requisito | Estado en el equipo de Camilo (2026-10-21) |
| --------- | ------------------------------------------ |
| Unreal Engine **5.8** (Epic Games Launcher) | ✅ Instalado en `D:\UE_5.8` |
| Plugin **Pixel Streaming 2** (viene con UE) | ✅ Incluido; se activa al crear el proyecto |
| Plugin **Cesium for Unreal** (Fab, gratis; soporta UE 5.8 desde julio de 2026) | ❌ Pendiente de instalar |
| Cuenta **Cesium ion** + token de acceso | Pendiente (gratis para uso no comercial) |
| Visual Studio 2022 con "Desarrollo de juegos con C++" | ❌ No instalado (solo si se usa C++; con Blueprints no hace falta) |
| GPU NVIDIA (codificación NVENC) | ✅ RTX 5080 |
| Git LFS | ✅ Instalado |
| Espacio en disco (~60 GB motor + ~20 GB proyecto) | ✅ C: 244 GB libres |

> **Importante:** este repositorio está dentro de OneDrive. Un proyecto de Unreal genera miles
> de archivos (`Intermediate/`, `DerivedDataCache/`) y OneDrive los bloquea al sincronizar.
> Clonar el repo fuera de OneDrive (p. ej. `C:\dev\NEXO`) antes de crear el proyecto.

## Pasos para levantar la beta

1. Instalar UE 5.8 desde el Epic Games Launcher (hecho: `D:\UE_5.8`).
2. Crear el proyecto `NexoMapa` (plantilla *Blank*, Blueprint) dentro de `unreal/`.
3. Activar los plugins **Pixel Streaming 2** y **Cesium for Unreal**; pegar el token de Cesium ion.
4. Añadir *Cesium World Terrain + OSM Buildings* y fijar el georreferenciador en Villavicencio.
5. Blueprint `BP_MapaNexo`: pedir `GET {API_URL}/api/v1/services?page_size=100`, crear marcadores
   y responder a los mensajes del protocolo.
6. Empaquetar para Windows y lanzar con
   `NexoMapa.exe -PixelStreamingURL=ws://localhost:8888 -RenderOffscreen`.
7. Descargar el servidor de señalización con `D:\UE_5.8\Engine\Plugins\Media\PixelStreaming2\Resources\WebServers\get_ps_servers.bat` (en 5.8 ya no viene incluido) y lanzar su `start.bat`.
8. Probar en `http://localhost` y luego integrar en el frontend (ver abajo).

## Lo que necesita de otros integrantes

- **Brayan (frontend)**: componente `MapaUnreal` en `features/territorio/` usando
  `@epicgames-ps/lib-pixelstreamingfrontend-ue5.8`, con el mapa ilustrado actual como
  respaldo cuando el stream no esté disponible.
- **Elizabeth (configuración)**: variable `VITE_PIXEL_STREAMING_URL` en `.env.example` y
  `compose.yaml`.
- **Los tres**: aprobar esta decisión (issue *Decisión pendiente*) y decidir dónde corre
  Unreal en la demo (el PC de Camilo en local, o una instancia con GPU en la nube).

## Limitaciones de la beta

- Cada espectador consume una sesión de GPU; en local soporta pocas personas a la vez.
- Requiere conexión estable (WebRTC); en móviles con datos puede verse con retraso.
- Sin servidor con GPU encendido, el mapa 3D no está disponible: por eso el respaldo ilustrado.
