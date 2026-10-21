# Diseño visual

## 1. Identidad aprobada

La identidad visual de NEXO JOVEN 360 es **editorial juvenil, cálida, contemporánea y atrevida**.

La referencia gráfica aprobada se encuentra en:

`docs/diseno/nexo-joven-moodboard.png`

Esta imagen es la fuente principal para definir y mantener la identidad visual del frontend.

Reglas obligatorias:

- No sustituir la referencia por una plantilla genérica de bienestar, salud o servicios institucionales.
- No reinventar la identidad visual ni proponer un concepto alternativo sin autorización.
- Mantener la personalidad editorial, la composición atrevida y la combinación de fotografía, ilustración e iconografía.
- Toda pantalla nueva debe ser coherente con la referencia aprobada.
- La imagen es una referencia visual; los elementos de la interfaz deben reconstruirse como componentes reales y funcionales.

## 2. Estado actual

La referencia aprobada está incorporada en `docs/diseno/nexo-joven-moodboard.png` (1536 × 1024 px)
y fue revisada visualmente para construir la primera versión del sistema visual
(rama `feat/frontend-identidad-inicio`).

Los tokens de `frontend/src/styles/tokens.css` ya reflejan la referencia (ver §9). Siguen pendientes
las fotografías con licencia (ver §5 y `docs/diseno/RECURSOS.md`).

## 3. Sistema visual

La paleta inicial de trabajo es:

- Verde petróleo: `#163B3A`
- Marfil: `#F7F4ED`
- Coral: `#FF8F70`
- Lila: `#8876F6`
- Amarillo suave: `#FFD66B`
- Verde menta: `#D5EFE5`
- Grafito: `#253238`
- Blanco: `#FFFFFF`

Estos valores son referencias iniciales y deben verificarse frente a la imagen aprobada antes de consolidar el sistema visual.

Tipografía sugerida:

- Manrope para titulares, navegación y elementos destacados.
- Caveat para anotaciones gráficas y frases breves.
- Inter o una alternativa legible para contenido funcional y datos administrativos.

No se deben introducir colores, tipografías o estilos nuevos que alteren la identidad sin justificar el cambio y solicitar aprobación cuando corresponda.

## 4. Aplicación en el frontend

Registrar los tokens definitivos en:

`frontend/src/styles/tokens.css`

Los estilos deben consumir las variables de diseño centralizadas, evitando valores de color, tipografía, espaciado o radios dispersos por los componentes.

Crear componentes reutilizables para botones, tarjetas, etiquetas, campos, navegación e iconografía.

Mantener coherencia entre la página de inicio, Brújula, Nexo Territorio, Espacio Pausa, Mi siguiente paso y las pantallas administrativas.

El panel institucional puede ser más sobrio y funcional, pero debe conservar la identidad de marca.

## 5. Fotografías, ilustraciones e iconografía

- Utilizar fotografía e ilustraciones coherentes con la referencia aprobada.
- No utilizar recursos con marcas de agua ni imágenes sin licencia adecuada.
- Registrar las fuentes y licencias de los recursos externos utilizados.
- Proporcionar textos alternativos para imágenes que transmitan información.
- Evitar que elementos decorativos interfieran con la lectura o la navegación.

Si se incorporan fuentes web, documentar su licencia y la estrategia de carga. Si se alojan localmente, utilizar `frontend/public/fonts/` cuando corresponda.

## 6. Accesibilidad

- Contraste mínimo WCAG AA de 4.5:1 para texto normal.
- Navegación completa por teclado y foco visible.
- Textos alternativos para imágenes con contenido.
- Diseño adaptable desde 320 px de ancho.
- Controles con nombres accesibles y estados comprensibles.
- Respeto por las preferencias de movimiento reducido.

La identidad editorial no debe comprometer la legibilidad ni la accesibilidad.

## 7. Revisión visual

Cada pull request que modifique la interfaz debe incluir capturas de pantalla antes y después cuando corresponda.

Las capturas deben permitir verificar:

- Coherencia con la referencia gráfica aprobada.
- Comportamiento en escritorio y móvil.
- Consistencia de colores, tipografía, espaciado y componentes.
- Estados de interacción relevantes.

Los cambios importantes de identidad deben aprobarse antes de extenderlos al resto de las pantallas.

