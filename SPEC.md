# SPEC — FOTOAMIGOS v2

> Sitio estático SPA · 4 pantallas · 8 superhéroes · Deploy: GitHub Pages
> Repo: `github.com/dargonarcobra-wq/imd-tp01` (branch `entrega01`)
> Workdir: `/media/dargonar/bkp_1t_new/facultad/imd/tp02/www/`

---

## 1. Datos (`config.json`)

### 1.1 Estructura

```json
{
  "superheroes": [ ... ],   // array de 8 objetos
  "atributos": [ ... ]      // array de 6 objetos
}
```

### 1.2 Superhéroes

Cada entrada:

```json
{
  "id": "ayelen",
  "nombre": "AYELÉN",
  "camara": "canon",
  "comidas": ["MILANESA CON PURÉ"],
  "poder_especial": ["Puesta en Escena"],
  "lente": ["35 mm"],
  "tipo": ["Documental"],
  "referentes": ["Vivian Maier"],
  "fotos": [],
  "avatar": ""
}
```

### 1.3 Datos concretos (del CSV)

| nombre | camara | comidas | poder_especial | lente | tipo | referentes |
|--------|--------|---------|----------------|-------|------|------------|
| AYELÉN | canon | MILANESA CON PURÉ | Puesta en Escena | 35 mm | Documental | Vivian Maier |
| JULIÁN MRS | nikon | MILANESA CON PAPAS FRITAS | Momento Justo | 600 mm | Naturaleza | Robert Capa |
| JULIÁN MDN | sony | MILANESA CON PAPAS FRITAS | Metáfora Visual | Gran Angular | Paisaje | Henri Cartier-Bresson |
| TUTINO | sony | RATATOUILLE | Narrativa Visual | 50 mm | Street photography | Antoine D'agata |
| ZECA | canon | FIDEOS | Puesta en Escena | 50 mm | Retrato | Annie Leibovitz |
| VALE | leica | SANGUCHES DE MIGA, EMPANADAS | Metáfora Visual | 24-70 mm | Conceptual | Saul Leiter |
| MARTÍN | nikon | ASADO | Metáfora Visual | 24-70 mm | Fine Art | Daido Moriyama |
| CARMELA | canon | FIDEOS, ATÚN, MILANESA | Instante Decisivo | 50 mm | Street photography | Sebastian Salgado |

**Notas sobre comidas:**
- Valores compuestos se muestran como frase: "MILANESA, PURÉ" → "Milanesa con puré", "MILANESA, PAPAS FRITAS" → "Milanesa con papas fritas"
- "SANGUCHES DE MIGA, EMPANADAS" → dos valores independientes: "Sanguches de miga" y "Empanadas"
- "FIDEOS, ATÚN, MILANESA" → tres valores independientes: "Fideos", "Atún", "Milanesa"
- Todos los valores se almacenan en PascalCase en el JSON; el display los convierte a Title Case
- **Vinculación de atributos:** las variantes "Milanesa con puré", "Milanesa con papas fritas" y "Milanesa" (sola) linkean todas al mismo grupo: `comidas → MILANESA`. La lógica de agrupamiento extrae la palabra clave base (MILANESA) para determinar los matches. Ver §1.4.

**Notas sobre arrays:**
- `poder_especial`, `lente`, `tipo`, `referentes` son arrays de 1 o más valores.
- `comidas` es array de 1 o más valores (ej: Carmela tiene 3: "Fideos", "Atún", "Milanesa").
- `camara` es un string (no array) — un héroe tiene una sola cámara.

### 1.4 Lógica de vinculación de atributos

Cuando el usuario clickea un valor de atributo, se navega a la pantalla Atributo mostrando todos los héroes que comparten ese valor. La vinculación funciona así:

| Atributo | Regla de match |
|----------|---------------|
| `camara` | Match exacto case-insensitive: `canon` = `canon` |
| `comidas` | Match por palabra clave base: "MILANESA CON PURÉ" contiene "MILANESA" → match con "MILANESA" y "MILANESA CON PAPAS FRITAS". "SANGUCHES DE MIGA" es un valor unitario. "FIDEOS" match con "FIDEOS" |
| `poder_especial` | Match exacto case-insensitive |
| `lente` | Match exacto case-insensitive |
| `tipo` | Match exacto case-insensitive |
| `referentes` | Match exacto case-insensitive |

