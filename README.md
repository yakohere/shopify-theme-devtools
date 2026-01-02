# Shopify Theme Devtools

In-browser devtools panel for Shopify theme development. Inspect Liquid context, cart state, and sections while working on storefront previews.

## Features

- **Object Inspector** — Tree-based viewer for Liquid objects (`cart`, `product`, `customer`, `shop`, etc.)
- **Liquid Path Copying** — Click any property to copy its Liquid access path
- **Section Highlighter** — List all sections, click to highlight and scroll into view
- **Cart Toolkit** — Live cart state, change tracking, diff visualization, and actions
- **Context Summary** — Template name, page type, theme info, locale, currency, design mode

## Project Structure

```
src/
├── scripts/
│   ├── utils/           # DOM helpers, clipboard, formatting
│   ├── services/        # Context parser, Cart API, Section highlighter
│   ├── components/      # UI components (panels, inspector, tabs)
│   └── main.js          # Entry point
├── styles/
│   └── main.css         # Styles (embedded in Shadow DOM)
└── liquid/
    └── theme-devtools-bridge.liquid   # Shopify snippet
```

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
npm install
```

### Commands

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Build Output

After running `npm run build`, the `dist/` folder will contain:

```
dist/
└── theme-devtools.js    # Single bundled IIFE (~25KB minified)
```

## Installation in Shopify Theme

### 1. Upload JS to CDN

After building, upload `dist/theme-devtools.js` to your CDN of choice:
- jsDelivr (via npm package)
- Cloudflare R2
- AWS S3 + CloudFront
- Shopify Files (via Storefront API)

### 2. Add Liquid Snippet

Copy `src/liquid/theme-devtools-bridge.liquid` to your theme's `snippets/` folder.

Update the CDN URL in the snippet:

```liquid
<script src="https://your-cdn.com/theme-devtools/v1.0.0/theme-devtools.js" defer></script>
```

### 3. Render in Theme

Add to `layout/theme.liquid` before `</body>`:

```liquid
{% render 'theme-devtools-bridge' %}
```

The devtools only render on **development/preview themes** (`theme.role == 'development'` or `theme.role == 'unpublished'`).

## Usage

### Keyboard Shortcut

`Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows) — Toggle panel

### Object Inspector

1. Select an object tab (shop, product, customer, etc.)
2. Expand nested properties by clicking
3. Click any **property key** to copy its Liquid path
4. Use search to filter properties

### Section Highlighter

1. Click "Sections" tab
2. Click any section to highlight on page
3. Section is outlined and scrolled into view

### Cart Toolkit

1. Click "Cart" tab
2. View live cart summary
3. See change diffs (added/removed/modified)
4. Adjust quantities or remove items

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 theme-devtools-bridge.liquid                     │
│  • Gates rendering (theme.role == 'development')                │
│  • Outputs JSON context                                         │
│  • Loads JS bundle from CDN                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      theme-devtools.js                           │
├─────────────────────────────────────────────────────────────────┤
│  Services          │  Components        │  Utils                │
│  ─────────────     │  ──────────────    │  ──────               │
│  • contextParser   │  • ObjectInspector │  • DOM helpers        │
│  • cartAPI         │  • Panels          │  • Clipboard          │
│  • sectionLight.   │  • Tabs            │  • Format money       │
├─────────────────────────────────────────────────────────────────┤
│                      ThemeDevtools                               │
│  • Shadow DOM mounting                                          │
│  • State management                                             │
│  • Event handling                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Schemas

### Context JSON

```typescript
interface DevtoolsContext {
  meta: {
    theme: { id: number; name: string; role: string };
    template: { name: string; suffix: string | null };
    request: { page_type: string; design_mode: boolean; locale: {...} };
    localization: { country: {...}; language: {...}; market: {...} };
  };
  objects: {
    shop: ShopObject;
    customer: CustomerObject | null;
    product: ProductObject | null;
    collection: CollectionObject | null;
    article: ArticleObject | null;
    blog: BlogObject | null;
    page: PageObject | null;
    cart: null; // Fetched via /cart.js
  };
  timestamp: number;
}
```

### Cart Diff

```typescript
interface CartDiff {
  itemCount: { old: number; new: number };
  totalPrice: { old: number; new: number };
  items: {
    added: CartItem[];
    removed: CartItem[];
    modified: { item: CartItem; oldQuantity: number; newQuantity: number }[];
  };
}
```

## Technical Details

- **Shadow DOM** — Isolates devtools CSS from theme styles
- **Cart Tracking** — Ajax interception + polling fallback
- **Section Detection** — `[id^="shopify-section-"]` + `[data-section-id]`
- **No Dependencies** — Vanilla JS, ~25KB minified

## Browser Support

Chrome 80+, Firefox 78+, Safari 14+, Edge 80+

## License

MIT
