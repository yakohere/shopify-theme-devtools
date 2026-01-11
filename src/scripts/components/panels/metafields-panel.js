import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class MetafieldsPanel extends LitElement {
  static properties = {
    metafields: { type: Object },
    metafieldsSchema: { type: Object },
    searchQuery: { type: String, state: true },
    expandedPaths: { type: Object, state: true },
    copiedPath: { type: String, state: true },
    showEmptyFields: { type: Boolean, state: true },
    activeResource: { type: String, state: true },
    snippetMode: { type: String, state: true }, // 'path' | 'safe' | 'assign'
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
        min-width: 150px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .search-input::placeholder {
        color: var(--tdt-text-muted);
      }

      .toggle-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .toggle-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .toggle-btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .stats {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .stats strong {
        color: var(--tdt-text);
      }

      .resource-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .resource-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .resource-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .resource-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .resource-tab--empty {
        opacity: 0.5;
      }

      .resource-tab__count {
        font-size: calc(9px * var(--tdt-scale, 1));
        background: color-mix(in srgb, var(--tdt-text) 15%, transparent);
        padding: 1px 4px;
        border-radius: 6px;
      }

      .resource-tab__filled {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-success);
      }

      .resource-tab--active .resource-tab__filled {
        color: rgba(255,255,255,0.8);
      }

      .namespace-group {
        margin-bottom: 12px;
      }

      .namespace-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        cursor: pointer;
        user-select: none;
      }

      .namespace-header:hover {
        background: var(--tdt-bg-hover);
      }

      .namespace-name {
        font-weight: 600;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        flex: 1;
      }

      .namespace-stats {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        display: flex;
        gap: 6px;
      }

      .namespace-stats__filled {
        color: var(--tdt-success);
      }

      .expand-icon {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        transition: transform 0.15s ease;
      }

      .expand-icon--open {
        transform: rotate(90deg);
      }

      .metafield-list {
        margin-top: 4px;
        margin-left: 8px;
        border-left: 2px solid var(--tdt-border);
        padding-left: 8px;
      }

      .metafield {
        padding: 6px 8px;
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        margin-bottom: 2px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
      }

      .metafield:hover {
        background: var(--tdt-bg-hover);
      }

      .metafield--empty {
        opacity: 0.6;
        border-style: dashed;
      }

      .metafield__header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }

      .metafield__key {
        color: var(--tdt-key);
        font-family: var(--tdt-font-mono);
        font-weight: 600;
        cursor: pointer;
        padding: 1px 4px;
        border-radius: 2px;
      }

      .metafield__key:hover {
        background: rgba(199, 146, 234, 0.2);
      }

      .metafield__key--copied {
        background: rgba(34, 197, 94, 0.3) !important;
      }

      .metafield__type {
        font-size: calc(8px * var(--tdt-scale, 1));
        padding: 2px 5px;
        border-radius: 3px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        font-weight: 600;
        white-space: nowrap;
        font-family: var(--tdt-font);
      }

      .metafield__category {
        font-size: calc(8px * var(--tdt-scale, 1));
        padding: 2px 4px;
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .type--text, .type--single_line_text_field { background: #2d4a3e; color: #98c379; }
      .type--multi_line_text_field, .type--rich_text_field { background: #2d3d3d; color: #abb2bf; }
      .type--number_integer, .type--number_decimal { background: #3d3a2d; color: #d19a66; }
      .type--boolean { background: #2d3a4a; color: #61afef; }
      .type--json { background: #4a2d4a; color: #c678dd; }
      .type--date, .type--date_time { background: #2d4a4a; color: #56b6c2; }
      .type--url { background: #3d2d2d; color: #e06c75; }
      .type--color { background: #4a3d2d; color: #e5c07b; }
      .type--file_reference { background: #3a3d2d; color: #98c379; }
      .type--product_reference, .type--collection_reference, .type--metaobject_reference { background: #3d2d4a; color: #c678dd; }
      .type--rating { background: #4a4a2d; color: #e5c07b; }
      .type--money { background: #2d4a3e; color: #98c379; }
      .type--dimension, .type--volume, .type--weight { background: #3d3a2d; color: #d19a66; }
      .type--list { background: #3d2d4a; color: #c678dd; }
      .type--unknown { background: var(--tdt-bg); color: var(--tdt-text-muted); }

      .metafield__name {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        font-weight: 500;
      }

      .metafield__description {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 2px;
        line-height: 1.4;
      }

      .metafield__value {
        margin-top: 4px;
        padding: 4px 6px;
        background: var(--tdt-bg);
        border-radius: 3px;
        word-break: break-word;
      }

      .metafield__value--empty {
        color: var(--tdt-text-muted);
        font-style: italic;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .value--string { color: var(--tdt-string); }
      .value--number { color: var(--tdt-number); }
      .value--boolean { color: var(--tdt-boolean); }
      .value--null { color: var(--tdt-null); font-style: italic; }
      .value--json { 
        color: var(--tdt-text-muted); 
        font-family: var(--tdt-font-mono);
        font-size: calc(10px * var(--tdt-scale, 1));
        white-space: pre-wrap;
      }

      .metafield__actions {
        display: flex;
        gap: 4px;
        margin-left: auto;
      }

      .action-btn {
        opacity: 0;
        padding: 2px 6px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        color: var(--tdt-text-muted);
        cursor: pointer;
        transition: opacity 0.15s;
        font-family: var(--tdt-font);
      }

      .metafield:hover .action-btn {
        opacity: 1;
      }

      .action-btn:hover {
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
        font-size: calc(32px * var(--tdt-scale, 1));
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-state__title {
        font-size: calc(14px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 8px;
      }

      .empty-state__hint {
        font-size: calc(11px * var(--tdt-scale, 1));
        max-width: 300px;
        margin: 0 auto;
        line-height: 1.5;
      }

      .no-results {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: calc(12px * var(--tdt-scale, 1));
      }

      .schema-notice {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid var(--tdt-accent);
        border-radius: var(--tdt-radius);
        padding: 8px 12px;
        margin-bottom: 12px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text);
      }

      .schema-notice__title {
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--tdt-accent);
      }

      /* Snippet Mode Selector */
      .snippet-mode {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .snippet-mode__label {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-right: 4px;
      }

      .snippet-mode__btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .snippet-mode__btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .snippet-mode__btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .snippet-preview {
        margin-top: 8px;
        padding: 8px 10px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        line-height: 1.5;
      }

      .snippet-preview__title {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        font-family: var(--tdt-font);
      }

      .snippet-preview code {
        display: block;
        color: var(--tdt-text);
        white-space: pre-wrap;
        word-break: break-all;
      }

      .snippet-preview--copied {
        border-color: var(--tdt-success);
        background: rgba(34, 197, 94, 0.1);
      }
    `
  ];

  constructor() {
    super();
    this.metafields = null;
    this.metafieldsSchema = null;
    this.searchQuery = '';
    this.expandedPaths = new Set();
    this.copiedPath = null;
    this.showEmptyFields = true;
    this.activeResource = null;
    this.snippetMode = 'path'; // 'path' | 'safe' | 'assign'
  }

  _getMergedData() {
    const merged = {};
    const schema = this.metafieldsSchema || {};
    const values = this.metafields || {};

    for (const [resource, definitions] of Object.entries(schema)) {
      if (!Array.isArray(definitions) || definitions.length === 0) continue;
      
      merged[resource] = {
        schema: definitions,
        values: values[resource] || {},
        byNamespace: {}
      };

      for (const def of definitions) {
        const ns = def.namespace;
        if (!merged[resource].byNamespace[ns]) {
          merged[resource].byNamespace[ns] = [];
        }
        
        const value = values[resource]?.[ns]?.[def.key];
        merged[resource].byNamespace[ns].push({
          ...def,
          hasValue: value !== undefined && value !== null,
          actualValue: value?.value,
          actualType: value?.type
        });
      }
    }

    for (const [resource, namespaces] of Object.entries(values)) {
      if (!namespaces || typeof namespaces !== 'object') continue;
      if (!merged[resource]) {
        merged[resource] = { schema: [], values: namespaces, byNamespace: {} };
      }
      
      for (const [ns, fields] of Object.entries(namespaces)) {
        if (!fields || typeof fields !== 'object') continue;
        
        if (!merged[resource].byNamespace[ns]) {
          merged[resource].byNamespace[ns] = [];
        }

        for (const [key, data] of Object.entries(fields)) {
          const existingDef = merged[resource].byNamespace[ns]?.find(d => d.key === key);
          if (!existingDef) {
            merged[resource].byNamespace[ns].push({
              key,
              namespace: ns,
              name: key,
              description: '',
              type: { name: data?.type || 'unknown', category: 'UNKNOWN' },
              hasValue: true,
              actualValue: data?.value,
              actualType: data?.type
            });
          }
        }
      }
    }

    return merged;
  }

  _getResourceStats(resourceData) {
    let total = 0;
    let filled = 0;
    
    for (const fields of Object.values(resourceData.byNamespace)) {
      total += fields.length;
      filled += fields.filter(f => f.hasValue).length;
    }
    
    return { total, filled };
  }

  _getTypeClass(typeName) {
    if (!typeName) return 'unknown';
    const normalized = typeName.toLowerCase().replace(/\./g, '_');
    
    if (normalized.startsWith('list_')) return 'list';
    if (normalized.includes('text')) return normalized.includes('multi') || normalized.includes('rich') ? 'multi_line_text_field' : 'single_line_text_field';
    if (normalized.includes('number') || normalized.includes('integer') || normalized.includes('decimal')) return 'number_integer';
    if (normalized.includes('boolean')) return 'boolean';
    if (normalized.includes('json')) return 'json';
    if (normalized.includes('date')) return 'date';
    if (normalized.includes('url')) return 'url';
    if (normalized.includes('color')) return 'color';
    if (normalized.includes('file')) return 'file_reference';
    if (normalized.includes('product') || normalized.includes('collection') || normalized.includes('metaobject')) return 'product_reference';
    if (normalized.includes('rating')) return 'rating';
    if (normalized.includes('money')) return 'money';
    
    return 'unknown';
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

  /**
   * Generate Liquid snippet based on current mode
   */
  _generateSnippet(resource, namespace, key) {
    const path = `${resource}.metafields.${namespace}.${key}`;

    switch (this.snippetMode) {
      case 'safe':
        // Safe access with blank check
        return `{%- if ${path} != blank -%}\n  {{ ${path} }}\n{%- endif -%}`;

      case 'assign':
        // Assign to variable with default
        const varName = key.replace(/[^a-zA-Z0-9_]/g, '_');
        return `{%- assign ${varName} = ${path} | default: '' -%}\n{%- if ${varName} != blank -%}\n  {{ ${varName} }}\n{%- endif -%}`;

      case 'path':
      default:
        // Simple output
        return `{{ ${path} }}`;
    }
  }

  /**
   * Get snippet mode description for tooltip
   */
  _getSnippetModeTitle() {
    switch (this.snippetMode) {
      case 'safe':
        return 'Copies: {% if field != blank %}{{ field }}{% endif %}';
      case 'assign':
        return 'Copies: {% assign var = field | default: \'\' %}{% if var != blank %}{{ var }}{% endif %}';
      case 'path':
      default:
        return 'Copies: {{ field }}';
    }
  }

  async _copyLiquidPath(resource, namespace, key, e) {
    e?.stopPropagation();
    const snippet = this._generateSnippet(resource, namespace, key);

    try {
      await navigator.clipboard.writeText(snippet);
      this.copiedPath = `${resource}.${namespace}.${key}`;
      setTimeout(() => {
        this.copiedPath = null;
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async _copyValue(value, e) {
    e?.stopPropagation();
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy value:', err);
    }
  }

  _formatValue(value) {
    if (value === null || value === undefined) {
      return html`<span class="value--null">null</span>`;
    }
    
    if (typeof value === 'object') {
      const json = JSON.stringify(value, null, 2);
      return html`<span class="value--json">${json}</span>`;
    }
    
    if (typeof value === 'string') {
      return html`<span class="value--string">"${value}"</span>`;
    }
    
    if (typeof value === 'number') {
      return html`<span class="value--number">${value}</span>`;
    }
    
    if (typeof value === 'boolean') {
      return html`<span class="value--boolean">${value}</span>`;
    }
    
    return html`<span>${String(value)}</span>`;
  }

  _deepSearchValue(value, query) {
    if (value === null || value === undefined) return false;

    // Check primitive values
    if (typeof value !== 'object') {
      return String(value).toLowerCase().includes(query);
    }

    // Check arrays
    if (Array.isArray(value)) {
      return value.some(item => this._deepSearchValue(item, query));
    }

    // Check objects - search both keys and values
    for (const [key, val] of Object.entries(value)) {
      if (key.toLowerCase().includes(query)) return true;
      if (this._deepSearchValue(val, query)) return true;
    }

    return false;
  }

  _filterData(merged) {
    if (!this.searchQuery.trim()) return merged;

    const query = this.searchQuery.toLowerCase();
    const filtered = {};

    for (const [resource, data] of Object.entries(merged)) {
      const filteredNamespaces = {};

      for (const [ns, fields] of Object.entries(data.byNamespace)) {
        const filteredFields = fields.filter(field => {
          const matchesKey = field.key.toLowerCase().includes(query);
          const matchesNamespace = ns.toLowerCase().includes(query);
          const matchesName = field.name?.toLowerCase().includes(query);
          const matchesDesc = field.description?.toLowerCase().includes(query);
          // Deep search into nested values (JSON objects, arrays, etc.)
          const matchesValue = field.actualValue !== undefined &&
                               field.actualValue !== null &&
                               this._deepSearchValue(field.actualValue, query);

          return matchesKey || matchesNamespace || matchesName || matchesDesc || matchesValue;
        });

        if (filteredFields.length > 0) {
          filteredNamespaces[ns] = filteredFields;
        }
      }

      if (Object.keys(filteredNamespaces).length > 0) {
        filtered[resource] = { ...data, byNamespace: filteredNamespaces };
      }
    }

    return filtered;
  }

  _renderMetafield(resource, field) {
    const fullPath = `${resource}.${field.namespace}.${field.key}`;
    const isCopied = this.copiedPath === fullPath;
    const typeName = field.type?.name || field.actualType || 'unknown';
    const snippet = this._generateSnippet(resource, field.namespace, field.key);
    const copyTitle = `Click to copy:\n${snippet}`;

    if (!this.showEmptyFields && !field.hasValue) return '';

    return html`
      <div class="metafield ${field.hasValue ? '' : 'metafield--empty'}">
        <div class="metafield__header">
          <span
            class="metafield__key ${isCopied ? 'metafield__key--copied' : ''}"
            @click=${(e) => this._copyLiquidPath(resource, field.namespace, field.key, e)}
            title="${copyTitle}"
          >${field.key}</span>
          <span class="metafield__type type--${this._getTypeClass(typeName)}">${typeName}</span>
          ${field.type?.category ? html`
            <span class="metafield__category">${field.type.category}</span>
          ` : ''}
          <div class="metafield__actions">
            <button
              class="action-btn"
              @click=${(e) => this._copyLiquidPath(resource, field.namespace, field.key, e)}
              title="${copyTitle}"
            >${isCopied ? '✓' : '📋'}</button>
            ${field.hasValue ? html`
              <button
                class="action-btn"
                @click=${(e) => this._copyValue(field.actualValue, e)}
                title="Copy value"
              >📄</button>
            ` : ''}
          </div>
        </div>
        ${field.name && field.name !== field.key ? html`
          <div class="metafield__name">${field.name}</div>
        ` : ''}
        ${field.description ? html`
          <div class="metafield__description">${field.description}</div>
        ` : ''}
        <div class="metafield__value ${field.hasValue ? '' : 'metafield__value--empty'}">
          ${field.hasValue
            ? this._formatValue(field.actualValue)
            : html`No value set`
          }
        </div>
      </div>
    `;
  }

  _renderNamespace(resource, namespace, fields) {
    const path = `${resource}.${namespace}`;
    const isExpanded = this.expandedPaths.has(path);
    const filled = fields.filter(f => f.hasValue).length;
    const total = fields.length;
    
    const visibleFields = this.showEmptyFields ? fields : fields.filter(f => f.hasValue);
    if (visibleFields.length === 0) return '';
    
    return html`
      <div class="namespace-group">
        <div class="namespace-header" @click=${() => this._toggleNamespace(path)}>
          <span class="expand-icon ${isExpanded ? 'expand-icon--open' : ''}">▶</span>
          <span class="namespace-name">${namespace}</span>
          <span class="namespace-stats">
            <span class="namespace-stats__filled">${filled} filled</span>
            <span>/ ${total} total</span>
          </span>
        </div>
        ${isExpanded ? html`
          <div class="metafield-list">
            ${visibleFields.map(field => this._renderMetafield(resource, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const merged = this._getMergedData();
    const hasSchema = this.metafieldsSchema && Object.keys(this.metafieldsSchema).length > 0;
    const hasData = Object.keys(merged).length > 0;

    if (!hasData) {
      return html`
        <div class="empty-state">
          <div class="empty-state__icon">🏷️</div>
          <div class="empty-state__title">No Metafields Found</div>
          <div class="empty-state__hint">
            ${hasSchema 
              ? 'No metafields are defined in your metafields.json schema.'
              : 'Paste your metafields.json content into the devtools bridge snippet to see all defined metafields.'
            }
          </div>
        </div>
      `;
    }

    const filtered = this._filterData(merged);
    const resources = Object.keys(filtered);
    
    if (!this.activeResource || !filtered[this.activeResource]) {
      this.activeResource = resources[0];
    }

    const activeData = filtered[this.activeResource];
    const hasResults = activeData && Object.keys(activeData.byNamespace).length > 0;

    let totalDefined = 0;
    let totalFilled = 0;
    for (const data of Object.values(merged)) {
      const stats = this._getResourceStats(data);
      totalDefined += stats.total;
      totalFilled += stats.filled;
    }

    return html`
      ${hasSchema ? html`
        <div class="schema-notice">
          <div class="schema-notice__title">📋 Schema Loaded</div>
          Showing all ${totalDefined} defined metafields. ${totalFilled} have values.
        </div>
      ` : ''}

      <div class="toolbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search keys, values, and nested data..."
          .value=${this.searchQuery}
          @input=${(e) => this.searchQuery = e.target.value}
        >
        <div class="snippet-mode" title="${this._getSnippetModeTitle()}">
          <span class="snippet-mode__label">Copy as:</span>
          <button
            class="snippet-mode__btn ${this.snippetMode === 'path' ? 'snippet-mode__btn--active' : ''}"
            @click=${() => this.snippetMode = 'path'}
            title="Simple path: {{ field }}"
          >Path</button>
          <button
            class="snippet-mode__btn ${this.snippetMode === 'safe' ? 'snippet-mode__btn--active' : ''}"
            @click=${() => this.snippetMode = 'safe'}
            title="Safe access: {% if field != blank %}{{ field }}{% endif %}"
          >Safe</button>
          <button
            class="snippet-mode__btn ${this.snippetMode === 'assign' ? 'snippet-mode__btn--active' : ''}"
            @click=${() => this.snippetMode = 'assign'}
            title="Assign to variable with default"
          >Assign</button>
        </div>
        <button
          class="toggle-btn ${this.showEmptyFields ? 'toggle-btn--active' : ''}"
          @click=${() => this.showEmptyFields = !this.showEmptyFields}
        >
          ${this.showEmptyFields ? '👁️ Show Empty' : '👁️ Hide Empty'}
        </button>
      </div>

      <div class="resource-tabs">
        ${resources.map(resource => {
          const stats = this._getResourceStats(filtered[resource]);
          const isEmpty = stats.total === 0;
          return html`
            <button 
              class="resource-tab ${this.activeResource === resource ? 'resource-tab--active' : ''} ${isEmpty ? 'resource-tab--empty' : ''}"
              @click=${() => this.activeResource = resource}
            >
              ${resource}
              <span class="resource-tab__count">${stats.total}</span>
              ${stats.filled > 0 ? html`<span class="resource-tab__filled">✓${stats.filled}</span>` : ''}
            </button>
          `;
        })}
      </div>

      ${hasResults 
        ? Object.entries(activeData.byNamespace).map(([ns, fields]) => 
            this._renderNamespace(this.activeResource, ns, fields)
          )
        : html`<div class="no-results">No metafields match "${this.searchQuery}"</div>`
      }
    `;
  }
}

customElements.define('tdt-metafields-panel', MetafieldsPanel);