**Algoritmo de match para comidas:**
1. Normalizar el valor clickeado a mayúsculas
2. Si el valor contiene "CON" → extraer la palabra clave base (todo antes de "CON"): ej: "MILANESA CON PURÉ" → base = "MILANESA"
3. Si el valor NO contiene "CON" → la base es el valor completo
4. Un héroe hace match si cualquiera de sus comidas contiene la base como substring

### 1.5 Atributos

```json
[
  { "key": "camara",          "label": "CÁMARA",          "icon": "photo_camera",   "color": "#0058be" },
  { "key": "comidas",         "label": "COMIDAS",         "icon": "restaurant",     "color": "#da3437" },
  { "key": "poder_especial",  "label": "PODER ESPECIAL",  "icon": "auto_fix_high",  "color": "#735c00" },
  { "key": "lente",           "label": "LENTE",           "icon": "lens_blur",      "color": "#5b403e" },
  { "key": "tipo",            "label": "TIPO",            "icon": "category",       "color": "#2170e4" },
  { "key": "referentes",      "label": "REFERENTES",      "icon": "person_apron",   "color": "#8f6f6d" }
]
```

Colores e iconos son valores iniciales. El atributo `camara` se muestra en el header de la card y también es clickeable como el resto.

---

## 2. Diseño visual (Design System "Hero Deck")

### 2.1 Paleta

| Rol | Color | Hex |
|-----|-------|-----|
| Background | Off-white papel | `#fcf9f8` |
| On background | Texto principal | `#1c1b1b` |
| Primary | Hero Red | `#b61722` |
| On Primary | Blanco sobre rojo | `#ffffff` |
| Primary Container | Rojo brillante | `#da3437` |
| Secondary | Power Blue | `#0058be` |
| Secondary Container | Azul brillante | `#2170e4` |
| Tertiary | Energy Yellow | `#735c00` |
| Tertiary Container | Amarillo dorado | `#cea700` |
| Tertiary Fixed | Amarillo标签 | `#ffe083` / `#eec200` |
| Inverse Surface | Negro profundo | `#313030` |
| Surface Container | Gris cálido | `#f0eded` |
| Outline | Borde suave | `#8f6f6d` |

### 2.2 Tipografía

| Uso | Familia | Peso | Tamaño |
|-----|---------|------|--------|
| Títulos de carta | Lexend | 900 (Black) | 24px |
| Valores de stat | Space Grotesk | 700 (Bold) | 20px |
| Labels de stat | Space Grotesk | 500 (Medium) | 12px |
| Body | Lexend | 400 (Regular) | 16px |
| Botones | Lexend | 800 (ExtraBold) | 18px |

Fuentes vía Google Fonts CDN.

### 2.3 Efectos

- **Ink border:** 4px `#1c1b1b` sólido en todos los elementos interactivos
- **Hard shadow:** `6px 6px 0 0 rgba(0,0,0,1)` (comic-shadow)
- **Hard shadow small:** `3px 3px 0 0 rgba(0,0,0,1)`
- **Halftone overlay:** `radial-gradient(rgba(0,0,0,0.1) 15%, transparent 20%)` con `background-size: 4px 4px`
- **Inner glow (hover/active):** `inset 0 0 15px rgba(255,255,255,0.4)` simula foil holográfico
- **Botón pressed:** `translateY(2px)` simulando compresión física
- **Bordes redondeados:** Cards `0.5rem`, Tags `0.25rem`, Pills `9999px`

### 2.4 Iconos

Material Symbols Outlined (Google Fonts CDN) con `FILL: 1` para iconos de stat en cards.

---

## 3. Pantallas

### P01 — Splash / Landing

**Propósito:** Intro del juego. Transición al Home.

