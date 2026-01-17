import { LitElement, html, css } from 'lit';
import { rootStyles, THEMES, FONT_SCALES } from '../styles/theme.js';
import { contextParser } from '../services/context.js';
import { cartAPI } from '../services/cart.js';
import { productAPI } from '../services/product.js';
import { sectionHighlighter } from '../services/sections.js';
import { settingsService } from '../services/settings.js';

import './panels/objects-panel.js';
// import './panels/sections-panel.js';  // Hidden for now
import './panels/cart-panel.js';
import './panels/info-panel.js';
import './panels/metafields-panel.js';
import './panels/cookies-panel.js';
import './panels/storage-panel.js';
import './panels/console-panel.js';
import './panels/localization-panel.js';
import './panels/analytics-panel.js';
import './panels/seo-panel.js';
import './panels/apps-panel.js';
import './panels/network-panel.js';
import './panels/preferences-panel.js';
import './panels/accessibility-panel.js';

export class ThemeDevtools extends LitElement {
  static properties = {
    isCollapsed: { type: Boolean, state: true },
    activeTab: { type: String, state: true },
    context: { type: Object, state: true },
    cart: { type: Object, state: true },
    product: { type: Object, state: true },
    tabOrder: { type: Array, state: true },
    hiddenTabs: { type: Array, state: true },
    draggedTab: { type: String, state: true },
    dragOverTab: { type: String, state: true },
    showAdminDropdown: { type: Boolean, state: true },
    showTabContextMenu: { type: Boolean, state: true },
    tabContextMenuPosition: { type: Object, state: true },
    contextMenuTabId: { type: String, state: true },
    panelPosition: { type: String, state: true },
    panelHeight: { type: String, state: true },
    floatingX: { type: Number, state: true },
    floatingY: { type: Number, state: true },
    isDraggingPanel: { type: Boolean, state: true },
  };

  static DEFAULT_TABS = [
    { id: 'objects', label: 'Objects' },
    { id: 'metafields', label: 'Metafields' },
    { id: 'cart', label: 'Cart' },
    { id: 'a11y', label: 'Accessibility' },
    { id: 'locale', label: 'Locale' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'seo', label: 'SEO' },
    { id: 'apps', label: 'Apps' },
    { id: 'network', label: 'Network' },
    { id: 'console', label: 'Console' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'storage', label: 'Storage' },
    { id: 'info', label: 'Info' },
    { id: 'preferences', label: 'Preferences' },
  ];

