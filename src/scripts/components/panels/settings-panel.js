import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class SettingsPanel extends LitElement {
  static properties = {
    settings: { type: Object },
    sectionSettings: { type: Object },
    searchQuery: { type: String, state: true },
    expandedPaths: { type: Object, state: true },
    activeView: { type: String, state: true },
    copiedPath: { type: String, state: true },
    validationErrors: { type: Array, state: true },
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

      .view-tabs {
        display: flex;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        padding: 2px;
      }

      .view-tab {
        padding: 4px 12px;
        font-size: calc(10px * var(--tdt-scale, 1));
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        border-radius: 3px;
        font-family: var(--tdt-font);
      }

      .view-tab:hover {
        color: var(--tdt-text);
      }

      .view-tab--active {
        background: var(--tdt-accent);
        color: white;
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

      .actions {
        display: flex;
        gap: 6px;
        margin-left: auto;
      }

      .validation-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(231, 76, 60, 0.1);
        border: 1px solid rgba(231, 76, 60, 0.3);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-danger);
      }

      .validation-banner__icon {
        font-size: calc(14px * var(--tdt-scale, 1));
      }

      .validation-banner__text {
        flex: 1;
      }

      .validation-banner__btn {
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        background: transparent;
        border: 1px solid currentColor;
        border-radius: 3px;
        color: inherit;
        cursor: pointer;
      }

      .validation-banner__btn:hover {
        background: var(--tdt-danger);
        color: white;
      }

      .settings-group {
        margin-bottom: 16px;
      }

      .group-header {
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

      .group-header:hover {
        background: var(--tdt-bg-hover);
      }

      .group-icon {
        font-size: calc(14px * var(--tdt-scale, 1));
      }

      .group-name {
        font-weight: 600;
        font-size: calc(12px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        flex: 1;
      }

      .group-count {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: 10px;
      }

      .expand-icon {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        transition: transform 0.15s ease;
      }

      .expand-icon--open {
        transform: rotate(90deg);
      }

      .settings-list {
        margin-top: 4px;
        margin-left: 12px;
        border-left: 1px solid var(--tdt-border);
        padding-left: 12px;
      }

      .setting-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .setting-item:last-child {
        border-bottom: none;
      }

      .setting-item:hover {
        background: var(--tdt-bg-hover);
      }

      .setting-item--error {
        background: rgba(231, 76, 60, 0.05);
        border-color: rgba(231, 76, 60, 0.2);
      }

      .setting__key {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 160px;
        flex-shrink: 0;
      }

      .setting__id {
        color: var(--tdt-key);
        font-family: var(--tdt-font-mono);
        cursor: pointer;
        padding: 1px 4px;
        border-radius: 2px;
        display: inline-block;
        width: fit-content;
      }

      .setting__id:hover {
        background: rgba(199, 146, 234, 0.2);
      }

      .setting__id--copied {
        background: rgba(34, 197, 94, 0.3) !important;
      }

      .setting__label {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .setting__type {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 5px;
        border-radius: 3px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        font-weight: 500;
        white-space: nowrap;
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
      }

      .type--color { background: #4a3d2d; color: #e5c07b; }
      .type--text { background: #2d4a3e; color: #98c379; }
      .type--textarea, .type--richtext, .type--html { background: #2d4a3e; color: #98c379; }
      .type--number, .type--range { background: #3d3a2d; color: #d19a66; }
      .type--checkbox { background: #2d3a4a; color: #61afef; }
      .type--select, .type--radio { background: #4a2d4a; color: #c678dd; }
      .type--image_picker, .type--video, .type--video_url { background: #3a3d2d; color: #98c379; }
      .type--url, .type--link_list { background: #3d2d2d; color: #e06c75; }
      .type--product, .type--collection, .type--blog, .type--page, .type--article { background: #2d4a4a; color: #56b6c2; }
      .type--font_picker { background: #3d3d2d; color: #abb2bf; }

      .setting__value {
        flex: 1;
        min-width: 0;
        word-break: break-word;
      }

      .value--string { color: var(--tdt-string); }
      .value--number { color: var(--tdt-number); }
      .value--boolean { color: var(--tdt-boolean); }
      .value--null { color: var(--tdt-null); font-style: italic; }
      .value--color {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .color-swatch {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid var(--tdt-border);
        display: inline-block;
      }
      .value--image {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .image-preview {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 3px;
        background: var(--tdt-bg);
      }
      .value--truncated {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .setting__error {
        color: var(--tdt-danger);
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-top: 4px;
      }

      .section-card {
        margin-bottom: 8px;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        cursor: pointer;
      }

      .section-header:hover {
        background: var(--tdt-bg-hover);
      }

      .section-type {
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-accent);
      }

      .section-id {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
      }

      .section-content {
        padding: 8px 12px;
        background: var(--tdt-bg);
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

      .export-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .modal-content {
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .modal-title {
        font-weight: 600;
        font-size: calc(14px * var(--tdt-scale, 1));
        color: var(--tdt-text);
      }

      .modal-close {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-size: calc(18px * var(--tdt-scale, 1));
        padding: 4px;
      }

      .modal-close:hover {
        color: var(--tdt-text);
      }

      .modal-textarea {
        width: 100%;
        height: 200px;
        padding: 12px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        resize: vertical;
      }

      .modal-textarea:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .modal-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: flex-end;
      }

      .validation-list {
        margin-top: 8px;
      }

      .validation-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        background: rgba(231, 76, 60, 0.05);
        border: 1px solid rgba(231, 76, 60, 0.2);
        border-radius: var(--tdt-radius);
        margin-bottom: 6px;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .validation-item__icon {
        color: var(--tdt-danger);
      }

      .validation-item__path {
        font-family: var(--tdt-font-mono);
        color: var(--tdt-key);
      }

      .validation-item__message {
        color: var(--tdt-text-muted);
      }
    `
  ];

  constructor() {
    super();
    this.settings = null;
    this.sectionSettings = null;
    this.searchQuery = '';
    this.expandedPaths = new Set(['theme', 'colors', 'typography']);
    this.activeView = 'theme';
    this.copiedPath = null;
    this.validationErrors = [];
    this._showExportModal = false;
    this._showValidationModal = false;
  }

  _getTypeClass(type) {
    if (!type) return '';
    const typeMap = {
      'color': 'color',
      'color_background': 'color',
      'text': 'text',
      'textarea': 'textarea',
      'richtext': 'richtext',
      'html': 'html',
      'number': 'number',
      'range': 'range',
      'checkbox': 'checkbox',
      'select': 'select',
      'radio': 'radio',
      'image_picker': 'image_picker',
      'video': 'video',
      'video_url': 'video_url',
      'url': 'url',
      'link_list': 'link_list',
      'product': 'product',
      'collection': 'collection',
      'blog': 'blog',
      'page': 'page',
      'article': 'article',
      'font_picker': 'font_picker',
    };
    return typeMap[type] || '';
  }

  _toggleGroup(groupId) {
    const newExpanded = new Set(this.expandedPaths);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    this.expandedPaths = newExpanded;
  }

  async _copySettingPath(path, e) {
    e?.stopPropagation();
    const liquidPath = `{{ settings.${path} }}`;
    
    try {
      await navigator.clipboard.writeText(liquidPath);
      this.copiedPath = path;
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

    if (type === 'color' || type === 'color_background') {
      return html`
        <span class="value--color">
          <span class="color-swatch" style="background: ${value}"></span>
          <span class="value--string">${value}</span>
        </span>
      `;
    }

    if (type === 'image_picker' && value) {
      const src = typeof value === 'object' ? value.src : value;
      return html`
        <span class="value--image">
          ${src ? html`<img class="image-preview" src="${src}" alt="">` : ''}
          <span class="value--string value--truncated">${src || 'No image'}</span>
        </span>
      `;
    }
    
    if (typeof value === 'object') {
      return html`<span class="value--string">${JSON.stringify(value)}</span>`;
    }
    
    if (typeof value === 'string') {
      const display = value.length > 60 ? value.slice(0, 60) + '...' : value;
      return html`<span class="value--string" title="${value}">"${display}"</span>`;
    }
    
    if (typeof value === 'number') {
      return html`<span class="value--number">${value}</span>`;
    }
    
    if (typeof value === 'boolean') {
      return html`<span class="value--boolean">${value}</span>`;
    }
    
    return html`<span>${String(value)}</span>`;
  }

  _filterSettings(settings) {
    if (!this.searchQuery.trim() || !settings) return settings;
    
    const query = this.searchQuery.toLowerCase();
    const filtered = {};
    
    for (const [group, items] of Object.entries(settings)) {
      if (typeof items !== 'object' || items === null) continue;
      
      const filteredItems = {};
      for (const [key, data] of Object.entries(items)) {
        const matchesKey = key.toLowerCase().includes(query);
        const matchesGroup = group.toLowerCase().includes(query);
        const matchesLabel = data?.label?.toLowerCase().includes(query);
        const matchesValue = data?.value && String(data.value).toLowerCase().includes(query);
        
        if (matchesKey || matchesGroup || matchesLabel || matchesValue) {
          filteredItems[key] = data;
        }
      }
      
      if (Object.keys(filteredItems).length > 0) {
        filtered[group] = filteredItems;
      }
    }
    
    return filtered;
  }

  _countSettings(settings) {
    let count = 0;
    if (!settings) return count;
    
    for (const items of Object.values(settings)) {
      if (items && typeof items === 'object') {
        count += Object.keys(items).length;
      }
    }
    return count;
  }

  _exportSettings() {
    const data = {
      theme_settings: this.settings,
      section_settings: this.sectionSettings,
      exported_at: new Date().toISOString(),
    };
    this._exportData = JSON.stringify(data, null, 2);
    this._showExportModal = true;
    this.requestUpdate();
  }

  _closeExportModal() {
    this._showExportModal = false;
    this.requestUpdate();
  }

  async _copyExport() {
    try {
      await navigator.clipboard.writeText(this._exportData);
      this._closeExportModal();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _downloadExport() {
    const blob = new Blob([this._exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._closeExportModal();
  }

  _showValidation() {
    this._showValidationModal = !this._showValidationModal;
    this.requestUpdate();
  }

  _renderSetting(id, data, groupId) {
    const isCopied = this.copiedPath === id;
    const hasError = this.validationErrors.some(e => e.path === id);
    
    return html`
      <div class="setting-item ${hasError ? 'setting-item--error' : ''}">
        <div class="setting__key">
          <span 
            class="setting__id ${isCopied ? 'setting__id--copied' : ''}"
            @click=${(e) => this._copySettingPath(id, e)}
            title="Click to copy Liquid path"
          >${id}</span>
          ${data?.label ? html`<span class="setting__label">${data.label}</span>` : ''}
        </div>
        ${data?.type ? html`
          <span class="setting__type type--${this._getTypeClass(data.type)}">
            ${data.type}
          </span>
        ` : ''}
        <div class="setting__value">
          ${this._formatValue(data?.value ?? data, data?.type)}
          ${hasError ? html`
            <div class="setting__error">
              ⚠️ ${this.validationErrors.find(e => e.path === id)?.message}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderGroup(groupId, items) {
    const isExpanded = this.expandedPaths.has(groupId);
    const count = Object.keys(items).length;
    
    const icons = {
      colors: '🎨',
      typography: '🔤',
      layout: '📐',
      header: '⬆️',
      footer: '⬇️',
      product: '📦',
      collection: '📂',
      cart: '🛒',
      social: '🔗',
      favicon: '⭐',
      checkout: '💳',
      theme: '🎭',
    };
    
    return html`
      <div class="settings-group">
        <div class="group-header" @click=${() => this._toggleGroup(groupId)}>
          <span class="group-icon">${icons[groupId] || '⚙️'}</span>
          <span class="group-name">${groupId}</span>
          <span class="group-count">${count}</span>
          <span class="expand-icon ${isExpanded ? 'expand-icon--open' : ''}">▶</span>
        </div>
        ${isExpanded ? html`
          <div class="settings-list">
            ${Object.entries(items).map(([id, data]) => 
              this._renderSetting(id, data, groupId)
            )}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderSectionSettings() {
    if (!this.sectionSettings || Object.keys(this.sectionSettings).length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state__icon">📐</div>
          <div class="empty-state__title">No Section Settings</div>
          <div class="empty-state__hint">
            Section settings will appear here when available on the current page.
          </div>
        </div>
      `;
    }

    return Object.entries(this.sectionSettings).map(([sectionId, section]) => {
      const isExpanded = this.expandedPaths.has(`section-${sectionId}`);
      const settingsCount = section.settings ? Object.keys(section.settings).length : 0;
      
      return html`
        <div class="section-card">
          <div class="section-header" @click=${() => this._toggleGroup(`section-${sectionId}`)}>
            <span class="expand-icon ${isExpanded ? 'expand-icon--open' : ''}">▶</span>
            <span class="section-type">${section.type || 'unknown'}</span>
            <span class="section-id">#${sectionId}</span>
            <span class="group-count" style="margin-left: auto">${settingsCount} settings</span>
          </div>
          ${isExpanded && section.settings ? html`
            <div class="section-content">
              ${Object.entries(section.settings).map(([key, value]) => html`
                <div class="setting-item">
                  <div class="setting__key">
                    <span class="setting__id">${key}</span>
                  </div>
                  <div class="setting__value">
                    ${this._formatValue(value)}
                  </div>
                </div>
              `)}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  _renderValidationModal() {
    if (!this._showValidationModal) return '';
    
    return html`
      <div class="validation-list">
        ${this.validationErrors.length === 0 
          ? html`<div class="no-results">✅ No validation errors found</div>`
          : this.validationErrors.map(error => html`
            <div class="validation-item">
              <span class="validation-item__icon">⚠️</span>
              <span class="validation-item__path">${error.path}</span>
              <span class="validation-item__message">${error.message}</span>
            </div>
          `)
        }
      </div>
    `;
  }

  _renderExportModal() {
    if (!this._showExportModal) return '';
    
    return html`
      <div class="export-modal" @click=${this._closeExportModal}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">📤 Export Settings</span>
            <button class="modal-close" @click=${this._closeExportModal}>×</button>
          </div>
          <textarea class="modal-textarea" readonly .value=${this._exportData || ''}></textarea>
          <div class="modal-actions">
            <button class="btn btn--sm" @click=${this._copyExport}>📋 Copy</button>
            <button class="btn btn--sm btn--primary" @click=${this._downloadExport}>⬇️ Download</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const hasThemeSettings = this.settings && Object.keys(this.settings).length > 0;
    const hasSectionSettings = this.sectionSettings && Object.keys(this.sectionSettings).length > 0;
    const hasAnyData = hasThemeSettings || hasSectionSettings;

    if (!hasAnyData) {
      return html`
        <div class="empty-state">
          <div class="empty-state__icon">🎨</div>
          <div class="empty-state__title">No Settings Found</div>
          <div class="empty-state__hint">
            Theme settings will appear here when available. Make sure your theme-devtools-bridge.liquid 
            is configured to expose settings data.
          </div>
        </div>
      `;
    }

    const filtered = this._filterSettings(this.settings);
    const totalCount = this._countSettings(this.settings);
    const filteredCount = this._countSettings(filtered);
    const hasResults = Object.keys(filtered || {}).length > 0;
    const hasErrors = this.validationErrors.length > 0;

    return html`
      <div class="toolbar">
        <div class="view-tabs">
          <button 
            class="view-tab ${this.activeView === 'theme' ? 'view-tab--active' : ''}"
            @click=${() => this.activeView = 'theme'}
          >Theme</button>
          <button 
            class="view-tab ${this.activeView === 'sections' ? 'view-tab--active' : ''}"
            @click=${() => this.activeView = 'sections'}
          >Sections</button>
          ${hasErrors ? html`
            <button 
              class="view-tab ${this.activeView === 'validation' ? 'view-tab--active' : ''}"
              @click=${() => this.activeView = 'validation'}
              style="color: var(--tdt-danger)"
            >⚠️ ${this.validationErrors.length}</button>
          ` : ''}
        </div>
        
        ${this.activeView === 'theme' ? html`
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search settings..."
            .value=${this.searchQuery}
            @input=${(e) => this.searchQuery = e.target.value}
          >
        ` : ''}
        
        <div class="actions">
          <button class="btn btn--sm" @click=${() => this._exportSettings()}>📤 Export</button>
        </div>
      </div>

      ${hasErrors && this.activeView !== 'validation' ? html`
        <div class="validation-banner">
          <span class="validation-banner__icon">⚠️</span>
          <span class="validation-banner__text">
            ${this.validationErrors.length} validation issue${this.validationErrors.length !== 1 ? 's' : ''} found
          </span>
          <button class="validation-banner__btn" @click=${() => this.activeView = 'validation'}>
            View
          </button>
        </div>
      ` : ''}

      ${this.activeView === 'theme' ? html`
        ${hasResults 
          ? Object.entries(filtered).map(([groupId, items]) => 
              this._renderGroup(groupId, items)
            )
          : this.searchQuery 
            ? html`<div class="no-results">No settings match "${this.searchQuery}"</div>`
            : ''
        }
      ` : ''}

      ${this.activeView === 'sections' ? this._renderSectionSettings() : ''}
      
      ${this.activeView === 'validation' ? this._renderValidationModal() : ''}

      ${this._renderExportModal()}
    `;
  }
}

customElements.define('tdt-settings-panel', SettingsPanel);