**Layout:**
- Fullscreen, sin scroll
- Fondo: imagen de mesa de poker (`01_mesa.png`) con overlay del tapete (`01_tapete-o-panio.png`) centrado
- Centrado en viewport:
  - Título: **"FOTOAMIGOS: THE GAME!"** — Lexend Black 64px, color `#fcf9f8` (off-white sobre fondo oscuro), italic uppercase, stroke `4px 4px 0px #b61722` (drop-shadow rojo)
  - Subtítulo: "Hipertexto e Interfaz — IMD 2025" — Space Grotesk 12px, uppercase, tracking 0.2em, color `rgba(255,255,255,0.7)`
  - Botón: "EMPEZAR JUEGO!" — bg `#b61722`, texto blanco, Lexend ExtraBold 18px, border 4px `#1c1b1b`, comic-shadow, rounded. Hover: bg `#da3437`. Active: translateY(2px)

**Animación de entrada:**
1. Fondo mesa fade-in (0.5s)
2. Título escala desde 0.8 → 1 con bounce (0.4s, delay 0.3s)
3. Subtítulo fade-in (0.3s, delay 0.6s)
4. Botón slide-up desde abajo (0.4s, delay 0.9s)

**Navegación:** Click en botón → fade-out splash (0.4s) → muestra Home

**Header:** Ninguno (pantalla completa)

---

### P02 — Home

**Propósito:** Grid de 8 cartas. Navegación a Atributo y Superheroe.

**Header:** Barra fija superior:
- Izquierda: logo "FOTOAMIGOS" en Lexend Black italic, clickable → Home (reset de navegación)
- Derecha: nada (por ahora)

**Layout del grid:**
- 8 cartas en grid responsive: 4 columnas en desktop (>1024px), 2 en tablet, 1 en mobile
- Gap: 32px
- Max-width: 1200px, centrado
- Padding top: debajo del header (64px)

**Estados de cada carta:**

| Estado | Visual | Acción |
|--------|--------|--------|
| **Boca abajo** | Dorso rojo `#b61722` con halftone, borde decorativo interior, círculo central con ícono `auto_awesome` + texto "FOTOAMIGOS" rotado | Click → animación flip → estado Colapsada |
| **Colapsada** | Header: nombre + badge cámara. Foto. Poder especial. | Click → overlay de Expandida. Si otra estaba colapsada, vuelve a boca abajo |
| **Boca abajo (con overlay abierto)** | Carta permanece boca abajo detrás del overlay | — |

**Animación flip:**
- `transform: rotateY(0)` → `rotateY(180deg)` en 0.6s ease
- `backface-visibility: hidden` en ambas caras
- `perspective: 1000px` en el contenedor
- La cara frontal tiene `transform: rotateY(180deg)` por defecto (para que se vea correcta al flip)

**Overlay de Expanded Card:**
- Backdrop: overlay oscuro `rgba(0,0,0,0.5)` con blur `4px`
- Card centrada en viewport, max-width 480px, z-index 50
- Animación de entrada: scale 0.9 → 1 + fade in (0.3s ease)
- La carta detrás (colapsada) permanece visible bajo el overlay
- **Cierre:** Click fuera de la card en el backdrop, o tecla ESC
- Al cerrar: animación scale 1 → 0.9 + fade out (0.2s) → se remueve el overlay → la carta debajo queda en estado colapsada

**Expanded Card (dentro del overlay):**

Secciones de arriba a abajo:
1. **Header:** Bg `#b61722`, padding 16px, border-bottom 4px negro
   - Izquierda: Nombre en Lexend Black, italic, uppercase
   - Derecha: Badge pill con cámara (bg negro, texto blanco, uppercase, rounded-full, border 2px)
2. **Foto:** Aspect ratio 4:5, border-bottom 4px negro, object-fit cover
   - Halftone overlay
3. **Poder Especial:** Sección destacada
   - Ícono `auto_fix_high` + label "PODER ESPECIAL"
   - Valor en box con bg `#cea700`, border 3px negro, comic-shadow, texto centrado
4. **Atributos:** Grid de secciones, cada una con:
   - Ícono del atributo en square 40×40px con bg del color del atributo, border 2px negro, small comic-shadow
   - Label del atributo (Space Grotesk 12px uppercase)
   - Valores como **tags/chips**: bg del color container del atributo, texto on-container, border 2px negro, rounded, font Lexend ExtraBold 14px
   - **Todos los tags son clickeables** → navega a Pantalla Atributo
5. **Footer:** Vacío por ahora, border-top sutil, h-8

