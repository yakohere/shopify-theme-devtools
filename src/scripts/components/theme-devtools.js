import { LitElement, html, css } from 'lit';
import { baseStyles } from '../styles/theme.js';
import { contextParser } from '../services/context.js';
import { cartAPI } from '../services/cart.js';
import { sectionHighlighter } from '../services/sections.js';

import './panels/objects-panel.js';
import './panels/sections-panel.js';
import './panels/cart-panel.js';
import './panels/info-panel.js';
import './panels/metafields-panel.js';
import './panels/settings-panel.js';
import './panels/cookies-panel.js';
import './panels/storage-panel.js';
import './panels/console-panel.js';
import './panels/localization-panel.js';

export class ThemeDevtools extends LitElement {
  static properties = {
    isCollapsed: { type: Boolean, state: true },
    activeTab: { type: String, state: true },
    context: { type: Object, state: true },
    cart: { type: Object, state: true },
    tabOrder: { type: Array, state: true },
    draggedTab: { type: String, state: true },
    dragOverTab: { type: String, state: true },
  };

  static DEFAULT_TABS = [
    { id: 'objects', label: 'Objects', icon: '📦' },
    { id: 'metafields', label: 'Metafields', icon: '🏷️' },
    { id: 'settings', label: 'Settings', icon: '🎨' },
    { id: 'sections', label: 'Sections', icon: '📐' },
    { id: 'cart', label: 'Cart', icon: '🛒' },
    { id: 'locale', label: 'Locale', icon: '🌐' },
    { id: 'console', label: 'Console', icon: '📋' },
    { id: 'cookies', label: 'Cookies', icon: '🍪' },
    { id: 'storage', label: 'Storage', icon: '💾' },
    { id: 'info', label: 'Info', icon: 'ℹ️' },
  ];

  static styles = [
    baseStyles,
    css`
      .dock {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60vh;
        background: var(--tdt-bg);
        border-top: 1px solid var(--tdt-border);
        display: flex;
        flex-direction: column;
        z-index: 2147483647;
        transition: transform 0.2s ease;
      }

      .dock--collapsed {
        transform: translateY(calc(100% - 32px));
      }

      .dock__handle {
        height: 32px;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: pointer;
        user-select: none;
        flex-shrink: 0;
      }

      .dock__title {
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tdt-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dock__title::before {
        content: '◆';
        color: var(--tdt-accent);
      }

      .dock__controls {
        display: flex;
        gap: 8px;
      }

      .dock__btn {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 4px 8px;
        font-size: 14px;
        border-radius: var(--tdt-radius);
      }

      .dock__btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        flex-wrap: wrap;
        flex-shrink: 0;
      }

      .header__template {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .header__page-type {
        color: var(--tdt-text-muted);
      }

      .header__cart {
        margin-left: auto;
        color: var(--tdt-text-muted);
        font-size: 11px;
      }

      .tabs {
        display: flex;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        flex-shrink: 0;
      }

      .tab {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        padding: 8px 16px;
        font-size: 11px;
        font-family: var(--tdt-font);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s ease;
        user-select: none;
      }

      .tab:hover {
        color: var(--tdt-text);
        background: var(--tdt-bg-hover);
      }

      .tab--active {
        color: var(--tdt-accent);
        border-bottom-color: var(--tdt-accent);
      }

      .tab--dragging {
        opacity: 0.5;
        cursor: grabbing;
      }

      .tab--drag-over {
        background: var(--tdt-bg-hover);
        border-left: 2px solid var(--tdt-accent);
      }

      .content {
        flex: 1;
        overflow: hidden;
        display: flex;
      }

      .panel {
        flex: 1;
        overflow: auto;
        display: none;
      }

      .panel--active {
        display: block;
      }
    `
  ];

