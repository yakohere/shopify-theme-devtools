import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class CookiesPanel extends LitElement {
  static properties = {
    cookies: { type: Array, state: true },
    filter: { type: String, state: true },
    editingCookie: { type: Object, state: true },
    newCookie: { type: Object, state: true },
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
        color: var(--tdt-error);
        border: 1px solid var(--tdt-error);
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .btn-clear:hover {
        background: var(--tdt-error);
        color: white;
      }

      .cookie-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cookie-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px 12px;
      }

      .cookie-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .cookie-name {
        font-weight: 600;
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        font-size: calc(12px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .cookie-name:hover {
        text-decoration: underline;
      }

      .cookie-actions {
        display: flex;
        gap: 6px;
      }

      .cookie-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        color: var(--tdt-text-muted);
      }

      .cookie-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .cookie-btn--danger:hover {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .cookie-value {
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        word-break: break-all;
        background: var(--tdt-bg);
        padding: 6px 8px;
        border-radius: var(--tdt-radius);
        max-height: 80px;
        overflow: auto;
      }

      .cookie-meta {
        display: flex;
        gap: 12px;
        margin-top: 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .cookie-meta span {
        display: flex;
        align-items: center;
        gap: 4px;
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
        width: 400px;
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
        min-height: 60px;
        resize: vertical;
      }

      .form-row {
        display: flex;
        gap: 12px;
      }

      .form-row .form-group {
        flex: 1;
      }

      .form-check {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .form-check input {
        width: auto;
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
    this.cookies = [];
    this.filter = '';
    this.editingCookie = null;
    this.newCookie = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadCookies();
  }

  _loadCookies() {
    const cookieString = document.cookie;
    if (!cookieString) {
      this.cookies = [];
      return;
    }

    this.cookies = cookieString.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      const value = valueParts.join('=');
      return {
        name: name.trim(),
        value: decodeURIComponent(value || ''),
        rawValue: value
      };
    }).filter(c => c.name);
  }

  _filterCookies(e) {
    this.filter = e.target.value;
  }

  _getFilteredCookies() {
    if (!this.filter) return this.cookies;
    const lower = this.filter.toLowerCase();
    return this.cookies.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.value.toLowerCase().includes(lower)
    );
  }

  _copyValue(cookie) {
    navigator.clipboard.writeText(cookie.value);
  }

  _copyName(cookie) {
    navigator.clipboard.writeText(cookie.name);
  }

  _deleteCookie(cookie) {
    document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    this._loadCookies();
  }

  _openAddModal() {
    this.newCookie = {
      name: '',
      value: '',
      path: '/',
      days: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
  }

  _openEditModal(cookie) {
    this.editingCookie = {
      originalName: cookie.name,
      name: cookie.name,
      value: cookie.value,
      path: '/',
      days: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
  }

  _closeModal() {
    this.newCookie = null;
    this.editingCookie = null;
  }

  _saveCookie() {
    const cookie = this.newCookie || this.editingCookie;
    if (!cookie || !cookie.name) return;

    if (this.editingCookie && this.editingCookie.originalName !== cookie.name) {
      this._deleteCookie({ name: this.editingCookie.originalName });
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + (cookie.days * 24 * 60 * 60 * 1000));
    
    let cookieString = `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value)}`;
    cookieString += `; expires=${expires.toUTCString()}`;
    cookieString += `; path=${cookie.path}`;
    if (cookie.secure) cookieString += '; secure';
    cookieString += `; samesite=${cookie.sameSite}`;
    
    document.cookie = cookieString;
    this._loadCookies();
    this._closeModal();
  }

  _updateCookieField(field, value) {
    if (this.newCookie) {
      this.newCookie = { ...this.newCookie, [field]: value };
    } else if (this.editingCookie) {
      this.editingCookie = { ...this.editingCookie, [field]: value };
    }
  }

  _formatSize(str) {
    const bytes = new Blob([str]).size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  _clearAllCookies() {
    if (this.cookies.length === 0) return;

    if (confirm(`Clear all ${this.cookies.length} cookies? This may log you out.`)) {
      this.cookies.forEach(cookie => {
        document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      });
      this._loadCookies();
    }
  }

  _renderModal() {
    const cookie = this.newCookie || this.editingCookie;
    if (!cookie) return null;

    const isEdit = !!this.editingCookie;

    return html`
      <div class="modal-overlay" @click=${this._closeModal}>
        <div class="modal" @click=${e => e.stopPropagation()}>
          <div class="modal-title">${isEdit ? 'Edit Cookie' : 'Add Cookie'}</div>
          
          <div class="form-group">
            <label>Name</label>
            <input 
              type="text" 
              .value=${cookie.name}
              @input=${e => this._updateCookieField('name', e.target.value)}
              placeholder="cookie_name"
            >
          </div>
          
          <div class="form-group">
            <label>Value</label>
            <textarea 
              .value=${cookie.value}
              @input=${e => this._updateCookieField('value', e.target.value)}
              placeholder="cookie value"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Path</label>
              <input 
                type="text" 
                .value=${cookie.path}
                @input=${e => this._updateCookieField('path', e.target.value)}
              >
            </div>
            <div class="form-group">
              <label>Expires (days)</label>
              <input 
                type="number" 
                .value=${cookie.days}
                @input=${e => this._updateCookieField('days', parseInt(e.target.value) || 0)}
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>SameSite</label>
              <input 
                type="text" 
                .value=${cookie.sameSite}
                @input=${e => this._updateCookieField('sameSite', e.target.value)}
                placeholder="Lax, Strict, None"
              >
            </div>
            <div class="form-group form-check">
              <input 
                type="checkbox" 
                id="secure"
                .checked=${cookie.secure}
                @change=${e => this._updateCookieField('secure', e.target.checked)}
              >
              <label for="secure">Secure</label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn" @click=${this._closeModal}>Cancel</button>
            <button class="btn btn--primary" @click=${this._saveCookie}>
              ${isEdit ? 'Update' : 'Add'} Cookie
            </button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const filtered = this._getFilteredCookies();
    const totalSize = this.cookies.reduce((acc, c) => acc + c.name.length + c.value.length, 0);

    return html`
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Total Cookies</span>
          <span class="stat-value">${this.cookies.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Size</span>
          <span class="stat-value">${this._formatSize(document.cookie)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Limit</span>
          <span class="stat-value">~4 KB each</span>
        </div>
      </div>

      <div class="toolbar">
        <input
          type="search"
          class="search"
          placeholder="Filter cookies..."
          .value=${this.filter}
          @input=${this._filterCookies}
        >
        <button class="btn-add" @click=${this._openAddModal}>
          + Add Cookie
        </button>
        ${this.cookies.length > 0 ? html`
          <button class="btn-clear" @click=${this._clearAllCookies}>
            Clear All
          </button>
        ` : ''}
      </div>

      ${filtered.length === 0 
        ? html`<div class="empty-state">No cookies found</div>`
        : html`
          <div class="cookie-list">
            ${filtered.map(cookie => html`
              <div class="cookie-item">
                <div class="cookie-header">
                  <span class="cookie-name" @click=${() => this._copyName(cookie)} title="Click to copy name">
                    ${cookie.name}
                  </span>
                  <div class="cookie-actions">
                    <button class="cookie-btn" @click=${() => this._copyValue(cookie)}>Copy</button>
                    <button class="cookie-btn" @click=${() => this._openEditModal(cookie)}>Edit</button>
                    <button class="cookie-btn cookie-btn--danger" @click=${() => this._deleteCookie(cookie)}>Delete</button>
                  </div>
                </div>
                <div class="cookie-value">${cookie.value || '(empty)'}</div>
                <div class="cookie-meta">
                  <span>${this._formatSize(cookie.name + '=' + cookie.value)}</span>
                </div>
              </div>
            `)}
          </div>
        `
      }

      ${this._renderModal()}
    `;
  }
}

customElements.define('tdt-cookies-panel', CookiesPanel);

