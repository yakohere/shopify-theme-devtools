import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class ObjectsPanel extends LitElement {
  static properties = {
    objects: { type: Object },
    activeObject: { type: String, state: true },
    searchQuery: { type: String, state: true },
    hideNullObjects: { type: Boolean, state: true },
    allExpanded: { type: Boolean, state: true },
    matchCount: { type: Number, state: true },
  };

  static STORAGE_KEY = 'tdt-objects-active-tab';

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
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .search {
        flex: 1;
        min-width: 0;
      }

      .toolbar-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: 10px;
        cursor: pointer;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .toolbar-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .toolbar-btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .search-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 11px;
      }

      .match-count {
        color: var(--tdt-accent);
        font-weight: 600;
      }

      .clear-search {
        background: none;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
      }

      .clear-search:hover {
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text);
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
        display: flex;
        align-items: center;
        gap: 6px;
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

      .object-tab__count {
        font-size: 9px;
        padding: 1px 5px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.2);
      }

      .object-tab--active .object-tab__count {
        background: rgba(255, 255, 255, 0.3);
      }

      .object-tab:not(.object-tab--active) .object-tab__count {
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
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

      .content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .content-title {
        font-weight: 600;
        color: var(--tdt-text);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .content-stats {
        font-size: 10px;
        color: var(--tdt-text-muted);
        font-weight: normal;
      }

      .content-actions {
        display: flex;
        gap: 6px;
      }

      .action-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: 10px;
        cursor: pointer;
      }

      .action-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .action-btn--copied {
        background: var(--tdt-success) !important;
        border-color: var(--tdt-success) !important;
        color: white !important;
      }

      .null-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--tdt-border);
      }

      .null-section-title {
        font-size: 10px;
        color: var(--tdt-text-muted);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `
  ];

  constructor() {
    super();
    this.objects = {};
    this.activeObject = null;
    this.searchQuery = '';
    this.hideNullObjects = false;
    this.allExpanded = false;
    this.matchCount = 0;
    this._loadPersistedTab();
  }

  _loadPersistedTab() {
    try {
      const stored = sessionStorage.getItem(ObjectsPanel.STORAGE_KEY);
      if (stored) {
        this.activeObject = stored;
      }
    } catch (e) {
      // Ignore
    }
  }

  _persistTab(tab) {
    try {
      sessionStorage.setItem(ObjectsPanel.STORAGE_KEY, tab);
    } catch (e) {
      // Ignore
    }
  }

  updated(changedProps) {
    if (changedProps.has('objects') && this.objects) {
      const availableKeys = Object.keys(this.objects).filter(k => this.objects[k] !== null);
      // If stored tab exists and is valid, use it
      if (this.activeObject && this.objects[this.activeObject] !== undefined) {
        // Keep current selection
      } else if (availableKeys.length > 0) {
        this.activeObject = availableKeys[0];
      }
    }
  }

  _handleSearch(e) {
    this.searchQuery = e.target.value;
  }

  _clearSearch() {
    this.searchQuery = '';
  }

  _selectObject(key) {
    this.activeObject = key;
    this._persistTab(key);
    // Reset expansion state when switching tabs
    this.allExpanded = false;
  }

  _getKeyCount(obj) {
    if (obj === null || obj === undefined) return 0;
    try {
      if (Array.isArray(obj)) return obj.length;
      return Object.keys(obj).length;
    } catch {
      return 0;
    }
  }

  _toggleHideNull() {
    this.hideNullObjects = !this.hideNullObjects;
  }

  _toggleExpandAll() {
    this.allExpanded = !this.allExpanded;
  }

  async _copyAsJSON() {
    const activeData = this.activeObject ? this.objects[this.activeObject] : null;
    if (!activeData) return;

    try {
      const json = JSON.stringify(activeData, null, 2);
      await navigator.clipboard.writeText(json);

      // Show feedback
      const btn = this.shadowRoot.querySelector('.copy-json-btn');
      if (btn) {
        btn.classList.add('action-btn--copied');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('action-btn--copied');
          btn.textContent = 'Copy JSON';
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _exportAsJSON() {
    const activeData = this.activeObject ? this.objects[this.activeObject] : null;
    if (!activeData) return;

    const json = JSON.stringify(activeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.activeObject}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  _handleMatchCount(e) {
    this.matchCount = e.detail.count;
  }

  render() {
    if (!this.objects || Object.keys(this.objects).length === 0) {
      return html`<div class="empty-state">No Liquid objects available on this page</div>`;
    }

    const allKeys = Object.keys(this.objects);
    const nullKeys = allKeys.filter(k => this.objects[k] === null);
    const availableKeys = allKeys.filter(k => this.objects[k] !== null);

    // If hiding nulls, only show available keys in tabs
    const displayKeys = this.hideNullObjects ? availableKeys : allKeys;

    const activeData = this.activeObject ? this.objects[this.activeObject] : null;
    const activeKeyCount = this._getKeyCount(activeData);

    return html`
      <div class="toolbar">
        <input
          type="search"
          class="search"
          placeholder="Search keys and values..."
          .value=${this.searchQuery}
          @input=${this._handleSearch}
        >
        <button
          class="toolbar-btn ${this.hideNullObjects ? 'toolbar-btn--active' : ''}"
          @click=${this._toggleHideNull}
          title="${this.hideNullObjects ? 'Show null objects' : 'Hide null objects'}"
        >
          ${this.hideNullObjects ? '👁️' : '👁️‍🗨️'} ${nullKeys.length} null
        </button>
      </div>

      ${this.searchQuery ? html`
        <div class="search-info">
          <span class="match-count">${this.matchCount} match${this.matchCount !== 1 ? 'es' : ''}</span>
          <span style="color: var(--tdt-text-muted)">for "${this.searchQuery}"</span>
          <button class="clear-search" @click=${this._clearSearch}>✕ Clear</button>
        </div>
      ` : ''}

      <div class="object-tabs">
        ${displayKeys.map(key => {
          const isNull = this.objects[key] === null;
          const count = this._getKeyCount(this.objects[key]);
          return html`
            <button
              class="object-tab ${this.activeObject === key ? 'object-tab--active' : ''} ${isNull ? 'object-tab--null' : ''}"
              @click=${() => this._selectObject(key)}
            >
              ${key}${isNull ? ' ∅' : ''}
              ${!isNull ? html`<span class="object-tab__count">${count}</span>` : ''}
            </button>
          `;
        })}
      </div>

      <div class="object-content">
        ${activeData === null
          ? html`<div class="null-state">${this.activeObject} is null on this page</div>`
          : html`
            <div class="content-header">
              <div class="content-title">
                ${this.activeObject}
                <span class="content-stats">${activeKeyCount} ${Array.isArray(activeData) ? 'items' : 'keys'}</span>
              </div>
              <div class="content-actions">
                <button
                  class="action-btn"
                  @click=${this._toggleExpandAll}
                  title="${this.allExpanded ? 'Collapse all' : 'Expand all'}"
                >
                  ${this.allExpanded ? '▼ Collapse' : '▶ Expand'}
                </button>
                <button class="action-btn copy-json-btn" @click=${this._copyAsJSON}>
                  Copy JSON
                </button>
                <button class="action-btn" @click=${this._exportAsJSON}>
                  Export
                </button>
              </div>
            </div>
            <tdt-object-inspector
              .data=${activeData}
              .path=${'objects.' + this.activeObject}
              .searchQuery=${this.searchQuery}
              .forceExpandAll=${this.allExpanded}
              @match-count-changed=${this._handleMatchCount}
            ></tdt-object-inspector>
          `
        }
      </div>
    `;
  }
}

customElements.define('tdt-objects-panel', ObjectsPanel);
