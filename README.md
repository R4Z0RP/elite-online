# ELITE Online Comunicaciones — Sitio web

Landing page premium de una sola página para **ELITE Online Comunicaciones**: ISP de
fibra óptica + infraestructura TI para clientes **hogar** y **empresa**.

Construida con **HTML + Tailwind (CDN) + CSS + JavaScript vanilla**. Sin build, sin
dependencias que instalar: se abre en cualquier navegador y se sube a cualquier hosting.

---

## 🚀 Cómo verla

- **Opción rápida:** doble clic en `index.html`.
- **Opción recomendada (servidor local):** desde esta carpeta corre uno de estos:
  ```bash
  python -m http.server 5173      # luego abre http://localhost:5173
  npx serve .                     # si tienes Node
  ```
  Usar un servidor local evita pequeñas restricciones de `file://` (fuentes/imágenes).

---

## 📁 Estructura

```
Elite/
├── index.html              # Toda la página (secciones + contenido)
├── assets/
│   ├── css/styles.css      # Sistema de diseño: colores, glass, glow, animaciones
│   ├── js/main.js          # Interacciones (toggle, menú, formulario, contadores)
│   └── img/                # Logo, favicon e imágenes optimizadas (WebP/PNG)
├── README.md
└── Presentacion Elite Online.pdf   # Brief original (fuente de marca)
```

---

## ✏️ Qué editar (lo importante)

### 1) Datos de contacto  → `assets/js/main.js`
Todo está centralizado en **una sola constante** al inicio del archivo. Cámbiala una vez
y se actualiza en TODO el sitio (botones de WhatsApp, teléfono, correo, formulario y footer):

```js
const CONTACT = {
  waNumber:     "573000000000",            // WhatsApp: solo dígitos, con indicativo (57 = Colombia)
  waDisplay:    "+57 300 000 0000",        // WhatsApp visible
  phoneTel:     "+573000000000",           // enlace tel:
  phoneDisplay: "+57 300 000 0000",        // teléfono visible
  email:        "contacto@eliteonline.com.co"
};
```
> Los valores actuales son **placeholders** (marcados en el sitio con “◦ Placeholder — edítalo”).
> También puedes ajustar el texto de “Cobertura” directamente en `index.html` (sección `#contacto`).

### 2) Colores de marca  → `assets/css/styles.css` (bloque `:root`)
```css
--brand:      #22a6ff;   /* azul eléctrico principal */
--brand-cyan: #41e3ff;   /* cian de acento           */
--brand-deep: #0b66e4;   /* azul profundo            */
```

### 3) Textos y secciones  → `index.html`
Cada sección está claramente comentada (`<!-- HERO -->`, `<!-- SERVICES -->`, etc.).

---

## 🎨 Sistema de diseño

- **Estilo:** *Trust & Authority* + dark futurista / glassmorphism (recomendado por la
  skill `ui-ux-pro-max` para un ISP/telecom B2B + B2C).
- **Paleta:** azul eléctrico / cian sobre navy profundo `#060b16` (tomada del branding del PDF).
- **Tipografías (Google Fonts):** `Exo 2` (títulos), `Inter` (texto), `Orbitron` (acentos/cifras).
- **Patrón:** *Enterprise Gateway* → selección de perfil **Hogar ↔ Empresa**.

### Funcionalidad incluida
- Toggle Hogar/Empresa (cambia CTA y precarga el formulario).
- Menú móvil, header con efecto al hacer scroll, smooth scroll.
- Animaciones de aparición al scroll + contadores + anillo de velocidad (respetan
  `prefers-reduced-motion`).
- Formulario con validación que **arma el mensaje y abre WhatsApp** (no requiere backend).
- Botón flotante de WhatsApp.
- Responsive (375 / 768 / 1024 / 1440) y accesible (foco visible, etiquetas, contraste, SVG).

---

## 🖼️ Imágenes
Logo, icono y fondos fueron **extraídos y optimizados** del PDF de presentación
(`hero-city`, `bg-network`, `bg-security`, `cabling-1`). El logo se procesó a fondo
transparente para verse limpio sobre el navy.

> **Logos de aliados:** se muestran como texto estilizado (marquesina). Si tienes los
> SVG/PNG oficiales y licencia de uso, puedes reemplazarlos en la sección `#aliados`.

---

## 🌐 Publicar (deploy)
Es un sitio estático: sube la carpeta completa a cualquier hosting.
- **Netlify / Vercel / Cloudflare Pages:** arrastra la carpeta o conecta el repo.
- **GitHub Pages:** sube los archivos y activa Pages.
- **Hosting tradicional (cPanel/FTP):** copia todo a `public_html/`.

### Nota de producción (opcional)
El sitio usa **Tailwind por CDN** para utilidades; el grueso del diseño vive en
`styles.css`, así que se ve igual aunque el CDN falle. Para una build 100% de producción
(CSS mínimo, sin script de Tailwind), compila Tailwind con su CLI y reemplaza el `<script>`
del CDN por el CSS generado. No es obligatorio para lanzar.

---

*Hecho para romperla. ⚡ ELITE Online Comunicaciones — La siguiente generación de internet.*
