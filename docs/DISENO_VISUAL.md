# Diseño visual

## Identidad aprobada

La identidad visual de NEXO JOVEN 360 es **editorial juvenil, cálida, contemporánea y
atrevida**. La referencia gráfica aprobada es la guía de diseño del proyecto:

- **No** sustituirla por una plantilla genérica.
- **No** reinventar la identidad visual ni proponer un concepto alternativo.
- Toda pantalla nueva debe poder justificarse a partir de la referencia.

## Estado actual (Fase 00)

> **PENDIENTE:** la referencia gráfica aprobada todavía no está en el repositorio.

La página de inicio actual es **temporal** y usa estilos neutros a propósito, para no
anticipar decisiones visuales. Los valores de `frontend/src/styles/tokens.css` son
provisionales.

## Cómo aplicar la referencia

1. Añadir los archivos de referencia a `docs/diseno/` (imágenes o PDF exportados; para
   archivos grandes usar un enlace al archivo fuente, p. ej. Figma).
2. Extraer de la referencia y registrar en `frontend/src/styles/tokens.css`:
   - Paleta de color (fondo, superficies, texto, primario, acentos, estados).
   - Tipografías (display/titulares y texto) y su escala.
   - Espaciado, radios, bordes y sombras.
3. Si se usan fuentes web, documentar la licencia y alojarlas en `frontend/public/fonts/`.
4. Los componentes usan solo variables de `tokens.css`; no hay valores sueltos de color o tamaño.
5. Cada PR con cambios visuales incluye capturas antes/después.

## Accesibilidad (mínimos)

- Contraste de texto WCAG AA (4.5:1 en texto normal).
- Navegación completa por teclado y foco visible.
- Textos alternativos en imágenes con contenido.
- Diseño adaptable desde 320 px de ancho.