  constructor() {
    super();
    this.isCollapsed = false;
    this.activeTab = 'objects';
    this.context = null;
    this.cart = null;
    this._unsubscribeCart = null;
    this.tabOrder = null;
    this.draggedTab = null;
    this.dragOverTab = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._init();
    this._bindKeyboard();
    this._restoreState();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeCart) {
      this._unsubscribeCart();
    }
    cartAPI.stopPolling();
    sectionHighlighter.destroy();
    document.removeEventListener('keydown', this._handleKeydown);
  }

  _init() {
    this.context = contextParser.parse();
    if (!this.context) {
      console.warn('[Theme Devtools] No context available');
      return;
    }

    cartAPI.interceptAjax();
    cartAPI.startPolling(3000);
    cartAPI.fetch().then(cart => {
      if (cart) cartAPI.setCart(cart);
    });

    this._unsubscribeCart = cartAPI.subscribe((cart) => {
      this.cart = cart;
    });

    sectionHighlighter.init();
  }

  _bindKeyboard() {
    this._handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this._toggleCollapse();
      }
    };
    document.addEventListener('keydown', this._handleKeydown);
  }

  _restoreState() {
    const saved = localStorage.getItem('theme-devtools-collapsed');
    if (saved === 'true') {
      this.isCollapsed = true;
    }

    const savedOrder = localStorage.getItem('theme-devtools-tab-order');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const defaultIds = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
        const validOrder = order.filter(id => defaultIds.includes(id));
        const missingIds = defaultIds.filter(id => !validOrder.includes(id));
        this.tabOrder = [...validOrder, ...missingIds];
      } catch {
        this.tabOrder = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
      }
    } else {
      this.tabOrder = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
    }
  }

  _getOrderedTabs() {
    if (!this.tabOrder) return ThemeDevtools.DEFAULT_TABS;
    return this.tabOrder
      .map(id => ThemeDevtools.DEFAULT_TABS.find(t => t.id === id))
      .filter(Boolean);
  }

  _handleDragStart(tabId, e) {
    this.draggedTab = tabId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  }

  _handleDragOver(tabId, e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (tabId !== this.draggedTab) {
      this.dragOverTab = tabId;
    }
  }

  _handleDragLeave() {
    this.dragOverTab = null;
  }

  _handleDrop(tabId, e) {
    e.preventDefault();
    if (!this.draggedTab || this.draggedTab === tabId) {
      this._resetDragState();
      return;
    }

    const newOrder = [...this.tabOrder];
    const draggedIndex = newOrder.indexOf(this.draggedTab);
    const dropIndex = newOrder.indexOf(tabId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, this.draggedTab);

    this.tabOrder = newOrder;
    localStorage.setItem('theme-devtools-tab-order', JSON.stringify(newOrder));
    this._resetDragState();
  }

  _handleDragEnd() {
    this._resetDragState();
  }

  _resetDragState() {
    this.draggedTab = null;
    this.dragOverTab = null;
  }

  _resetTabOrder() {
    this.tabOrder = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
    localStorage.removeItem('theme-devtools-tab-order');
  }

  _toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('theme-devtools-collapsed', this.isCollapsed);
  }

  _setTab(tabId) {
    this.activeTab = tabId;
  }

  _close() {
    this.remove();
  }

  _formatMoney(cents) {
    if (cents == null) return '—';
    return `$${(cents / 100).toFixed(2)}`;
  }

  render() {
    if (!this.context) {
      return html``;
    }

    const { meta, objects, metafields, settings, sectionSettings } = this.context;

    const objectsWithLiveCart = {
      ...objects,
      cart: this.cart || objects.cart
    };

    const tabs = this._getOrderedTabs();

    return html`
      <div class="dock ${this.isCollapsed ? 'dock--collapsed' : ''}">
        <div class="dock__handle" @click=${this._toggleCollapse}>
          <div class="dock__title">Theme Devtools</div>
          <div class="dock__controls">
            <button class="dock__btn" @click=${(e) => { e.stopPropagation(); this._toggleCollapse(); }}>
              ${this.isCollapsed ? '▲' : '▼'}
            </button>
            <button class="dock__btn" @click=${(e) => { e.stopPropagation(); this._close(); }}>×</button>
          </div>
        </div>

        <div class="header">
          <span class="badge badge--${meta.theme?.role || 'unknown'}">
            ${meta.theme?.role || 'Unknown'}
          </span>
          <span class="header__template">
            ${meta.template?.name || 'Unknown'}${meta.template?.suffix ? `.${meta.template.suffix}` : ''}
          </span>
          <span class="header__page-type">${meta.request?.page_type || '—'}</span>
          ${meta.request?.design_mode ? html`<span class="badge badge--design">Design Mode</span>` : ''}
          <span class="header__cart">
            🛒 ${this.cart?.item_count || 0} items • ${this._formatMoney(this.cart?.total_price)}
          </span>
        </div>

        <div class="tabs">
          ${tabs.map(tab => html`
            <button 
              class="tab ${this.activeTab === tab.id ? 'tab--active' : ''} ${this.draggedTab === tab.id ? 'tab--dragging' : ''} ${this.dragOverTab === tab.id ? 'tab--drag-over' : ''}"
              draggable="true"
              @click=${() => this._setTab(tab.id)}
              @dragstart=${(e) => this._handleDragStart(tab.id, e)}
              @dragover=${(e) => this._handleDragOver(tab.id, e)}
              @dragleave=${() => this._handleDragLeave()}
              @drop=${(e) => this._handleDrop(tab.id, e)}
              @dragend=${() => this._handleDragEnd()}
            >
              ${tab.icon} ${tab.label}
            </button>
          `)}
        </div>

        <div class="content">
          <tdt-objects-panel 
            class="panel ${this.activeTab === 'objects' ? 'panel--active' : ''}"
            .objects=${objectsWithLiveCart}
          ></tdt-objects-panel>
          
          <tdt-metafields-panel 
            class="panel ${this.activeTab === 'metafields' ? 'panel--active' : ''}"
            .metafields=${metafields}
          ></tdt-metafields-panel>
          
          <tdt-settings-panel 
            class="panel ${this.activeTab === 'settings' ? 'panel--active' : ''}"
            .settings=${settings}
            .sectionSettings=${sectionSettings}
          ></tdt-settings-panel>
          
          <tdt-sections-panel 
            class="panel ${this.activeTab === 'sections' ? 'panel--active' : ''}"
          ></tdt-sections-panel>
          
          <tdt-cart-panel 
            class="panel ${this.activeTab === 'cart' ? 'panel--active' : ''}"
            .cart=${this.cart}
          ></tdt-cart-panel>
          
          <tdt-localization-panel 
            class="panel ${this.activeTab === 'locale' ? 'panel--active' : ''}"
            .meta=${meta}
          ></tdt-localization-panel>
          
          <tdt-console-panel 
            class="panel ${this.activeTab === 'console' ? 'panel--active' : ''}"
          ></tdt-console-panel>
          
          <tdt-cookies-panel 
            class="panel ${this.activeTab === 'cookies' ? 'panel--active' : ''}"
          ></tdt-cookies-panel>
          
          <tdt-storage-panel 
            class="panel ${this.activeTab === 'storage' ? 'panel--active' : ''}"
          ></tdt-storage-panel>
          
          <tdt-info-panel 
            class="panel ${this.activeTab === 'info' ? 'panel--active' : ''}"
            .meta=${meta}
          ></tdt-info-panel>
        </div>
      </div>
    `;
  }
}

customElements.define('theme-devtools', ThemeDevtools);

