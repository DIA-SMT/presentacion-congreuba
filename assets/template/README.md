# Template "Celebrando Magnífica Humanitas" (diseño extraído)

Fuente: `Template Speakers - CELEBRANDO MAGNÍFICA HUMANITAS.pptx` (export de Canva, 14 slides, 16:9).
Todas las medidas están en **px sobre un escenario de 1920×1080** (1 px = 9525 EMU; tamaño de fuente en px = pt × 4/3).

## Archivos

| Archivo | Qué es |
|---|---|
| `bg.jpg` | Fondo de **todos** los slides (image1.jpeg, 1920×1080): degradado metálico plateado/beige horizontal con un globo punteado (Américas) a la derecha. |
| `logos/*.png`, `logos/*.svg` | 49 logos de la portada/cierre, con nombre legible. Los PNG ya están **recortados al marco** que usa Canva (fillRect), así que se usan tal cual con `width/height` = caja de layout.json. Cuando el PPTX traía SVG (8 logos) está el `.svg` (preferido) y el `.png` de respaldo. |
| `logos/_src/*.png` | Los PNG originales sin recortar (mismo nombre). |
| `fonts/Now-Regular.otf` | Fuente "Now" (Alfredo Marco Pradil, licencia OFL) extraída del PPTX. |
| `fonts/Poppins-*.ttf` | Poppins Regular/Bold/Italic/BoldItalic (OFL) extraídas, como respaldo offline de Google Fonts. |
| `layout.json` | Todos los elementos visibles de los slides 1, 2, 3, 4, 5, 6, 7, 9, 10, 13, 14 con posición, tamaño, relleno, radios, borde, textos y estilos, más un campo `role`. |
| `template-preview.html` | Render HTML fiel de esos slides (1920×1080 escalado al ancho). `?slide=N` muestra uno solo; tecla **D** dibuja las cajas. |

## Paleta

| Color | Rol |
|---|---|
| `#111A3B` | **Primario (navy)**: títulos, pills/kickers, panel lateral, barra de titular, headers de tarjetas, pestaña de acento, texto destacado sobre blanco. |
| `#FFFFFF` | Tarjetas (cards) y texto sobre navy. |
| `#2E344B` | Texto de cuerpo sobre tarjetas blancas (Poppins Regular). |
| `#8A8270` | **Acento gris cálido**: eyebrows de tarjetas (CATEGORÍA, PREGUNTA DISPARADORA, CONCLUSIÓN, TESTIMONIO, CITA DESTACADA). |
| `#C9C4B8` | Etiquetas dentro del panel navy (PALABRA CLAVE, FUENTE, ENFOQUE…). |
| `#3A4366` | Divisor 304×2 dentro del panel navy. |
| `#E4E3E1` | Borde 1.5 px de las tarjetas (familia "cards"). |
| `#E9E7E3` | Color de fondo del slide (queda tapado por bg.jpg; útil como fallback). |
| `#293140` / `#29313F` | Etiquetas ORGANIZAN/CO-ORGANIZAN/AUSPICIAN y color en que vienen pintados todos los logos. |
| `#5B616B` | Filetes de 1 px a los lados de "CO-ORGANIZAN". |

Portada/cierre tienen además un degradado vertical de fondo (`#8B806F → #E8DECC → #8B806F → #B3AE9A → #8D8C88`), también tapado por bg.jpg.
El propio template lo resume en el slide 4: "azul #111A3B, blanco y gris cálido #8A8270".

## Escala tipográfica (todo Poppins salvo las etiquetas de logos)

