import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';
import { expressionEvaluator } from '../../services/expression-evaluator.js';

export class ConsolePanel extends LitElement {
  static properties = {
    logs: { type: Array, state: true },
    liquidErrors: { type: Array, state: true },
    filter: { type: String, state: true },
    activeFilter: { type: String, state: true },
    showThemeOnly: { type: Boolean, state: true },
    expandedLogs: { type: Set, state: true },
    groupedErrors: { type: Map, state: true },
    networkErrors: { type: Array, state: true },
    groupStack: { type: Array, state: true },
    // Expression input properties
    inputValue: { type: String, state: true },
    inputHistory: { type: Array, state: true },
    historyIndex: { type: Number, state: true },
    suggestions: { type: Array, state: true },
    selectedSuggestion: { type: Number, state: true },
    showSuggestions: { type: Boolean, state: true },
    showFilterDropdown: { type: Boolean, state: true },
    context: { type: Object },
  };

  static STORAGE_KEY = 'tdt-console-logs';

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 12px;
        height: 100%;
        overflow: hidden;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        position: sticky;
        top: 0;
        background: var(--tdt-bg);
        z-index: 10;
        margin: 0;
        padding: 0 0 12px 0;
      }

      .search {
        flex: 1;
        min-width: 120px;
      }

      /* Filter Dropdown */
      .filter-dropdown {
        position: relative;
      }

      .filter-dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text);
        font-family: var(--tdt-font);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
        min-width: 150px;
      }

      .filter-dropdown-trigger:hover {
        background: var(--tdt-bg-hover);
      }

      .filter-dropdown-trigger--active {
        border-color: var(--tdt-accent);
      }

      .filter-dropdown-trigger__icon {
        margin-left: auto;
        font-size: calc(10px * var(--tdt-scale, 1));
        transition: transform 0.15s ease;
      }

      .filter-dropdown-trigger__icon--open {
        transform: rotate(180deg);
      }

      .filter-dropdown-trigger__count {
        font-size: calc(10px * var(--tdt-scale, 1));
        background: var(--tdt-accent);
        color: white;
        padding: 1px 6px;
        border-radius: 8px;
        font-weight: 600;
      }

      .filter-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        min-width: 180px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        z-index: 100;
        overflow: hidden;
      }

      .filter-dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        transition: background 0.1s ease;
      }

      .filter-dropdown-item:hover {
        background: var(--tdt-bg-hover);
      }

      .filter-dropdown-item--active {
        background: var(--tdt-accent);
        color: white;
      }

      .filter-dropdown-item--active:hover {
        background: var(--tdt-accent);
      }

      .filter-dropdown-item__icon {
        width: 16px;
        text-align: center;
        flex-shrink: 0;
      }

      .filter-dropdown-item__label {
        flex: 1;
      }

      .filter-dropdown-item__count {
        font-size: calc(10px * var(--tdt-scale, 1));
        opacity: 0.7;
        background: rgba(255, 255, 255, 0.15);
        padding: 1px 6px;
        border-radius: 8px;
      }

      .filter-dropdown-item--active .filter-dropdown-item__count {
        background: rgba(255, 255, 255, 0.25);
        opacity: 1;
      }

      .filter-dropdown-item--error {
        color: var(--tdt-error);
      }

      .filter-dropdown-item--error.filter-dropdown-item--active {
        background: var(--tdt-error);
        color: white;
      }

      .filter-dropdown-item--warn {
        color: var(--tdt-warning);
      }

      .filter-dropdown-item--warn.filter-dropdown-item--active {
        background: var(--tdt-warning);
        color: var(--tdt-bg);
      }

      .toggle-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .toggle-btn:hover {
        background: var(--tdt-bg-hover);
      }

      .toggle-btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn-clear {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .btn-clear:hover {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .log-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .log-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        overflow: hidden;
        margin-bottom: 4px;
      }

      .log-item--error {
        border-left: 3px solid var(--tdt-error);
        background: rgba(255, 77, 77, 0.05);
      }

      .log-item--warn {
        border-left: 3px solid var(--tdt-warning);
        background: rgba(255, 193, 100, 0.05);
      }

      .log-item--info {
        border-left: 3px solid var(--tdt-accent);
      }

      .log-item--liquid {
        border-left: 3px solid #9382ff;
        background: rgba(147, 130, 255, 0.05);
      }

      .log-item--deprecation {
        border-left: 3px solid #ff9f43;
        background: rgba(255, 159, 67, 0.05);
      }

      .log-header {
        display: flex;
        align-items: flex-start;
        padding: 8px 10px;
        cursor: pointer;
        gap: 8px;
      }

      .log-header:hover {
        background: var(--tdt-bg-hover);
      }

      .log-type {
        font-size: calc(10px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .log-type--error {
        background: var(--tdt-error);
        color: white;
      }

      .log-type--warn {
        background: var(--tdt-warning);
        color: var(--tdt-bg);
      }

      .log-type--info {
        background: var(--tdt-accent);
        color: white;
      }

      .log-type--log {
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
      }

      .log-type--liquid {
        background: #9382ff;
        color: white;
      }

      .log-type--deprecation {
        background: #ff9f43;
        color: white;
      }

      .log-message {
        flex: 1;
        font-family: var(--tdt-font-mono);
        color: var(--tdt-text);
      }

      .log-count {
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: calc(10px * var(--tdt-scale, 1));
        font-weight: 600;
        flex-shrink: 0;
      }

      .log-time {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        flex-shrink: 0;
      }

      .log-content {
        border-top: 1px solid var(--tdt-border);
        padding: 10px;
        background: var(--tdt-bg);
      }

      .log-stack {
        font-family: var(--tdt-font-mono);
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        white-space: pre-wrap;
        max-height: 150px;
        overflow: auto;
        margin-top: 8px;
        padding: 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
      }

      .log-source {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 6px;
      }

      .log-source a {
        color: var(--tdt-accent);
        text-decoration: none;
      }

      .log-source a:hover {
        text-decoration: underline;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state__icon {
        font-size: calc(32px * var(--tdt-scale, 1));
        margin-bottom: 8px;
      }

      .liquid-section {
        margin-bottom: 16px;
      }

      .section-title {
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--tdt-border);
      }

      .deprecation-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-left: 3px solid #ff9f43;
        border-radius: var(--tdt-radius);
        padding: 10px 12px;
        margin-bottom: 8px;
      }

      .deprecation-tag {
        font-family: var(--tdt-font-mono);
        font-weight: 600;
        color: #ff9f43;
      }

      .deprecation-message {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        margin-top: 4px;
      }

      .deprecation-replacement {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 4px;
      }

      .deprecation-replacement code {
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        color: var(--tdt-success);
      }

      .log-item--network {
        border-left: 3px solid #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }

      .log-type--network {
        background: #ef4444;
        color: white;
      }

      .log-item--group {
        border-left: 3px solid #6366f1;
        background: rgba(99, 102, 241, 0.05);
      }

      .log-type--group {
        background: #6366f1;
        color: white;
      }

      .log-group-children {
        margin-left: 16px;
        padding-left: 12px;
        border-left: 2px solid var(--tdt-border);
      }

      .log-table {
        width: 100%;
        border-collapse: collapse;
        font-size: calc(11px * var(--tdt-scale, 1));
        margin-top: 8px;
      }

      .log-table th,
      .log-table td {
        border: 1px solid var(--tdt-border);
        padding: 4px 8px;
        text-align: left;
      }

      .log-table th {
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text-muted);
        font-weight: 600;
      }

      .log-table td {
        color: var(--tdt-text);
      }

      .log-table tr:nth-child(even) td {
        background: rgba(255, 255, 255, 0.02);
      }

      .network-details {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        margin-top: 8px;
      }

      .network-details dt {
        color: var(--tdt-text-muted);
      }

      .network-details dd {
        color: var(--tdt-text);
        margin: 0;
        word-break: break-all;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        font-size: calc(10px * var(--tdt-scale, 1));
        font-weight: 600;
      }

      .status-badge--error {
        background: var(--tdt-error);
        color: white;
      }

      .status-badge--success {
        background: var(--tdt-success);
        color: white;
      }

      .persist-indicator {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .persist-indicator::before {
        content: '';
        width: 6px;
        height: 6px;
        background: var(--tdt-success);
        border-radius: 50%;
      }

      .log-item--drop {
        border-left: 3px solid #f97316;
        background: rgba(249, 115, 22, 0.05);
      }

      .log-type--drop {
        background: #f97316;
        color: white;
      }

      .log-item--asset {
        border-left: 3px solid #eab308;
        background: rgba(234, 179, 8, 0.05);
      }

      .log-type--asset {
        background: #eab308;
        color: var(--tdt-bg);
      }

      .log-item--schema {
        border-left: 3px solid #ec4899;
        background: rgba(236, 72, 153, 0.05);
      }

      .log-type--schema {
        background: #ec4899;
        color: white;
      }

      .liquid-category {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 1px 4px;
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        margin-left: 6px;
      }

      .element-path {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        margin-top: 4px;
        padding: 4px 8px;
        background: var(--tdt-bg);
        border-radius: var(--tdt-radius);
      }

      .liquid-hint {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 6px;
        padding: 6px 8px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: var(--tdt-radius);
        border-left: 2px solid #6366f1;
      }

      .liquid-hint code {
        background: var(--tdt-bg-secondary);
        padding: 1px 4px;
        border-radius: 2px;
        color: var(--tdt-success);
      }

      /* Console Input Styles */
      .console-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .console-content {
        flex: 1;
        overflow: auto;
        padding-bottom: 8px;
      }

      .console-input-container {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 0;
        border-top: 1px solid var(--tdt-border);
        background: var(--tdt-bg);
        margin-top: auto;
      }

      .console-prompt {
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        font-size: calc(14px * var(--tdt-scale, 1));
        font-weight: 600;
        flex-shrink: 0;
        user-select: none;
        padding-top: 4px;
      }

      .console-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        font-size: calc(12px * var(--tdt-scale, 1));
        padding: 4px 0;
        resize: none;
        min-height: 20px;
        max-height: 150px;
        overflow-y: auto;
        line-height: 1.4;
      }

      .console-input::placeholder {
        color: var(--tdt-text-muted);
        opacity: 0.6;
      }

      .console-input-hint {
        position: absolute;
        right: 0;
        bottom: 100%;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        opacity: 0.6;
        padding: 2px 4px;
      }

      .autocomplete-dropdown {
        position: absolute;
        bottom: 100%;
        left: 20px;
        right: 0;
        max-height: 200px;
        overflow-y: auto;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.25);
        z-index: 100;
        margin-bottom: 4px;
      }

      .autocomplete-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        border-bottom: 1px solid var(--tdt-border);
      }

      .autocomplete-item:last-child {
        border-bottom: none;
      }

      .autocomplete-item:hover:not(.autocomplete-item--selected) {
        background: var(--tdt-bg-hover);
      }

      .autocomplete-item--selected {
        background: var(--tdt-accent);
      }

      .autocomplete-item--selected .autocomplete-path {
        color: white;
        font-weight: 500;
      }

      .autocomplete-item--selected .autocomplete-type {
        background: rgba(0, 0, 0, 0.2);
        color: white;
        border-color: transparent;
      }

      .autocomplete-item--selected .autocomplete-preview {
        color: rgba(255, 255, 255, 0.8);
      }

      .autocomplete-path {
        flex: 1;
        color: var(--tdt-text);
      }

      .autocomplete-type {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: 3px;
        background: var(--tdt-bg-hover);
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        font-weight: 600;
        border: 1px solid var(--tdt-border);
        flex-shrink: 0;
      }

      .autocomplete-type--filter {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .autocomplete-preview {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Eval log styles */
      .log-item--eval {
        border-left: 3px solid var(--tdt-accent);
        background: rgba(59, 130, 246, 0.05);
      }

      .log-type--eval {
        background: var(--tdt-accent);
        color: white;
      }

      .eval-expression {
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        margin-bottom: 4px;
      }

      .eval-result {
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
      }

      .eval-result--error {
        color: var(--tdt-error);
      }

      .eval-result--undefined {
        color: var(--tdt-text-muted);
        font-style: italic;
      }

      .eval-result--string {
        color: #22c55e;
      }

      .eval-result--number {
        color: #3b82f6;
      }

      .eval-result--boolean {
        color: #a855f7;
      }

      .eval-result--null {
        color: var(--tdt-text-muted);
      }
    `
  ];

  static THEME_KEYWORDS = [
    'shopify', 'theme', 'liquid', 'cart', 'product', 'collection',
    'variant', 'checkout', 'customer', 'section', 'block', 'snippet',
    'asset', 'cdn.shopify', 'myshopify', 'storefront'
  ];

  static LIQUID_DEPRECATIONS = [
    { pattern: /\{\%\s*include\s+/i, tag: '{% include %}', message: 'The include tag is deprecated', replacement: '{% render %}' },
    { pattern: /\|\s*date_to_xmlschema/i, tag: '| date_to_xmlschema', message: 'date_to_xmlschema is deprecated', replacement: '| date: "%Y-%m-%dT%H:%M:%S%z"' },
    { pattern: /\|\s*json_string/i, tag: '| json_string', message: 'json_string is deprecated', replacement: '| json' },
    { pattern: /\.all\.size/i, tag: '.all.size', message: 'Using .all.size is deprecated', replacement: 'Use .size directly or specific count properties' },
    { pattern: /product\.collections\[0\]/i, tag: 'product.collections[0]', message: 'Accessing collections by index is unreliable', replacement: 'Use collection object directly' },
  ];

  constructor() {
    super();
    this.logs = [];
    this.liquidErrors = [];
    this.filter = '';
    this.activeFilter = 'all';
    this.showThemeOnly = true;
    this.expandedLogs = new Set();
    this.groupedErrors = new Map();
    this.networkErrors = [];
    this.groupStack = [];
    this._originalConsole = {};
    this._originalFetch = null;
    this._currentGroupId = null;

    // Expression input state
    this.inputValue = '';
    this.inputHistory = [];
    this.historyIndex = -1;
    this.suggestions = [];
    this.selectedSuggestion = -1;
    this.showSuggestions = false;
    this.showFilterDropdown = false;
    this.context = null;

    // Load persisted logs
    this._loadPersistedLogs();
  }

  _loadPersistedLogs() {
    try {
      const stored = sessionStorage.getItem(ConsolePanel.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.logs = (data.logs || []).map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
          persisted: true
        }));
        this.networkErrors = (data.networkErrors || []).map(err => ({
          ...err,
          timestamp: new Date(err.timestamp),
          persisted: true
        }));

        // Rebuild grouped errors
        this.logs.forEach(log => {
          if (log.type === 'error' || log.type === 'warn') {
            const key = this._getGroupKey(log);
            const existing = this.groupedErrors.get(key);
            if (existing) {
              existing.count++;
            } else {
              this.groupedErrors.set(key, { ...log, count: 1 });
            }
          }
        });
        this.groupedErrors = new Map(this.groupedErrors);
      }
    } catch (e) {
      console.warn('Failed to load persisted logs:', e);
    }
  }

  _persistLogs() {
    try {
      const data = {
        logs: this.logs.slice(-500).map(log => ({
          ...log,
          args: undefined // Don't persist complex objects
        })),
        networkErrors: this.networkErrors.slice(-100)
      };
      sessionStorage.setItem(ConsolePanel.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage full or unavailable, silently fail
    }
  }

  _getGroupKey(log) {
    // Smarter grouping: normalize URLs, remove timestamps, etc.
    let message = log.message || '';

    // Remove timestamps
    message = message.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '[timestamp]');
    message = message.replace(/\d{2}:\d{2}:\d{2}\.\d{3}/g, '[time]');

    // Normalize UUIDs
    message = message.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[uuid]');

    // Normalize numbers in URLs
    message = message.replace(/\/\d+\//g, '/[id]/');
    message = message.replace(/=\d+(&|$)/g, '=[num]$1');

    // Take first 200 chars after normalization
    return `${log.type}:${message.substring(0, 200)}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._interceptConsole();
    this._interceptNetwork();
    this._scanForLiquidErrors();
    this._captureGlobalErrors();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._restoreConsole();
    this._restoreNetwork();
    window.removeEventListener('error', this._handleGlobalError);
    window.removeEventListener('unhandledrejection', this._handleUnhandledRejection);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Update expression evaluator context when context changes
    if (changedProperties.has('context') && this.context) {
      expressionEvaluator.setContext(this.context);
    }
  }

  willUpdate(changedProperties) {
    // Also set context on initial render
    if (changedProperties.has('context') && this.context && !expressionEvaluator.context) {
      expressionEvaluator.setContext(this.context);
    }
  }

  _interceptConsole() {
    const self = this;
    const methods = ['log', 'info', 'warn', 'error', 'debug'];

    methods.forEach(method => {
      this._originalConsole[method] = console[method];
      console[method] = function(...args) {
        self._addLog(method, args);
        self._originalConsole[method].apply(console, args);
      };
    });

    // Handle console.table
    this._originalConsole.table = console.table;
    console.table = function(data, columns) {
      self._addLog('table', [data], { columns, isTable: true });
      self._originalConsole.table.apply(console, [data, columns]);
    };

    // Handle console.group and groupCollapsed
    this._originalConsole.group = console.group;
    this._originalConsole.groupCollapsed = console.groupCollapsed;
    this._originalConsole.groupEnd = console.groupEnd;

    console.group = function(...args) {
      const groupId = Date.now() + Math.random();
      self._startGroup(args.join(' ') || 'Group', groupId, false);
      self._originalConsole.group.apply(console, args);
    };

    console.groupCollapsed = function(...args) {
      const groupId = Date.now() + Math.random();
      self._startGroup(args.join(' ') || 'Group', groupId, true);
      self._originalConsole.groupCollapsed.apply(console, args);
    };

    console.groupEnd = function() {
      self._endGroup();
      self._originalConsole.groupEnd.apply(console);
    };
  }

  _restoreConsole() {
    Object.keys(this._originalConsole).forEach(method => {
      if (this._originalConsole[method]) {
        console[method] = this._originalConsole[method];
      }
    });
  }

  _startGroup(label, groupId, collapsed) {
    const groupLog = {
      id: groupId,
      type: 'group',
      message: label,
      timestamp: new Date(),
      isThemeRelated: this._isThemeRelated(label, ''),
      collapsed,
      children: [],
      parentGroupId: this._currentGroupId
    };

    if (this._currentGroupId) {
      // Nested group - add to parent's children
      const parentGroup = this._findGroupById(this._currentGroupId);
      if (parentGroup) {
        parentGroup.children.push(groupLog);
      }
    } else {
      this.logs = [...this.logs, groupLog];
    }

    this.groupStack.push(groupId);
    this._currentGroupId = groupId;
  }

  _endGroup() {
    this.groupStack.pop();
    this._currentGroupId = this.groupStack.length > 0
      ? this.groupStack[this.groupStack.length - 1]
      : null;
  }

  _findGroupById(groupId, logs = this.logs) {
    for (const log of logs) {
      if (log.id === groupId) return log;
      if (log.children) {
        const found = this._findGroupById(groupId, log.children);
        if (found) return found;
      }
    }
    return null;
  }

  _interceptNetwork() {
    const self = this;

    // Intercept fetch
    this._originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      const startTime = performance.now();

      try {
        const response = await self._originalFetch.apply(window, [input, init]);
        const duration = performance.now() - startTime;

        if (!response.ok) {
          self._addNetworkError({
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            duration,
            type: 'fetch'
          });
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        self._addNetworkError({
          url,
          method,
          status: 0,
          statusText: error.message || 'Network Error',
          duration,
          type: 'fetch',
          error: true
        });
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._tdtMethod = method;
      this._tdtUrl = url;
      this._tdtStartTime = null;
      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      this._tdtStartTime = performance.now();

      this.addEventListener('loadend', function() {
        const duration = performance.now() - this._tdtStartTime;

        if (this.status >= 400 || this.status === 0) {
          self._addNetworkError({
            url: this._tdtUrl,
            method: this._tdtMethod,
            status: this.status,
            statusText: this.statusText || (this.status === 0 ? 'Network Error' : ''),
            duration,
            type: 'xhr'
          });
        }
      });

      return originalXHRSend.apply(this, arguments);
    };

    this._originalXHROpen = originalXHROpen;
    this._originalXHRSend = originalXHRSend;
  }

  _restoreNetwork() {
    if (this._originalFetch) {
      window.fetch = this._originalFetch;
    }
    if (this._originalXHROpen) {
      XMLHttpRequest.prototype.open = this._originalXHROpen;
    }
    if (this._originalXHRSend) {
      XMLHttpRequest.prototype.send = this._originalXHRSend;
    }
  }

  _addNetworkError(details) {
    const error = {
      id: Date.now() + Math.random(),
      ...details,
      timestamp: new Date(),
      isThemeRelated: this._isThemeRelated(details.url, '')
    };

    this.networkErrors = [...this.networkErrors, error];
    this._persistLogs();
  }

  _captureGlobalErrors() {
    this._handleGlobalError = (event) => {
      this._addLog('error', [event.message], {
        stack: event.error?.stack,
        source: `${event.filename}:${event.lineno}:${event.colno}`
      });
    };

    this._handleUnhandledRejection = (event) => {
      this._addLog('error', [`Unhandled Promise Rejection: ${event.reason}`], {
        stack: event.reason?.stack
      });
    };

    window.addEventListener('error', this._handleGlobalError);
    window.addEventListener('unhandledrejection', this._handleUnhandledRejection);
  }

  _addLog(type, args, extra = {}) {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const isThemeRelated = this._isThemeRelated(message, extra.source);

    const logEntry = {
      id: Date.now() + Math.random(),
      type,
      message,
      args,
      timestamp: new Date(),
      isThemeRelated,
      stack: extra.stack,
      source: extra.source,
      hasObjects: args.some(a => typeof a === 'object' && a !== null),
      isTable: extra.isTable || false,
      tableColumns: extra.columns,
      groupId: this._currentGroupId
    };

    const key = this._getGroupKey(logEntry);
    const existing = this.groupedErrors.get(key);

    if (existing && (type === 'error' || type === 'warn')) {
      existing.count++;
      existing.lastTime = logEntry.timestamp;
      this.groupedErrors = new Map(this.groupedErrors);
    } else {
      if (type === 'error' || type === 'warn') {
        this.groupedErrors.set(key, { ...logEntry, count: 1 });
        this.groupedErrors = new Map(this.groupedErrors);
      }

      // Add to current group if we're inside one
      if (this._currentGroupId) {
        const currentGroup = this._findGroupById(this._currentGroupId);
        if (currentGroup) {
          currentGroup.children.push(logEntry);
          this.logs = [...this.logs]; // Trigger reactivity
        } else {
          this.logs = [...this.logs, logEntry];
        }
      } else {
        this.logs = [...this.logs, logEntry];
      }
    }

    this._persistLogs();
  }

  _isThemeRelated(message, source = '') {
    const combined = (message + ' ' + source).toLowerCase();
    return ConsolePanel.THEME_KEYWORDS.some(kw => combined.includes(kw));
  }

  _scanForLiquidErrors() {
    const errors = [];
    const seenMessages = new Set();

    const addError = (message, category, element = null) => {
      const trimmed = message.trim();
      if (seenMessages.has(trimmed)) return;
      seenMessages.add(trimmed);

      errors.push({
        id: Date.now() + Math.random(),
        type: 'liquid',
        category,
        message: trimmed,
        timestamp: new Date(),
        element: element ? this._getElementPath(element) : null
      });
    };

    // 1. Scan HTML comments for Liquid errors
    const comments = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    while (comments.nextNode()) {
      const text = comments.currentNode.textContent;
      if (text.includes('Liquid error') || text.includes('Liquid syntax error')) {
        addError(text, 'comment');
      }
    }

    // 2. Scan visible text content for various Liquid error patterns
    const pageContent = document.body.innerHTML;

    // Liquid error patterns
    const liquidErrorPatterns = [
      // Standard Liquid errors
      /Liquid\s+error\s*\(line\s*\d+\):\s*[^<\n]+/gi,
      /Liquid\s+error:\s*[^<\n]+/gi,
      /Liquid\s+syntax\s+error\s*\(line\s*\d+\):\s*[^<\n]+/gi,
      /Liquid\s+syntax\s+error:\s*[^<\n]+/gi,

      // Schema/JSON errors
      /Error\s+in\s+schema:\s*[^<\n]+/gi,
      /Invalid\s+JSON\s+in\s+schema\s+tag/gi,
      /Error\s+parsing\s+schema:\s*[^<\n]+/gi,
    ];

    liquidErrorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(pageContent)) !== null) {
        addError(match[0], 'inline');
      }
    });

    // 3. Detect Drop objects rendered as strings (e.g., #<ProductDrop:0x...>)
    const dropPattern = /#<(?:Shopify::)?(?:Liquid::)?(\w+)Drop:0x[a-f0-9]+>/gi;
    let dropMatch;
    while ((dropMatch = dropPattern.exec(pageContent)) !== null) {
      const dropType = dropMatch[1];
      addError(
        `Raw ${dropType} Drop object rendered: ${dropMatch[0]} — Use .title, .url, or other property instead of outputting the object directly`,
        'drop'
      );
    }

    // 4. Scan text nodes for errors that might be in visible content
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tagName = parent.tagName?.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      const text = walker.currentNode.textContent;

      // Check for Liquid errors in text
      if (/Liquid\s+(error|syntax error)/i.test(text)) {
        const match = text.match(/Liquid\s+(?:error|syntax error)[^]*/i);
        if (match) {
          addError(match[0], 'text', walker.currentNode.parentElement);
        }
      }

      // Check for Drop objects in text
      if (/#<\w+Drop:0x/i.test(text)) {
        const match = text.match(/#<(?:Shopify::)?(?:Liquid::)?(\w+)Drop:0x[a-f0-9]+>/i);
        if (match) {
          addError(
            `Raw ${match[1]} Drop object in page: ${match[0]}`,
            'drop',
            walker.currentNode.parentElement
          );
        }
      }

      // Check for "unknown image file" or asset errors
      if (/unknown\s+image\s+file/i.test(text)) {
        addError(`Unknown image file error: ${text.substring(0, 200)}`, 'asset', walker.currentNode.parentElement);
      }
    }

    // 5. Check for broken images that might indicate asset errors
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src || img.dataset.src;
      const alt = img.alt;

      // Check if alt text contains error indicators
      if (alt && /Liquid\s+error|Could\s+not\s+find\s+asset/i.test(alt)) {
        addError(`Image error: ${alt}`, 'asset', img);
      }

      // Check for broken image indicators in src
      if (src && /Liquid%20error|Could%20not%20find/i.test(src)) {
        addError(`Broken image URL contains error: ${decodeURIComponent(src.substring(0, 200))}`, 'asset', img);
      }
    });

    // 6. Look for common error patterns in specific elements
    const errorContainers = document.querySelectorAll('.shopify-section, [data-section-type], .template-');
    errorContainers.forEach(container => {
      const text = container.textContent;

      // Check for form errors
      if (/form\s+'product'\s+needs\s+a\s+product\s+object/i.test(text)) {
        addError("Liquid error: form 'product' needs a product object", 'form', container);
      }
      if (/form\s+'customer_address'\s+requires\s+an\s+address/i.test(text)) {
        addError("Liquid error: form 'customer_address' requires an address", 'form', container);
      }
      if (/invalid\s+form\s+type/i.test(text)) {
        const match = text.match(/invalid\s+form\s+type\s*['"]?(\w+)['"]?/i);
        addError(`Liquid error: invalid form type '${match?.[1] || 'unknown'}'`, 'form', container);
      }
    });

    this._checkDeprecations();
    this.liquidErrors = errors;
  }

  _getElementPath(element) {
    if (!element) return null;
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 5) {
      let selector = current.tagName?.toLowerCase() || '';
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').filter(c => c && !c.startsWith('js-')).slice(0, 2);
        if (classes.length) selector += `.${classes.join('.')}`;
      }
      if (selector) parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  _checkDeprecations() {
    const scripts = document.querySelectorAll('script:not([src])');
    const pageHTML = document.documentElement.innerHTML;
    
    ConsolePanel.LIQUID_DEPRECATIONS.forEach(dep => {
      if (dep.pattern.test(pageHTML)) {
        this._addLog('warn', [`Liquid Deprecation: ${dep.message}`], {
          deprecation: dep
        });
      }
    });
  }

  _filterLogs(e) {
    this.filter = e.target.value;
  }

  _setFilter(filter) {
    this.activeFilter = filter;
    this.showFilterDropdown = false;
  }

  _toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  _closeFilterDropdown() {
    this.showFilterDropdown = false;
  }

  _getFilterLabel(filter) {
    const labels = {
      all: '📋 All',
      error: '❌ Errors',
      warn: '⚠️ Warnings',
      info: 'ℹ️ Info',
      log: '📝 Logs',
      liquid: '💧 Liquid',
      network: '🌐 Network'
    };
    return labels[filter] || '📋 All';
  }

  _toggleThemeOnly() {
    this.showThemeOnly = !this.showThemeOnly;
  }

  _clearLogs() {
    this.logs = [];
    this.networkErrors = [];
    this.groupedErrors = new Map();
    this.groupStack = [];
    this._currentGroupId = null;
    sessionStorage.removeItem(ConsolePanel.STORAGE_KEY);
  }

  // Expression input methods
  _handleInputKeydown(e) {
    switch (e.key) {
      case 'Enter':
        // Shift+Enter for newlines, Enter alone to evaluate
        if (e.shiftKey) {
          // Allow default behavior (insert newline)
          return;
        }
        e.preventDefault();
        if (this.showSuggestions && this.selectedSuggestion >= 0) {
          this._selectSuggestion(this.selectedSuggestion);
        } else {
          this._evaluateExpression();
        }
        break;

      case 'ArrowUp':
        // Only navigate history if at the first line or input is single line
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          this.selectedSuggestion = this.selectedSuggestion <= 0
            ? this.suggestions.length - 1
            : this.selectedSuggestion - 1;
          this._scrollSuggestionIntoView();
        } else if (!this.inputValue.includes('\n') || this._isAtFirstLine(e.target)) {
          e.preventDefault();
          this._navigateHistory(-1);
        }
        break;

      case 'ArrowDown':
        // Only navigate history if at the last line or input is single line
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          this.selectedSuggestion = this.selectedSuggestion >= this.suggestions.length - 1
            ? 0
            : this.selectedSuggestion + 1;
          this._scrollSuggestionIntoView();
        } else if (!this.inputValue.includes('\n') || this._isAtLastLine(e.target)) {
          e.preventDefault();
          this._navigateHistory(1);
        }
        break;

      case 'Tab':
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          const index = this.selectedSuggestion >= 0 ? this.selectedSuggestion : 0;
          this._selectSuggestion(index);
        }
        break;

      case 'Escape':
        if (this.showSuggestions) {
          e.preventDefault();
          this.showSuggestions = false;
          this.selectedSuggestion = -1;
        }
        break;
    }
  }

  _isAtFirstLine(textarea) {
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    return !textBefore.includes('\n');
  }

  _isAtLastLine(textarea) {
    const cursorPos = textarea.selectionStart;
    const textAfter = textarea.value.substring(cursorPos);
    return !textAfter.includes('\n');
  }

  _scrollSuggestionIntoView() {
    this.updateComplete.then(() => {
      const dropdown = this.shadowRoot.querySelector('.autocomplete-dropdown');
      const selectedItem = this.shadowRoot.querySelector('.autocomplete-item--selected');
      if (dropdown && selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  _handleInput(e) {
    this.inputValue = e.target.value;
    this.historyIndex = -1;
    this._updateSuggestions();
    this._autoGrowTextarea(e.target);
  }

  _autoGrowTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height to scrollHeight to expand
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  _updateSuggestions() {
    if (!this.inputValue.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.selectedSuggestion = -1;
      return;
    }

    this.suggestions = expressionEvaluator.getCompletions(this.inputValue);
    this.showSuggestions = this.suggestions.length > 0;
    this.selectedSuggestion = -1;
  }

  _selectSuggestion(index) {
    const suggestion = this.suggestions[index];
    if (!suggestion) return;

    // Check if we're completing a filter (after |)
    const pipeIndex = this.inputValue.lastIndexOf('|');
    if (pipeIndex !== -1 && suggestion.type === 'filter') {
      // Replace filter part only
      this.inputValue = this.inputValue.slice(0, pipeIndex + 1) + ' ' + suggestion.value;
    } else {
      this.inputValue = suggestion.value;
    }

    this.showSuggestions = false;
    this.selectedSuggestion = -1;

    // Focus back on textarea
    this.updateComplete.then(() => {
      const textarea = this.shadowRoot.querySelector('.console-input');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        this._autoGrowTextarea(textarea);
      }
    });
  }

  _navigateHistory(direction) {
    const history = expressionEvaluator.getHistory();
    if (history.length === 0) return;

    if (direction === -1) {
      // Up - go back in history
      if (this.historyIndex < history.length - 1) {
        this.historyIndex++;
        this.inputValue = history[history.length - 1 - this.historyIndex];
      }
    } else {
      // Down - go forward in history
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputValue = history[history.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.inputValue = '';
      }
    }

    this.showSuggestions = false;
  }

  async _evaluateExpression() {
    if (!this.inputValue.trim()) return;

    const expression = this.inputValue;

    // Clear input immediately for better UX
    this.inputValue = '';
    this.historyIndex = -1;
    this.showSuggestions = false;

    // Evaluate asynchronously
    const result = await expressionEvaluator.evaluate(expression);

    // Add to logs as an eval entry
    const logEntry = {
      id: Date.now() + Math.random(),
      type: 'eval',
      expression: result.expression,
      message: result.expression,
      result: result.success ? result.value : null,
      error: result.success ? null : result.error,
      success: result.success,
      timestamp: new Date(),
      isThemeRelated: true,
    };

    this.logs = [...this.logs, logEntry];
    this._persistLogs();

    // Update history
    this.inputHistory = expressionEvaluator.getHistory();

    // Scroll to bottom after adding log
    this.updateComplete.then(() => {
      const content = this.shadowRoot.querySelector('.console-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    });
  }

  _renderEvalResult(log) {
    if (!log.success) {
      return html`<span class="eval-result eval-result--error">${log.error}</span>`;
    }

    const value = log.result;

    if (value === undefined) {
      return html`<span class="eval-result eval-result--undefined">undefined</span>`;
    }

    if (value === null) {
      return html`<span class="eval-result eval-result--null">null</span>`;
    }

    if (typeof value === 'string') {
      return html`<span class="eval-result eval-result--string">"${value}"</span>`;
    }

    if (typeof value === 'number') {
      return html`<span class="eval-result eval-result--number">${value}</span>`;
    }

    if (typeof value === 'boolean') {
      return html`<span class="eval-result eval-result--boolean">${value}</span>`;
    }

    if (typeof value === 'object') {
      return html`
        <div class="eval-result">
          <tdt-object-inspector .data=${value} .path=${'result'}></tdt-object-inspector>
        </div>
      `;
    }

    return html`<span class="eval-result">${String(value)}</span>`;
  }

  _toggleExpand(logId) {
    const newExpanded = new Set(this.expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    this.expandedLogs = newExpanded;
  }

  _getFilteredLogs() {
    let filtered = this.logs.filter(log => !log.groupId); // Only top-level logs

    if (this.showThemeOnly) {
      filtered = filtered.filter(log => log.isThemeRelated);
    }

    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'liquid') {
        filtered = filtered.filter(log =>
          log.message.toLowerCase().includes('liquid') ||
          this.liquidErrors.some(e => e.message === log.message)
        );
      } else if (this.activeFilter === 'network') {
        return []; // Network errors are handled separately
      } else if (this.activeFilter === 'table') {
        filtered = filtered.filter(log => log.isTable);
      } else if (this.activeFilter === 'group') {
        filtered = filtered.filter(log => log.type === 'group');
      } else {
        filtered = filtered.filter(log => log.type === this.activeFilter);
      }
    }

    if (this.filter) {
      const lower = this.filter.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }

  _getFilteredNetworkErrors() {
    let filtered = this.networkErrors;

    if (this.showThemeOnly) {
      filtered = filtered.filter(err => err.isThemeRelated);
    }

    if (this.filter) {
      const lower = this.filter.toLowerCase();
      filtered = filtered.filter(err =>
        err.url.toLowerCase().includes(lower) ||
        err.statusText.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }

  _getCounts() {
    const logs = this.showThemeOnly
      ? this.logs.filter(l => l.isThemeRelated)
      : this.logs;

    const networkErrors = this.showThemeOnly
      ? this.networkErrors.filter(e => e.isThemeRelated)
      : this.networkErrors;

    return {
      all: logs.length + networkErrors.length,
      error: logs.filter(l => l.type === 'error').length,
      warn: logs.filter(l => l.type === 'warn').length,
      info: logs.filter(l => l.type === 'info').length,
      log: logs.filter(l => l.type === 'log' || l.type === 'debug').length,
      liquid: this.liquidErrors.length,
      network: networkErrors.length,
      table: logs.filter(l => l.isTable).length,
      group: logs.filter(l => l.type === 'group').length
    };
  }

  _formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  _renderLogContent(log) {
    // Handle table rendering
    if (log.isTable && log.args && log.args[0]) {
      return html`
        <div class="log-content">
          ${this._renderTable(log.args[0], log.tableColumns)}
        </div>
      `;
    }

    if (log.hasObjects) {
      const objects = log.args.filter(a => typeof a === 'object' && a !== null);
      return html`
        <div class="log-content">
          ${objects.map(obj => html`
            <tdt-object-inspector .data=${obj} .path=${'console'}></tdt-object-inspector>
          `)}
          ${log.stack ? html`<pre class="log-stack">${log.stack}</pre>` : ''}
          ${log.source ? html`<div class="log-source">Source: <a href="#">${log.source}</a></div>` : ''}
        </div>
      `;
    }

    if (log.stack || log.source) {
      return html`
        <div class="log-content">
          ${log.stack ? html`<pre class="log-stack">${log.stack}</pre>` : ''}
          ${log.source ? html`<div class="log-source">Source: ${log.source}</div>` : ''}
        </div>
      `;
    }

    return null;
  }

  _renderTable(data, columns) {
    if (!data) return null;

    // Convert to array if it's an object
    let rows = Array.isArray(data) ? data : Object.entries(data).map(([k, v]) => ({ '(index)': k, ...v }));

    if (rows.length === 0) return html`<span class="preview">Empty table</span>`;

    // Get all unique keys
    let allKeys = new Set();
    rows.forEach(row => {
      if (typeof row === 'object' && row !== null) {
        Object.keys(row).forEach(k => allKeys.add(k));
      }
    });

    // Filter by columns if specified
    let headers = columns ? columns.filter(c => allKeys.has(c)) : Array.from(allKeys);

    // Add index column
    if (!headers.includes('(index)')) {
      headers = ['(index)', ...headers];
    }

    return html`
      <table class="log-table">
        <thead>
          <tr>
            ${headers.map(h => html`<th>${h}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, index) => html`
            <tr>
              ${headers.map(h => {
                if (h === '(index)') {
                  return html`<td>${row['(index)'] ?? index}</td>`;
                }
                const value = row && typeof row === 'object' ? row[h] : row;
                return html`<td>${this._formatTableValue(value)}</td>`;
              })}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  _formatTableValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  _renderGroupChildren(children) {
    if (!children || children.length === 0) return null;

    return html`
      <div class="log-group-children">
        ${children.map(child => this._renderLogItem(child))}
      </div>
    `;
  }

  _renderNetworkErrors() {
    const errors = this._getFilteredNetworkErrors();
    if (errors.length === 0) return null;

    return html`
      <div class="liquid-section">
        <div class="section-title">Network Errors</div>
        ${errors.slice().reverse().map(error => {
          const isExpanded = this.expandedLogs.has(error.id);
          return html`
            <div class="log-item log-item--network">
              <div class="log-header" @click=${() => this._toggleExpand(error.id)}>
                <span class="log-type log-type--network">${error.type.toUpperCase()}</span>
                <span class="status-badge status-badge--error">${error.status || 'ERR'}</span>
                <span class="log-message">${error.method} ${error.url}</span>
                <span class="log-time">${Math.round(error.duration)}ms</span>
              </div>
              ${isExpanded ? html`
                <div class="log-content">
                  <dl class="network-details">
                    <dt>URL</dt>
                    <dd>${error.url}</dd>
                    <dt>Method</dt>
                    <dd>${error.method}</dd>
                    <dt>Status</dt>
                    <dd>${error.status} ${error.statusText}</dd>
                    <dt>Duration</dt>
                    <dd>${error.duration.toFixed(2)}ms</dd>
                    <dt>Type</dt>
                    <dd>${error.type}</dd>
                  </dl>
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderLogItem(log) {
    const groupKey = this._getGroupKey(log);
    const grouped = this.groupedErrors.get(groupKey);
    const count = grouped?.count || 1;
    const isExpanded = this.expandedLogs.has(log.id);
    const hasExpandable = log.hasObjects || log.stack || log.source || log.isTable || log.type === 'group';

    // Handle eval logs
    if (log.type === 'eval') {
      return html`
        <div class="log-item log-item--eval">
          <div class="log-header">
            <span class="log-type log-type--eval">EVAL</span>
            <span class="log-message">
              <span class="eval-expression">${log.expression}</span>
            </span>
            <span class="log-time">${this._formatTime(log.timestamp)}</span>
          </div>
          <div class="log-content">
            ${this._renderEvalResult(log)}
          </div>
        </div>
      `;
    }

    // Handle group logs
    if (log.type === 'group') {
      return html`
        <div class="log-item log-item--group">
          <div class="log-header" @click=${() => this._toggleExpand(log.id)}>
            <span class="log-type log-type--group">GROUP</span>
            <span class="log-message">${log.message}</span>
            ${log.children?.length ? html`<span class="log-count">${log.children.length} items</span>` : ''}
            <span class="log-time">${this._formatTime(log.timestamp)}</span>
          </div>
          ${isExpanded || !log.collapsed ? this._renderGroupChildren(log.children) : ''}
        </div>
      `;
    }

    return html`
      <div class="log-item log-item--${log.type}${log.isTable ? ' log-item--table' : ''}">
        <div class="log-header" @click=${() => hasExpandable && this._toggleExpand(log.id)}>
          <span class="log-type log-type--${log.isTable ? 'info' : log.type}">${log.isTable ? 'TABLE' : log.type}</span>
          <span class="log-message">${log.message}</span>
          ${count > 1 ? html`<span class="log-count">${count}</span>` : ''}
          ${log.persisted ? html`<span class="persist-indicator">from previous page</span>` : ''}
          <span class="log-time">${this._formatTime(log.timestamp)}</span>
        </div>
        ${isExpanded ? this._renderLogContent(log) : ''}
      </div>
    `;
  }

  _renderLiquidErrors() {
    if (this.liquidErrors.length === 0) return null;

    const getCategoryStyle = (category) => {
      switch (category) {
        case 'drop': return 'log-item--drop';
        case 'asset': return 'log-item--asset';
        case 'schema': return 'log-item--schema';
        default: return 'log-item--liquid';
      }
    };

    const getTypeStyle = (category) => {
      switch (category) {
        case 'drop': return 'log-type--drop';
        case 'asset': return 'log-type--asset';
        case 'schema': return 'log-type--schema';
        default: return 'log-type--liquid';
      }
    };

    const getTypeLabel = (category) => {
      switch (category) {
        case 'drop': return 'DROP';
        case 'asset': return 'ASSET';
        case 'schema': return 'SCHEMA';
        case 'form': return 'FORM';
        default: return 'LIQUID';
      }
    };

    const getHint = (error) => {
      if (error.category === 'drop') {
        // Extract the drop type from the message
        const match = error.message.match(/Raw\s+(\w+)\s+Drop/i);
        const dropType = match?.[1]?.toLowerCase() || 'object';
        return html`
          <div class="liquid-hint">
            Instead of <code>{{ ${dropType} }}</code>, use a specific property like
            <code>{{ ${dropType}.title }}</code>, <code>{{ ${dropType}.url }}</code>, or
            <code>{{ ${dropType}.handle }}</code>
          </div>
        `;
      }
      if (error.message.includes('Could not find snippet')) {
        const match = error.message.match(/Could not find snippet '([^']+)'/i);
        const snippetName = match?.[1] || 'snippet-name';
        return html`
          <div class="liquid-hint">
            Create the missing snippet file: <code>snippets/${snippetName}.liquid</code>
          </div>
        `;
      }
      if (error.message.includes('Could not find asset')) {
        const match = error.message.match(/Could not find asset '([^']+)'/i);
        const assetName = match?.[1] || 'asset-name';
        return html`
          <div class="liquid-hint">
            Upload the missing asset to: <code>assets/${assetName}</code>
          </div>
        `;
      }
      if (error.message.includes('Unknown filter')) {
        const match = error.message.match(/Unknown filter '([^']+)'/i);
        const filterName = match?.[1] || 'filter';
        return html`
          <div class="liquid-hint">
            The filter <code>${filterName}</code> doesn't exist in Shopify Liquid. Check the
            <a href="https://shopify.dev/docs/api/liquid/filters" target="_blank" style="color: var(--tdt-accent)">Liquid filters reference</a>.
          </div>
        `;
      }
      if (error.message.includes('Unknown tag')) {
        const match = error.message.match(/Unknown tag '([^']+)'/i);
        const tagName = match?.[1] || 'tag';
        return html`
          <div class="liquid-hint">
            The tag <code>${tagName}</code> doesn't exist in Shopify Liquid. Check the
            <a href="https://shopify.dev/docs/api/liquid/tags" target="_blank" style="color: var(--tdt-accent)">Liquid tags reference</a>.
          </div>
        `;
      }
      if (error.message.includes('divided by 0')) {
        return html`
          <div class="liquid-hint">
            Add a check before dividing: <code>{% if divisor != 0 %}{{ value | divided_by: divisor }}{% endif %}</code>
          </div>
        `;
      }
      return null;
    };

    return html`
      <div class="liquid-section">
        <div class="section-title">Liquid Errors Found on Page (${this.liquidErrors.length})</div>
        ${this.liquidErrors.map(error => {
          const isExpanded = this.expandedLogs.has(error.id);
          const hasDetails = error.element || error.category === 'drop';
          return html`
            <div class="log-item ${getCategoryStyle(error.category)}">
              <div class="log-header" @click=${() => hasDetails && this._toggleExpand(error.id)}>
                <span class="log-type ${getTypeStyle(error.category)}">${getTypeLabel(error.category)}</span>
                <span class="log-message">${error.message}</span>
                ${error.category && error.category !== 'inline' ? html`
                  <span class="liquid-category">${error.category}</span>
                ` : ''}
                <span class="log-time">${this._formatTime(error.timestamp)}</span>
              </div>
              ${isExpanded ? html`
                <div class="log-content">
                  ${error.element ? html`
                    <div class="element-path">Found in: ${error.element}</div>
                  ` : ''}
                  ${getHint(error)}
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  render() {
    const filtered = this._getFilteredLogs();
    const counts = this._getCounts();

    return html`
      <div class="console-container">
        <div class="console-content">
          <div class="toolbar">
            <div class="filter-dropdown">
              <button
                class="filter-dropdown-trigger ${this.activeFilter !== 'all' ? 'filter-dropdown-trigger--active' : ''}"
                @click=${this._toggleFilterDropdown}
              >
                ${this._getFilterLabel(this.activeFilter)}
                ${counts.all > 0 ? html`<span class="filter-dropdown-trigger__count">${counts.all}</span>` : ''}
                <span class="filter-dropdown-trigger__icon ${this.showFilterDropdown ? 'filter-dropdown-trigger__icon--open' : ''}">▼</span>
              </button>
              ${this.showFilterDropdown ? html`
                <div class="filter-dropdown-menu" @mouseleave=${this._closeFilterDropdown}>
                  <button
                    class="filter-dropdown-item ${this.activeFilter === 'all' ? 'filter-dropdown-item--active' : ''}"
                    @click=${() => this._setFilter('all')}
                  >
                    <span class="filter-dropdown-item__icon">📋</span>
                    <span class="filter-dropdown-item__label">All</span>
                    <span class="filter-dropdown-item__count">${counts.all}</span>
                  </button>
                  <button
                    class="filter-dropdown-item filter-dropdown-item--error ${this.activeFilter === 'error' ? 'filter-dropdown-item--active' : ''}"
                    @click=${() => this._setFilter('error')}
                  >
                    <span class="filter-dropdown-item__icon">❌</span>
                    <span class="filter-dropdown-item__label">Errors</span>
                    <span class="filter-dropdown-item__count">${counts.error}</span>
                  </button>
                  <button
                    class="filter-dropdown-item filter-dropdown-item--warn ${this.activeFilter === 'warn' ? 'filter-dropdown-item--active' : ''}"
                    @click=${() => this._setFilter('warn')}
                  >
                    <span class="filter-dropdown-item__icon">⚠️</span>
                    <span class="filter-dropdown-item__label">Warnings</span>
                    <span class="filter-dropdown-item__count">${counts.warn}</span>
                  </button>
                  <button
                    class="filter-dropdown-item ${this.activeFilter === 'info' ? 'filter-dropdown-item--active' : ''}"
                    @click=${() => this._setFilter('info')}
                  >
                    <span class="filter-dropdown-item__icon">ℹ️</span>
                    <span class="filter-dropdown-item__label">Info</span>
                    <span class="filter-dropdown-item__count">${counts.info}</span>
                  </button>
                  <button
                    class="filter-dropdown-item ${this.activeFilter === 'log' ? 'filter-dropdown-item--active' : ''}"
                    @click=${() => this._setFilter('log')}
                  >
                    <span class="filter-dropdown-item__icon">📝</span>
                    <span class="filter-dropdown-item__label">Logs</span>
                    <span class="filter-dropdown-item__count">${counts.log}</span>
                  </button>
                  ${counts.liquid > 0 ? html`
                    <button
                      class="filter-dropdown-item ${this.activeFilter === 'liquid' ? 'filter-dropdown-item--active' : ''}"
                      @click=${() => this._setFilter('liquid')}
                    >
                      <span class="filter-dropdown-item__icon">💧</span>
                      <span class="filter-dropdown-item__label">Liquid</span>
                      <span class="filter-dropdown-item__count">${counts.liquid}</span>
                    </button>
                  ` : ''}
                  ${counts.network > 0 ? html`
                    <button
                      class="filter-dropdown-item filter-dropdown-item--error ${this.activeFilter === 'network' ? 'filter-dropdown-item--active' : ''}"
                      @click=${() => this._setFilter('network')}
                    >
                      <span class="filter-dropdown-item__icon">🌐</span>
                      <span class="filter-dropdown-item__label">Network</span>
                      <span class="filter-dropdown-item__count">${counts.network}</span>
                    </button>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            <input
              type="search"
              class="search"
              placeholder="Filter logs..."
              .value=${this.filter}
              @input=${this._filterLogs}
            >
            <button
              class="toggle-btn ${this.showThemeOnly ? 'toggle-btn--active' : ''}"
              @click=${this._toggleThemeOnly}
              title="Show only theme-related logs"
            >
              Theme Only
            </button>
            <button class="btn-clear" @click=${this._clearLogs}>
              Clear
            </button>
          </div>

          ${this.activeFilter === 'all' || this.activeFilter === 'liquid'
            ? this._renderLiquidErrors()
            : ''
          }

          ${this.activeFilter === 'all' || this.activeFilter === 'network'
            ? this._renderNetworkErrors()
            : ''
          }

          ${this.activeFilter === 'network'
            ? '' // Network errors already rendered above
            : filtered.length === 0
            ? html`
              <div class="empty-state">
                <div class="empty-state__icon">📋</div>
                <div>No ${this.showThemeOnly ? 'theme-related ' : ''}logs captured yet</div>
              </div>
            `
            : html`
              <div class="log-list">
                ${filtered.map(log => this._renderLogItem(log))}
              </div>
            `
          }
        </div>

        <div class="console-input-container">
          ${this.showSuggestions && this.suggestions.length > 0 ? html`
            <div class="autocomplete-dropdown">
              ${this.suggestions.map((suggestion, index) => html`
                <div
                  class="autocomplete-item ${index === this.selectedSuggestion ? 'autocomplete-item--selected' : ''}"
                  @click=${() => this._selectSuggestion(index)}
                  @mouseenter=${() => this.selectedSuggestion = index}
                >
                  <span class="autocomplete-path">${suggestion.value}</span>
                  <span class="autocomplete-type ${suggestion.type === 'filter' ? 'autocomplete-type--filter' : ''}">${suggestion.type}</span>
                  ${suggestion.preview ? html`
                    <span class="autocomplete-preview">${typeof suggestion.preview === 'object' ? JSON.stringify(suggestion.preview) : suggestion.preview}</span>
                  ` : ''}
                </div>
              `)}
            </div>
          ` : ''}
          ${this.inputValue.includes('\n') ? html`
            <span class="console-input-hint">Shift+Enter for newline</span>
          ` : ''}
          <span class="console-prompt">></span>
          <textarea
            class="console-input"
            placeholder="Type expression... (e.g., product.title | upcase)"
            .value=${this.inputValue}
            @input=${this._handleInput}
            @keydown=${this._handleInputKeydown}
            @blur=${() => setTimeout(() => this.showSuggestions = false, 200)}
            @focus=${() => this._updateSuggestions()}
            rows="1"
          ></textarea>
        </div>
      </div>
    `;
  }
}

customElements.define('tdt-console-panel', ConsolePanel);

