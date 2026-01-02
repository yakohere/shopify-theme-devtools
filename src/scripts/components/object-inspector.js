import { LitElement, html, css } from 'lit';
import { baseStyles } from '../styles/theme.js';

export class ObjectInspector extends LitElement {
  static properties = {
    data: { type: Object },
    path: { type: String },
    expanded: { type: Object, state: true },
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
    `
  ];

  constructor() {
    super();
    this.data = null;
    this.path = '';
    this.expanded = new Set();
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

    const nodeClasses = [
      'node',
      isRoot ? 'node--root' : '',
      expandable ? 'node--expandable' : '',
      isExpanded ? 'node--expanded' : '',
    ].filter(Boolean).join(' ');

    const displayKey = isArrayItem ? `[${key}]` : key;

    return html`
      <div 
        class=${nodeClasses}
        @click=${expandable ? (e) => this._toggleExpand(currentPath, e) : null}
      >
        <span class="key" @click=${(e) => this._copyPath(currentPath, e)}>${displayKey}</span>
        <span class="separator">: </span>
        ${expandable 
          ? this._renderPreview(value, type)
          : this._renderValue(value, type)
        }
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

