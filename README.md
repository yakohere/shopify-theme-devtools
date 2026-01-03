# Shopify Theme Devtools

[![npm version](https://img.shields.io/npm/v/shopify-theme-devtools.svg)](https://www.npmjs.com/package/shopify-theme-devtools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![jsDelivr hits](https://img.shields.io/jsdelivr/npm/hm/shopify-theme-devtools)](https://www.jsdelivr.com/package/npm/shopify-theme-devtools)

A powerful in-browser developer tools panel for Shopify theme development. Inspect Liquid objects, metafields, cart state, detect Liquid errors, debug network requests, and much more — all without leaving the browser.

## Features

- **Liquid Object Inspector** — Browse `shop`, `product`, `collection`, `customer`, `cart` and more with deep search
- **Metafields Viewer** — Explore metafields across all resources and namespaces
- **Live Cart State** — Real-time cart updates with add/remove/clear actions
- **Liquid Error Detection** — Automatically detects `Liquid error`, Drop objects, missing snippets/assets
- **Network Monitor** — Captures failed fetch/XHR requests
- **Console Capture** — Intercepts `console.log`, `console.table`, `console.group` with persistence
- **SEO Inspector** — Meta tags, Open Graph, structured data
- **Analytics Viewer** — Google Analytics, Facebook Pixel tracking codes
- **Storage Inspector** — localStorage, sessionStorage, and cookies
- **Localization** — Markets, currencies, languages, and country data

## Quick Start

**1. Add the snippet to your theme**

Copy the Liquid bridge to your theme's snippets folder:

```
snippets/theme-devtools-bridge.liquid
```

You can find it in [`src/liquid/theme-devtools-bridge.liquid`](src/liquid/theme-devtools-bridge.liquid) or install via npm:

```bash
npm install shopify-theme-devtools
# Then copy node_modules/shopify-theme-devtools/src/liquid/theme-devtools-bridge.liquid to your snippets/
```

**2. Include in your layout**

Add this line to `layout/theme.liquid` just before `</body>`:

```liquid
{% render 'theme-devtools-bridge' %}
```

**3. You're done!**

The devtools panel will automatically appear on unpublished/development themes. It's safe to commit — it won't render on your live published theme.

## Usage

| Action | Shortcut |
|--------|----------|
| Toggle Panel | `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows) |
| Copy Liquid Path | Click any property key |

### Panels

| Panel | Description |
|-------|-------------|
| **Objects** | Inspect Liquid objects with deep search filtering |
| **Metafields** | Browse metafields by resource and namespace |
| **Cart** | Live cart state with manipulation actions |
| **Locale** | Markets, currencies, languages |
| **Analytics** | Tracking codes and analytics data |
| **SEO** | Meta tags, Open Graph, structured data |
| **Apps** | Installed Shopify apps |
| **Console** | Captured logs with Liquid error detection |
| **Cookies** | Browser cookies viewer |
| **Storage** | localStorage & sessionStorage inspector |
| **Info** | Theme, template, and request metadata |

## Console Panel Features

The Console panel goes beyond basic logging:

- **Liquid Error Detection** — Scans the DOM for `Liquid error`, `Liquid syntax error`, Drop objects (`#<ProductDrop:0x...>`), and schema errors
- **Network Errors** — Captures failed fetch and XHR requests with status, timing, and URL
- **Log Persistence** — Logs persist across page navigations within a session
- **`console.table` Support** — Renders tables properly
- **`console.group` Support** — Collapsible log groups
- **Smart Grouping** — Deduplicates repeated errors with counts

## Configuration

By default, the devtools load from jsDelivr CDN. For local development:

```liquid
{%- assign devtools_local = true -%}
{% render 'theme-devtools-bridge' %}
```

Then run the dev server:

```bash
npm run dev  # Starts at localhost:9999
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:9999)
npm run dev

# Build for production
npm run build
```

## How It Works

1. The Liquid bridge snippet extracts context (objects, metafields, settings) and injects it as JSON
2. The JavaScript bundle reads this context and renders the devtools panel
3. Only renders on unpublished themes (checks `theme.role != 'main'`)
4. Uses Shadow DOM for style isolation — won't affect your theme styles

## Tech Stack

- [Lit](https://lit.dev/) — Lightweight Web Components
- [Vite](https://vitejs.dev/) — Fast build tooling
- Single IIFE bundle (~48KB gzipped)

## License

[MIT](LICENSE) — Built by [@yakohere](https://github.com/yakohere)
