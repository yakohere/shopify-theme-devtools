import { css } from 'lit';

// Theme definitions
export const THEMES = {
  dark: {
    '--tdt-bg': '#1a1a1a',
    '--tdt-bg-secondary': '#242424',
    '--tdt-bg-hover': '#2a2a2a',
    '--tdt-border': '#333',
    '--tdt-text': '#e0e0e0',
    '--tdt-text-muted': '#888',
    '--tdt-accent': '#3b82f6',
    '--tdt-accent-hover': '#2563eb',
    '--tdt-success': '#22c55e',
    '--tdt-warning': '#eab308',
    '--tdt-error': '#ef4444',
    '--tdt-danger': '#ef4444',
    '--tdt-string': '#a5d6ff',
    '--tdt-number': '#79c0ff',
    '--tdt-boolean': '#ff7b72',
    '--tdt-null': '#888',
    '--tdt-key': '#c792ea',
    // SERP preview (Google dark theme)
    '--tdt-serp-bg': '#202124',
    '--tdt-serp-border': '#3c4043',
    '--tdt-serp-favicon-bg': '#303134',
    '--tdt-serp-domain': '#bdc1c6',
    '--tdt-serp-breadcrumb': '#9aa0a6',
    '--tdt-serp-title': '#8ab4f8',
    '--tdt-serp-description': '#bdc1c6',
  },
  light: {
    '--tdt-bg': '#ffffff',
    '--tdt-bg-secondary': '#f5f5f5',
    '--tdt-bg-hover': '#ebebeb',
    '--tdt-border': '#e0e0e0',
    '--tdt-text': '#1a1a1a',
    '--tdt-text-muted': '#666',
    '--tdt-accent': '#2563eb',
    '--tdt-accent-hover': '#1d4ed8',
    '--tdt-success': '#16a34a',
    '--tdt-warning': '#ca8a04',
    '--tdt-error': '#dc2626',
    '--tdt-danger': '#dc2626',
    '--tdt-string': '#0969da',
    '--tdt-number': '#0550ae',
    '--tdt-boolean': '#cf222e',
    '--tdt-null': '#666',
    '--tdt-key': '#8250df',
    // SERP preview (Google light theme)
    '--tdt-serp-bg': '#ffffff',
    '--tdt-serp-border': '#dfe1e5',
    '--tdt-serp-favicon-bg': '#f1f3f4',
    '--tdt-serp-domain': '#202124',
    '--tdt-serp-breadcrumb': '#5f6368',
    '--tdt-serp-title': '#1a0dab',
    '--tdt-serp-description': '#4d5156',
  },
};

// Scale values for font sizes
export const FONT_SCALES = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

/**
 * Base styles for all components.
 * CSS variables are inherited from the parent theme-devtools component.
 * Child components should NOT redefine these variables.
 */
export const baseStyles = css`
  :host {
    /* Inherit all CSS custom properties from parent */
    font-family: var(--tdt-font);
    font-size: calc(12px * var(--tdt-scale, 1));
    line-height: 1.5;
    color: var(--tdt-text);
    display: block;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  button {
    font-family: var(--tdt-font);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--tdt-bg-secondary);
    border: 1px solid var(--tdt-border);
    border-radius: var(--tdt-radius, 4px);
    padding: 6px 12px;
    color: var(--tdt-text);
    font-family: var(--tdt-font);
    font-size: calc(11px * var(--tdt-scale, 1));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn:hover:not(:disabled) {
    background: var(--tdt-bg-hover);
    border-color: var(--tdt-accent);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn--sm {
    padding: 4px 8px;
    font-size: calc(10px * var(--tdt-scale, 1));
  }

  .btn--danger {
    border-color: var(--tdt-danger);
    color: var(--tdt-danger);
  }

  .btn--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
  }

  .badge {
    font-size: calc(10px * var(--tdt-scale, 1));
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .badge--development {
    background: rgba(34, 197, 94, 0.2);
    color: var(--tdt-success);
  }

  .badge--unpublished {
    background: rgba(234, 179, 8, 0.2);
    color: var(--tdt-warning);
  }

  .badge--design {
    background: rgba(59, 130, 246, 0.2);
    color: var(--tdt-accent);
  }

  .empty-state {
    color: var(--tdt-text-muted);
    text-align: center;
    padding: 24px;
    font-style: italic;
  }

  input, select, textarea {
    font-family: var(--tdt-font);
    font-size: calc(12px * var(--tdt-scale, 1));
  }

  input[type="text"],
  input[type="number"],
  input[type="search"] {
    background: var(--tdt-bg-secondary);
    border: 1px solid var(--tdt-border);
    border-radius: var(--tdt-radius, 4px);
    padding: 6px 10px;
    color: var(--tdt-text);
  }

  input:focus {
    outline: none;
    border-color: var(--tdt-accent);
  }
`;

/**
 * Root styles for the main theme-devtools component only.
 * This defines all CSS custom properties that child components inherit.
 */
export const rootStyles = css`
  :host {
    /* Default dark theme - will be overridden by JS */
    --tdt-bg: #1a1a1a;
    --tdt-bg-secondary: #242424;
    --tdt-bg-hover: #2a2a2a;
    --tdt-border: #333;
    --tdt-text: #e0e0e0;
    --tdt-text-muted: #888;
    --tdt-accent: #3b82f6;
    --tdt-accent-hover: #2563eb;
    --tdt-success: #22c55e;
    --tdt-warning: #eab308;
    --tdt-error: #ef4444;
    --tdt-danger: #ef4444;
    --tdt-string: #a5d6ff;
    --tdt-number: #79c0ff;
    --tdt-boolean: #ff7b72;
    --tdt-null: #888;
    --tdt-key: #c792ea;
    --tdt-font: ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
    --tdt-scale: 1;
    --tdt-radius: 4px;
    /* SERP preview defaults (dark theme) */
    --tdt-serp-bg: #202124;
    --tdt-serp-border: #3c4043;
    --tdt-serp-favicon-bg: #303134;
    --tdt-serp-domain: #bdc1c6;
    --tdt-serp-breadcrumb: #9aa0a6;
    --tdt-serp-title: #8ab4f8;
    --tdt-serp-description: #bdc1c6;

    all: initial;
    font-family: var(--tdt-font);
    font-size: calc(12px * var(--tdt-scale, 1));
    line-height: 1.5;
    color: var(--tdt-text);
    display: block;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }
`;
