import { css } from 'lit';

export const baseStyles = css`
  :host {
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
    --tdt-danger: #ef4444;
    --tdt-string: #a5d6ff;
    --tdt-number: #79c0ff;
    --tdt-boolean: #ff7b72;
    --tdt-null: #888;
    --tdt-key: #c792ea;
    --tdt-font: ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
    --tdt-font-size: 12px;
    --tdt-radius: 4px;

    all: initial;
    font-family: var(--tdt-font);
    font-size: var(--tdt-font-size);
    line-height: 1.5;
    color: var(--tdt-text);
    display: block;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--tdt-bg-secondary);
    border: 1px solid var(--tdt-border);
    border-radius: var(--tdt-radius);
    padding: 6px 12px;
    color: var(--tdt-text);
    font-family: var(--tdt-font);
    font-size: 11px;
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
    font-size: 10px;
  }

  .btn--danger {
    border-color: var(--tdt-danger);
    color: var(--tdt-danger);
  }

  .btn--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
  }

  .badge {
    font-size: 10px;
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
    font-size: var(--tdt-font-size);
  }

  input[type="text"],
  input[type="number"],
  input[type="search"] {
    background: var(--tdt-bg-secondary);
    border: 1px solid var(--tdt-border);
    border-radius: var(--tdt-radius);
    padding: 6px 10px;
    color: var(--tdt-text);
  }

  input:focus {
    outline: none;
    border-color: var(--tdt-accent);
  }
`;