  static styles = [
    rootStyles,
    css`
      .dock {
        position: fixed;
        background: var(--tdt-bg);
        display: flex;
        flex-direction: column;
        z-index: 2147483647;
        transition: transform 0.2s ease;
      }

      /* Bottom position (default) */
      .dock--bottom {
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--tdt-panel-height, 50vh);
        border-top: 1px solid var(--tdt-border);
      }

      .dock--bottom.dock--collapsed {
        transform: translateY(calc(100% - 32px));
      }

      /* Floating position */
      .dock--floating {
        position: fixed;
        width: 700px;
        height: var(--tdt-panel-height, 50vh);
        min-width: 400px;
        min-height: 200px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 40px);
        border: 1px solid var(--tdt-border);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        resize: both;
        overflow: hidden;
      }

      .dock--floating.dock--collapsed {
        height: 32px !important;
        width: 550px !important;
        min-height: 32px;
        min-width: 550px;
        resize: none;
      }

      .dock--floating .dock__handle {
        border-radius: 8px 8px 0 0;
        cursor: move;
      }

      .dock--floating.dock--collapsed .dock__handle {
        border-radius: 8px;
      }

      .dock--floating.dock--dragging {
        opacity: 0.9;
        transition: none;
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
        font-size: calc(11px * var(--tdt-scale, 1));
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

      .dock__theme-name {
        font-weight: 400;
        color: var(--tdt-text);
        text-transform: none;
        letter-spacing: normal;
        padding-left: 8px;
        border-left: 1px solid var(--tdt-border);
        margin-left: 2px;
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
        font-size: calc(14px * var(--tdt-scale, 1));
        border-radius: var(--tdt-radius);
      }

      .dock__btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        flex-wrap: wrap;
        flex-shrink: 0;
      }

      .header__info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .header__template {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .header__page-type {
        color: var(--tdt-text-muted);
      }

      .header__actions {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: auto;
        flex-wrap: wrap;
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        flex-shrink: 0;
        overflow-y: auto;
        max-height: 80px;
      }

      .tab {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        padding: 8px 16px;
        font-size: calc(11px * var(--tdt-scale, 1));
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

      .action-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        color: var(--tdt-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .action-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      .action-btn--danger:hover {
        background: rgba(255, 77, 77, 0.15);
        border-color: var(--tdt-error);
        color: var(--tdt-error);
      }

      .action-btn--success {
        background: rgba(34, 197, 94, 0.15);
        border-color: var(--tdt-success);
        color: var(--tdt-success);
      }

      .action-btn__icon {
        font-size: calc(12px * var(--tdt-scale, 1));
      }

      .actions-divider {
        width: 1px;
        height: 16px;
        background: var(--tdt-border);
        margin: 0 4px;
      }

      .action-dropdown {
        position: relative;
      }

      .action-dropdown__menu {
        position: absolute;
        left: 0;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 0;
        min-width: 180px;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
        z-index: 100;
        margin-bottom: 4px;
      }

      .action-dropdown__item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        cursor: pointer;
        transition: background 0.1s ease;
        text-decoration: none;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: var(--tdt-font);
      }

      .action-dropdown__item:hover {
        background: var(--tdt-bg-hover);
      }

      .action-dropdown__item--highlight {
        background: rgba(147, 130, 255, 0.1);
        border-left: 2px solid var(--tdt-accent);
      }

      .action-dropdown__divider {
        height: 1px;
        background: var(--tdt-border);
        margin: 4px 0;
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

      /* Tab context menu */
      .tab-context-menu {
        position: fixed;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 0;
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 2147483647;
      }

      .tab-context-menu__item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        cursor: pointer;
        transition: background 0.1s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: var(--tdt-font);
      }

      .tab-context-menu__item:hover {
        background: var(--tdt-bg-hover);
      }

      .tab-context-menu__item--danger {
        color: var(--tdt-error);
      }

      .tab-context-menu__item--danger:hover {
        background: rgba(239, 68, 68, 0.1);
      }

      .tab-context-menu__divider {
        height: 1px;
        background: var(--tdt-border);
        margin: 4px 0;
      }

      .tab-context-menu__submenu-label {
        padding: 6px 12px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tab-context-menu__hidden-list {
        max-height: 200px;
        overflow-y: auto;
      }
    `
  ];

  constructor() {
    super();
    this.isCollapsed = true;
    this.activeTab = settingsService.get('defaultTab') || 'objects';
    this.context = null;
    this.cart = null;
    this.product = null;
    this._unsubscribeCart = null;
    this._unsubscribeProduct = null;
    this._unsubscribeSettings = null;
    this.tabOrder = null;
    this.hiddenTabs = [];
    this.draggedTab = null;
    this.dragOverTab = null;
    this.showAdminDropdown = false;
    this.showTabContextMenu = false;
    this.tabContextMenuPosition = { x: 0, y: 0 };
    this.contextMenuTabId = null;
    this.panelPosition = settingsService.get('panelPosition') || 'bottom';
    this.panelHeight = settingsService.get('panelHeight') || '50';
    this.isDraggingPanel = false;
    this._loadFloatingPosition();
  }

  _loadFloatingPosition() {
    try {
      const stored = localStorage.getItem('tdt-floating-position');
      if (stored) {
        const { x, y, width, height } = JSON.parse(stored);
        this.floatingX = x;
        this.floatingY = y;
        this.floatingWidth = width || 700;
        this.floatingHeight = height || null; // null means use default from settings
      } else {
        // Default to bottom-right
        this.floatingX = window.innerWidth - 720;
        this.floatingY = window.innerHeight - 400;
        this.floatingWidth = 700;
        this.floatingHeight = null;
      }
    } catch {
      this.floatingX = window.innerWidth - 720;
      this.floatingY = window.innerHeight - 400;
      this.floatingWidth = 700;
      this.floatingHeight = null;
    }
  }

