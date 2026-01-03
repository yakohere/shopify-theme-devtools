import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class StoragePanel extends LitElement {
  static properties = {
    activeStorage: { type: String, state: true },
    items: { type: Array, state: true },
    filter: { type: String, state: true },
    editingItem: { type: Object, state: true },
    newItem: { type: Object, state: true },
    expandedItems: { type: Set, state: true },
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

      .storage-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .storage-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .storage-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .storage-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .storage-tab__count {
        font-size: calc(10px * var(--tdt-scale, 1));
        opacity: 0.8;
        background: color-mix(in srgb, var(--tdt-text) 15%, transparent);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .search {
        flex: 1;
      }

      .btn-add {
        background: var(--tdt-accent);
        color: white;
        border: none;
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .btn-add:hover {
        opacity: 0.9;
      }

      .btn-clear {
        background: transparent;
        border: 1px solid var(--tdt-error);
        color: var(--tdt-error);
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .btn-clear:hover {
        background: var(--tdt-error);
        color: white;
      }

      .storage-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .storage-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        cursor: pointer;
      }

      .item-header:hover {
        background: var(--tdt-bg-hover);
      }

      .item-key {
        font-weight: 600;
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        font-size: calc(12px * var(--tdt-scale, 1));
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 12px;
      }

      .item-size {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
      }

      .item-type {
        font-size: calc(10px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
      }

      .item-type--json {
        background: rgba(147, 130, 255, 0.2);
        color: #9382ff;
      }

      .item-type--string {
        background: rgba(255, 193, 100, 0.2);
        color: #ffc164;
      }

      .item-actions {
        display: flex;
        gap: 6px;
      }

      .item-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        color: var(--tdt-text-muted);
      }

      .item-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .item-btn--danger:hover {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .item-content {
        border-top: 1px solid var(--tdt-border);
        padding: 12px;
        background: var(--tdt-bg);
      }

      .item-value {
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        word-break: break-all;
        white-space: pre-wrap;
        max-height: 200px;
        overflow: auto;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: color-mix(in srgb, var(--tdt-bg) 60%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }

      .modal {
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 16px;
        width: 500px;
        max-width: 90%;
      }

      .modal-title {
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--tdt-text);
      }

      .form-group {
        margin-bottom: 12px;
      }

      .form-group label {
        display: block;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-bottom: 4px;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 8px;
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        box-sizing: border-box;
      }

      .form-group textarea {
        min-height: 120px;
        resize: vertical;
      }

      .form-hint {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 4px;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }

      .btn {
        padding: 8px 16px;
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        border: 1px solid var(--tdt-border);
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text);
      }

      .btn:hover {
        background: var(--tdt-bg-hover);
      }

      .btn--primary {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn--primary:hover {
        opacity: 0.9;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .stats {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .stat {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        color: var(--tdt-text-muted);
        font-size: calc(9px * var(--tdt-scale, 1));
        text-transform: uppercase;
      }

      .stat-value {
        font-weight: 600;
        color: var(--tdt-text);
      }
    `
  ];

  constructor() {
    super();
    this.activeStorage = 'local';
    this.items = [];
    this.filter = '';
    this.editingItem = null;
    this.newItem = null;
    this.expandedItems = new Set();
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadItems();
    
    window.addEventListener('storage', this._handleStorageChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('storage', this._handleStorageChange);
  }

  _handleStorageChange = () => {
    this._loadItems();
  };

  _getStorage() {
    return this.activeStorage === 'local' ? localStorage : sessionStorage;
  }

  _loadItems() {
    const storage = this._getStorage();
    const items = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const value = storage.getItem(key);
      let parsedValue = value;
      let isJson = false;
      
      try {
        parsedValue = JSON.parse(value);
        isJson = typeof parsedValue === 'object' && parsedValue !== null;
      } catch {
        isJson = false;
      }
      
      items.push({
        key,
        value,
        parsedValue: isJson ? parsedValue : value,
        isJson,
        size: new Blob([value]).size
      });
    }
    
    items.sort((a, b) => a.key.localeCompare(b.key));
    this.items = items;
  }

  _switchStorage(type) {
    this.activeStorage = type;
    this.expandedItems = new Set();
    this._loadItems();
  }

  _filterItems(e) {
    this.filter = e.target.value;
  }

  _getFilteredItems() {
    if (!this.filter) return this.items;
    const lower = this.filter.toLowerCase();
    return this.items.filter(item => 
      item.key.toLowerCase().includes(lower) || 
      item.value.toLowerCase().includes(lower)
    );
  }

  _toggleExpand(key, e) {
    e.stopPropagation();
    const newExpanded = new Set(this.expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    this.expandedItems = newExpanded;
  }

  _copyKey(item, e) {
    e.stopPropagation();
    navigator.clipboard.writeText(item.key);
  }

  _copyValue(item, e) {
    e.stopPropagation();
    navigator.clipboard.writeText(item.value);
  }

  _deleteItem(item, e) {
    e.stopPropagation();
    this._getStorage().removeItem(item.key);
    this._loadItems();
  }

  _clearAll() {
    if (confirm(`Clear all ${this.activeStorage === 'local' ? 'localStorage' : 'sessionStorage'} items?`)) {
      this._getStorage().clear();
      this._loadItems();
    }
  }

  _openAddModal() {
    this.newItem = {
      key: '',
      value: '',
    };
  }

  _openEditModal(item, e) {
    e.stopPropagation();
    this.editingItem = {
      originalKey: item.key,
      key: item.key,
      value: item.value,
    };
  }

  _closeModal() {
    this.newItem = null;
    this.editingItem = null;
  }

  _saveItem() {
    const item = this.newItem || this.editingItem;
    if (!item || !item.key) return;

    const storage = this._getStorage();

    if (this.editingItem && this.editingItem.originalKey !== item.key) {
      storage.removeItem(this.editingItem.originalKey);
    }

    storage.setItem(item.key, item.value);
    this._loadItems();
    this._closeModal();
  }

  _updateItemField(field, value) {
    if (this.newItem) {
      this.newItem = { ...this.newItem, [field]: value };
    } else if (this.editingItem) {
      this.editingItem = { ...this.editingItem, [field]: value };
    }
  }

  _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  _getTotalSize() {
    return this.items.reduce((acc, item) => acc + item.size + item.key.length, 0);
  }

  _renderModal() {
    const item = this.newItem || this.editingItem;
    if (!item) return null;

    const isEdit = !!this.editingItem;

    return html`
      <div class="modal-overlay" @click=${this._closeModal}>
        <div class="modal" @click=${e => e.stopPropagation()}>
          <div class="modal-title">${isEdit ? 'Edit Item' : 'Add Item'}</div>
          
          <div class="form-group">
            <label>Key</label>
            <input 
              type="text" 
              .value=${item.key}
              @input=${e => this._updateItemField('key', e.target.value)}
              placeholder="storage_key"
            >
          </div>
          
          <div class="form-group">
            <label>Value</label>
            <textarea 
              .value=${item.value}
              @input=${e => this._updateItemField('value', e.target.value)}
              placeholder='{"json": "or plain text"}'
            ></textarea>
            <div class="form-hint">Tip: Enter valid JSON for structured data, or plain text</div>
          </div>
          
          <div class="modal-actions">
            <button class="btn" @click=${this._closeModal}>Cancel</button>
            <button class="btn btn--primary" @click=${this._saveItem}>
              ${isEdit ? 'Update' : 'Add'} Item
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderItemContent(item) {
    if (item.isJson) {
      return html`
        <tdt-object-inspector 
          .data=${item.parsedValue}
          .path=${`${this.activeStorage}Storage.${item.key}`}
        ></tdt-object-inspector>
      `;
    }
    return html`<div class="item-value">${item.value}</div>`;
  }

  render() {
    const filtered = this._getFilteredItems();
    const localCount = localStorage.length;
    const sessionCount = sessionStorage.length;

    return html`
      <div class="storage-tabs">
        <button 
          class="storage-tab ${this.activeStorage === 'local' ? 'storage-tab--active' : ''}"
          @click=${() => this._switchStorage('local')}
        >
          💾 localStorage
          <span class="storage-tab__count">${localCount}</span>
        </button>
        <button 
          class="storage-tab ${this.activeStorage === 'session' ? 'storage-tab--active' : ''}"
          @click=${() => this._switchStorage('session')}
        >
          ⏱️ sessionStorage
          <span class="storage-tab__count">${sessionCount}</span>
        </button>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-label">Items</span>
          <span class="stat-value">${this.items.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Size</span>
          <span class="stat-value">${this._formatSize(this._getTotalSize())}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Limit</span>
          <span class="stat-value">~5 MB</span>
        </div>
      </div>

      <div class="toolbar">
        <input 
          type="search" 
          class="search" 
          placeholder="Filter items..."
          .value=${this.filter}
          @input=${this._filterItems}
        >
        <button class="btn-add" @click=${this._openAddModal}>
          + Add Item
        </button>
        ${this.items.length > 0 ? html`
          <button class="btn-clear" @click=${this._clearAll}>
            Clear All
          </button>
        ` : ''}
      </div>

      ${filtered.length === 0 
        ? html`<div class="empty-state">No items in ${this.activeStorage === 'local' ? 'localStorage' : 'sessionStorage'}</div>`
        : html`
          <div class="storage-list">
            ${filtered.map(item => html`
              <div class="storage-item">
                <div class="item-header" @click=${(e) => this._toggleExpand(item.key, e)}>
                  <span class="item-key">${item.key}</span>
                  <div class="item-meta">
                    <span class="item-type ${item.isJson ? 'item-type--json' : 'item-type--string'}">
                      ${item.isJson ? 'JSON' : 'String'}
                    </span>
                    <span class="item-size">${this._formatSize(item.size)}</span>
                    <div class="item-actions">
                      <button class="item-btn" @click=${(e) => this._copyValue(item, e)}>Copy</button>
                      <button class="item-btn" @click=${(e) => this._openEditModal(item, e)}>Edit</button>
                      <button class="item-btn item-btn--danger" @click=${(e) => this._deleteItem(item, e)}>Delete</button>
                    </div>
                  </div>
                </div>
                ${this.expandedItems.has(item.key) ? html`
                  <div class="item-content">
                    ${this._renderItemContent(item)}
                  </div>
                ` : ''}
              </div>
            `)}
          </div>
        `
      }

      ${this._renderModal()}
    `;
  }
}

customElements.define('tdt-storage-panel', StoragePanel);

