import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class ConsolePanel extends LitElement {
  static properties = {
    logs: { type: Array, state: true },
    liquidErrors: { type: Array, state: true },
    filter: { type: String, state: true },
    activeFilter: { type: String, state: true },
    showThemeOnly: { type: Boolean, state: true },
    expandedLogs: { type: Set, state: true },
    groupedErrors: { type: Map, state: true },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 12px;
        height: 100%;
        overflow: auto;
      }

      .toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .search {
        flex: 1;
        min-width: 150px;
      }

      .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .filter-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .filter-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .filter-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .filter-tab--error {
        border-color: var(--tdt-error);
      }

      .filter-tab--error.filter-tab--active {
        background: var(--tdt-error);
      }

      .filter-tab--warn {
        border-color: var(--tdt-warning);
      }

      .filter-tab--warn.filter-tab--active {
        background: var(--tdt-warning);
        color: #000;
      }

      .filter-tab__count {
        font-size: 10px;
        opacity: 0.8;
        background: rgba(255,255,255,0.15);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .toggle-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-size: 11px;
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
        font-size: 11px;
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
        font-size: 11px;
        overflow: hidden;
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
        font-size: 10px;
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
        color: #000;
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
        word-break: break-word;
        white-space: pre-wrap;
      }

      .log-count {
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .log-time {
        color: var(--tdt-text-muted);
        font-size: 10px;
        flex-shrink: 0;
      }

      .log-content {
        border-top: 1px solid var(--tdt-border);
        padding: 10px;
        background: var(--tdt-bg);
      }

      .log-stack {
        font-family: var(--tdt-font-mono);
        font-size: 10px;
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
        font-size: 10px;
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
        font-size: 32px;
        margin-bottom: 8px;
      }

      .liquid-section {
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 11px;
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
        font-size: 11px;
        color: var(--tdt-text);
        margin-top: 4px;
      }

      .deprecation-replacement {
        font-size: 11px;
        color: var(--tdt-text-muted);
        margin-top: 4px;
      }

      .deprecation-replacement code {
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        color: var(--tdt-success);
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
    this._originalConsole = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._interceptConsole();
    this._scanForLiquidErrors();
    this._captureGlobalErrors();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._restoreConsole();
    window.removeEventListener('error', this._handleGlobalError);
    window.removeEventListener('unhandledrejection', this._handleUnhandledRejection);
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
  }

  _restoreConsole() {
    Object.keys(this._originalConsole).forEach(method => {
      console[method] = this._originalConsole[method];
    });
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
      hasObjects: args.some(a => typeof a === 'object' && a !== null)
    };

    const key = `${type}:${message.substring(0, 100)}`;
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
      this.logs = [...this.logs, logEntry];
    }
  }

  _isThemeRelated(message, source = '') {
    const combined = (message + ' ' + source).toLowerCase();
    return ConsolePanel.THEME_KEYWORDS.some(kw => combined.includes(kw));
  }

  _scanForLiquidErrors() {
    const errors = [];
    
    const comments = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    while (comments.nextNode()) {
      const text = comments.currentNode.textContent;
      if (text.includes('Liquid error') || text.includes('Liquid syntax error')) {
        errors.push({
          type: 'liquid',
          message: text.trim(),
          timestamp: new Date()
        });
      }
    }

    const pageContent = document.body.innerHTML;
    const liquidErrorRegex = /Liquid\s+(error|syntax error)[^<]*/gi;
    let match;
    while ((match = liquidErrorRegex.exec(pageContent)) !== null) {
      if (!errors.some(e => e.message.includes(match[0]))) {
        errors.push({
          type: 'liquid',
          message: match[0].trim(),
          timestamp: new Date()
        });
      }
    }

    this._checkDeprecations();
    this.liquidErrors = errors;
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
  }

  _toggleThemeOnly() {
    this.showThemeOnly = !this.showThemeOnly;
  }

  _clearLogs() {
    this.logs = [];
    this.groupedErrors = new Map();
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
    let filtered = this.logs;

    if (this.showThemeOnly) {
      filtered = filtered.filter(log => log.isThemeRelated);
    }

    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'liquid') {
        filtered = filtered.filter(log => 
          log.message.toLowerCase().includes('liquid') ||
          this.liquidErrors.some(e => e.message === log.message)
        );
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

  _getCounts() {
    const logs = this.showThemeOnly 
      ? this.logs.filter(l => l.isThemeRelated)
      : this.logs;

    return {
      all: logs.length,
      error: logs.filter(l => l.type === 'error').length,
      warn: logs.filter(l => l.type === 'warn').length,
      info: logs.filter(l => l.type === 'info').length,
      log: logs.filter(l => l.type === 'log' || l.type === 'debug').length,
      liquid: this.liquidErrors.length
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

  _renderLiquidErrors() {
    if (this.liquidErrors.length === 0) return null;

    return html`
      <div class="liquid-section">
        <div class="section-title">Liquid Errors Found on Page</div>
        ${this.liquidErrors.map(error => html`
          <div class="log-item log-item--liquid">
            <div class="log-header">
              <span class="log-type log-type--liquid">LIQUID</span>
              <span class="log-message">${error.message}</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    const filtered = this._getFilteredLogs();
    const counts = this._getCounts();

    return html`
      <div class="toolbar">
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
          🎯 Theme Only
        </button>
        <button class="btn-clear" @click=${this._clearLogs}>
          🗑️ Clear
        </button>
      </div>

      <div class="filter-tabs">
        <button 
          class="filter-tab ${this.activeFilter === 'all' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('all')}
        >
          All <span class="filter-tab__count">${counts.all}</span>
        </button>
        <button 
          class="filter-tab filter-tab--error ${this.activeFilter === 'error' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('error')}
        >
          ❌ Errors <span class="filter-tab__count">${counts.error}</span>
        </button>
        <button 
          class="filter-tab filter-tab--warn ${this.activeFilter === 'warn' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('warn')}
        >
          ⚠️ Warnings <span class="filter-tab__count">${counts.warn}</span>
        </button>
        <button 
          class="filter-tab ${this.activeFilter === 'info' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('info')}
        >
          ℹ️ Info <span class="filter-tab__count">${counts.info}</span>
        </button>
        <button 
          class="filter-tab ${this.activeFilter === 'log' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('log')}
        >
          📝 Logs <span class="filter-tab__count">${counts.log}</span>
        </button>
        ${counts.liquid > 0 ? html`
          <button 
            class="filter-tab ${this.activeFilter === 'liquid' ? 'filter-tab--active' : ''}"
            @click=${() => this._setFilter('liquid')}
          >
            💧 Liquid <span class="filter-tab__count">${counts.liquid}</span>
          </button>
        ` : ''}
      </div>

      ${this.activeFilter === 'all' || this.activeFilter === 'liquid' 
        ? this._renderLiquidErrors() 
        : ''
      }

      ${filtered.length === 0 
        ? html`
          <div class="empty-state">
            <div class="empty-state__icon">📋</div>
            <div>No ${this.showThemeOnly ? 'theme-related ' : ''}logs captured yet</div>
          </div>
        `
        : html`
          <div class="log-list">
            ${filtered.slice().reverse().map(log => {
              const groupKey = `${log.type}:${log.message.substring(0, 100)}`;
              const grouped = this.groupedErrors.get(groupKey);
              const count = grouped?.count || 1;
              const isExpanded = this.expandedLogs.has(log.id);
              const hasExpandable = log.hasObjects || log.stack || log.source;

              return html`
                <div class="log-item log-item--${log.type}">
                  <div class="log-header" @click=${() => hasExpandable && this._toggleExpand(log.id)}>
                    <span class="log-type log-type--${log.type}">${log.type}</span>
                    <span class="log-message">${log.message}</span>
                    ${count > 1 ? html`<span class="log-count">${count}</span>` : ''}
                    <span class="log-time">${this._formatTime(log.timestamp)}</span>
                  </div>
                  ${isExpanded ? this._renderLogContent(log) : ''}
                </div>
              `;
            })}
          </div>
        `
      }
    `;
  }
}

customElements.define('tdt-console-panel', ConsolePanel);

