#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

function log(message, color = '') {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✓ ${message}`, COLORS.green);
}

function warn(message) {
  log(`⚠ ${message}`, COLORS.yellow);
}

function error(message) {
  log(`✗ ${message}`, COLORS.red);
}

function info(message) {
  log(`  ${message}`, COLORS.dim);
}

function printHelp() {
  console.log(`
${COLORS.bold}Shopify Theme Devtools CLI${COLORS.reset}

${COLORS.bold}Usage:${COLORS.reset}
  npx shopify-theme-devtools <command> [options]

${COLORS.bold}Commands:${COLORS.reset}
  init          Initialize devtools in your Shopify theme
  sync          Sync metafields schema from .shopify/metafields.json

${COLORS.bold}Options for init:${COLORS.reset}
  --local       Copy JS/CSS to assets folder instead of using CDN
  --inject      Add render tag to layout/theme.liquid automatically
  --force       Overwrite existing files without prompting
  --help, -h    Show this help message

${COLORS.bold}Examples:${COLORS.reset}
  npx shopify-theme-devtools init
  npx shopify-theme-devtools init --local
  npx shopify-theme-devtools init --local --inject
  npx shopify-theme-devtools sync
`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest, force = false) {
  if (existsSync(dest) && !force) {
    warn(`File already exists: ${dest}`);
    info('Use --force to overwrite');
    return false;
  }
  copyFileSync(src, dest);
  return true;
}

function findMetafieldsSchema(themeRoot) {
  // Look for metafields.json in common locations
  const possiblePaths = [
    join(themeRoot, '.shopify', 'metafields.json'),
    join(themeRoot, 'metafields.json'),
    join(themeRoot, 'config', 'metafields.json'),
  ];

  for (const schemaPath of possiblePaths) {
    if (existsSync(schemaPath)) {
      try {
        const content = readFileSync(schemaPath, 'utf-8');
        // Validate it's valid JSON
        JSON.parse(content);
        return { path: schemaPath, content };
      } catch {
        // Invalid JSON, skip
      }
    }
  }

  return null;
}

function injectMetafieldsSchema(liquidContent, schemaContent) {
  // Replace the default empty schema with the actual schema
  const defaultSchema = `{%- capture devtools_metafields_schema -%}
{
  "article": [],
  "blog": [],
  "collection": [],
  "company": [],
  "company_location": [],
  "location": [],
  "market": [],
  "order": [],
  "page": [],
  "product": [],
  "variant": [],
  "shop": [],
  "customer": []
}
{%- endcapture -%}`;

  const newSchema = `{%- capture devtools_metafields_schema -%}
${schemaContent.trim()}
{%- endcapture -%}`;

  return liquidContent.replace(defaultSchema, newSchema);
}

function patchLiquidForLocal(content) {
  // Change CDN to asset_url
  let patched = content.replace(
    /{%- assign devtools_cdn_base = '[^']+' -%}/,
    "{%- assign devtools_cdn_base = '' -%}"
  );

  // Replace the script loading section for local assets
  patched = patched.replace(
    /<script>\s*window\.__THEME_DEVTOOLS_CSS_URL__[^<]+<\/script>\s*<script src="{{ devtools_cdn_base }}\/theme-devtools\.js" defer><\/script>/s,
    `<script>
      window.__THEME_DEVTOOLS_CSS_URL__ = '{{ 'theme-devtools.css' | asset_url }}';
    </script>
    <script src="{{ 'theme-devtools.js' | asset_url }}" defer></script>`
  );

  return patched;
}

function injectRenderTag(themeLiquidPath) {
  if (!existsSync(themeLiquidPath)) {
    warn(`layout/theme.liquid not found at: ${themeLiquidPath}`);
    return false;
  }

  let content = readFileSync(themeLiquidPath, 'utf-8');
  const renderTag = "{% render 'theme-devtools-bridge' %}";

  if (content.includes('theme-devtools-bridge')) {
    info('Render tag already exists in theme.liquid');
    return true;
  }

  // Insert before </body>
  const bodyCloseRegex = /<\/body>/i;
  if (!bodyCloseRegex.test(content)) {
    warn('Could not find </body> tag in theme.liquid');
    return false;
  }

  content = content.replace(bodyCloseRegex, `  ${renderTag}\n  </body>`);
  writeFileSync(themeLiquidPath, content);
  return true;
}

function detectThemeRoot(cwd) {
  // Check if we're in a Shopify theme directory
  const markers = ['layout', 'snippets', 'templates', 'config'];
  const hasMarkers = markers.filter(dir => existsSync(join(cwd, dir)));

  if (hasMarkers.length >= 2) {
    return cwd;
  }

  // Check if there's a theme subdirectory
  const possibleThemeDirs = ['theme', 'shopify', 'src'];
  for (const dir of possibleThemeDirs) {
    const themePath = join(cwd, dir);
    if (existsSync(themePath)) {
      const subMarkers = markers.filter(m => existsSync(join(themePath, m)));
      if (subMarkers.length >= 2) {
        return themePath;
      }
    }
  }

  return null;
}

async function init(args) {
  const cwd = process.cwd();
  const useLocal = args.includes('--local');
  const shouldInject = args.includes('--inject');
  const force = args.includes('--force');

  console.log();
  log('Shopify Theme Devtools', COLORS.bold);
  console.log();

  // Detect theme root
  const themeRoot = detectThemeRoot(cwd);

  if (!themeRoot) {
    error('Could not detect Shopify theme directory');
    info('Make sure you run this command from your theme root');
    info('(should contain layout/, snippets/, templates/ folders)');
    process.exit(1);
  }

  if (themeRoot !== cwd) {
    info(`Detected theme root: ${themeRoot}`);
  }

  const snippetsDir = join(themeRoot, 'snippets');
  const assetsDir = join(themeRoot, 'assets');
  const layoutDir = join(themeRoot, 'layout');

  // Ensure directories exist
  ensureDir(snippetsDir);
  if (useLocal) {
    ensureDir(assetsDir);
  }

  // Source files
  const liquidSrc = join(packageRoot, 'src', 'liquid', 'theme-devtools-bridge.liquid');
  const jsSrc = join(packageRoot, 'dist', 'theme-devtools.js');
  const cssSrc = join(packageRoot, 'dist', 'theme-devtools.css');

  // Destination files
  const liquidDest = join(snippetsDir, 'theme-devtools-bridge.liquid');
  const jsDest = join(assetsDir, 'theme-devtools.js');
  const cssDest = join(assetsDir, 'theme-devtools.css');

  let liquidContent = readFileSync(liquidSrc, 'utf-8');

  // Set devtools_local to false for production use
  liquidContent = liquidContent.replace(
    /{%- assign devtools_local = true -%}/,
    '{%- assign devtools_local = false -%}'
  );

  // Auto-detect and inject metafields schema
  const metafieldsSchema = findMetafieldsSchema(themeRoot);
  if (metafieldsSchema) {
    liquidContent = injectMetafieldsSchema(liquidContent, metafieldsSchema.content);
    success(`Injected metafields schema from ${metafieldsSchema.path.replace(themeRoot + '/', '')}`);
  }

  if (useLocal) {
    liquidContent = patchLiquidForLocal(liquidContent);
  }

  // Copy liquid snippet
  if (existsSync(liquidDest) && !force) {
    warn(`Snippet already exists: snippets/theme-devtools-bridge.liquid`);
    info('Use --force to overwrite');
  } else {
    writeFileSync(liquidDest, liquidContent);
    success('Created snippets/theme-devtools-bridge.liquid');
  }

  // Copy assets if --local
  if (useLocal) {
    if (!existsSync(jsSrc)) {
      error('dist/theme-devtools.js not found. Run npm run build first.');
      process.exit(1);
    }

    if (copyFile(jsSrc, jsDest, force)) {
      success('Copied assets/theme-devtools.js');
    }

    if (existsSync(cssSrc)) {
      if (copyFile(cssSrc, cssDest, force)) {
        success('Copied assets/theme-devtools.css');
      }
    }
  }

  // Inject render tag if --inject
  if (shouldInject) {
    const themeLiquid = join(layoutDir, 'theme.liquid');
    if (injectRenderTag(themeLiquid)) {
      success('Added render tag to layout/theme.liquid');
    }
  }

  console.log();
  log('Setup complete!', COLORS.green + COLORS.bold);
  console.log();

  if (!shouldInject) {
    log('Next step:', COLORS.bold);
    info("Add this line to layout/theme.liquid before </body>:");
    console.log();
    log("  {% render 'theme-devtools-bridge' %}", COLORS.blue);
    console.log();
    info('Or run with --inject to do this automatically');
  }

  console.log();
  info('The devtools panel will only appear on unpublished/development themes.');
  console.log();
}

async function sync() {
  const cwd = process.cwd();

  console.log();
  log('Shopify Theme Devtools', COLORS.bold);
  console.log();

  // Detect theme root
  const themeRoot = detectThemeRoot(cwd);

  if (!themeRoot) {
    error('Could not detect Shopify theme directory');
    info('Make sure you run this command from your theme root');
    info('(should contain layout/, snippets/, templates/ folders)');
    process.exit(1);
  }

  const snippetsDir = join(themeRoot, 'snippets');
  const liquidDest = join(snippetsDir, 'theme-devtools-bridge.liquid');

  // Check if snippet exists
  if (!existsSync(liquidDest)) {
    error('Devtools snippet not found');
    info('Run "npx shopify-theme-devtools init" first');
    process.exit(1);
  }

  // Find metafields schema
  const metafieldsSchema = findMetafieldsSchema(themeRoot);

  if (!metafieldsSchema) {
    error('No metafields.json found');
    info('Looked in: .shopify/metafields.json, metafields.json, config/metafields.json');
    process.exit(1);
  }

  // Read current snippet
  let liquidContent = readFileSync(liquidDest, 'utf-8');

  // Replace the metafields schema using a regex that matches any JSON content
  const schemaRegex = /\{%- capture devtools_metafields_schema -%\}[\s\S]*?\{%- endcapture -%\}/;

  if (!schemaRegex.test(liquidContent)) {
    error('Could not find metafields schema section in snippet');
    info('The snippet may be corrupted. Run "npx shopify-theme-devtools init --force" to regenerate');
    process.exit(1);
  }

  const newSchema = `{%- capture devtools_metafields_schema -%}
${metafieldsSchema.content.trim()}
{%- endcapture -%}`;

  liquidContent = liquidContent.replace(schemaRegex, newSchema);

  // Write updated snippet
  writeFileSync(liquidDest, liquidContent);
  success(`Synced metafields schema from ${metafieldsSchema.path.replace(themeRoot + '/', '')}`);

  console.log();
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'init') {
  init(args);
} else if (command === 'sync') {
  sync();
} else {
  error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
