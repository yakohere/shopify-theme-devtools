import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class MetafieldsPanel extends LitElement {
  static properties = {
    metafields: { type: Object },
    searchQuery: { type: String, state: true },
    expandedPaths: { type: Object, state: true },
    copiedPath: { type: String, state: true },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 8px 12px;
        height: 100%;
        overflow: auto;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .search-input {
        flex: 1;
        min-width: 200px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text);
        font-size: 11px;
        font-family: var(--tdt-font);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .search-input::placeholder {
        color: var(--tdt-text-muted);
      }

      .stats {
        font-size: 11px;
        color: var(--tdt-text-muted);
      }

      .stats strong {
        color: var(--tdt-text);
      }

      .resource-group {
        margin-bottom: 16px;
      }

      .resource-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        cursor: pointer;
        user-select: none;
      }

      .resource-header:hover {
        background: var(--tdt-bg-hover);
      }

      .resource-icon {
        font-size: 14px;
      }

      .resource-name {
        font-weight: 600;
        font-size: 12px;
        color: var(--tdt-text);
        flex: 1;
      }

      .resource-count {
        font-size: 10px;
        color: var(--tdt-text-muted);
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: 10px;
      }

      .expand-icon {
        font-size: 10px;
        color: var(--tdt-text-muted);
        transition: transform 0.15s ease;
      }

      .expand-icon--open {
        transform: rotate(90deg);
      }

      .namespace-list {
        margin-top: 4px;
        margin-left: 12px;
        border-left: 1px solid var(--tdt-border);
        padding-left: 12px;
      }

      .namespace {
        margin-bottom: 8px;
      }

      .namespace-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: var(--tdt-radius);
        font-size: 11px;
      }

      .namespace-header:hover {
        background: var(--tdt-bg-hover);
      }

      .namespace-name {
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        font-weight: 500;
      }

      .metafield-list {
        margin-left: 16px;
        margin-top: 4px;
      }

      .metafield {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 8px;
        border-radius: var(--tdt-radius);
        font-size: 11px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .metafield:last-child {
        border-bottom: none;
      }

      .metafield:hover {
        background: var(--tdt-bg-hover);
      }

      .metafield__key {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 140px;
        flex-shrink: 0;
      }

      .metafield__name {
        color: var(--tdt-key);
        font-family: var(--tdt-font-mono);
        cursor: pointer;
        padding: 1px 4px;
        border-radius: 2px;
      }

      .metafield__name:hover {
        background: rgba(199, 146, 234, 0.2);
      }

      .metafield__name--copied {
        background: rgba(34, 197, 94, 0.3) !important;
      }

      .metafield__type {
        font-size: 9px;
        padding: 2px 5px;
        border-radius: 3px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        font-weight: 500;
        white-space: nowrap;
      }

      .type--string { background: #2d4a3e; color: #98c379; }
      .type--number, .type--integer { background: #3d3a2d; color: #d19a66; }
      .type--boolean { background: #2d3a4a; color: #61afef; }
      .type--json { background: #4a2d4a; color: #c678dd; }
      .type--date, .type--date_time { background: #2d4a4a; color: #56b6c2; }
      .type--url, .type--link { background: #3d2d2d; color: #e06c75; }
      .type--color { background: #4a3d2d; color: #e5c07b; }
      .type--rich_text, .type--multi_line_text { background: #2d3d3d; color: #abb2bf; }
      .type--file, .type--file_reference { background: #3a3d2d; color: #98c379; }
      .type--list { background: #3d2d4a; color: #c678dd; }
      .type--rating { background: #4a4a2d; color: #e5c07b; }
      .type--unknown { background: var(--tdt-bg); color: var(--tdt-text-muted); }

      .metafield__value {
        flex: 1;
        min-width: 0;
        word-break: break-word;
      }

      .value--string { color: var(--tdt-string); }
      .value--number { color: var(--tdt-number); }
      .value--boolean { color: var(--tdt-boolean); }
      .value--null { color: var(--tdt-null); font-style: italic; }
      .value--json { 
        color: var(--tdt-text-muted); 
        font-family: var(--tdt-font-mono);
        font-size: 10px;
      }
      .value--truncated {
        cursor: pointer;
      }
      .value--truncated:hover {
        text-decoration: underline;
      }

      .copy-btn {
        opacity: 0;
        padding: 2px 6px;
        font-size: 10px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        color: var(--tdt-text-muted);
        cursor: pointer;
        transition: opacity 0.15s;
      }

      .metafield:hover .copy-btn {
        opacity: 1;
      }

      .copy-btn:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state__icon {
        font-size: 32px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-state__title {
        font-size: 14px;
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 8px;
      }

      .empty-state__hint {
        font-size: 11px;
        max-width: 300px;
        margin: 0 auto;
        line-height: 1.5;
      }

      .no-results {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: 12px;
      }
    `
  ];

  constructor() {
    super();
    this.metafields = null;
    this.searchQuery = '';
    this.expandedPaths = new Set(['shop', 'product', 'collection', 'customer']);
    this.copiedPath = null;
  }

  _getResourceIcon(resource) {
    const icons = {
      shop: '🏪',
      product: '📦',
      collection: '📂',
      customer: '👤',
      article: '📝',
      blog: '📰',
      page: '📄',
    };
    return icons[resource] || '📋';
  }

  _getTypeClass(type) {
    if (!type) return 'unknown';
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    const knownTypes = [
      'string', 'number', 'integer', 'boolean', 'json', 
      'date', 'date_time', 'url', 'link', 'color',
      'rich_text', 'multi_line_text', 'file', 'file_reference',
      'list', 'rating'
    ];
    const match = knownTypes.find(t => normalizedType.includes(t));
    return match || 'unknown';
  }

  _toggleResource(resource) {
    const newExpanded = new Set(this.expandedPaths);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    this.expandedPaths = newExpanded;
  }

  _toggleNamespace(path) {
    const newExpanded = new Set(this.expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    this.expandedPaths = newExpanded;
  }

  async _copyLiquidPath(resource, namespace, key, e) {
    e.stopPropagation();
    const liquidPath = `{{ ${resource}.metafields.${namespace}.${key} }}`;
    
    try {
      await navigator.clipboard.writeText(liquidPath);
      this.copiedPath = `${resource}.${namespace}.${key}`;
      setTimeout(() => {
        this.copiedPath = null;
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _formatValue(value, type) {
    if (value === null || value === undefined) {
      return html`<span class="value--null">null</span>`;
    }
    
    if (typeof value === 'object') {
      const json = JSON.stringify(value, null, 2);
      const truncated = json.length > 100;
      return html`
        <span class="value--json ${truncated ? 'value--truncated' : ''}" 
              title="${truncated ? 'Click to expand' : ''}"
              @click=${truncated ? () => alert(json) : null}>
          ${truncated ? json.slice(0, 100) + '...' : json}
        </span>
      `;
    }
    
    if (typeof value === 'string') {
      const truncated = value.length > 80;
      return html`
        <span class="value--string" title="${truncated ? value : ''}">
          "${truncated ? value.slice(0, 80) + '...' : value}"
        </span>
      `;
    }
    
    if (typeof value === 'number') {
      return html`<span class="value--number">${value}</span>`;
    }
    
    if (typeof value === 'boolean') {
      return html`<span class="value--boolean">${value}</span>`;
    }
    
    return html`<span>${String(value)}</span>`;
  }

  _filterMetafields(metafields) {
    if (!this.searchQuery.trim()) return metafields;
    
    const query = this.searchQuery.toLowerCase();
    const filtered = {};
    
    for (const [resource, namespaces] of Object.entries(metafields)) {
      if (!namespaces || typeof namespaces !== 'object') continue;
      
      const filteredNamespaces = {};
      for (const [namespace, fields] of Object.entries(namespaces)) {
        if (!fields || typeof fields !== 'object') continue;
        
        const filteredFields = {};
        for (const [key, data] of Object.entries(fields)) {
          const matchesKey = key.toLowerCase().includes(query);
          const matchesNamespace = namespace.toLowerCase().includes(query);
          const matchesValue = data?.value && String(data.value).toLowerCase().includes(query);
          
          if (matchesKey || matchesNamespace || matchesValue) {
            filteredFields[key] = data;
          }
        }
        
        if (Object.keys(filteredFields).length > 0) {
          filteredNamespaces[namespace] = filteredFields;
        }
      }
      
      if (Object.keys(filteredNamespaces).length > 0) {
        filtered[resource] = filteredNamespaces;
      }
    }
    
    return filtered;
  }

  _countMetafields(metafields) {
    let count = 0;
    if (!metafields) return count;
    
    for (const namespaces of Object.values(metafields)) {
      if (!namespaces || typeof namespaces !== 'object') continue;
      for (const fields of Object.values(namespaces)) {
        if (fields && typeof fields === 'object') {
          count += Object.keys(fields).length;
        }
      }
    }
    return count;
  }

  _countResourceMetafields(namespaces) {
    let count = 0;
    if (!namespaces || typeof namespaces !== 'object') return count;
    
    for (const fields of Object.values(namespaces)) {
      if (fields && typeof fields === 'object') {
        count += Object.keys(fields).length;
      }
    }
    return count;
  }

  _renderMetafield(resource, namespace, key, data) {
    const fullPath = `${resource}.${namespace}.${key}`;
    const isCopied = this.copiedPath === fullPath;
    
    return html`
      <div class="metafield">
        <div class="metafield__key">
          <span 
            class="metafield__name ${isCopied ? 'metafield__name--copied' : ''}"
            @click=${(e) => this._copyLiquidPath(resource, namespace, key, e)}
            title="Click to copy Liquid path"
          >${key}</span>
          ${data?.type ? html`
            <span class="metafield__type type--${this._getTypeClass(data.type)}">
              ${data.type}
            </span>
          ` : ''}
        </div>
        <div class="metafield__value">
          ${this._formatValue(data?.value, data?.type)}
        </div>
        <button 
          class="copy-btn" 
          @click=${(e) => this._copyLiquidPath(resource, namespace, key, e)}
          title="Copy Liquid path"
        >
          ${isCopied ? '✓' : 'Copy'}
        </button>
      </div>
    `;
  }

  _renderNamespace(resource, namespace, fields) {
    const path = `${resource}.${namespace}`;
    const isExpanded = this.expandedPaths.has(path);
    const fieldCount = Object.keys(fields).length;
    
    return html`
      <div class="namespace">
        <div class="namespace-header" @click=${() => this._toggleNamespace(path)}>
          <span class="expand-icon ${isExpanded ? 'expand-icon--open' : ''}">▶</span>
          <span class="namespace-name">${namespace}</span>
          <span class="resource-count">${fieldCount}</span>
        </div>
        ${isExpanded ? html`
          <div class="metafield-list">
            ${Object.entries(fields).map(([key, data]) => 
              this._renderMetafield(resource, namespace, key, data)
            )}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderResource(resource, namespaces) {
    const isExpanded = this.expandedPaths.has(resource);
    const count = this._countResourceMetafields(namespaces);
    
    if (count === 0) return '';
    
    return html`
      <div class="resource-group">
        <div class="resource-header" @click=${() => this._toggleResource(resource)}>
          <span class="resource-icon">${this._getResourceIcon(resource)}</span>
          <span class="resource-name">${resource}</span>
          <span class="resource-count">${count} metafield${count !== 1 ? 's' : ''}</span>
          <span class="expand-icon ${isExpanded ? 'expand-icon--open' : ''}">▶</span>
        </div>
        ${isExpanded ? html`
          <div class="namespace-list">
            ${Object.entries(namespaces).map(([namespace, fields]) => 
              this._renderNamespace(resource, namespace, fields)
            )}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.metafields || Object.keys(this.metafields).length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state__icon">🏷️</div>
          <div class="empty-state__title">No Metafields Found</div>
          <div class="empty-state__hint">
            Metafields will appear here when available. Make sure your theme-devtools-bridge.liquid 
            is configured with your metafield namespaces.
          </div>
        </div>
      `;
    }

    const filtered = this._filterMetafields(this.metafields);
    const totalCount = this._countMetafields(this.metafields);
    const filteredCount = this._countMetafields(filtered);
    const hasResults = Object.keys(filtered).length > 0;

    return html`
      <div class="toolbar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search metafields by namespace, key, or value..."
          .value=${this.searchQuery}
          @input=${(e) => this.searchQuery = e.target.value}
        >
        <div class="stats">
          ${this.searchQuery 
            ? html`<strong>${filteredCount}</strong> of ${totalCount} metafields`
            : html`<strong>${totalCount}</strong> metafields`
          }
        </div>
      </div>

      ${hasResults 
        ? Object.entries(filtered).map(([resource, namespaces]) => 
            this._renderResource(resource, namespaces)
          )
        : html`<div class="no-results">No metafields match "${this.searchQuery}"</div>`
      }
    `;
  }
}

customElements.define('tdt-metafields-panel', MetafieldsPanel);

