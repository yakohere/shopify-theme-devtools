# Shopify Theme Devtools

In-browser devtools panel for Shopify theme development. Inspect Liquid context, metafields, theme settings, cart state, and sections.

## Installation

```bash
npm install shopify-theme-devtools
```

## Setup

1. Copy `src/liquid/theme-devtools-bridge.liquid` to your theme's `snippets/` folder

2. Add to `layout/theme.liquid` before `</body>`:

```liquid
{% render 'theme-devtools-bridge' %}
```

Only renders on development/preview themes, safe to leave in production.

## Usage

Toggle panel: `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows)

**Panels:**
- **Objects** — Inspect Liquid objects (shop, product, collection, customer, etc.)
- **Metafields** — Browse metafields by resource
- **Settings** — View theme and section settings
- **Sections** — List and highlight rendered sections
- **Cart** — Live cart state with actions
- **Info** — Theme, template, and request info
- **Analytics** — View analytics and tracking data
- **Apps** — Installed apps information
- **Cookies** — Browser cookies inspector
- **Storage** — LocalStorage and SessionStorage viewer
- **Localization** — Markets, currencies, and languages
- **SEO** — Meta tags and SEO information
- **Console** — Liquid debug console

Click any property to copy its Liquid path.

## Development

```bash
npm install
npm run dev      # Dev server at localhost:9999
npm run build    # Production build
```

## License

[MIT](LICENSE)