## 8. Responsabilidad de implementación

La persona responsable del frontend debe reconstruir progresivamente la identidad aprobada, comenzando por la página de inicio y los componentes compartidos.

No se deben desarrollar todas las pantallas con una identidad provisional para intentar corregirlas al final.

La prioridad es establecer un sistema visual coherente y validarlo en una primera pantalla funcional antes de extenderlo al resto del producto.
## 9. Decisiones aplicadas en la primera versión

### Paleta: documento frente a moodboard

Las etiquetas hexadecimales del moodboard son de baja resolución y difieren ligeramente de la
paleta de este documento. Se adoptan los valores **de este documento** (fuente escrita aprobada) y
se registran las diferencias para que el equipo las confirme:

| Color | Documento (en uso) | Etiqueta en el moodboard | Muestra de píxel |
| ----- | ------------------ | ------------------------ | ---------------- |
| Verde petróleo | `#163B3A` | `#163B3A` | `#094140` |
| Coral | `#FF8F70` | `#FF8A6A` | `#FE9A75` |
| Lila | `#8876F6` | `#887CF6` | `#9B7EFC` |
| Amarillo | `#FFD66B` | ilegible (`#F9D35?`) | `#FED768` |
| Menta | `#D5EFE5` | `#D9F0E5` | `#D3EEE4` |
| Marfil / Arena | `#F7F4ED` | `#F7F4ED` | `#F4EFE6` |
| Grafito | `#253238` | `#253238` | `#2D3E44` |

### Derivados por accesibilidad (WCAG AA)

El texto blanco sobre lila `#8876F6` tiene un contraste de 3,5:1 e incumple AA. Por eso se añadieron
derivados que conservan el tono:

| Token | Valor | Uso | Contraste |
| ----- | ----- | --- | --------- |
| `--brand-lila-strong` | `#6B57E8` | Rellenos lila con texto blanco (etiquetas, botón de acento, paso actual) | 5,1:1 con blanco |
| `--brand-lila-ink` | `#5E4AD9` | Texto lila sobre marfil o blanco | 5,5:1 con marfil |
| `--brand-coral-ink` | `#A8432A` | Texto coral sobre marfil | 5,5:1 |
| `--brand-menta-ink` | `#1E6B4F` | Texto verde sobre menta (estado verificado) | 5,6:1 |
| `--color-text-muted` | `#5A6A70` | Texto secundario | 5,1:1 con marfil |

El lila, el coral y el amarillo originales se usan en ilustraciones, fondos y elementos con texto
grafito (grafito sobre coral: 5,9:1; grafito sobre amarillo: 9,5:1).

### Tipografía

- **Caveat** (700) para titulares expresivos y notas manuscritas, como en el moodboard
  ("Tu bienestar también construye…", "Pequeños pasos también cuentan").
- **Manrope** para títulos de sección, navegación, botones y logotipo.
- **Inter** para texto y controles.
- Fuentes variables alojadas en `frontend/public/fonts/` (OFL 1.1, ver `LICENCIAS.md` en esa
  carpeta) con `font-display: swap`.

### Componentes compartidos (`frontend/src/components/`)

`Button` / `ButtonLink`, `Card`, `Tag` / `DemoTag` / `Chip`, `SearchField`, `ChoiceTile`,
`StatusMessage` (carga, vacío, error), `Icon` (iconografía lineal propia), `IconBadge`,
`Annotation` (nota manuscrita), `Doodle` (trazos decorativos), `PhotoFrame`, `Logo` e
ilustraciones (`LlanoScene`, `ServiceThumb`).

### Fotografía

El moodboard usa fotografía (joven en el hero, fachadas y actividades en las tarjetas). Aún no hay
fotografías con licencia en el repositorio, así que:

- `PhotoFrame` acepta `src` y, mientras no exista la foto, muestra una ilustración provisional
  (`LlanoScene`: piedemonte llanero con palmas de moriche).
- Las tarjetas de servicios usan miniaturas ilustradas por categoría (`ServiceThumb`).
- No se recortaron imágenes del moodboard: la referencia no es un recurso de producción.

**Pendiente:** conseguir fotografías con licencia y registrarlas en `docs/diseno/RECURSOS.md`.