**Interacciones en Expanded Card:**
- Click en **nombre** (header) → Pantalla Superheroe
- Click en **foto** → Pantalla Superheroe
- Click en **tag de atributo** → Pantalla Atributo (con el atributo clickeado)
- Click en **backdrop** o **ESC** → cierra overlay

---

### P03 — Atributo

**Propósito:** Mostrar héroes que comparten un valor de atributo vs. los que no.

**Header:** Barra fija superior:
- Izquierda: Botón "← VOLVER" (bg `#0058be`, texto blanco, comic-shadow, click → navega atrás en stack)
- Centro: Tipo de atributo (chico, Space Grotesk 12px uppercase, color del atributo) + Valor (grande, Lexend Black 24px, color `#1c1b1b`)
  - Ejemplo: `CÁMARA` (azul, chico) `CANON` (grande, negro)
- Derecha: Logo "FOTOAMIGOS" clickable → Home (reset de navegación)
- Ícono del atributo + color coherente con el design system

**Layout principal — 2 columnas:**

```
┌─────────────────────────────────────────────┐
│ ← VOLVER  │  CÁMARA — CANON  │  FOTOAMIGOS │  ← Header
├────────────────────┬────────────────────────┤
│   COMPARTEN        │   NO COMPARTEN        │
│   (4 cards)        │   (4 cards)           │
│                    │                       │
│   [collapsed]     │   [collapsed]         │
│   [collapsed]     │   [collapsed]         │
│   [collapsed]     │   [collapsed]         │
│   [collapsed]     │                       │
├────────────────────┴────────────────────────┤
│  Thumbnails de heroes que comparten        │  ← Footer opcional
└─────────────────────────────────────────────┘
```

- Izquierda (50%): Héroes que **comparten** el valor → collapsed cards con estilo normal
- Derecha (50%): Héroes que **no comparten** → collapsed cards con **opacity 0.4** pero **sí clickeables** (click en card → overlay expanded, click en tag → pantalla Atributo)
- Las collapsed cards de la izquierda **reemplazan** la sección "Poder Especial" por el **atributo actual** (el que se está mostrando en la pantalla)

**Comportamiento de collapsed cards (lado izquierdo):**
- Click en card → overlay de Expanded Card (igual que en Home)
- Desde el overlay, click en tag de atributo → se **apila** nueva pantalla Atributo en el stack de navegación
- Click en nombre/foto → Pantalla Superheroe

**Navegación:**
- Stack de navegación: cada vez que se entra a una pantalla Atributo, se pushea al stack
- "← VOLVER" → popea la última pantalla del stack
- Logo "FOTOAMIGOS" → limpia el stack, va a Home
- Si el stack está vacío, "VOLVER" vuelve a Home

**Animación de entrada:**
- Columna izquierda: cards aparecen con stagger (delay 0.05s por card) desde abajo
- Columna derecha: cards aparecen con stagger pero fade-in simple, opacity final 0.4. **Son clickeables** (abren overlay / navegan a atributo).

---

### P04 — Superheroe

**Propósito:** Detalle completo de un héroe con photo viewer.

**Header:** Barra fija superior:
- Izquierda: Botón "← VOLVER"
- Centro: Nombre del héroe (Lexend Black 24px)
- Derecha: Logo "FOTOAMIGOS" clickable → Home

**Layout principal — 2 columnas:**

```
┌─────────────────────────────────────────────┐
│ ← VOLVER  │  AYELÉN       │  FOTOAMIGOS    │  ← Header
├────────────────────┬────────────────────────┤
│                    │                        │
│   ATRIBUTOS        │   PHOTO VIEWER         │
│   (card style)     │                        │
│                    │   ┌──────────────┐     │
│   Nombre + Cámara  │   │              │     │
│   Foto (avatar)    │   │   FOTO       │     │
│   Poder Especial   │   │   GRANDE     │     │
│   ─────────────    │   │              │     │
│   Comidas  [tags]  │   └──────────────┘     │
│   Lente    [tags]  │      ← ○ ○ ○ →        │
│   Tipo     [tags]  │   3/5                  │
│   Refer.   [tags]  │                        │
│                    │                        │
├────────────────────┴────────────────────────┤
│  [thumb] [thumb] [thumb] [thumb] [thumb]    │  ← Footer: thumbnails de otros heroes
└─────────────────────────────────────────────┘
```

