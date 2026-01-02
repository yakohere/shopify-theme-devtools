# Shopify Theme Devtools

[![npm version](https://img.shields.io/npm/v/shopify-theme-devtools.svg)](https://www.npmjs.com/package/shopify-theme-devtools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

In-browser devtools panel for Shopify theme development. Inspect Liquid context, metafields, theme settings, cart state, and sections while working on storefront previews.

![Theme Devtools Screenshot](https://via.placeholder.com/800x400?text=Theme+Devtools+Screenshot)

## Features

- 📦 **Object Inspector** — Tree-based viewer for Liquid objects (`cart`, `product`, `customer`, `shop`, etc.)
- 🏷️ **Metafields Explorer** — Browse product, collection, shop metafields with type indicators
- 🎨 **Theme Settings** — View all theme settings organized by group with validation
- 📐 **Section Highlighter** — List all sections, click to highlight and scroll into view
- 🛒 **Cart Toolkit** — Live cart state, change tracking, diff visualization, and actions
- 📋 **Copy as Liquid** — Click any property to copy its Liquid access path
- ⌨️ **Keyboard Shortcut** — `Cmd+Shift+D` to toggle panel

## Installation

### Option 1: npm + CDN (Recommended)

```bash
npm install shopify-theme-devtools
```

After building, the JS bundle is available at:
- jsDelivr: `https://cdn.jsdelivr.net/npm/shopify-theme-devtools@latest/dist/theme-devtools.js`
- unpkg: `https://unpkg.com/shopify-theme-devtools@latest/dist/theme-devtools.js`

### Option 2: Manual Download

Download the latest release from [GitHub Releases](https://github.com/yourusername/shopify-theme-devtools/releases) and upload to your CDN.

## Setup in Shopify Theme

### 1. Add the Liquid Snippet

Copy the snippet to your theme's `snippets/` folder:

```bash
# From npm package
cp node_modules/shopify-theme-devtools/src/liquid/theme-devtools-bridge.liquid snippets/
```

Or copy manually from `src/liquid/theme-devtools-bridge.liquid`.

### 2. Configure the Snippet

Edit `snippets/theme-devtools-bridge.liquid`:

```liquid
{%- assign devtools_local = false -%}  {# Set to true for local development #}
{%- assign devtools_cdn_base = 'https://cdn.jsdelivr.net/npm/shopify-theme-devtools@latest/dist' -%}
```

**Optional:** Configure metafield namespaces and theme settings to expose:

```liquid
{%- assign devtools_metafield_namespaces = 'custom,global,my_fields' | split: ',' -%}
```

### 3. Render in Theme

Add to `layout/theme.liquid` before `</body>`:

```liquid
{% render 'theme-devtools-bridge' %}
```

The devtools **only render on development/preview themes** (`theme.role == 'development'` or `theme.role == 'unpublished'`), so it's safe to leave in production code.

## Usage

### Keyboard Shortcut

`Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows) — Toggle panel visibility

### Tabs

| Tab | Description |
|-----|-------------|
| 📦 **Objects** | Inspect Liquid objects (shop, product, collection, customer, etc.) |
| 🏷️ **Metafields** | Browse metafields by resource → namespace → key |
| 🎨 **Settings** | View theme settings and section settings |
| 📐 **Sections** | List and highlight rendered sections |
| 🛒 **Cart** | Live cart state with edit capabilities |
| ℹ️ **Info** | Theme, template, request, and localization info |

### Copying Liquid Paths

Click any property key to copy its Liquid path:
- Object property → `{{ product.title }}`
- Metafield → `{{ product.metafields.custom.sizing_chart }}`
- Setting → `{{ settings.colors_accent_1 }}`

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/yourusername/shopify-theme-devtools.git
cd shopify-theme-devtools
npm install
```

### Commands

```bash
# Development server with HMR (http://localhost:9999)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Local Development Workflow

1. Run `npm run dev` to start Vite dev server
2. Set `devtools_local = true` in your theme's snippet
3. Run `shopify theme dev` in your theme directory
4. Changes to JS files hot-reload automatically

## Project Structure

```
src/
├── scripts/
│   ├── components/      # Lit web components
│   │   ├── panels/      # Panel components (objects, metafields, settings, etc.)
│   │   ├── object-inspector.js
│   │   └── theme-devtools.js
│   ├── services/        # Context parser, Cart API, Section highlighter
│   └── main.js          # Entry point
├── styles/
│   └── main.css
└── liquid/
    └── theme-devtools-bridge.liquid
```

## Technical Details

- **Lit Web Components** — Modern, reactive UI components
- **Shadow DOM** — Isolates devtools CSS from theme styles
- **Cart Tracking** — Ajax interception + polling fallback
- **Section Detection** — `[id^="shopify-section-"]` + `[data-section-id]`
- **~50KB** — Minified bundle size

## Browser Support

Chrome 80+, Firefox 78+, Safari 14+, Edge 80+

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) © Your Name

## Related

- [Shopify Theme Development](https://shopify.dev/themes)
- [Liquid Reference](https://shopify.dev/docs/api/liquid)
- [Theme Check](https://github.com/Shopify/theme-check)
