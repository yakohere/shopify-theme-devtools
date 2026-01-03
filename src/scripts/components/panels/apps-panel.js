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
        font-size: calc(11px * var(--tdt-scale, 1));
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
        font-size: calc(9px * var(--tdt-scale, 1));
        opacity: 0.8;
        background: color-mix(in srgb, var(--tdt-text) 15%, transparent);
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
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .stat__value {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .stat__icon {
        font-size: calc(12px * var(--tdt-scale, 1));
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
        font-size: calc(11px * var(--tdt-scale, 1));
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
        font-size: calc(10px * var(--tdt-scale, 1));
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
        font-size: calc(14px * var(--tdt-scale, 1));
        flex-shrink: 0;
      }

      .item__info {
        flex: 1;
        min-width: 0;
      }

      .item__name {
        font-weight: 600;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item__meta {
        font-size: calc(9px * var(--tdt-scale, 1));
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
        font-size: calc(8px * var(--tdt-scale, 1));
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
        font-size: calc(12px * var(--tdt-scale, 1));
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
        font-size: calc(10px * var(--tdt-scale, 1));
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
        font-size: calc(9px * var(--tdt-scale, 1));
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
        font-size: calc(32px * var(--tdt-scale, 1));
        margin-bottom: 8px;
        opacity: 0.5;
      }

      .highlight-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 6px;
        color: var(--tdt-text-muted);
        font-size: calc(9px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .highlight-btn:hover {
        background: var(--tdt-bg-hover);
        border-color: var(--tdt-accent);
        color: var(--tdt-accent);
      }

      .btn-export {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .btn-export:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .item__badge--version {
        background: rgba(168, 85, 247, 0.2);
        color: #a855f7;
      }

      .vendor-icon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(10px * var(--tdt-scale, 1));
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
    // Reviews & UGC
    'klaviyo': { name: 'Klaviyo', icon: 'K', patterns: ['klaviyo', 'klviyo'] },
    'judgeme': { name: 'Judge.me', icon: 'J', patterns: ['judge.me', 'judgeme'] },
    'yotpo': { name: 'Yotpo', icon: 'Y', patterns: ['yotpo'] },
    'loox': { name: 'Loox', icon: 'L', patterns: ['loox'] },
    'stamped': { name: 'Stamped', icon: 'S', patterns: ['stamped'] },
    'okendo': { name: 'Okendo', icon: 'O', patterns: ['okendo'] },
    'reviews-io': { name: 'Reviews.io', icon: 'R', patterns: ['reviews.io', 'reviewsio'] },
    'trustpilot': { name: 'Trustpilot', icon: 'T', patterns: ['trustpilot'] },
    'bazaarvoice': { name: 'Bazaarvoice', icon: 'B', patterns: ['bazaarvoice', 'bvapi'] },

    // Subscriptions & Payments
    'recharge': { name: 'ReCharge', icon: 'R', patterns: ['recharge', 'rechargepayments'] },
    'bold': { name: 'Bold', icon: 'B', patterns: ['boldapps', 'boldcommerce'] },
    'afterpay': { name: 'Afterpay', icon: 'A', patterns: ['afterpay', 'portal.afterpay'] },
    'klarna': { name: 'Klarna', icon: 'K', patterns: ['klarna'] },
    'affirm': { name: 'Affirm', icon: 'A', patterns: ['affirm'] },
    'sezzle': { name: 'Sezzle', icon: 'S', patterns: ['sezzle'] },
    'clearpay': { name: 'Clearpay', icon: 'C', patterns: ['clearpay'] },
    'zip': { name: 'Zip', icon: 'Z', patterns: ['quadpay', 'zip.co'] },
    'paypal': { name: 'PayPal', icon: 'P', patterns: ['paypal', 'paypalobjects'] },
    'stripe': { name: 'Stripe', icon: 'S', patterns: ['stripe.com', 'js.stripe'] },

    // Email & Marketing
    'privy': { name: 'Privy', icon: 'P', patterns: ['privy'] },
    'omnisend': { name: 'Omnisend', icon: 'O', patterns: ['omnisend'] },
    'mailchimp': { name: 'Mailchimp', icon: 'M', patterns: ['mailchimp', 'chimpstatic'] },
    'drip': { name: 'Drip', icon: 'D', patterns: ['getdrip', 'drip.com'] },
    'attentive': { name: 'Attentive', icon: 'A', patterns: ['attentive', 'attn.tv'] },
    'postscript': { name: 'Postscript', icon: 'P', patterns: ['postscript'] },
    'sendlane': { name: 'Sendlane', icon: 'S', patterns: ['sendlane'] },
    'retention': { name: 'Retention.com', icon: 'R', patterns: ['retention.com'] },

    // Loyalty & Rewards
    'smile': { name: 'Smile.io', icon: 'S', patterns: ['smile.io', 'smileio'] },
    'loyaltylion': { name: 'LoyaltyLion', icon: 'L', patterns: ['loyaltylion'] },
    'yotpo-loyalty': { name: 'Yotpo Loyalty', icon: 'Y', patterns: ['yotpo-loyalty', 'swell.is'] },
    'rise-ai': { name: 'Rise.ai', icon: 'R', patterns: ['rise.ai', 'riseai'] },

    // Customer Support
    'gorgias': { name: 'Gorgias', icon: 'G', patterns: ['gorgias'] },
    'zendesk': { name: 'Zendesk', icon: 'Z', patterns: ['zendesk', 'zopim'] },
    'tidio': { name: 'Tidio', icon: 'T', patterns: ['tidio'] },
    'intercom': { name: 'Intercom', icon: 'I', patterns: ['intercom'] },
    'freshdesk': { name: 'Freshdesk', icon: 'F', patterns: ['freshdesk', 'freshchat'] },
    'livechat': { name: 'LiveChat', icon: 'L', patterns: ['livechat', 'livechatinc'] },
    'crisp': { name: 'Crisp', icon: 'C', patterns: ['crisp.chat'] },
    'drift': { name: 'Drift', icon: 'D', patterns: ['drift.com', 'driftt'] },
    'reamaze': { name: 'Reamaze', icon: 'R', patterns: ['reamaze'] },

    // Analytics & Tracking
    'hotjar': { name: 'Hotjar', icon: 'H', patterns: ['hotjar'] },
    'facebook': { name: 'Meta Pixel', icon: 'M', patterns: ['facebook', 'fbevents', 'connect.facebook'] },
    'google': { name: 'Google', icon: 'G', patterns: ['googletagmanager', 'google-analytics', 'gtag', 'gtm.js'] },
    'tiktok': { name: 'TikTok', icon: 'T', patterns: ['tiktok', 'analytics.tiktok'] },
    'pinterest': { name: 'Pinterest', icon: 'P', patterns: ['pintrk', 'pinterest'] },
    'snapchat': { name: 'Snapchat', icon: 'S', patterns: ['snapchat', 'sc-static'] },
    'shopify': { name: 'Shopify', icon: 'S', patterns: ['shopify', 'cdn.shopify', 'monorail-edge'] },
    'segment': { name: 'Segment', icon: 'S', patterns: ['segment.com', 'segment.io'] },
    'heap': { name: 'Heap', icon: 'H', patterns: ['heap-analytics', 'heapanalytics'] },
    'mixpanel': { name: 'Mixpanel', icon: 'M', patterns: ['mixpanel'] },
    'fullstory': { name: 'FullStory', icon: 'F', patterns: ['fullstory'] },
    'lucky-orange': { name: 'Lucky Orange', icon: 'L', patterns: ['luckyorange'] },
    'clarity': { name: 'Microsoft Clarity', icon: 'C', patterns: ['clarity.ms'] },
    'reddit': { name: 'Reddit Pixel', icon: 'R', patterns: ['redditmedia', 'reddit.com/pixel'] },
    'twitter': { name: 'Twitter Pixel', icon: 'T', patterns: ['static.ads-twitter', 'analytics.twitter'] },
    'criteo': { name: 'Criteo', icon: 'C', patterns: ['criteo'] },
    'taboola': { name: 'Taboola', icon: 'T', patterns: ['taboola'] },

    // Page Builders
    'pagefly': { name: 'PageFly', icon: 'P', patterns: ['pagefly'] },
    'shogun': { name: 'Shogun', icon: 'S', patterns: ['getshogun', 'shogun'] },
    'gempage': { name: 'GemPages', icon: 'G', patterns: ['gempages'] },
    'zipify': { name: 'Zipify', icon: 'Z', patterns: ['zipify'] },

    // Upsell & Cross-sell
    'rebuy': { name: 'Rebuy', icon: 'R', patterns: ['rebuyengine', 'rebuy'] },
    'recom-ai': { name: 'Recom.ai', icon: 'R', patterns: ['recom.ai'] },
    'frequently-bought': { name: 'Frequently Bought', icon: 'F', patterns: ['frequently-bought', 'also-bought'] },
    'honeycomb': { name: 'Honeycomb', icon: 'H', patterns: ['honeycomb-upsell'] },
    'candy-rack': { name: 'Candy Rack', icon: 'C', patterns: ['candy-rack', 'candyrack'] },
    'reconvert': { name: 'ReConvert', icon: 'R', patterns: ['reconvert'] },

    // Shipping & Fulfillment
    'shipstation': { name: 'ShipStation', icon: 'S', patterns: ['shipstation'] },
    'shippo': { name: 'Shippo', icon: 'S', patterns: ['goshippo'] },
    'easyship': { name: 'Easyship', icon: 'E', patterns: ['easyship'] },
    'aftership': { name: 'AfterShip', icon: 'A', patterns: ['aftership'] },
    'route': { name: 'Route', icon: 'R', patterns: ['route.com', 'routeapp'] },

    // Popups & Conversion
    'justuno': { name: 'Justuno', icon: 'J', patterns: ['justuno'] },
    'optinmonster': { name: 'OptinMonster', icon: 'O', patterns: ['optinmonster'] },
    'wisepops': { name: 'Wisepops', icon: 'W', patterns: ['wisepops'] },
    'wheelio': { name: 'Wheelio', icon: 'W', patterns: ['wheelio'] },
    'spin-a-sale': { name: 'Spin-a-Sale', icon: 'S', patterns: ['spin-a-sale', 'spinasale'] },

    // Social Proof
    'fomo': { name: 'Fomo', icon: 'F', patterns: ['fomo.com', 'usefomo'] },
    'nudgify': { name: 'Nudgify', icon: 'N', patterns: ['nudgify'] },
    'proof': { name: 'Proof', icon: 'P', patterns: ['useproof'] },
    'fera': { name: 'Fera', icon: 'F', patterns: ['fera.ai'] },

    // Search & Navigation
    'searchspring': { name: 'Searchspring', icon: 'S', patterns: ['searchspring'] },
    'algolia': { name: 'Algolia', icon: 'A', patterns: ['algolia'] },
    'boost-commerce': { name: 'Boost Commerce', icon: 'B', patterns: ['boost-commerce', 'boostcommerce'] },
    'klevu': { name: 'Klevu', icon: 'K', patterns: ['klevu'] },

    // Miscellaneous
    'elfsight': { name: 'Elfsight', icon: 'E', patterns: ['elfsight', 'static.elfsight'] },
    'instafeed': { name: 'Instafeed', icon: 'I', patterns: ['instafeed'] },
    'beeketing': { name: 'Beeketing', icon: 'B', patterns: ['beeketing'] },
    'vitals': { name: 'Vitals', icon: 'V', patterns: ['vitals.co', 'vitalsapp'] },
    'hextom': { name: 'Hextom', icon: 'H', patterns: ['hextom'] },
    'cart-upsell': { name: 'Cart Upsell', icon: 'C', patterns: ['incart-upsell'] },
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
      const version = this._extractVersion(src, content);

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
        version,
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

  _extractVersion(src, content = '') {
    // Common version patterns in URLs
    const urlPatterns = [
      // v1.2.3 or v1.2
      /[?&/]v(\d+\.\d+(?:\.\d+)?)/i,
      // version=1.2.3
      /version[=:](\d+\.\d+(?:\.\d+)?)/i,
      // @1.2.3
      /@(\d+\.\d+(?:\.\d+)?)/,
      // /1.2.3/ in path
      /\/(\d+\.\d+\.\d+)\//,
      // -1.2.3.js or .1.2.3.js
      /[-.](\d+\.\d+\.\d+)\.(?:min\.)?js/i,
      // _v1.2.3
      /_v(\d+\.\d+(?:\.\d+)?)/i,
    ];

    // Try URL patterns first
    for (const pattern of urlPatterns) {
      const match = src.match(pattern);
      if (match) return match[1];
    }

    // Try content patterns for inline scripts
    if (content) {
      const contentPatterns = [
        // version: "1.2.3" or version: '1.2.3'
        /version['":\s]+['"]?(\d+\.\d+(?:\.\d+)?)/i,
        // VERSION = "1.2.3"
        /VERSION\s*[=:]\s*['"](\d+\.\d+(?:\.\d+)?)/i,
        // v1.2.3
        /\bv(\d+\.\d+\.\d+)\b/,
        // Shopify script pattern: shopify-1.2.3
        /shopify-(\d+\.\d+\.\d+)/i,
      ];

      for (const pattern of contentPatterns) {
        const match = content.match(pattern);
        if (match) return match[1];
      }
    }

    return null;
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
      items = items.filter(item => this._matchesSearch(item, search));
    }

    return items;
  }

  _matchesSearch(item, search) {
    // Search in name
    const name = (item.name || item.vendor?.name || '').toLowerCase();
    if (name.includes(search)) return true;

    // Search in URL/src
    const src = (item.src || '').toLowerCase();
    if (src.includes(search)) return true;

    // Search in block type
    const blockType = (item.blockType || '').toLowerCase();
    if (blockType.includes(search)) return true;

    // Search in app ID (for embeds)
    const appId = (item.appId || '').toLowerCase();
    if (appId.includes(search)) return true;

    // Deep search in inline script content
    const content = (item.content || '').toLowerCase();
    if (content.includes(search)) return true;

    // Search in classes
    const classes = (item.classes || '').toLowerCase();
    if (classes.includes(search)) return true;

    // Search in version
    const version = (item.version || '').toLowerCase();
    if (version.includes(search)) return true;

    return false;
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

    // Version badge
    if (item.version) {
      badges.push(html`<span class="item__badge item__badge--version">v${item.version}</span>`);
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
        ${item.version ? html`
          <div class="item__detail">
            <span class="item__detail-label">Version:</span>
            <span class="item__detail-value">${item.version}</span>
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

  _exportApps() {
    const filteredItems = this._getFilteredItems();

    const exportData = {
      exportedAt: new Date().toISOString(),
      url: window.location.href,
      summary: {
        totalScripts: this.scripts.length,
        totalPixels: this.pixelScripts.length,
        totalBlocks: this.appBlocks.length,
        totalEmbeds: this.appEmbeds.length,
      },
      items: filteredItems.map(item => {
        const base = {
          category: item.category,
          name: item.name || item.vendor?.name || this._extractNameFromSrc(item.src) || 'Unknown',
          vendor: item.vendor?.name || null,
        };

        if (item.category === 'block') {
          return {
            ...base,
            blockType: item.blockType,
            sectionId: item.sectionId,
            tagName: item.tagName,
            classes: item.classes,
          };
        }

        if (item.category === 'script' || item.category === 'pixel') {
          return {
            ...base,
            src: item.src || null,
            isInline: item.isInline,
            isAsync: item.isAsync,
            isDefer: item.isDefer,
            version: item.version || null,
            size: item.size,
            type: item.type,
          };
        }

        if (item.category === 'embed') {
          return {
            ...base,
            appId: item.appId,
            type: item.type,
            tagName: item.tagName,
            position: item.position,
          };
        }

        return base;
      }),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apps-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this._showFeedback('Exported!');
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
        <button class="btn-export" @click=${() => this._exportApps()}>📥 Export</button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          class="search-input"
          placeholder="Search apps, scripts, vendors, content..."
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

