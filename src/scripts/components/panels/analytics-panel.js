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
    fbpixel: { name: 'FB Pixel', icon: '📘', color: '#1877f2' },
    shopify: { name: 'Shopify', icon: '🛍️', color: '#96bf48' },
    datalayer: { name: 'DataLayer', icon: '📦', color: '#f9ab00' },
    custom: { name: 'Custom', icon: '⚡', color: '#9382ff' },
  };

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
    this._detectProviders();
    this._interceptDataLayer();
    this._interceptGtag();
    this._interceptFbPixel();
    this._interceptShopifyAnalytics();
    this._interceptCustomEvents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._restoreInterceptors();
  }

  _detectProviders() {
    if (window.dataLayer) this._detectedProviders.add('datalayer');
    if (window.gtag) this._detectedProviders.add('ga4');
    if (window.fbq) this._detectedProviders.add('fbpixel');
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

  _addEvent(provider, eventName, data, isLive = true) {
    const isConversion = AnalyticsPanel.CONVERSION_EVENTS.some(
      ce => eventName.toLowerCase().includes(ce.toLowerCase())
    );

    const event = {
      id: Date.now() + Math.random(),
      provider,
      eventName,
      data,
      timestamp: new Date(),
      isConversion,
      isLive
    };

    if (isLive) {
      this.events = [...this.events, event];
    } else {
      this.events = [event, ...this.events];
    }
  }

  _togglePause() {
    this.isPaused = !this.isPaused;
  }

  _clearEvents() {
    this.events = [];
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
    return {
      all: this.events.length,
      conversion: this.events.filter(e => e.isConversion).length,
      ga4: this.events.filter(e => e.provider === 'ga4').length,
      fbpixel: this.events.filter(e => e.provider === 'fbpixel').length,
      shopify: this.events.filter(e => e.provider === 'shopify').length,
      datalayer: this.events.filter(e => e.provider === 'datalayer').length,
      custom: this.events.filter(e => e.provider === 'custom').length,
    };
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
    const providers = ['ga4', 'fbpixel', 'shopify', 'datalayer'];
    
    return html`
      <div class="detected-providers">
        ${providers.map(p => {
          const isActive = this._detectedProviders.has(p);
          const info = AnalyticsPanel.PROVIDERS[p];
          return html`
            <span class="provider-badge ${isActive ? 'provider-badge--active' : ''}">
              ${info.icon} ${info.name} ${isActive ? '✓' : '✗'}
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
        ${counts.ga4 > 0 ? html`
          <button
            class="filter-tab ${this.activeFilter === 'ga4' ? 'filter-tab--active' : ''}"
            @click=${() => this._setFilter('ga4')}
          >
            📊 GA4 <span class="filter-tab__count">${counts.ga4}</span>
          </button>
        ` : ''}
        ${counts.fbpixel > 0 ? html`
          <button
            class="filter-tab ${this.activeFilter === 'fbpixel' ? 'filter-tab--active' : ''}"
            @click=${() => this._setFilter('fbpixel')}
          >
            📘 FB Pixel <span class="filter-tab__count">${counts.fbpixel}</span>
          </button>
        ` : ''}
        ${counts.shopify > 0 ? html`
          <button
            class="filter-tab ${this.activeFilter === 'shopify' ? 'filter-tab--active' : ''}"
            @click=${() => this._setFilter('shopify')}
          >
            🛍️ Shopify <span class="filter-tab__count">${counts.shopify}</span>
          </button>
        ` : ''}
        ${counts.datalayer > 0 ? html`
          <button
            class="filter-tab ${this.activeFilter === 'datalayer' ? 'filter-tab--active' : ''}"
            @click=${() => this._setFilter('datalayer')}
          >
            📦 DataLayer <span class="filter-tab__count">${counts.datalayer}</span>
          </button>
        ` : ''}
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
                    ${event.isConversion ? html`<span class="event-badge">Conversion</span>` : ''}
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