| Uso | Estilo |
|---|---|
| Título de portada | Bold 77.3 px (58 pt), line-height 88.15, `#111A3B`, centrado, mayúsculas (cierre: 76 px, "¡MUCHAS GRACIAS POR SU ATENCIÓN!") |
| Orador portada | Regular 46.65 px "NOMBRE Y APELLIDO · " + *Italic* "Cargo, Institución", lh 56, `#111A3B` |
| Evento/panel portada | Bold 22 px, letter-spacing 3 px (≈0.14 em), lh 26.4, `#111A3B` |
| Fecha/sede portada | Bold 21.3 px, ls 0.92 px, **blanco**, lh 25.6 |
| Header de slide ("CELEBRANDO MAGNÍFICA HUMANITAS · NOMBRE Y APELLIDO") | Bold 22 px, ls 4 px (≈0.18 em), lh 26.4, `#111A3B`, en (86, 59) |
| Título de slide (H1) | Bold 60 px (45 pt), lh 72, `#111A3B`, mayúsculas, x = 86, centro vertical ≈ y 147 |
| Pill/kicker | Bold 20 px blanco centrado en pill navy 296–300×50, r = 25 (slides 7–13: ls 3.6 px) |
| Subtítulo junto al pill (familia cards) | Regular 24 px `#111A3B`, lh 28.8 |
| Titular en barra navy | Bold 31–38 px blanco, lh 1.2 |
| Panel lateral | título 48–52 Bold; número gigante 120–160 Bold (lh 1.1); subtítulo 30–38 Bold; etiqueta 15 Bold `#C9C4B8`; valor 32 / 26 Bold; descripción 19 Regular; todo blanco salvo etiquetas |
| Eyebrow en tarjeta | Bold 15 px `#8A8270` (en columnas: ls 1.91 px, centrado); tarjetas chicas: Bold 13 px `#111A3B` ls 1.65 |
| Header de tarjeta | Bold 24–38 px blanco, centrado |
| Idea principal en tarjeta | Bold 17–30 px `#111A3B` (17/22 en 6 tarjetas, 26/33.7 en 3 col, 30/38.9 en 2 col, 42/54.4 en el mensaje final) |
| Cuerpo | Regular 21–25 px `#2E344B`, lh ≈ 1.45 (21/30.4, 22/31.9, 24/34.8); lista del caso 25/45; tarjetas chicas 15/20.2 |
| Destacado / pregunta | Bold 25 px `#111A3B`, lh 35 |
| Cita | Bold 54 px `#111A3B`, lh 70.2; testimonio Bold Italic 34 px |
| Etiquetas de logos | **Now Regular** 16 px (ORGANIZAN, CO-ORGANIZAN) y 13.9 px (AUSPICIAN), `#293140` |

## Grilla y motivos recurrentes

- **Márgenes**: 86 px a izquierda y derecha (contenido de x 86 a 1834). Header del evento en y 59, H1 en y ≈105–190, contenido desde y 195 (panel), 215 o 220 (tarjetas) hasta y 960–983.
- **Kicker**: H1 en mayúsculas + pill navy a la derecha con la categoría (p. ej. "SECCIÓN 1" + [CONTEXTO], "DATOS" + [EVIDENCIA], "CITA" + [PARA REFLEXIONAR], "CASO" + [EXPERIENCIA], "PUNTOS CLAVE" + [PROPUESTAS] + subtítulo gris).
- **Familia "panel lateral"** (slides 2–6): panel navy 375×788 en (86,195), r = 14; adentro título, número/glifo gigante ("01", "85%", "“"), divisor `#3A4366` 304×2 en y 610 y dos pares etiqueta/valor. Columna derecha x 495, ancho 1317: barra navy de titular 150 px (r 14–18.6) + tarjetas blancas sin borde (r 14–18.6).
- **Pestaña de acento "?" / "!"**: franja navy de 59–61 px a la izquierda de una tarjeta blanca (esquinas izquierdas redondeadas, derechas rectas) con un "?" (pregunta disparadora) o "!" (conclusión / para destacar) Bold 40 px blanco centrado; en la cita la franja sola recorre toda la tarjeta. Al lado: eyebrow `#8A8270` + texto Bold 25 navy.
- **Familia "cards"** (slides 7, 9–13): tarjetas blancas con borde 1.5 px `#E4E3E1` y un header navy encima (solo esquinas superiores redondeadas, 62–100 px de alto) con el título en blanco; dentro: eyebrow, idea principal en negrita y cuerpo, todo centrado. Grillas: 3×2 de 337×340 (gap 17/30), 2 columnas de 855×740 (gap 38), 3 columnas de 560×740 (gap 34), banner 1748×320 + 3 de 556×390.
- **Esquinas**: Canva exportó esquinas **elípticas** (rx ≠ ry) porque estiró las formas: p. ej. tarjeta 1748×320 → 73×11 px, columnas 855×740 → 36×26 px. layout.json trae los radios exactos (`cornerRadiiPx`, `cssBorderRadius`); para un HTML más prolijo se puede normalizar a un radio único de ~14–24 px.
- **Sin sombras, sin degradados en formas, sin transparencias** (las únicas `alpha` están en el degradado de fondo).

## Franja de logos (portada = slide 1 y cierre = slide 14, idénticos salvo el título)