**Columna izquierda — Detalle del héroe:**
- Reproduce el layout de la Expanded Card pero sin overlay
- Nombre y cámara en header
- Foto del avatar
- Poder especial destacado
- Todos los atributos con íconos, labels y tags clickeables
- **Todos los tags clickeables** → Pantalla Atributo (se apila en el stack)

**Columna derecha — Photo Viewer (Slideshow):**
- Si `fotos[]` tiene contenido:
  - Foto grande con aspect-ratio 4:5, object-fit cover, border 4px negro, comic-shadow
  - Halftone overlay sobre la foto
  - Flechas prev/next a los costados (bg semi-transparente, íconos Material Symbols `arrow_back` / `arrow_forward`)
  - Indicador de posición: "3/5" centrado debajo de la foto
  - Dots de navegación: `○ ○ ● ○ ○`
  - Transición: slide horizontal (0.3s ease)
  - Keyboard: ← → arrow keys
- Si `fotos[]` está vacío (placeholder):
  - Muestra placeholder: bg `#e5e2e1` con ícono `photo_camera` grande centrado, texto "Sin fotos"

**Footer — Mini thumbnails de otros héroes:**
- Fila horizontal de collapsed cards mini (w-16 h-24 aprox.)
- Cada una muestra avatar + nombre del otro héroe
- Click → navega a esa pantalla Superheroe (reemplaza la actual, no apila)
- Héroe actual tiene border destacado (bg tertiary o primary)
- Si no hay avatars → placeholder con ícono + nombre

**Navegación:**
- "← VOLVER" → popea stack
- Logo → Home (reset)
- Tag de atributo → Pantalla Atributo (se apila)
- Thumbnail de otro héroe → reemplaza pantalla actual

---

## 4. Navegación

### 4.1 Stack de navegación

```
Stack = [Home]                          ← base siempre Home
      → [Home, Atributo(camara,canon)]  ← push al entrar a Atributo
      → [Home, Atributo(camara,canon), Atributo(tipo,street)]  ← push anidado
      → [Home]                          ← reset al clickear logo
```

- "← VOLVER" popea el último elemento
- Logo "FOTOAMIGOS" limpia el stack y va a Home
- Pantalla Superheroe se pushea al stack igual que Atributo
- Overlay de expanded card NO se pushea al stack (es un overlay visual, no una pantalla)

### 4.2 Transiciones entre pantallas

| Transición | Animación |
|------------|-----------|
| Splash → Home | Fade-out splash (0.4s) + fade-in Home (0.3s) |
| Home → Atributo | Slide-left de contenido (0.3s) |
| Home → Superheroe | Slide-left de contenido (0.3s) |
| Atributo → Atributo (drill-down) | Slide-left (0.3s) |
| Atributo → Superheroe | Slide-left (0.3s) |
| Back (cualquier pantalla) | Slide-right (0.3s) |
| Logo → Home | Fade (0.3s), reset de stack |

### 4.3 Teclado

| Tecla | Acción |
|-------|--------|
| `ESC` | Cierra overlay de expanded card. Si no hay overlay, ejecuta Back |
| `←` / `→` | En Pantalla Superheroe: navega fotos del slideshow |
| `Enter` | En Splash: equivalente a "Empezar juego!" |

---

## 5. Componentes reutilizables

### 5.1 Dorso de carta (Card Back)
- Bg `#b61722`, border 4px negro, comic-shadow
- Halftone overlay (opacity 20%)
- Borde decorativo interior (2px `rgba(255,255,255,0.3)`, rounded, inset 16px)
- Círculo central: 128×128px, bg `#1c1b1b`, border 6px blanco, flex center
  - Ícono `auto_awesome` blanco 48px
- Texto "FOTOAMIGOS" debajo del círculo: bg blanco, border 3px negro, comic-shadow, slight rotation (-2° a +3° random por carta)

