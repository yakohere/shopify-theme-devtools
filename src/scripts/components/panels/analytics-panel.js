import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class AnalyticsPanel extends LitElement {
  static properties = {
    events: { type: Array, state: true },
    dataLayerSnapshots: { type: Array, state: true },
    filter: { type: String, state: true },
    activeFilter: { type: String, state: true },
    expandedEvents: { type: Set, state: true },
    isPaused: { type: Boolean, state: true },
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
        flex-wrap: wrap;
      }

      .search {
        flex: 1;
        min-width: 150px;
      }

      .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .filter-tab {
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

      .filter-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .filter-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .filter-tab--conversion {
        border-color: var(--tdt-success);
      }

      .filter-tab--conversion.filter-tab--active {
        background: var(--tdt-success);
      }

      .filter-tab__count {
        font-size: 10px;
        opacity: 0.8;
        background: rgba(255,255,255,0.15);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .toggle-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-size: 11px;
        cursor: pointer;
      }

      .toggle-btn:hover {
        background: var(--tdt-bg-hover);
      }

      .toggle-btn--active {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .btn-clear {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
      }

      .btn-clear:hover {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .stats {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        font-size: 11px;
        flex-wrap: wrap;
      }

      .stat {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        color: var(--tdt-text-muted);
        font-size: 9px;
        text-transform: uppercase;
      }

      .stat-value {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .stat-value--success {
        color: var(--tdt-success);
      }

      .detected-providers {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .provider-badge {
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 8px;
        font-size: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .provider-badge--active {
        border-color: var(--tdt-success);
        background: rgba(34, 197, 94, 0.1);
      }

      .event-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .event-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .event-item--conversion {
        border-left: 3px solid var(--tdt-success);
        background: rgba(34, 197, 94, 0.05);
      }

      .event-item--ga4 {
        border-left: 3px solid #4285f4;
      }

      .event-item--fbpixel {
        border-left: 3px solid #1877f2;
      }

      .event-item--shopify {
        border-left: 3px solid #96bf48;
      }

      .event-item--datalayer {
        border-left: 3px solid #f9ab00;
      }

      .event-item--custom {
        border-left: 3px solid var(--tdt-accent);
      }

      .event-header {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        cursor: pointer;
        gap: 8px;
      }

      .event-header:hover {
        background: var(--tdt-bg-hover);
      }

      .event-provider {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .event-provider--ga4 {
        background: rgba(66, 133, 244, 0.2);
        color: #4285f4;
      }

      .event-provider--fbpixel {
        background: rgba(24, 119, 242, 0.2);
        color: #1877f2;
      }

      .event-provider--shopify {
        background: rgba(150, 191, 72, 0.2);
        color: #96bf48;
      }

      .event-provider--datalayer {
        background: rgba(249, 171, 0, 0.2);
        color: #f9ab00;
      }

      .event-provider--custom {
        background: rgba(147, 130, 255, 0.2);
        color: var(--tdt-accent);
      }

      .event-name {
        font-weight: 600;
        font-size: 12px;
        color: var(--tdt-text);
        flex: 1;
      }

      .event-name--conversion {
        color: var(--tdt-success);
      }

      .event-badge {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-success);
        color: white;
        font-weight: 600;
      }

      .event-time {
        font-size: 10px;
        color: var(--tdt-text-muted);
        flex-shrink: 0;
      }

      .event-content {
        border-top: 1px solid var(--tdt-border);
        padding: 10px;
        background: var(--tdt-bg);
      }

      .event-summary {
        font-size: 11px;
        color: var(--tdt-text-muted);
        margin-bottom: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .event-summary__item {
        display: flex;
        gap: 4px;
      }

      .event-summary__label {
        color: var(--tdt-text-muted);
      }

      .event-summary__value {
        color: var(--tdt-text);
        font-weight: 500;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state__icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 16px 0 8px;
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

      .btn-export {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
      }

      .btn-export:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn-copy {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 3px 8px;
        font-size: 10px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .event-header:hover .btn-copy {
        opacity: 1;
      }

      .btn-copy:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn-copy--copied {
        background: var(--tdt-success) !important;
        border-color: var(--tdt-success) !important;
        color: white !important;
        opacity: 1 !important;
      }

      .event-count {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-accent);
        color: white;
        font-weight: 600;
        flex-shrink: 0;
      }

      .event-item--ga {
        border-left: 3px solid #e37400;
      }

      .event-item--tiktok {
        border-left: 3px solid #000000;
      }

      .event-item--pinterest {
        border-left: 3px solid #e60023;
      }

      .event-item--snapchat {
        border-left: 3px solid #fffc00;
      }

      .event-item--klaviyo {
        border-left: 3px solid #2d2d2d;
      }

      .event-item--webpixel {
        border-left: 3px solid #5c6ac4;
      }

      .event-provider--ga {
        background: rgba(227, 116, 0, 0.2);
        color: #e37400;
      }

      .event-provider--tiktok {
        background: rgba(0, 0, 0, 0.2);
        color: #000000;
      }

      .event-provider--pinterest {
        background: rgba(230, 0, 35, 0.2);
        color: #e60023;
      }

      .event-provider--snapchat {
        background: rgba(255, 252, 0, 0.2);
        color: #b3b000;
      }

      .event-provider--klaviyo {
        background: rgba(45, 45, 45, 0.2);
        color: #2d2d2d;
      }

      .event-provider--webpixel {
        background: rgba(92, 106, 196, 0.2);
        color: #5c6ac4;
      }
    `
  ];

  static CONVERSION_EVENTS = [
    'purchase', 'add_to_cart', 'begin_checkout', 'add_payment_info',
    'add_shipping_info', 'view_item', 'view_item_list', 'select_item',
    'remove_from_cart', 'view_cart', 'sign_up', 'login', 'search',
    'Purchase', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo',
    'ViewContent', 'Lead', 'CompleteRegistration', 'Subscribe'
  ];

  static PROVIDERS = {
    ga4: { name: 'GA4', icon: '📊', color: '#4285f4' },
    ga: { name: 'GA Universal', icon: '📈', color: '#e37400' },
    fbpixel: { name: 'FB Pixel', icon: '📘', color: '#1877f2' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
    pinterest: { name: 'Pinterest', icon: '📌', color: '#e60023' },
    snapchat: { name: 'Snapchat', icon: '👻', color: '#fffc00' },
    klaviyo: { name: 'Klaviyo', icon: '📧', color: '#2d2d2d' },
    shopify: { name: 'Shopify', icon: '🛍️', color: '#96bf48' },
    webpixel: { name: 'Web Pixel', icon: '🔷', color: '#5c6ac4' },
    datalayer: { name: 'DataLayer', icon: '📦', color: '#f9ab00' },
    custom: { name: 'Custom', icon: '⚡', color: '#9382ff' },
  };

  static STORAGE_KEY = 'tdt-analytics-events';

  constructor() {
    super();
    this.events = [];
    this.dataLayerSnapshots = [];
    this.filter = '';
    this.activeFilter = 'all';
    this.expandedEvents = new Set();
    this.isPaused = false;
    this._detectedProviders = new Set();
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadPersistedEvents();
    this._detectProviders();
    this._interceptDataLayer();
    this._interceptGtag();
    this._interceptGaUniversal();
    this._interceptFbPixel();
    this._interceptTikTok();
    this._interceptPinterest();
    this._interceptSnapchat();
    this._interceptKlaviyo();
    this._interceptShopifyAnalytics();
    this._interceptWebPixels();
    this._interceptCustomEvents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._restoreInterceptors();
  }

  _loadPersistedEvents() {
    try {
      const stored = sessionStorage.getItem(AnalyticsPanel.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.events = parsed.map(e => ({
          ...e,
          timestamp: new Date(e.timestamp),
          isLive: false
        }));
      }
    } catch (err) {
      console.warn('[TDT] Failed to load persisted events:', err);
    }
  }

  _persistEvents() {
    try {
      const toStore = this.events.slice(-500).map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString()
      }));
      sessionStorage.setItem(AnalyticsPanel.STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('[TDT] Failed to persist events:', err);
    }
  }

  _detectProviders() {
    if (window.dataLayer) this._detectedProviders.add('datalayer');
    if (window.gtag) this._detectedProviders.add('ga4');
    if (window.ga) this._detectedProviders.add('ga');
    if (window.fbq) this._detectedProviders.add('fbpixel');
    if (window.ttq) this._detectedProviders.add('tiktok');
    if (window.pintrk) this._detectedProviders.add('pinterest');
    if (window.snaptr) this._detectedProviders.add('snapchat');
    if (window._learnq) this._detectedProviders.add('klaviyo');
    if (window.Shopify?.analytics) this._detectedProviders.add('shopify');
  }

  _interceptDataLayer() {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    const self = this;

    window.dataLayer.push = function(...args) {
      args.forEach(data => {
        if (!self.isPaused && data && typeof data === 'object') {
          self._addEvent('datalayer', data.event || 'push', data);
        }
      });
      return originalPush(...args);
    };

    this._originalDataLayerPush = originalPush;

    window.dataLayer.forEach(data => {
      if (data && typeof data === 'object') {
        this._addEvent('datalayer', data.event || 'push', data, false);
      }
    });
  }

  _interceptGtag() {
    if (!window.gtag) return;

    const originalGtag = window.gtag;
    const self = this;

    window.gtag = function(command, ...args) {
      if (!self.isPaused) {
        if (command === 'event') {
          const [eventName, params] = args;
          self._addEvent('ga4', eventName, params || {});
          self._detectedProviders.add('ga4');
        } else if (command === 'config') {
          self._addEvent('ga4', 'config', { measurementId: args[0], ...args[1] });
        }
      }
      return originalGtag.call(this, command, ...args);
    };

    this._originalGtag = originalGtag;
  }

  _interceptGaUniversal() {
    if (!window.ga) return;

    const originalGa = window.ga;
    const self = this;

    window.ga = function(command, ...args) {
      if (!self.isPaused) {
        if (command === 'send') {
          const [hitType, ...rest] = args;
          if (hitType === 'event') {
            const [category, action, label, value] = rest;
            self._addEvent('ga', action || 'event', { category, action, label, value });
          } else if (hitType === 'pageview') {
            self._addEvent('ga', 'pageview', { page: rest[0] });
          }
          self._detectedProviders.add('ga');
        } else if (typeof command === 'function') {
          // GA ready callback
        } else if (command === 'create') {
          self._addEvent('ga', 'create', { trackingId: args[0], ...args[1] });
        }
      }
      return originalGa.call(this, command, ...args);
    };

    this._originalGa = originalGa;
  }

  _interceptFbPixel() {
    if (!window.fbq) return;

    const originalFbq = window.fbq;
    const self = this;

    window.fbq = function(command, ...args) {
      if (!self.isPaused) {
        if (command === 'track' || command === 'trackCustom') {
          const [eventName, params] = args;
          self._addEvent('fbpixel', eventName, params || {});
          self._detectedProviders.add('fbpixel');
        } else if (command === 'init') {
          self._addEvent('fbpixel', 'init', { pixelId: args[0] });
        }
      }
      return originalFbq.call(this, command, ...args);
    };

    this._originalFbq = originalFbq;
  }

  _interceptTikTok() {
    if (!window.ttq) return;

    const originalTtq = window.ttq;
    const self = this;

    // TikTok uses ttq.track() and ttq.page()
    if (originalTtq.track) {
      const originalTrack = originalTtq.track.bind(originalTtq);
      originalTtq.track = function(eventName, params) {
        if (!self.isPaused) {
          self._addEvent('tiktok', eventName, params || {});
          self._detectedProviders.add('tiktok');
        }
        return originalTrack(eventName, params);
      };
      this._originalTtqTrack = originalTrack;
    }

    if (originalTtq.page) {
      const originalPage = originalTtq.page.bind(originalTtq);
      originalTtq.page = function() {
        if (!self.isPaused) {
          self._addEvent('tiktok', 'PageView', {});
          self._detectedProviders.add('tiktok');
        }
        return originalPage();
      };
      this._originalTtqPage = originalPage;
    }
  }

  _interceptPinterest() {
    if (!window.pintrk) return;

    const originalPintrk = window.pintrk;
    const self = this;

    window.pintrk = function(command, ...args) {
      if (!self.isPaused) {
        if (command === 'track') {
          const [eventName, params] = args;
          self._addEvent('pinterest', eventName, params || {});
          self._detectedProviders.add('pinterest');
        } else if (command === 'load') {
          self._addEvent('pinterest', 'load', { tagId: args[0] });
        }
      }
      return originalPintrk.call(this, command, ...args);
    };

    this._originalPintrk = originalPintrk;
  }

  _interceptSnapchat() {
    if (!window.snaptr) return;

    const originalSnaptr = window.snaptr;
    const self = this;

    window.snaptr = function(command, ...args) {
      if (!self.isPaused) {
        if (command === 'track') {
          const [eventName, params] = args;
          self._addEvent('snapchat', eventName, params || {});
          self._detectedProviders.add('snapchat');
        } else if (command === 'init') {
          self._addEvent('snapchat', 'init', { pixelId: args[0] });
        }
      }
      return originalSnaptr.call(this, command, ...args);
    };

    this._originalSnaptr = originalSnaptr;
  }

  _interceptKlaviyo() {
    if (!window._learnq) return;

    const originalLearnq = window._learnq;
    const self = this;

    // Klaviyo uses _learnq.push(['track', 'Event Name', {...}])
    if (Array.isArray(originalLearnq)) {
      const originalPush = originalLearnq.push.bind(originalLearnq);
      originalLearnq.push = function(item) {
        if (!self.isPaused && Array.isArray(item)) {
          const [command, ...args] = item;
          if (command === 'track') {
            const [eventName, params] = args;
            self._addEvent('klaviyo', eventName, params || {});
            self._detectedProviders.add('klaviyo');
          } else if (command === 'identify') {
            self._addEvent('klaviyo', 'identify', args[0] || {});
          }
        }
        return originalPush(item);
      };
      this._originalLearnqPush = originalPush;
    }
  }

  _interceptShopifyAnalytics() {
    if (!window.Shopify?.analytics) return;

    const analytics = window.Shopify.analytics;
    const self = this;

    if (analytics.publish) {
      const originalPublish = analytics.publish.bind(analytics);
      analytics.publish = function(eventName, data) {
        if (!self.isPaused) {
          self._addEvent('shopify', eventName, data || {});
          self._detectedProviders.add('shopify');
        }
        return originalPublish(eventName, data);
      };
      this._originalShopifyPublish = originalPublish;
    }
  }

  _interceptWebPixels() {
    // Shopify Web Pixels API uses analytics.subscribe
    if (!window.Shopify?.analytics?.subscribe) return;

    const analytics = window.Shopify.analytics;
    const self = this;
    const originalSubscribe = analytics.subscribe.bind(analytics);

    analytics.subscribe = function(eventName, callback) {
      // Wrap the callback to capture events
      const wrappedCallback = (event) => {
        if (!self.isPaused) {
          self._addEvent('webpixel', eventName, event || {});
          self._detectedProviders.add('webpixel');
        }
        return callback(event);
      };
      return originalSubscribe(eventName, wrappedCallback);
    };

    this._originalWebPixelSubscribe = originalSubscribe;
  }

  _interceptCustomEvents() {
    const self = this;

    this._customEventHandler = (e) => {
      if (!self.isPaused && e.detail) {
        self._addEvent('custom', e.type, e.detail);
      }
    };

    ['analytics', 'tracking', 'gtm', 'conversion'].forEach(eventType => {
      document.addEventListener(eventType, this._customEventHandler);
    });
  }

  _restoreInterceptors() {
    if (this._originalDataLayerPush && window.dataLayer) {
      window.dataLayer.push = this._originalDataLayerPush;
    }
    if (this._originalGtag) {
      window.gtag = this._originalGtag;
    }
    if (this._originalFbq) {
      window.fbq = this._originalFbq;
    }

    ['analytics', 'tracking', 'gtm', 'conversion'].forEach(eventType => {
      document.removeEventListener(eventType, this._customEventHandler);
    });
  }

  _getEventKey(provider, eventName, data) {
    // Create a stable key for deduplication
    const dataKey = JSON.stringify(data, Object.keys(data || {}).sort());
    return `${provider}:${eventName}:${dataKey}`;
  }

  _addEvent(provider, eventName, data, isLive = true) {
    const isConversion = AnalyticsPanel.CONVERSION_EVENTS.some(
      ce => eventName.toLowerCase().includes(ce.toLowerCase())
    );

    const eventKey = this._getEventKey(provider, eventName, data);

    // Check for duplicate within last 500ms (same event, same data)
    const recentDuplicate = this.events.find(e => {
      const timeDiff = Date.now() - e.timestamp.getTime();
      return timeDiff < 500 && this._getEventKey(e.provider, e.eventName, e.data) === eventKey;
    });

    if (recentDuplicate) {
      // Increment count instead of adding new event
      recentDuplicate.count = (recentDuplicate.count || 1) + 1;
      this.events = [...this.events]; // Trigger re-render
      this._persistEvents();
      return;
    }

    const event = {
      id: Date.now() + Math.random(),
      provider,
      eventName,
      data,
      timestamp: new Date(),
      isConversion,
      isLive,
      count: 1
    };

    if (isLive) {
      this.events = [...this.events, event];
    } else {
      this.events = [event, ...this.events];
    }

    if (isLive) {
      this._persistEvents();
    }
  }

  _togglePause() {
    this.isPaused = !this.isPaused;
  }

  _clearEvents() {
    this.events = [];
    sessionStorage.removeItem(AnalyticsPanel.STORAGE_KEY);
  }

  _exportEvents() {
    const filtered = this._getFilteredEvents();
    const exportData = filtered.map(e => ({
      provider: e.provider,
      eventName: e.eventName,
      data: e.data,
      timestamp: e.timestamp.toISOString(),
      isConversion: e.isConversion,
      count: e.count || 1
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-events-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _copyEvent(event, e) {
    e.stopPropagation();
    const eventData = {
      provider: event.provider,
      eventName: event.eventName,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
      isConversion: event.isConversion
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(eventData, null, 2));
      const btn = e.target;
      btn.classList.add('btn-copy--copied');
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('btn-copy--copied');
        btn.textContent = 'Copy';
      }, 1500);
    } catch (err) {
      console.error('[TDT] Failed to copy event:', err);
    }
  }

  _filterEvents(e) {
    this.filter = e.target.value;
  }

  _setFilter(filter) {
    this.activeFilter = filter;
  }

  _toggleExpand(eventId) {
    const newExpanded = new Set(this.expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    this.expandedEvents = newExpanded;
  }

  _getFilteredEvents() {
    let filtered = this.events;

    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'conversion') {
        filtered = filtered.filter(e => e.isConversion);
      } else {
        filtered = filtered.filter(e => e.provider === this.activeFilter);
      }
    }

    if (this.filter) {
      const lower = this.filter.toLowerCase();
      filtered = filtered.filter(e =>
        e.eventName.toLowerCase().includes(lower) ||
        JSON.stringify(e.data).toLowerCase().includes(lower)
      );
    }

    return filtered;
  }

  _getCounts() {
    const counts = {
      all: this.events.length,
      conversion: this.events.filter(e => e.isConversion).length,
    };

    // Count per provider
    const providers = Object.keys(AnalyticsPanel.PROVIDERS);
    for (const provider of providers) {
      counts[provider] = this.events.filter(e => e.provider === provider).length;
    }

    return counts;
  }

  _formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  _getEventSummary(event) {
    const { data } = event;
    const summary = [];

    if (data.currency) summary.push({ label: 'Currency', value: data.currency });
    if (data.value !== undefined) summary.push({ label: 'Value', value: data.value });
    if (data.transaction_id) summary.push({ label: 'Order', value: data.transaction_id });
    if (data.items?.length) summary.push({ label: 'Items', value: data.items.length });
    if (data.item_id) summary.push({ label: 'Item ID', value: data.item_id });
    if (data.item_name) summary.push({ label: 'Item', value: data.item_name });
    if (data.content_name) summary.push({ label: 'Content', value: data.content_name });
    if (data.content_ids?.length) summary.push({ label: 'IDs', value: data.content_ids.length });

    return summary;
  }

  _renderProviderBadges() {
    const providers = ['ga4', 'ga', 'fbpixel', 'tiktok', 'pinterest', 'snapchat', 'klaviyo', 'shopify', 'webpixel', 'datalayer'];

    // Only show providers that are detected
    const detectedProviders = providers.filter(p => this._detectedProviders.has(p));

    if (detectedProviders.length === 0) {
      return html`<span style="color: var(--tdt-text-muted); font-size: 10px;">None detected</span>`;
    }

    return html`
      <div class="detected-providers">
        ${detectedProviders.map(p => {
          const info = AnalyticsPanel.PROVIDERS[p];
          return html`
            <span class="provider-badge provider-badge--active">
              ${info.icon} ${info.name}
            </span>
          `;
        })}
      </div>
    `;
  }

  render() {
    const filtered = this._getFilteredEvents();
    const counts = this._getCounts();

    return html`
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Events</span>
          <span class="stat-value">${this.events.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Conversions</span>
          <span class="stat-value stat-value--success">${counts.conversion}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Detected</span>
          ${this._renderProviderBadges()}
        </div>
      </div>

      <div class="toolbar">
        <input
          type="search"
          class="search"
          placeholder="Filter events..."
          .value=${this.filter}
          @input=${this._filterEvents}
        >
        <button
          class="toggle-btn ${this.isPaused ? 'toggle-btn--active' : ''}"
          @click=${this._togglePause}
        >
          ${this.isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button class="btn-clear" @click=${this._clearEvents}>
          🗑️ Clear
        </button>
        <button class="btn-export" @click=${this._exportEvents}>
          📥 Export
        </button>
      </div>

      <div class="filter-tabs">
        <button
          class="filter-tab ${this.activeFilter === 'all' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('all')}
        >
          All <span class="filter-tab__count">${counts.all}</span>
        </button>
        <button
          class="filter-tab filter-tab--conversion ${this.activeFilter === 'conversion' ? 'filter-tab--active' : ''}"
          @click=${() => this._setFilter('conversion')}
        >
          💰 Conversions <span class="filter-tab__count">${counts.conversion}</span>
        </button>
        ${Object.entries(AnalyticsPanel.PROVIDERS).map(([key, info]) =>
          counts[key] > 0 ? html`
            <button
              class="filter-tab ${this.activeFilter === key ? 'filter-tab--active' : ''}"
              @click=${() => this._setFilter(key)}
            >
              ${info.icon} ${info.name} <span class="filter-tab__count">${counts[key]}</span>
            </button>
          ` : ''
        )}
      </div>

      ${filtered.length === 0
        ? html`
          <div class="empty-state">
            <div class="empty-state__icon">📊</div>
            <div>No analytics events captured yet</div>
            <div style="font-size: 11px; margin-top: 8px;">
              Events will appear as they fire (GA4, FB Pixel, dataLayer, etc.)
            </div>
          </div>
        `
        : html`
          <div class="event-list">
            ${filtered.slice().reverse().map(event => {
              const isExpanded = this.expandedEvents.has(event.id);
              const summary = this._getEventSummary(event);
              const providerInfo = AnalyticsPanel.PROVIDERS[event.provider];

              return html`
                <div class="event-item event-item--${event.provider} ${event.isConversion ? 'event-item--conversion' : ''}">
                  <div class="event-header" @click=${() => this._toggleExpand(event.id)}>
                    <span class="event-provider event-provider--${event.provider}">
                      ${providerInfo?.icon} ${providerInfo?.name}
                    </span>
                    <span class="event-name ${event.isConversion ? 'event-name--conversion' : ''}">
                      ${event.eventName}
                    </span>
                    ${event.count > 1 ? html`<span class="event-count">×${event.count}</span>` : ''}
                    ${event.isConversion ? html`<span class="event-badge">Conversion</span>` : ''}
                    <button class="btn-copy" @click=${(e) => this._copyEvent(event, e)}>Copy</button>
                    <span class="event-time">${this._formatTime(event.timestamp)}</span>
                  </div>
                  ${isExpanded ? html`
                    <div class="event-content">
                      ${summary.length > 0 ? html`
                        <div class="event-summary">
                          ${summary.map(s => html`
                            <span class="event-summary__item">
                              <span class="event-summary__label">${s.label}:</span>
                              <span class="event-summary__value">${s.value}</span>
                            </span>
                          `)}
                        </div>
                      ` : ''}
                      <tdt-object-inspector
                        .data=${event.data}
                        .path=${'analytics.' + event.eventName}
                      ></tdt-object-inspector>
                    </div>
                  ` : ''}
                </div>
              `;
            })}
          </div>
        `
      }
    `;
  }
}

customElements.define('tdt-analytics-panel', AnalyticsPanel);

