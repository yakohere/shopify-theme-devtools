import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class ObjectsPanel extends LitElement {
  static properties = {
    objects: { type: Object },
    activeObject: { type: String, state: true },
    searchQuery: { type: String, state: true },
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

      .search {
        width: 100%;
        margin-bottom: 12px;
      }

      .object-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .object-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .object-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .object-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .object-tab--null {
        opacity: 0.5;
      }

      .object-content {
        overflow: auto;
      }

      .null-state {
        color: var(--tdt-text-muted);
        padding: 24px;
        text-align: center;
        font-style: italic;
      }
    `
  ];

  constructor() {
    super();
    this.objects = {};
    this.activeObject = null;
    this.searchQuery = '';
  }

  updated(changedProps) {
    if (changedProps.has('objects') && this.objects) {
      const availableKeys = Object.keys(this.objects).filter(k => this.objects[k] !== null);
      if (availableKeys.length > 0 && !this.activeObject) {
        this.activeObject = availableKeys[0];
      }
    }
  }

  _handleSearch(e) {
    this.searchQuery = e.target.value;
  }

  _selectObject(key) {
    this.activeObject = key;
  }

  render() {
    if (!this.objects || Object.keys(this.objects).length === 0) {
      return html`<div class="empty-state">No Liquid objects available on this page</div>`;
    }

    const objectKeys = Object.keys(this.objects);
    const activeData = this.activeObject ? this.objects[this.activeObject] : null;

    return html`
      <input 
        type="search" 
        class="search" 
        placeholder="Filter objects..."
        .value=${this.searchQuery}
        @input=${this._handleSearch}
      >

      <div class="object-tabs">
        ${objectKeys.map(key => html`
          <button
            class="object-tab ${this.activeObject === key ? 'object-tab--active' : ''} ${this.objects[key] === null ? 'object-tab--null' : ''}"
            @click=${() => this._selectObject(key)}
          >
            ${key}${this.objects[key] === null ? ' ∅' : ''}
          </button>
        `)}
      </div>

      <div class="object-content">
        ${activeData === null 
          ? html`<div class="null-state">${this.activeObject} is null on this page</div>`
          : html`
            <tdt-object-inspector 
              .data=${activeData} 
              .path=${'objects.' + this.activeObject}
            ></tdt-object-inspector>
          `
        }
      </div>
    `;
  }
}

customElements.define('tdt-objects-panel', ObjectsPanel);