  _saveFloatingPosition() {
    try {
      localStorage.setItem('tdt-floating-position', JSON.stringify({
        x: this.floatingX,
        y: this.floatingY,
        width: this.floatingWidth,
        height: this.floatingHeight,
      }));
    } catch {
      // Ignore
    }
  }

  _setupResizeObserver() {
    if (this._resizeObserver) return;

    this._resizeObserver = new ResizeObserver((entries) => {
      if (this.panelPosition !== 'floating' || this.isCollapsed) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Only save if dimensions changed significantly (to avoid excessive saves)
        if (Math.abs(width - (this.floatingWidth || 700)) > 5 ||
            Math.abs(height - (this.floatingHeight || 300)) > 5) {
          this.floatingWidth = width;
          this.floatingHeight = height;
          this._saveFloatingPosition();
        }
      }
    });
  }

  _observeResize() {
    if (this.panelPosition !== 'floating') return;

    this._setupResizeObserver();
    const dock = this.shadowRoot?.querySelector('.dock');
    if (dock && this._resizeObserver) {
      this._resizeObserver.observe(dock);
    }
  }

  _disconnectResizeObserver() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._init();
    this._bindKeyboard();
    this._restoreState();
    this._applySettings();
    this._subscribeToSettings();
    this._listenForSystemTheme();
  }

  updated(changedProps) {
    super.updated(changedProps);
    // Start observing resize when panel becomes floating
    if (changedProps.has('panelPosition') && this.panelPosition === 'floating') {
      this._observeResize();
    }
    // Also observe after first render
    if (this.panelPosition === 'floating' && !this._resizeObserver) {
      this._observeResize();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeCart) {
      this._unsubscribeCart();
    }
    if (this._unsubscribeProduct) {
      this._unsubscribeProduct();
    }
    if (this._unsubscribeSettings) {
      this._unsubscribeSettings();
    }
    if (this._mediaQueryListener) {
      this._systemThemeQuery?.removeEventListener('change', this._mediaQueryListener);
    }
    this._disconnectResizeObserver();
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

    // Initialize product API if on a product page
    if (this.context.objects?.product) {
      this._unsubscribeProduct = productAPI.subscribe((product) => {
        this.product = product;
      });
      productAPI.initialize(this.context.objects.product);
    }

    sectionHighlighter.init();
  }

  _bindKeyboard() {
    this._handleKeydown = (e) => {
      // Use custom shortcut from settings
      if (settingsService.matchesShortcut(e)) {
        e.preventDefault();
        this._toggleCollapse();
      }
    };
    document.addEventListener('keydown', this._handleKeydown);
  }

  _subscribeToSettings() {
    this._unsubscribeSettings = settingsService.subscribe((key, newValue) => {
      if (key === 'theme' || key === 'fontSize' || key === '*') {
        this._applySettings();
      }
      if (key === 'panelPosition' || key === '*') {
        this.panelPosition = settingsService.get('panelPosition') || 'bottom';
      }
      if (key === 'panelHeight' || key === '*') {
        this.panelHeight = settingsService.get('panelHeight') || '50';
        this._applyPanelHeight();
      }
    });
  }

  _listenForSystemTheme() {
    // Listen for system theme changes when theme is set to 'system'
    this._systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._mediaQueryListener = () => {
      if (settingsService.get('theme') === 'system') {
        this._applySettings();
      }
    };
    this._systemThemeQuery.addEventListener('change', this._mediaQueryListener);
  }

  _applySettings() {
    const settings = settingsService.getAll();
    let activeTheme = settings.theme;

    // Handle system theme
    if (activeTheme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const themeVars = THEMES[activeTheme] || THEMES.dark;
    const scale = FONT_SCALES[settings.fontSize] || FONT_SCALES.medium;

    // Apply CSS variables to the host element
    for (const [prop, value] of Object.entries(themeVars)) {
      this.style.setProperty(prop, value);
    }
    this.style.setProperty('--tdt-scale', scale);

    // Apply panel height
    this._applyPanelHeight();
  }

  _applyPanelHeight() {
    const height = this.panelHeight || '50';
    this.style.setProperty('--tdt-panel-height', `${height}vh`);
  }

  _restoreState() {
    const saved = localStorage.getItem('theme-devtools-collapsed');
    if (saved !== null) {
      this.isCollapsed = saved === 'true';
    }

    // Only restore saved tab if it exists, otherwise use the default from settings
    const savedTab = localStorage.getItem('theme-devtools-active-tab');
    const validTabIds = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
    if (savedTab && validTabIds.includes(savedTab)) {
      this.activeTab = savedTab;
    }
    // Note: If no saved tab, activeTab already set from settings in constructor

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

    // Restore hidden tabs
    const savedHidden = localStorage.getItem('theme-devtools-hidden-tabs');
    if (savedHidden) {
      try {
        const hidden = JSON.parse(savedHidden);
        this.hiddenTabs = hidden.filter(id => validTabIds.includes(id));
      } catch {
        this.hiddenTabs = ['locale', 'analytics', 'seo', 'apps', 'cookies', 'storage'];
      }
    } else {
      // Default hidden tabs for first-time users
      this.hiddenTabs = ['locale', 'analytics', 'seo', 'apps', 'cookies', 'storage'];
    }

    // Ensure active tab is not hidden, switch to first visible if needed
    if (this.hiddenTabs.includes(this.activeTab)) {
      const visibleTabs = this.tabOrder.filter(id => !this.hiddenTabs.includes(id));
      this.activeTab = visibleTabs[0] || 'objects';
    }
  }

  _getOrderedTabs() {
    if (!this.tabOrder) return ThemeDevtools.DEFAULT_TABS.filter(t => !this.hiddenTabs.includes(t.id));
    return this.tabOrder
      .filter(id => !this.hiddenTabs.includes(id))
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

  // Tab context menu handlers
  _handleTabContextMenu(tabId, e) {
    e.preventDefault();
    this.contextMenuTabId = tabId;
    this.tabContextMenuPosition = { x: e.clientX, y: e.clientY };
    this.showTabContextMenu = true;

    // Close on outside click
    const closeMenu = (event) => {
      if (!event.target.closest('.tab-context-menu')) {
        this.showTabContextMenu = false;
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  _closeTabContextMenu() {
    this.showTabContextMenu = false;
    this.contextMenuTabId = null;
  }

  _hideTab(tabId) {
    if (!tabId || tabId === 'preferences') {
      // Don't allow hiding the preferences tab (need access to restore tabs)
      this._showActionFeedback('Cannot hide Preferences tab');
      return;
    }

    const visibleCount = this.tabOrder.filter(id => !this.hiddenTabs.includes(id)).length;
    if (visibleCount <= 2) {
      this._showActionFeedback('Must keep at least 2 tabs visible');
      return;
    }

    this.hiddenTabs = [...this.hiddenTabs, tabId];
    localStorage.setItem('theme-devtools-hidden-tabs', JSON.stringify(this.hiddenTabs));

    // Switch active tab if we hid the current one
    if (this.activeTab === tabId) {
      const visibleTabs = this.tabOrder.filter(id => !this.hiddenTabs.includes(id));
      this.activeTab = visibleTabs[0] || 'objects';
      localStorage.setItem('theme-devtools-active-tab', this.activeTab);
    }

    this._closeTabContextMenu();
  }

  _showTab(tabId) {
    this.hiddenTabs = this.hiddenTabs.filter(id => id !== tabId);
    localStorage.setItem('theme-devtools-hidden-tabs', JSON.stringify(this.hiddenTabs));
    this._closeTabContextMenu();
  }

  _showAllTabs() {
    this.hiddenTabs = [];
    localStorage.removeItem('theme-devtools-hidden-tabs');
    this._closeTabContextMenu();
    this._showActionFeedback('All tabs restored');
  }

  _resetTabsToDefaults() {
    this.tabOrder = ThemeDevtools.DEFAULT_TABS.map(t => t.id);
    this.hiddenTabs = [];
    localStorage.removeItem('theme-devtools-tab-order');
    localStorage.removeItem('theme-devtools-hidden-tabs');
    this._closeTabContextMenu();
    this._showActionFeedback('Tabs reset to defaults');
  }

  _renderTabContextMenu() {
    if (!this.showTabContextMenu) return '';

    const tab = ThemeDevtools.DEFAULT_TABS.find(t => t.id === this.contextMenuTabId);
    const hiddenTabsList = this.hiddenTabs
      .map(id => ThemeDevtools.DEFAULT_TABS.find(t => t.id === id))
      .filter(Boolean);

    return html`
      <div
        class="tab-context-menu"
        style="left: ${this.tabContextMenuPosition.x}px; top: ${this.tabContextMenuPosition.y}px;"
        @click=${(e) => e.stopPropagation()}
      >
        ${tab ? html`
          <button
            class="tab-context-menu__item tab-context-menu__item--danger"
            @click=${() => this._hideTab(this.contextMenuTabId)}
            ?disabled=${this.contextMenuTabId === 'preferences'}
          >
            Hide "${tab.label}"
          </button>
          <div class="tab-context-menu__divider"></div>
        ` : ''}

        ${hiddenTabsList.length > 0 ? html`
          <div class="tab-context-menu__submenu-label">Hidden Tabs</div>
          <div class="tab-context-menu__hidden-list">
            ${hiddenTabsList.map(t => html`
              <button
                class="tab-context-menu__item"
                @click=${() => this._showTab(t.id)}
              >
                Show "${t.label}"
              </button>
            `)}
          </div>
          <div class="tab-context-menu__divider"></div>
        ` : ''}

        ${hiddenTabsList.length > 0 ? html`
          <button
            class="tab-context-menu__item"
            @click=${this._showAllTabs}
          >
            Show All Tabs
          </button>
        ` : ''}

        <button
          class="tab-context-menu__item"
          @click=${this._resetTabsToDefaults}
        >
          Reset Tabs to Defaults
        </button>
      </div>
    `;
  }

  // Floating panel drag handlers
  _handlePanelDragStart(e) {
    if (this.panelPosition !== 'floating') return;

    // Only handle drag on the handle element itself, not its children (buttons)
    if (e.target.closest('.dock__btn')) return;

    e.preventDefault();

    const dock = this.shadowRoot.querySelector('.dock');
    const rect = dock.getBoundingClientRect();

    this._dragOffsetX = e.clientX - rect.left;
    this._dragOffsetY = e.clientY - rect.top;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._didDrag = false;

    this._handlePanelDragMove = this._handlePanelDragMove.bind(this);
    this._handlePanelDragEnd = this._handlePanelDragEnd.bind(this);

    document.addEventListener('mousemove', this._handlePanelDragMove);
    document.addEventListener('mouseup', this._handlePanelDragEnd);
  }

  _handlePanelDragMove(e) {
    // Check if mouse moved enough to be considered a drag (5px threshold)
    const dx = Math.abs(e.clientX - this._dragStartX);
    const dy = Math.abs(e.clientY - this._dragStartY);

    if (dx > 5 || dy > 5) {
      this._didDrag = true;
      this.isDraggingPanel = true;
    }

    if (!this.isDraggingPanel) return;

    let newX = e.clientX - this._dragOffsetX;
    let newY = e.clientY - this._dragOffsetY;

    // Constrain to viewport
    const dock = this.shadowRoot.querySelector('.dock');
    const rect = dock.getBoundingClientRect();

    newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
    newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));

    this.floatingX = newX;
    this.floatingY = newY;
  }

  _handlePanelDragEnd() {
    document.removeEventListener('mousemove', this._handlePanelDragMove);
    document.removeEventListener('mouseup', this._handlePanelDragEnd);

    if (this._didDrag) {
      this._saveFloatingPosition();
    }

    this.isDraggingPanel = false;
    this._didDrag = false;
  }

  _handleFloatingHandleClick(e) {
    // Only toggle if we didn't just drag
    if (this._didDrag) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this._toggleCollapse();
  }

  async _clearCart() {
    try {
      await fetch('/cart/clear.js', { method: 'POST' });
      this.cart = { items: [], item_count: 0, total_price: 0 };
      this._showActionFeedback('Cart cleared');
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  }

  _forceRefresh() {
    location.reload(true);
  }

  _toggleDesignMode() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('design_mode')) {
      url.searchParams.delete('design_mode');
    } else {
      url.searchParams.set('design_mode', 'true');
    }
    window.location.href = url.toString();
  }

  _getShopURL() {
    return window.location.origin;
  }

  _getAdminBaseUrl() {
    return `${this._getShopURL()}/admin`;
  }

  _toggleAdminDropdown(e) {
    e?.stopPropagation();
    this.showAdminDropdown = !this.showAdminDropdown;
    
    if (this.showAdminDropdown) {
      const closeDropdown = () => {
        this.showAdminDropdown = false;
        document.removeEventListener('click', closeDropdown);
      };
      setTimeout(() => document.addEventListener('click', closeDropdown), 0);
    }
  }

  _openAdminPage(path) {
    window.open(`${this._getAdminBaseUrl()}${path}`, '_blank');
    this.showAdminDropdown = false;
  }

  _openThemeEditor() {
    const { meta } = this.context || {};
    const themeId = meta?.theme?.id;

    if (!themeId) {
      window.open(this._getAdminBaseUrl() + '/themes', '_blank');
      return;
    }

    const path = window.location.pathname + window.location.search;
    const editorUrl = `${this._getAdminBaseUrl()}/themes/${themeId}/editor?previewPath=${encodeURIComponent(path)}`;

    window.open(editorUrl, '_blank');
  }

  _getThemeEditorUrl() {
    const { meta } = this.context || {};
    const themeId = meta?.theme?.id;

    if (!themeId) {
      return `${this._getAdminBaseUrl()}/themes`;
    }

    const path = window.location.pathname + window.location.search;
    return `${this._getAdminBaseUrl()}/themes/${themeId}/editor?previewPath=${encodeURIComponent(path)}`;
  }

  async _copyThemeEditorUrl() {
    try {
      const url = this._getThemeEditorUrl();
      await navigator.clipboard.writeText(url);
      this._showActionFeedback('Editor URL copied');
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }

  _getPreviewThemeUrl() {
    const { meta } = this.context || {};
    const themeId = meta?.theme?.id;

    if (!themeId) {
      return window.location.href;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('preview_theme_id', themeId);
    return url.toString();
  }

  async _copyPreviewThemeUrl() {
    try {
      const url = this._getPreviewThemeUrl();
      await navigator.clipboard.writeText(url);
      this._showActionFeedback('Preview URL copied');
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }

  _openResourceInAdmin() {
    const { meta, objects } = this.context || {};
    const pageType = meta?.request?.page_type;
    
    if (pageType === 'product' && objects?.product?.id) {
      this._openAdminPage(`/products/${objects.product.id}`);
    } else if (pageType === 'collection' && objects?.collection?.id) {
      this._openAdminPage(`/collections/${objects.collection.id}`);
    } else if (pageType === 'article' && objects?.article?.id) {
      this._openAdminPage(`/articles/${objects.article.id}`);
    } else if (pageType === 'page' && objects?.page?.id) {
      this._openAdminPage(`/pages/${objects.page.id}`);
    } else if (pageType === 'blog' && objects?.blog?.id) {
      this._openAdminPage(`/blogs/${objects.blog.id}`);
    }
  }

  _getResourceLabel() {
    const pageType = this.context?.meta?.request?.page_type;
    const labels = {
      product: 'Product',
      collection: 'Collection',
      article: 'Article',
      page: 'Page',
      blog: 'Blog'
    };
    return labels[pageType] || null;
  }

  _clearLocalStorage() {
    if (confirm('Clear all localStorage? This may log you out or reset preferences.')) {
      localStorage.clear();
      this._showActionFeedback('Storage cleared');
    }
  }

  _clearSessionStorage() {
    sessionStorage.clear();
    this._showActionFeedback('Session cleared');
  }

  _clearAllCookies() {
    const cookies = document.cookie.split(';');
    if (cookies.length === 0 || (cookies.length === 1 && !cookies[0].trim())) {
      this._showActionFeedback('No cookies to clear');
      return;
    }

    if (confirm(`Clear all ${cookies.filter(c => c.trim()).length} cookies? This may log you out.`)) {
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        }
      });
      this._showActionFeedback('Cookies cleared');
    }
  }

  _showActionFeedback(message) {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `
      position: fixed;
      bottom: calc(60vh + 10px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--tdt-success, #22c55e);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: calc(12px * var(--tdt-scale, 1));
      font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
      z-index: 2147483647;
      animation: fadeOut 2s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        0%, 70% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    el.appendChild(style);
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 2000);
  }

  _toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('theme-devtools-collapsed', this.isCollapsed);
  }

  _setTab(tabId) {
    this.activeTab = tabId;
    localStorage.setItem('theme-devtools-active-tab', tabId);
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

    const { meta, objects, metafields, metafieldsSchema } = this.context;

    const objectsWithLiveCart = {
      ...objects,
      cart: this.cart || objects.cart,
      product: this.product || objects.product
    };

    const tabs = this._getOrderedTabs();

    const positionClass = `dock--${this.panelPosition || 'bottom'}`;
    const collapseIcon = this.isCollapsed ? '▲' : '▼';

    // For floating panel, apply position and size styles
    let floatingStyle = '';
    if (this.panelPosition === 'floating') {
      const styles = [`left: ${this.floatingX}px`, `top: ${this.floatingY}px`];
      if (this.floatingWidth) {
        styles.push(`width: ${this.floatingWidth}px`);
      }
      if (this.floatingHeight) {
        styles.push(`height: ${this.floatingHeight}px`);
      }
      floatingStyle = styles.join('; ') + ';';
    }

    return html`
      <div
        class="dock ${positionClass} ${this.isCollapsed ? 'dock--collapsed' : ''} ${this.isDraggingPanel ? 'dock--dragging' : ''}"
        style="${floatingStyle}"
      >
        <div
          class="dock__handle"
          @click=${this._toggleCollapse}
          @mousedown=${this.panelPosition === 'floating' ? (e) => this._handlePanelDragStart(e) : null}
        >
          <div class="dock__title">
            Theme Devtools
            ${meta.theme?.name ? html`<span class="dock__theme-name">${meta.theme.name}</span>` : ''}
          </div>
          <div class="dock__controls">
            <button class="dock__btn" @click=${(e) => { e.stopPropagation(); this._toggleCollapse(); }}>
              ${collapseIcon}
            </button>
            <button class="dock__btn" @click=${(e) => { e.stopPropagation(); this._close(); }}>×</button>
          </div>
        </div>

        <div class="header">
          <div class="header__info">
            <span class="badge badge--${meta.theme?.role || 'unknown'}">
              ${meta.theme?.role || 'Unknown'}
            </span>
            <span class="header__template">
              ${meta.template?.name || 'Unknown'}${meta.template?.suffix ? `.${meta.template.suffix}` : ''}
            </span>
            <span class="header__page-type">${meta.request?.page_type || '—'}</span>
            ${meta.request?.design_mode ? html`<span class="badge badge--design">Design Mode</span>` : ''}
          </div>

          <div class="header__actions">
            <button class="action-btn action-btn--danger" @click=${this._clearCart} title="Clear shopping cart">
              Clear Cart
            </button>

            <button class="action-btn" @click=${this._forceRefresh} title="Hard refresh page">
              Refresh
            </button>

            <div class="actions-divider"></div>

            <div class="action-dropdown">
              <button class="action-btn" @click=${this._toggleAdminDropdown} title="Open Shopify admin pages">
                Admin ▾
              </button>
              ${this.showAdminDropdown ? html`
                <div class="action-dropdown__menu" @click=${(e) => e.stopPropagation()}>
                  ${this._getResourceLabel() ? html`
                    <button class="action-dropdown__item action-dropdown__item--highlight" @click=${this._openResourceInAdmin}>
                      Open ${this._getResourceLabel()} in Admin
                    </button>
                    <div class="action-dropdown__divider"></div>
                  ` : ''}
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/products?selectedView=all')}>
                    Products
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/collections?selectedView=all')}>
                    Collections
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/orders')}>
                    Orders
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/discounts')}>
                    Discounts
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/content/metaobjects')}>
                    Metaobjects
                  </button>
                  <div class="action-dropdown__divider"></div>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/themes')}>
                    Themes
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/customers')}>
                    Customers
                  </button>
                  <button class="action-dropdown__item" @click=${() => this._openAdminPage('/settings')}>
                    Settings
                  </button>
                </div>
              ` : ''}
            </div>

            <button class="action-btn" @click=${this._openThemeEditor} title="Open current page in theme editor">
              Editor
            </button>

            <button class="action-btn" @click=${this._copyThemeEditorUrl} title="Copy theme editor URL">
              Copy Editor URL
            </button>

            <button class="action-btn" @click=${this._copyPreviewThemeUrl} title="Copy preview theme URL">
              Copy Preview URL
            </button>

            <div class="actions-divider"></div>

            <button class="action-btn action-btn--danger" @click=${this._clearAllCookies} title="Clear all cookies">
              Clear Cookies
            </button>
          </div>
        </div>

        <div class="tabs">
          ${tabs.map(tab => html`
            <button
              class="tab ${this.activeTab === tab.id ? 'tab--active' : ''} ${this.draggedTab === tab.id ? 'tab--dragging' : ''} ${this.dragOverTab === tab.id ? 'tab--drag-over' : ''}"
              draggable="true"
              @click=${() => this._setTab(tab.id)}
              @contextmenu=${(e) => this._handleTabContextMenu(tab.id, e)}
              @dragstart=${(e) => this._handleDragStart(tab.id, e)}
              @dragover=${(e) => this._handleDragOver(tab.id, e)}
              @dragleave=${() => this._handleDragLeave()}
              @drop=${(e) => this._handleDrop(tab.id, e)}
              @dragend=${() => this._handleDragEnd()}
            >
              ${tab.label}
            </button>
          `)}
        </div>
        ${this._renderTabContextMenu()}

        <div class="content">
          ${!this.hiddenTabs.includes('objects') ? html`
            <tdt-objects-panel
              class="panel ${this.activeTab === 'objects' ? 'panel--active' : ''}"
              .objects=${objectsWithLiveCart}
            ></tdt-objects-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('metafields') ? html`
            <tdt-metafields-panel
              class="panel ${this.activeTab === 'metafields' ? 'panel--active' : ''}"
              .metafields=${metafields}
              .metafieldsSchema=${metafieldsSchema}
            ></tdt-metafields-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('cart') ? html`
            <tdt-cart-panel
              class="panel ${this.activeTab === 'cart' ? 'panel--active' : ''}"
              .cart=${this.cart}
            ></tdt-cart-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('a11y') ? html`
            <tdt-accessibility-panel
              class="panel ${this.activeTab === 'a11y' ? 'panel--active' : ''}"
            ></tdt-accessibility-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('locale') ? html`
            <tdt-localization-panel
              class="panel ${this.activeTab === 'locale' ? 'panel--active' : ''}"
              .meta=${meta}
            ></tdt-localization-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('analytics') ? html`
            <tdt-analytics-panel
              class="panel ${this.activeTab === 'analytics' ? 'panel--active' : ''}"
            ></tdt-analytics-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('seo') ? html`
            <tdt-seo-panel
              class="panel ${this.activeTab === 'seo' ? 'panel--active' : ''}"
            ></tdt-seo-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('apps') ? html`
            <tdt-apps-panel
              class="panel ${this.activeTab === 'apps' ? 'panel--active' : ''}"
            ></tdt-apps-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('network') ? html`
            <network-panel
              class="panel ${this.activeTab === 'network' ? 'panel--active' : ''}"
            ></network-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('console') ? html`
            <tdt-console-panel
              class="panel ${this.activeTab === 'console' ? 'panel--active' : ''}"
              .context=${this.context}
            ></tdt-console-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('cookies') ? html`
            <tdt-cookies-panel
              class="panel ${this.activeTab === 'cookies' ? 'panel--active' : ''}"
            ></tdt-cookies-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('storage') ? html`
            <tdt-storage-panel
              class="panel ${this.activeTab === 'storage' ? 'panel--active' : ''}"
            ></tdt-storage-panel>
          ` : ''}

          ${!this.hiddenTabs.includes('info') ? html`
            <tdt-info-panel
              class="panel ${this.activeTab === 'info' ? 'panel--active' : ''}"
              .meta=${meta}
            ></tdt-info-panel>
          ` : ''}

          <tdt-preferences-panel
            class="panel ${this.activeTab === 'preferences' ? 'panel--active' : ''}"
            @settings-changed=${this._applySettings}
          ></tdt-preferences-panel>
        </div>
      </div>
    `;
  }
}

customElements.define('theme-devtools', ThemeDevtools);