### 5.2 Collapsed Card
- Ancho fijo dentro del grid
- Secciones:
  1. Header: bg primary, nombre (Lexend Black) + badge cámara (pill negro)
  2. Foto: aspect-ratio 1:1, halftone, border-bottom 4px negro
  3. Sección destacada: atributo contextual (Poder especial en Home, atributo actual en P03)
     - Ícono + label + valor en box con color del atributo

### 5.3 Expanded Card (overlay)
- Ver § P02 para detalle completo
- Es el mismo componente usado en Home (overlay) y en P04 (columna izquierda, sin overlay)

### 5.4 Attribute Tag (chip)
- bg: color container del atributo
- texto: on-container color
- border: 2px negro
- rounded
- font: Lexend ExtraBold 14px
- padding: 2px 12px
- cursor: pointer
- hover: translateY(-1px) + shadow reforzada
- active: translateY(1px)

### 5.5 Botón "← VOLVER"
- bg `#0058be`, texto blanco
- border 2px negro, comic-shadow small
- Lexend ExtraBold
- hover: bg `#2170e4`, translateY(-1px)
- active: translateY(1px), shadow reducida

### 5.6 Header de pantalla
- Height: 64px, fixed top, z-index 40
- bg: `#fcf9f8` (off-white) con border-bottom 4px negro y shadow `0 4px 0 0 rgba(0,0,0,1)`
- Layout flex: izquierda (back) | centro (título) | derecha (logo)

---

## 6. Estructura de archivos

```
www/
├── index.html          ← SPA principal (toda la app)
├── config.json         ← datos de superhéroes y atributos
├── app.js              ← Lógica SPA: routing, rendering, interacciones
├── styles.css          ← Estilos custom + overrides (Tailwind vía CDN en index.html)
├── assets/
│   ├── mesa.png        ← copia de 01_mesa.png
│   ├── tapete.png      ← copia de 01_tapete-o-panio.png
│   ├── card-back.png   ← copia de 02_back.png (si se usa como imagen en vez de CSS)
│   └── photos/         ← fotos de héroes (vacío por ahora, placeholders)
│       ├── ayelen.jpg
│       ├── julian_mrs.jpg
│       ├── ...
└── img/                ← legado v1 (se puede limpiar)
```

**Nota:** Las imágenes de referencia de `assets.v2/` (mesa, tapete, card backs) se copian a `www/assets/` para que el sitio sea self-contained.

---

## 7. Dependencias externas (CDN)

| Lib | URL | Uso |
|-----|-----|-----|
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades CSS |
| Lexend font | Google Fonts | Títulos y body |
| Space Grotesk font | Google Fonts | Stats y labels |
| Material Symbols | Google Fonts | Íconos |

Sin build step. Todo funciona abriendo `index.html` directamente o vía GitHub Pages.

---

## 8. Placeholder de fotos

Mientras no haya fotos reales:
- **Avatar:** Ícono `photo_camera` en bg `#e5e2e1` con nombre del héroe overlay
- **Fotos slideshow:** Grid de 3 placeholders con íconos `photo_camera` y texto "Sin fotos"
- El `config.json` tiene `fotos: []` y `avatar: ""` para cada héroe

Cuando se agreguen fotos reales, solo se actualiza el JSON y se suben los archivos a `assets/photos/`.

---

## 9. Accesibilidad

- Todos los elementos clickeables tienen `cursor: pointer` y focus-visible styles
- `role` y `aria-label` en botones, overlays, slideshow controls
- Navegación por teclado (ESC, arrows, Enter)
- Contraste mínimo WCAG AA en texto sobre fondos de color
- `alt` text en imágenes (aunque sean placeholders)
- `tabindex` apropiado en elementos interactivos del overlay

---

## 10. Orden de implementación

1. Crear branch `entrega01` en el repo
2. Generar `config.json` con datos del CSV + placeholders
3. Copiar assets de referencia a `www/assets/`
4. Armar `index.html` con estructura base + Tailwind CDN + Google Fonts
5. Implementar P01 (Splash)
6. Implementar P02 (Home con grid, flip, collapsed, overlay expanded)
7. Implementar P03 (Atributo con 2 columnas, stack de navegación)
8. Implementar P04 (Superheroe con slideshow y thumbnails)
9. Sistema de navegación (stack, transiciones, back, logo)
10. Animaciones y polish
11. Deploy a GitHub Pages
