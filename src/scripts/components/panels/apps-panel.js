import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class AppsPanel extends LitElement {
  static properties = {
    appBlocks: { type: Array, state: true },
    scripts: { type: Array, state: true },
    appEmbeds: { type: Array, state: true },
    pixelScripts: { type: Array, state: true },
    activeTab: { type: String, state: true },
    searchTerm: { type: String, state: true },
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

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .tab {
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

      .tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .tab__count {
        font-size: 9px;
        opacity: 0.8;
        background: rgba(255,255,255,0.15);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .stats-bar {
        display: flex;
        gap: 12px;
        padding: 8px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        color: var(--tdt-text-muted);
      }

      .stat__value {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .stat__icon {
        font-size: 12px;
      }

      .search-bar {
        margin-bottom: 12px;
      }

      .search-input {
        width: 100%;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        color: var(--tdt-text);
        font-family: var(--tdt-font);
        font-size: 11px;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .search-input::placeholder {
        color: var(--tdt-text-muted);
      }

      .section {
        margin-bottom: 12px;
      }

      .section-title {
        font-size: 10px;
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--tdt-border);
      }

      .item-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .item--warning {
        border-left: 3px solid var(--tdt-warning);
      }

      .item--info {
        border-left: 3px solid var(--tdt-accent);
      }

      .item--success {
        border-left: 3px solid var(--tdt-success);
      }

      .item__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        cursor: pointer;
        gap: 8px;
      }

      .item__header:hover {
        background: var(--tdt-bg-hover);
      }

      .item__main {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .item__icon {
        font-size: 14px;
        flex-shrink: 0;
      }

      .item__info {
        flex: 1;
        min-width: 0;
      }

      .item__name {
        font-weight: 600;
        font-size: 11px;
        color: var(--tdt-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item__meta {
        font-size: 9px;
        color: var(--tdt-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item__badges {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .item__badge {
        font-size: 8px;
        padding: 2px 5px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        text-transform: uppercase;
        font-family: var(--tdt-font);
      }

      .item__badge--app {
        background: rgba(139, 92, 246, 0.2);
        color: #a78bfa;
      }

      .item__badge--script {
        background: rgba(59, 130, 246, 0.2);
        color: var(--tdt-accent);
      }

      .item__badge--pixel {
        background: rgba(236, 72, 153, 0.2);
        color: #f472b6;
      }

      .item__badge--embed {
        background: rgba(34, 197, 94, 0.2);
        color: var(--tdt-success);
      }

      .item__badge--async {
        background: rgba(234, 179, 8, 0.2);
        color: var(--tdt-warning);
      }

      .item__badge--defer {
        background: rgba(6, 182, 212, 0.2);
        color: #22d3ee;
      }

      .item__badge--inline {
        background: rgba(249, 115, 22, 0.2);
        color: #fb923c;
      }

      .item__badge--external {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }

      .item__actions {
        display: flex;
        gap: 4px;
      }

      .item__btn {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: var(--tdt-text-muted);
        font-size: 12px;
        border-radius: var(--tdt-radius);
        transition: all 0.15s ease;
      }

      .item__btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .item__content {
        border-top: 1px solid var(--tdt-border);
        padding: 8px 10px;
        background: var(--tdt-bg);
      }

      .item__detail {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
        font-size: 10px;
      }

      .item__detail:last-child {
        margin-bottom: 0;
      }

      .item__detail-label {
        color: var(--tdt-text-muted);
        flex-shrink: 0;
        min-width: 60px;
      }

      .item__detail-value {
        color: var(--tdt-text);
        word-break: break-all;
        font-family: var(--tdt-font-mono);
      }

      .item__detail-value--link {
        color: var(--tdt-accent);
        cursor: pointer;
      }

      .item__detail-value--link:hover {
        text-decoration: underline;
      }

      .item__code {
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 8px;
        font-size: 9px;
        font-family: var(--tdt-font-mono);
        color: var(--tdt-text);
        max-height: 100px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-all;
        margin-top: 6px;
      }

      .empty-state {
        text-align: center;
        padding: 24px 16px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .empty-state__icon {
        font-size: 32px;
        margin-bottom: 8px;
        opacity: 0.5;
      }

      .highlight-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 6px;
        color: var(--tdt-text-muted);
        font-size: 9px;
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .highlight-btn:hover {
        background: var(--tdt-bg-hover);
        border-color: var(--tdt-accent);
        color: var(--tdt-accent);
      }

      .vendor-icon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .vendor-icon--klaviyo { background: #2f2f2f; color: #00d4aa; }
      .vendor-icon--judgeme { background: #000; color: #ffd700; }
      .vendor-icon--recharge { background: #00a3e0; color: white; }
      .vendor-icon--privy { background: #3b5998; color: white; }
      .vendor-icon--omnisend { background: #ff6b35; color: white; }
      .vendor-icon--shopify { background: #96bf48; color: white; }
      .vendor-icon--facebook { background: #1877f2; color: white; }
      .vendor-icon--google { background: #4285f4; color: white; }
      .vendor-icon--tiktok { background: #000; color: white; }
      .vendor-icon--pinterest { background: #e60023; color: white; }
      .vendor-icon--hotjar { background: #fd3a5c; color: white; }
      .vendor-icon--unknown { background: var(--tdt-bg-secondary); color: var(--tdt-text-muted); }
    `
  ];

  static KNOWN_APPS = {
    'klaviyo': { name: 'Klaviyo', icon: 'K', patterns: ['klaviyo', 'klviyo'] },
    'judgeme': { name: 'Judge.me', icon: 'J', patterns: ['judge.me', 'judgeme'] },
    'recharge': { name: 'ReCharge', icon: 'R', patterns: ['recharge', 'rechargepayments'] },
    'privy': { name: 'Privy', icon: 'P', patterns: ['privy'] },
    'omnisend': { name: 'Omnisend', icon: 'O', patterns: ['omnisend'] },
    'yotpo': { name: 'Yotpo', icon: 'Y', patterns: ['yotpo'] },
    'loox': { name: 'Loox', icon: 'L', patterns: ['loox'] },
    'stamped': { name: 'Stamped', icon: 'S', patterns: ['stamped'] },
    'smile': { name: 'Smile.io', icon: 'S', patterns: ['smile.io', 'smileio'] },
    'gorgias': { name: 'Gorgias', icon: 'G', patterns: ['gorgias'] },
    'zendesk': { name: 'Zendesk', icon: 'Z', patterns: ['zendesk', 'zopim'] },
    'tidio': { name: 'Tidio', icon: 'T', patterns: ['tidio'] },
    'intercom': { name: 'Intercom', icon: 'I', patterns: ['intercom'] },
    'hotjar': { name: 'Hotjar', icon: 'H', patterns: ['hotjar'] },
    'facebook': { name: 'Meta Pixel', icon: 'M', patterns: ['facebook', 'fbevents', 'connect.facebook'] },
    'google': { name: 'Google', icon: 'G', patterns: ['googletagmanager', 'google-analytics', 'gtag', 'gtm.js'] },
    'tiktok': { name: 'TikTok', icon: 'T', patterns: ['tiktok', 'analytics.tiktok'] },
    'pinterest': { name: 'Pinterest', icon: 'P', patterns: ['pintrk', 'pinterest'] },
    'snapchat': { name: 'Snapchat', icon: 'S', patterns: ['snapchat', 'sc-static'] },
    'shopify': { name: 'Shopify', icon: 'S', patterns: ['shopify', 'cdn.shopify', 'monorail-edge'] },
    'afterpay': { name: 'Afterpay', icon: 'A', patterns: ['afterpay', 'portal.afterpay'] },
    'klarna': { name: 'Klarna', icon: 'K', patterns: ['klarna'] },
    'affirm': { name: 'Affirm', icon: 'A', patterns: ['affirm'] },
    'sezzle': { name: 'Sezzle', icon: 'S', patterns: ['sezzle'] },
    'bold': { name: 'Bold', icon: 'B', patterns: ['boldapps', 'boldcommerce'] },
    'pagefly': { name: 'PageFly', icon: 'P', patterns: ['pagefly'] },
    'shogun': { name: 'Shogun', icon: 'S', patterns: ['getshogun', 'shogun'] },
  };

  constructor() {
    super();
    this.appBlocks = [];
    this.scripts = [];
    this.appEmbeds = [];
    this.pixelScripts = [];
    this.activeTab = 'all';
    this.searchTerm = '';
    this._expandedItems = new Set();
  }

  connectedCallback() {
    super.connectedCallback();
    this._scanPage();
  }

  _scanPage() {
    this._scanAppBlocks();
    this._scanScripts();
    this._scanAppEmbeds();
    this._categorizeScripts();
  }

  _scanAppBlocks() {
    const blocks = [];

    const appBlockElements = document.querySelectorAll('[data-shopify-editor-block], [data-block-type*="shopify://apps"], .shopify-app-block');
    
    appBlockElements.forEach((el, index) => {
      const blockType = el.getAttribute('data-block-type') || '';
      const blockId = el.getAttribute('data-block-id') || el.id || `block-${index}`;
      const sectionId = el.closest('[data-section-id]')?.getAttribute('data-section-id') || 'unknown';
      
      let appName = 'Unknown App';
      const appMatch = blockType.match(/shopify:\/\/apps\/([^/]+)/);
      if (appMatch) {
        appName = appMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      blocks.push({
        id: blockId,
        type: 'app-block',
        name: appName,
        blockType,
        sectionId,
        element: el,
        tagName: el.tagName.toLowerCase(),
        classes: Array.from(el.classList).slice(0, 5).join(', '),
      });
    });

    const themeAppBlocks = document.querySelectorAll('[id*="shopify-block"], [class*="shopify-app"]');
    themeAppBlocks.forEach((el, index) => {
      const existingBlock = blocks.find(b => b.element === el);
      if (!existingBlock) {
        blocks.push({
          id: el.id || `theme-block-${index}`,
          type: 'theme-block',
          name: 'Theme App Block',
          element: el,
          tagName: el.tagName.toLowerCase(),
          classes: Array.from(el.classList).slice(0, 5).join(', '),
        });
      }
    });

    this.appBlocks = blocks;
  }

  _scanScripts() {
    const scripts = [];
    const allScripts = document.querySelectorAll('script');

    allScripts.forEach((script, index) => {
      const src = script.src || '';
      const type = script.type || 'text/javascript';
      const isAsync = script.async;
      const isDefer = script.defer;
      const isInline = !src;
      const content = isInline ? script.textContent?.substring(0, 500) : '';

      if (isInline && !content?.trim()) return;

      const vendor = this._identifyVendor(src || content);
      const isPixel = this._isPixelScript(src, content);
      const isShopifyCore = this._isShopifyCoreScript(src);

      if (isShopifyCore && !isPixel) return;

      scripts.push({
        id: `script-${index}`,
        src,
        type,
        isAsync,
        isDefer,
        isInline,
        content,
        vendor,
        isPixel,
        element: script,
        size: isInline ? new Blob([content]).size : null,
      });
    });

    this.scripts = scripts;
  }

  _scanAppEmbeds() {
    const embeds = [];

    const embedElements = document.querySelectorAll('[data-app-embed], [data-shopify-app-embed], .shopify-app-embed');
    
    embedElements.forEach((el, index) => {
      const appId = el.getAttribute('data-app-embed') || el.getAttribute('data-shopify-app-embed') || '';
      
      embeds.push({
        id: `embed-${index}`,
        type: 'embed',
        appId,
        element: el,
        tagName: el.tagName.toLowerCase(),
        position: this._getPosition(el),
      });
    });

    const floatingWidgets = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    floatingWidgets.forEach((el, index) => {
      if (el.closest('theme-devtools')) return;
      
      const vendor = this._identifyVendorFromElement(el);
      if (vendor) {
        const existingEmbed = embeds.find(e => e.element === el);
        if (!existingEmbed) {
          embeds.push({
            id: `widget-${index}`,
            type: 'widget',
            name: vendor.name,
            vendor: vendor.key,
            element: el,
            tagName: el.tagName.toLowerCase(),
            position: this._getPosition(el),
          });
        }
      }
    });

    this.appEmbeds = embeds;
  }

  _categorizeScripts() {
    this.pixelScripts = this.scripts.filter(s => s.isPixel);
  }

  _identifyVendor(source) {
    const lowerSource = source.toLowerCase();
    
    for (const [key, vendor] of Object.entries(AppsPanel.KNOWN_APPS)) {
      if (vendor.patterns.some(pattern => lowerSource.includes(pattern))) {
        return { key, ...vendor };
      }
    }
    
    return null;
  }

  _identifyVendorFromElement(el) {
    const classNames = el.className?.toLowerCase() || '';
    const id = el.id?.toLowerCase() || '';
    const innerHTML = el.innerHTML?.substring(0, 1000).toLowerCase() || '';
    
    for (const [key, vendor] of Object.entries(AppsPanel.KNOWN_APPS)) {
      if (vendor.patterns.some(pattern => 
        classNames.includes(pattern) || 
        id.includes(pattern) || 
        innerHTML.includes(pattern)
      )) {
        return { key, ...vendor };
      }
    }
    
    return null;
  }

  _isPixelScript(src, content) {
    const pixelPatterns = [
      'fbevents', 'facebook', 'pixel',
      'gtag', 'gtm.js', 'googletagmanager', 'google-analytics',
      'analytics.tiktok', 'tiktok',
      'pintrk', 'pinterest',
      'snapchat', 'sc-static',
      'monorail', 'trekkie',
    ];
    
    const source = (src + content).toLowerCase();
    return pixelPatterns.some(pattern => source.includes(pattern));
  }

  _isShopifyCoreScript(src) {
    const corePatterns = [
      'cdn.shopify.com/shopifycloud',
      'cdn.shopify.com/s/files',
      '/assets/',
    ];
    
    return corePatterns.some(pattern => src.includes(pattern));
  }

  _getPosition(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    
    return {
      top: style.top,
      right: style.right,
      bottom: style.bottom,
      left: style.left,
      position: style.position,
    };
  }

  _toggleExpand(id) {
    if (this._expandedItems.has(id)) {
      this._expandedItems.delete(id);
    } else {
      this._expandedItems.add(id);
    }
    this.requestUpdate();
  }

  _highlightElement(el) {
    if (!el) return;
    
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const originalOutline = el.style.outline;
    const originalTransition = el.style.transition;
    
    el.style.transition = 'outline 0.2s ease';
    el.style.outline = '3px solid #3b82f6';
    
    setTimeout(() => {
      el.style.outline = originalOutline;
      el.style.transition = originalTransition;
    }, 2000);
  }

  _copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this._showFeedback('Copied!');
    });
  }

  _showFeedback(message) {
    const event = new CustomEvent('show-feedback', { 
      detail: { message }, 
      bubbles: true, 
      composed: true 
    });
    this.dispatchEvent(event);
  }

  _setActiveTab(tab) {
    this.activeTab = tab;
  }

  _handleSearch(e) {
    this.searchTerm = e.target.value;
  }

  _getFilteredItems() {
    const search = this.searchTerm.toLowerCase();
    
    let items = [];
    
    if (this.activeTab === 'all' || this.activeTab === 'blocks') {
      items = [...items, ...this.appBlocks.map(b => ({ ...b, category: 'block' }))];
    }
    
    if (this.activeTab === 'all' || this.activeTab === 'scripts') {
      items = [...items, ...this.scripts.filter(s => !s.isPixel).map(s => ({ ...s, category: 'script' }))];
    }
    
    if (this.activeTab === 'all' || this.activeTab === 'pixels') {
      items = [...items, ...this.pixelScripts.map(s => ({ ...s, category: 'pixel' }))];
    }
    
    if (this.activeTab === 'all' || this.activeTab === 'embeds') {
      items = [...items, ...this.appEmbeds.map(e => ({ ...e, category: 'embed' }))];
    }
    
    if (search) {
      items = items.filter(item => {
        const name = item.name || item.vendor?.name || '';
        const src = item.src || '';
        return name.toLowerCase().includes(search) || src.toLowerCase().includes(search);
      });
    }
    
    return items;
  }

  _getVendorIcon(vendor) {
    if (!vendor) return html`<span class="vendor-icon vendor-icon--unknown">?</span>`;
    return html`<span class="vendor-icon vendor-icon--${vendor.key}">${vendor.icon}</span>`;
  }

  _renderItem(item) {
    const isExpanded = this._expandedItems.has(item.id);
    const vendor = item.vendor;
    const name = item.name || vendor?.name || this._extractNameFromSrc(item.src) || 'Unknown';
    
    return html`
      <div class="item item--${item.category === 'pixel' ? 'warning' : item.category === 'embed' ? 'success' : 'info'}">
        <div class="item__header" @click=${() => this._toggleExpand(item.id)}>
          <div class="item__main">
            ${vendor ? this._getVendorIcon(vendor) : html`<span class="item__icon">${this._getCategoryIcon(item.category)}</span>`}
            <div class="item__info">
              <div class="item__name">${name}</div>
              <div class="item__meta">
                ${item.src ? this._truncateSrc(item.src) : item.tagName || item.type}
              </div>
            </div>
          </div>
          <div class="item__badges">
            ${this._renderBadges(item)}
          </div>
          <div class="item__actions">
            ${item.element ? html`
              <button class="item__btn" @click=${(e) => { e.stopPropagation(); this._highlightElement(item.element); }} title="Highlight">👁️</button>
            ` : ''}
            ${item.src ? html`
              <button class="item__btn" @click=${(e) => { e.stopPropagation(); this._copyToClipboard(item.src); }} title="Copy URL">📋</button>
            ` : ''}
          </div>
        </div>
        ${isExpanded ? html`
          <div class="item__content">
            ${this._renderItemDetails(item)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBadges(item) {
    const badges = [];
    
    if (item.category === 'block') {
      badges.push(html`<span class="item__badge item__badge--app">Block</span>`);
    } else if (item.category === 'script') {
      badges.push(html`<span class="item__badge item__badge--script">Script</span>`);
    } else if (item.category === 'pixel') {
      badges.push(html`<span class="item__badge item__badge--pixel">Pixel</span>`);
    } else if (item.category === 'embed') {
      badges.push(html`<span class="item__badge item__badge--embed">Embed</span>`);
    }
    
    if (item.isAsync) {
      badges.push(html`<span class="item__badge item__badge--async">Async</span>`);
    }
    if (item.isDefer) {
      badges.push(html`<span class="item__badge item__badge--defer">Defer</span>`);
    }
    if (item.isInline) {
      badges.push(html`<span class="item__badge item__badge--inline">Inline</span>`);
    }
    if (item.src && !item.isInline) {
      badges.push(html`<span class="item__badge item__badge--external">External</span>`);
    }
    
    return badges;
  }

  _renderItemDetails(item) {
    if (item.category === 'block') {
      return html`
        ${item.blockType ? html`
          <div class="item__detail">
            <span class="item__detail-label">Block Type:</span>
            <span class="item__detail-value">${item.blockType}</span>
          </div>
        ` : ''}
        ${item.sectionId ? html`
          <div class="item__detail">
            <span class="item__detail-label">Section:</span>
            <span class="item__detail-value">${item.sectionId}</span>
          </div>
        ` : ''}
        ${item.classes ? html`
          <div class="item__detail">
            <span class="item__detail-label">Classes:</span>
            <span class="item__detail-value">${item.classes}</span>
          </div>
        ` : ''}
        <button class="highlight-btn" @click=${() => this._highlightElement(item.element)}>
          Highlight in Page
        </button>
      `;
    }
    
    if (item.category === 'script' || item.category === 'pixel') {
      return html`
        ${item.src ? html`
          <div class="item__detail">
            <span class="item__detail-label">Source:</span>
            <span class="item__detail-value item__detail-value--link" @click=${() => window.open(item.src, '_blank')}>${item.src}</span>
          </div>
        ` : ''}
        ${item.type && item.type !== 'text/javascript' ? html`
          <div class="item__detail">
            <span class="item__detail-label">Type:</span>
            <span class="item__detail-value">${item.type}</span>
          </div>
        ` : ''}
        ${item.size ? html`
          <div class="item__detail">
            <span class="item__detail-label">Size:</span>
            <span class="item__detail-value">${this._formatSize(item.size)}</span>
          </div>
        ` : ''}
        ${item.isInline && item.content ? html`
          <div class="item__code">${item.content}${item.content.length >= 500 ? '...' : ''}</div>
        ` : ''}
      `;
    }
    
    if (item.category === 'embed') {
      return html`
        ${item.appId ? html`
          <div class="item__detail">
            <span class="item__detail-label">App ID:</span>
            <span class="item__detail-value">${item.appId}</span>
          </div>
        ` : ''}
        ${item.position ? html`
          <div class="item__detail">
            <span class="item__detail-label">Position:</span>
            <span class="item__detail-value">${item.position.position} (${item.position.top || 'auto'}, ${item.position.right || 'auto'}, ${item.position.bottom || 'auto'}, ${item.position.left || 'auto'})</span>
          </div>
        ` : ''}
        <button class="highlight-btn" @click=${() => this._highlightElement(item.element)}>
          Highlight in Page
        </button>
      `;
    }
    
    return '';
  }

  _getCategoryIcon(category) {
    switch (category) {
      case 'block': return '🧩';
      case 'script': return '📜';
      case 'pixel': return '📊';
      case 'embed': return '🔌';
      default: return '❓';
    }
  }

  _extractNameFromSrc(src) {
    if (!src) return null;
    
    try {
      const url = new URL(src);
      const hostname = url.hostname;
      
      const parts = hostname.replace('www.', '').split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      }
      return hostname;
    } catch {
      const match = src.match(/\/([^/]+)\.(js|min\.js)(\?|$)/);
      if (match) return match[1];
      return null;
    }
  }

  _truncateSrc(src) {
    if (!src) return '';
    if (src.length <= 60) return src;
    
    try {
      const url = new URL(src);
      return url.hostname + '/...' + src.slice(-20);
    } catch {
      return src.substring(0, 30) + '...' + src.slice(-20);
    }
  }

  _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  _refresh() {
    this._expandedItems.clear();
    this._scanPage();
  }

  render() {
    const filteredItems = this._getFilteredItems();
    const totalScripts = this.scripts.length;
    const totalPixels = this.pixelScripts.length;
    const totalBlocks = this.appBlocks.length;
    const totalEmbeds = this.appEmbeds.length;

    return html`
      <div class="tabs">
        <button 
          class="tab ${this.activeTab === 'all' ? 'tab--active' : ''}"
          @click=${() => this._setActiveTab('all')}
        >
          📦 All <span class="tab__count">${totalScripts + totalBlocks + totalEmbeds}</span>
        </button>
        <button 
          class="tab ${this.activeTab === 'blocks' ? 'tab--active' : ''}"
          @click=${() => this._setActiveTab('blocks')}
        >
          🧩 App Blocks <span class="tab__count">${totalBlocks}</span>
        </button>
        <button 
          class="tab ${this.activeTab === 'scripts' ? 'tab--active' : ''}"
          @click=${() => this._setActiveTab('scripts')}
        >
          📜 Scripts <span class="tab__count">${totalScripts - totalPixels}</span>
        </button>
        <button 
          class="tab ${this.activeTab === 'pixels' ? 'tab--active' : ''}"
          @click=${() => this._setActiveTab('pixels')}
        >
          📊 Pixels <span class="tab__count">${totalPixels}</span>
        </button>
        <button 
          class="tab ${this.activeTab === 'embeds' ? 'tab--active' : ''}"
          @click=${() => this._setActiveTab('embeds')}
        >
          🔌 Embeds <span class="tab__count">${totalEmbeds}</span>
        </button>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <span class="stat__icon">📜</span>
          <span class="stat__value">${totalScripts}</span>
          <span>scripts</span>
        </div>
        <div class="stat">
          <span class="stat__icon">📊</span>
          <span class="stat__value">${totalPixels}</span>
          <span>pixels</span>
        </div>
        <div class="stat">
          <span class="stat__icon">🧩</span>
          <span class="stat__value">${totalBlocks}</span>
          <span>blocks</span>
        </div>
        <div class="stat">
          <span class="stat__icon">🔌</span>
          <span class="stat__value">${totalEmbeds}</span>
          <span>embeds</span>
        </div>
        <button class="btn btn--sm" @click=${() => this._refresh()}>🔄 Refresh</button>
      </div>

      <div class="search-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search apps, scripts, vendors..."
          .value=${this.searchTerm}
          @input=${this._handleSearch}
        />
      </div>

      ${filteredItems.length === 0 ? html`
        <div class="empty-state">
          <div class="empty-state__icon">🔌</div>
          <div>No ${this.activeTab === 'all' ? 'items' : this.activeTab} found</div>
        </div>
      ` : html`
        <div class="item-list">
          ${filteredItems.map(item => this._renderItem(item))}
        </div>
      `}
    `;
  }
}

customElements.define('tdt-apps-panel', AppsPanel);