Todos los logos vienen monocromo `#29313F` en el propio archivo: **no hay** `duotone`, `grayscl`, `clrChange` ni `alphaModFix` sobre ningún logo, así que no hace falta filtro CSS.

1. **ORGANIZAN** (arriba, 5 logos en tresbolillo 3 + 2 alrededor de la etiqueta central):
   - Fila 1 (y ≈ 36–116, ~73–78 px de alto): `red-latinoamericana-ia` (227, 41, 361×73) · `cea-conferencia-episcopal` (870, 41, 181×75) · `pass-pontifical-academy` (1446, 36, 180×78).
   - Etiqueta "ORGANIZAN" Now 16 px centrada en x ≈ 963, y 143.
   - Fila 2 (y ≈ 165–223): `uba-ialab` (473, 177, 193×46) · `fli-future-of-life` (1280, 165, 85×58).
2. **CO-ORGANIZAN**: etiqueta Now 16 px centrada (894, 237) entre dos filetes de 1 px `#5B616B` a y ≈ 249.5 (x 83→832 y 1088→1837). Debajo, una fila de **21 logos** de borde a borde (x 30→1895, alto 23–47 px, centrados en y ≈ 324, separados 3–13 px), en este orden: cm-caba, mpf-caba, mpt-caba, legislatura-caba (svg), procuracion-general-caba, alana, fundacion-carolina, santa-fe-institute, universidad-austral, fundar, ucsf-santa-fe, juslab, jufejus, jufejus-capacitacion-judicial, ifitej, universidad-champagnat, saia, tsj-caba, ai-academy-doinglobal, trend-smart-cities, red-uc-oc (svg).
3. Bloque central: evento/panel (y 416), título (y 512), orador (y 653), fecha y sede (y 760).
4. **AUSPICIAN**: etiqueta Now 13.9 px centrada (924, 911), sin filetes. Fila de **23 logos** (x 77→1850, alto 22–39 px, centro y ≈ 972, separados 7–18 px): aada, iu-envigado, iaf-fundacion (svg), islab-unr, fundacion-expoterra, insight-lac, fofecma, oea (svg), unlz-lab-innovacion, clapes-uc, ifbc-fray-bartolome, alta, fam-60, defensoria-pueblo-caba (svg), cgt, riaej, upaz (svg), sigmu-ushuaia (svg), umet, defensoria-villa-la-angostura (svg), amja, cari, acde.

Las cajas exactas de cada logo están en `layout.json` (`role: "logo"`, `image.tier`). `riaej` (sello con globo) es una identificación tentativa.

## Fuentes

`presentation.xml` → `embeddedFontLst`: font23 = Poppins Bold, font24 = Poppins (Regular), font25 = Poppins Italics, font26 = "Now 1", font27 = "Now 2", font28 = Poppins Bold Italics.
Los `.fntdata` son EOT sin compresión ni XOR; el contenido es la fuente completa (no subset). "Now 1" y "Now 2" son **la misma** Now Regular (OpenType/CFF) renombrada por Canva → `fonts/Now-Regular.otf`. Se usa solo en las 3 etiquetas ORGANIZAN / CO-ORGANIZAN / AUSPICIAN de los slides 1 y 14. Si se prefiere Google Fonts, lo más parecido es **Montserrat** (o Questrial) 400.

```css
@font-face { font-family: 'Now'; src: url('fonts/Now-Regular.otf') format('opentype'); font-weight: 400; }
```

## Rarezas del export

- `image2.jpeg` (paisaje de colinas, el placeholder de Canva) aparece en los slides 1, 7, 9, 10, 11, 12, 13 y 14 solo como relleno **invisible** (`alphaModFix amt="0"`) de los marcos de texto agrupados de Canva; no es un placeholder de imagen visible y no se copió. El placeholder de imagen real (slide 8) es una tarjeta blanca con el texto "IMAGEN O GRÁFICO".
- La fecha/sede de la portada es texto **blanco** sobre el fondo claro, sin banda detrás (contraste bajo; quizás en Canva tenía un fondo de texto que no se exportó).
- En los slides 7–13 el fondo está corrido 1 px a la derecha (x = 1), dejando una línea blanca de 1 px a la izquierda.
- La 6.ª tarjeta del slide 7 no tiene la línea "Idea principal en una línea" (variante del template).
- La miniatura (`docProps/thumbnail.jpeg`) está en blanco.
