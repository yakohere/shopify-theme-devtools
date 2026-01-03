import { LitElement, html, css } from 'lit';
import { baseStyles } from '../styles/theme.js';

export class ObjectInspector extends LitElement {
  static properties = {
    data: { type: Object },
    path: { type: String },
    expanded: { type: Object, state: true },
    searchQuery: { type: String },
    _matchingPaths: { type: Object, state: true },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--tdt-font);
        font-size: var(--tdt-font-size);
      }

      .node {
        padding: 2px 0;
        padding-left: 16px;
        position: relative;
      }

      .node--root {
        padding-left: 0;
      }

      .node--expandable {
        cursor: pointer;
      }

      .node--expandable::before {
        content: '▶';
        position: absolute;
        left: 2px;
        font-size: 8px;
        color: var(--tdt-text-muted);
        transition: transform 0.15s ease;
      }

      .node--root.node--expandable::before {
        left: -12px;
      }

      .node--expanded::before {
        transform: rotate(90deg);
      }

      .key {
        color: var(--tdt-key);
        cursor: pointer;
        border-radius: 2px;
        padding: 0 2px;
        margin: 0 -2px;
      }

      .key:hover {
        background: rgba(199, 146, 234, 0.2);
      }

      .key--copied {
        background: rgba(34, 197, 94, 0.3) !important;
        transition: background 0.3s ease;
      }

      .separator {
        color: var(--tdt-text-muted);
      }

      .value {
        word-break: break-all;
      }

      .value--string { color: var(--tdt-string); }
      .value--number { color: var(--tdt-number); }
      .value--boolean { color: var(--tdt-boolean); }
      .value--null, .value--undefined { 
        color: var(--tdt-null); 
        font-style: italic; 
      }

      .preview {
        color: var(--tdt-text-muted);
        font-style: italic;
      }

      .children {
        border-left: 1px solid var(--tdt-border);
        margin-left: 6px;
      }

      .highlight {
        background: rgba(250, 204, 21, 0.3);
        border-radius: 2px;
        padding: 0 1px;
      }

      .node--hidden {
        display: none;
      }

      .match-count {
        color: var(--tdt-text-muted);
        font-size: 10px;
        margin-left: 6px;
        background: var(--tdt-bg-secondary);
        padding: 1px 5px;
        border-radius: 8px;
      }
    `
  ];

  constructor() {
    super();
    this.data = null;
    this.path = '';
    this.expanded = new Set();
    this.searchQuery = '';
    this._matchingPaths = new Set();
  }

  updated(changedProps) {
    if (changedProps.has('searchQuery') || changedProps.has('data')) {
      this._updateMatchingPaths();
    }
  }

  _updateMatchingPaths() {
    const query = (this.searchQuery || '').toLowerCase().trim();
    if (!query || !this.data) {
      this._matchingPaths = new Set();
      return;
    }

    const matches = new Set();
    this._findMatches(this.data, this.path, query, matches);
    this._matchingPaths = matches;

    // Auto-expand paths that contain matches
    if (matches.size > 0) {
      const newExpanded = new Set(this.expanded);
      for (const matchPath of matches) {
        // Add all parent paths
        const parts = matchPath.split('.');
        let current = '';
        for (let i = 0; i < parts.length - 1; i++) {
          current = current ? `${current}.${parts[i]}` : parts[i];
          newExpanded.add(current);
        }
      }
      this.expanded = newExpanded;
    }
  }

  _findMatches(obj, basePath, query, matches) {
    if (obj === null || obj === undefined) return;

    const type = this._getType(obj);

    if (type !== 'object' && type !== 'array') {
      // Check if the value matches
      const valueStr = String(obj).toLowerCase();
      if (valueStr.includes(query)) {
        matches.add(basePath);
      }
      return;
    }

    let entries;
    try {
      entries = Object.entries(obj);
    } catch {
      return;
    }

    for (const [key, value] of entries) {
      const path = basePath ? `${basePath}.${key}` : key;

      // Check if key matches
      if (key.toLowerCase().includes(query)) {
        matches.add(path);
      }

      // Recurse into children
      this._findMatches(value, path, query, matches);
    }
  }

  _isPathVisible(path) {
    if (!this.searchQuery || this._matchingPaths.size === 0) {
      return true;
    }

    // Path is visible if it matches or if any of its descendants match
    for (const matchPath of this._matchingPaths) {
      if (matchPath === path || matchPath.startsWith(path + '.')) {
        return true;
      }
    }
    return false;
  }

  _highlightText(text, query) {
    if (!query) return text;

    const lowerText = String(text).toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = String(text).slice(0, index);
    const match = String(text).slice(index, index + query.length);
    const after = String(text).slice(index + query.length);

    return html`${before}<span class="highlight">${match}</span>${after}`;
  }

  _getType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  _isExpandable(value) {
    if (value === null || value === undefined) return false;
    const type = this._getType(value);
    if (type !== 'object' && type !== 'array') return false;
    
    try {
      const keys = Object.keys(value);
      return keys.length > 0;
    } catch {
      return false;
    }
  }

  _getKeys(value) {
    try {
      return Object.keys(value);
    } catch {
      return [];
    }
  }

  _toggleExpand(path, e) {
    e.stopPropagation();
    const newExpanded = new Set(this.expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    this.expanded = newExpanded;
  }

  async _copyPath(path, e) {
    e.stopPropagation();
    const liquidPath = path
      .replace(/^objects\./, '')
      .replace(/^meta\./, '');
    
    try {
      await navigator.clipboard.writeText(`{{ ${liquidPath} }}`);
      const target = e.target;
      target.classList.add('key--copied');
      setTimeout(() => target.classList.remove('key--copied'), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _renderValue(value, type) {
    switch (type) {
      case 'string':
        const display = value.length > 80 ? value.slice(0, 80) + '...' : value;
        return html`<span class="value value--string">"${display}"</span>`;
      case 'number':
        return html`<span class="value value--number">${value}</span>`;
      case 'boolean':
        return html`<span class="value value--boolean">${value}</span>`;
      case 'null':
        return html`<span class="value value--null">null</span>`;
      case 'undefined':
        return html`<span class="value value--undefined">undefined</span>`;
      case 'object':
      case 'array':
        return html`<span class="preview">{}</span>`;
      default:
        return html`<span class="value">${String(value)}</span>`;
    }
  }

  _renderValueWithHighlight(value, type, query) {
    if (!query) return this._renderValue(value, type);

    switch (type) {
      case 'string':
        const display = value.length > 80 ? value.slice(0, 80) + '...' : value;
        return html`<span class="value value--string">"${this._highlightText(display, query)}"</span>`;
      case 'number':
        return html`<span class="value value--number">${this._highlightText(String(value), query)}</span>`;
      case 'boolean':
        return html`<span class="value value--boolean">${this._highlightText(String(value), query)}</span>`;
      case 'null':
        return html`<span class="value value--null">null</span>`;
      case 'undefined':
        return html`<span class="value value--undefined">undefined</span>`;
      case 'object':
      case 'array':
        return html`<span class="preview">{}</span>`;
      default:
        return html`<span class="value">${this._highlightText(String(value), query)}</span>`;
    }
  }

  _renderPreview(value, type) {
    let count;
    try {
      count = Object.keys(value).length;
    } catch {
      count = 0;
    }
    const preview = type === 'array' 
      ? `Array(${count})` 
      : `{${count} ${count === 1 ? 'key' : 'keys'}}`;
    return html`<span class="preview">${preview}</span>`;
  }

  _renderNode(key, value, currentPath, isRoot = false, isArrayItem = false) {
    const type = this._getType(value);
    const expandable = this._isExpandable(value);
    const isExpanded = this.expanded.has(currentPath);
    const isVisible = this._isPathVisible(currentPath);
    const query = (this.searchQuery || '').trim();

    const nodeClasses = [
      'node',
      isRoot ? 'node--root' : '',
      expandable ? 'node--expandable' : '',
      isExpanded ? 'node--expanded' : '',
      !isVisible ? 'node--hidden' : '',
    ].filter(Boolean).join(' ');

    const displayKey = isArrayItem ? `[${key}]` : key;
    const highlightedKey = query ? this._highlightText(displayKey, query) : displayKey;

    // Count matches in children for preview
    let matchCount = 0;
    if (expandable && query && this._matchingPaths.size > 0) {
      for (const matchPath of this._matchingPaths) {
        if (matchPath.startsWith(currentPath + '.')) {
          matchCount++;
        }
      }
    }

    return html`
      <div
        class=${nodeClasses}
        @click=${expandable ? (e) => this._toggleExpand(currentPath, e) : null}
      >
        <span class="key" @click=${(e) => this._copyPath(currentPath, e)}>${highlightedKey}</span>
        <span class="separator">: </span>
        ${expandable
          ? this._renderPreview(value, type)
          : this._renderValueWithHighlight(value, type, query)
        }
        ${matchCount > 0 && !isExpanded ? html`<span class="match-count">${matchCount} match${matchCount > 1 ? 'es' : ''}</span>` : ''}
        ${expandable && isExpanded ? html`
          <div class="children">
            ${this._renderObject(value, currentPath)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderObject(obj, basePath = '') {
    if (obj === null || obj === undefined) {
      return html`<span class="value value--null">${obj === null ? 'null' : 'undefined'}</span>`;
    }

    const type = this._getType(obj);
    
    let entries;
    try {
      entries = Object.entries(obj);
    } catch {
      return html`<span class="preview">[Object]</span>`;
    }

    if (entries.length === 0) {
      return html`<span class="preview">${type === 'array' ? '[]' : '{}'}</span>`;
    }

    return entries.map(([key, value]) => {
      const path = basePath ? `${basePath}.${key}` : key;
      return this._renderNode(key, value, path, !basePath, type === 'array');
    });
  }

  render() {
    if (this.data === null) {
      return html`<span class="value value--null">null</span>`;
    }

    if (this.data === undefined) {
      return html`<span class="value value--undefined">undefined</span>`;
    }

    return html`${this._renderObject(this.data, this.path)}`;
  }
}

customElements.define('tdt-object-inspector', ObjectInspector);

