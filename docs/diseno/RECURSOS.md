# Recursos gráficos

Registro de las fuentes y licencias de los recursos externos usados en la interfaz
(ver `docs/DISENO_VISUAL.md` §5). Todo recurso nuevo se añade aquí antes de integrarlo.

| Recurso | Ubicación | Fuente | Licencia | Fecha |
| ------- | --------- | ------ | -------- | ----- |
| Moodboard aprobado (solo referencia, no se usa en producción) | `docs/diseno/nexo-joven-moodboard.png` | Equipo NEXO JOVEN 360 | Interna | 2026-10-21 |
| Manrope, Inter y Caveat (woff2, subconjunto latino) | `frontend/public/fonts/` | Google Fonts | SIL OFL 1.1 | 2026-10-21 |
| Iconos, trazos decorativos e ilustraciones SVG | `frontend/src/components/` | Elaboración propia | Del proyecto | 2026-10-21 |
| Ilustración de la maceta (estado vacío de Mi siguiente paso) | `frontend/src/features/paso/SeedlingArt.tsx` | Elaboración propia | Del proyecto | 2026-10-21 |
| Ciudad 3D ilustrativa de Nexo Territorio: geometría, materiales «toon» y texturas de fachada (generadas por código, sin modelos ni imágenes externas) | `frontend/src/features/territorio/map3d/` | Elaboración propia con Three.js (MIT) y React Three Fiber (MIT) | Del proyecto | 2026-10-22 |
| Sonido ambiental "Brisa suave" (generado, sin archivo de audio) | `frontend/src/features/sonido/ambientEngine.ts` | Elaboración propia: síntesis en el navegador con la Web Audio API | Del proyecto | 2026-10-21 |

### Sonido ambiental

No se descargó ni se incluye ninguna grabación. El sonido se **genera en el navegador** cada vez
que alguien lo activa: ruido marrón (6 s en bucle, con los extremos alineados para evitar el
"clic" del bucle) → filtro paso bajo a 650 Hz → oscilación lenta de volumen (0,07 Hz) → volumen
general (máximo 0,35, curva cuadrática). El resultado recuerda a brisa o a un río lejano; no es
una grabación de la naturaleza y la interfaz no lo presenta como tal.

Reglas de uso: apagado por defecto; solo se crea el contexto de audio tras pulsar «Sonido»; se
puede pausar, reanudar, ajustar el volumen y detener al instante; solo se recuerda el volumen
(`localStorage`, clave `nexo:sonido-ambiental:volumen:v1`), nunca la reproducción; no existe en
los paneles institucionales.

## Pendientes

- [ ] Fotografía del hero de Inicio (joven en espacio abierto de Villavicencio).
- [ ] Fotografías de servicios destacados (fachadas, actividades deportivas y culturales).
- [ ] Autorización de uso de imagen si aparecen personas identificables.
- [ ] (Opcional) Grabaciones reales de naturaleza para "Sonidos de la naturaleza" de Espacio
  Pausa y, si se prefiere, para sustituir el sonido generado. Requieren fuente y licencia
  verificables (por ejemplo CC0 o CC BY con atribución) registradas aquí antes de integrarlas.
