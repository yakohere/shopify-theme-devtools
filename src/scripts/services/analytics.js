/**
 * Analytics Service
 * Shared service for storing and accessing analytics event data
 * Used by both the analytics panel and AI panel
 */

const STORAGE_KEY = 'tdt-analytics-events';
const MAX_EVENTS = 500;

// Conversion events to identify important tracking events
const CONVERSION_EVENTS = [
  'purchase', 'add_to_cart', 'begin_checkout', 'add_payment_info',
  'add_shipping_info', 'view_item', 'view_item_list', 'select_item',
  'remove_from_cart', 'view_cart', 'sign_up', 'login', 'search',
  'Purchase', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo',
  'ViewContent', 'Lead', 'CompleteRegistration', 'Subscribe'
];

// Provider information
const PROVIDERS = {
  ga4: { name: 'GA4', color: '#4285f4' },
  ga: { name: 'GA Universal', color: '#e37400' },
  fbpixel: { name: 'FB Pixel', color: '#1877f2' },
  tiktok: { name: 'TikTok', color: '#000000' },
  pinterest: { name: 'Pinterest', color: '#e60023' },
  snapchat: { name: 'Snapchat', color: '#fffc00' },
  klaviyo: { name: 'Klaviyo', color: '#2d2d2d' },
  shopify: { name: 'Shopify', color: '#96bf48' },
  webpixel: { name: 'Web Pixel', color: '#5c6ac4' },
  datalayer: { name: 'DataLayer', color: '#f9ab00' },
  custom: { name: 'Custom', color: '#9382ff' },
};

class AnalyticsService {
  constructor() {
    this._events = [];
    this._detectedProviders = new Set();
    this._listeners = new Set();
    this._isPaused = false;
    this._interceptorsInstalled = false;
    this._originalFunctions = {};
  }

  /**
   * Get all events
   * @returns {Array}
   */
  get events() {
    return this._events;
  }

  /**
   * Get detected providers
   * @returns {Set}
   */
  get detectedProviders() {
    return this._detectedProviders;
  }

  /**
   * Check if tracking is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this._isPaused;
  }

  /**
   * Get conversion events
   * @returns {Array}
   */
  get conversionEvents() {
    return this._events.filter(e => e.isConversion);
  }

  /**
   * Get summary counts
   * @returns {Object}
   */
  get summary() {
    const counts = {
      total: this._events.length,
      conversions: this._events.filter(e => e.isConversion).length,
      providers: {},
    };

    // Count per provider
    for (const provider of Object.keys(PROVIDERS)) {
      counts.providers[provider] = this._events.filter(e => e.provider === provider).length;
    }

    return counts;
  }

  /**
   * Pause/resume event tracking
   */
  setPaused(paused) {
    this._isPaused = paused;
    this._notifyListeners();
  }

  /**
   * Initialize interceptors - call this when analytics panel mounts
   */
  init() {
    if (this._interceptorsInstalled) return;

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

    this._interceptorsInstalled = true;
  }

  /**
   * Restore original functions - call on cleanup
   */
  destroy() {
    if (!this._interceptorsInstalled) return;

    if (this._originalFunctions.dataLayerPush && window.dataLayer) {
      window.dataLayer.push = this._originalFunctions.dataLayerPush;
    }
    if (this._originalFunctions.gtag) {
      window.gtag = this._originalFunctions.gtag;
    }
    if (this._originalFunctions.ga) {
      window.ga = this._originalFunctions.ga;
    }
    if (this._originalFunctions.fbq) {
      window.fbq = this._originalFunctions.fbq;
    }
    if (this._originalFunctions.pintrk) {
      window.pintrk = this._originalFunctions.pintrk;
    }
    if (this._originalFunctions.snaptr) {
      window.snaptr = this._originalFunctions.snaptr;
    }

    // Remove custom event listeners
    if (this._customEventHandler) {
      ['analytics', 'tracking', 'gtm', 'conversion'].forEach(eventType => {
        document.removeEventListener(eventType, this._customEventHandler);
      });
    }

    this._interceptorsInstalled = false;
  }

  /**
   * Add an event
   */
  addEvent(provider, eventName, data, isLive = true) {
    if (this._isPaused) return;

    const isConversion = CONVERSION_EVENTS.some(
      ce => eventName.toLowerCase().includes(ce.toLowerCase())
    );

    const eventKey = this._getEventKey(provider, eventName, data);

    // Check for duplicate within last 500ms
    const recentDuplicate = this._events.find(e => {
      const timeDiff = Date.now() - new Date(e.timestamp).getTime();
      return timeDiff < 500 && this._getEventKey(e.provider, e.eventName, e.data) === eventKey;
    });

    if (recentDuplicate) {
      recentDuplicate.count = (recentDuplicate.count || 1) + 1;
      this._notifyListeners();
      this._persistEvents();
      return;
    }

    const event = {
      id: Date.now() + Math.random(),
      provider,
      eventName,
      data: this._safeCloneData(data),
      timestamp: new Date().toISOString(),
      isConversion,
      isLive,
      count: 1,
    };

    if (isLive) {
      this._events.push(event);
    } else {
      this._events.unshift(event);
    }

    // Keep max events
    if (this._events.length > MAX_EVENTS) {
      this._events = this._events.slice(-MAX_EVENTS);
    }

    if (isLive) {
      this._persistEvents();
    }

    this._notifyListeners();
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this._events = [];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
    this._notifyListeners();
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Get data formatted for AI context serialization
   * @returns {Object|null}
   */
  getForAI() {
    if (this._events.length === 0) {
      return null;
    }

    return {
      totalEvents: this._events.length,
      conversionCount: this._events.filter(e => e.isConversion).length,
      detectedProviders: Array.from(this._detectedProviders),
      recentEvents: this._events.slice(-20).map(e => ({
        provider: e.provider,
        eventName: e.eventName,
        isConversion: e.isConversion,
        timestamp: e.timestamp,
        count: e.count || 1,
        // Only include key data fields to save tokens
        data: this._summarizeEventData(e.data),
      })),
      providerCounts: Object.fromEntries(
        Object.keys(PROVIDERS)
          .map(p => [p, this._events.filter(e => e.provider === p).length])
          .filter(([, count]) => count > 0)
      ),
    };
  }

  // Private methods

  _notifyListeners() {
    this._listeners.forEach(cb => {
      try {
        cb({
          events: this._events,
          detectedProviders: this._detectedProviders,
          isPaused: this._isPaused,
        });
      } catch (e) {
        console.error('[Analytics Service] Listener error:', e);
      }
    });
  }

  _getEventKey(provider, eventName, data) {
    const dataKey = JSON.stringify(data, Object.keys(data || {}).sort());
    return `${provider}:${eventName}:${dataKey}`;
  }

  _safeCloneData(data, seen = new WeakSet()) {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    if (seen.has(data)) {
      return '[Circular]';
    }

    if (data instanceof Element || data instanceof Node) {
      return '[DOM Element]';
    }

    if (typeof data === 'function') {
      return '[Function]';
    }

    seen.add(data);

    if (Array.isArray(data)) {
      return data.map(item => this._safeCloneData(item, seen));
    }

    const result = {};
    for (const key of Object.keys(data)) {
      try {
        const value = data[key];
        if (key === 'renderOptions' || key === 'host' || key.startsWith('__')) {
          continue;
        }
        result[key] = this._safeCloneData(value, seen);
      } catch {
        result[key] = '[Unserializable]';
      }
    }
    return result;
  }

  _summarizeEventData(data) {
    if (!data || typeof data !== 'object') return data;

    const summary = {};
    const importantKeys = [
      'event', 'event_name', 'eventName',
      'currency', 'value', 'price', 'total',
      'transaction_id', 'order_id',
      'item_id', 'item_name', 'product_id', 'product_name',
      'content_name', 'content_ids', 'content_type',
      'items', 'products',
      'category', 'action', 'label',
      'page', 'page_title', 'page_location',
    ];

    for (const key of importantKeys) {
      if (data[key] !== undefined) {
        // For arrays, just show count
        if (Array.isArray(data[key])) {
          summary[key] = `[${data[key].length} items]`;
        } else {
          summary[key] = data[key];
        }
      }
    }

    return Object.keys(summary).length > 0 ? summary : data;
  }

  _loadPersistedEvents() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this._events = parsed.map(e => ({
          ...e,
          isLive: false,
        }));
      }
    } catch (err) {
      console.warn('[Analytics Service] Failed to load events:', err);
    }
  }

  _persistEvents() {
    try {
      const toStore = this._events.slice(-MAX_EVENTS);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('[Analytics Service] Failed to persist events:', err);
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
        if (!self._isPaused && data && typeof data === 'object') {
          self.addEvent('datalayer', data.event || 'push', data);
        }
      });
      return originalPush(...args);
    };

    this._originalFunctions.dataLayerPush = originalPush;

    // Process existing dataLayer items
    window.dataLayer.forEach(data => {
      if (data && typeof data === 'object') {
        this.addEvent('datalayer', data.event || 'push', data, false);
      }
    });
  }

  _interceptGtag() {
    if (!window.gtag) return;

    const originalGtag = window.gtag;
    const self = this;

    window.gtag = function(command, ...args) {
      if (!self._isPaused) {
        if (command === 'event') {
          const [eventName, params] = args;
          self.addEvent('ga4', eventName, params || {});
          self._detectedProviders.add('ga4');
        } else if (command === 'config') {
          self.addEvent('ga4', 'config', { measurementId: args[0], ...args[1] });
        }
      }
      return originalGtag.call(this, command, ...args);
    };

    this._originalFunctions.gtag = originalGtag;
  }

  _interceptGaUniversal() {
    if (!window.ga) return;

    const originalGa = window.ga;
    const self = this;

    window.ga = function(command, ...args) {
      if (!self._isPaused) {
        if (command === 'send') {
          const [hitType, ...rest] = args;
          if (hitType === 'event') {
            const [category, action, label, value] = rest;
            self.addEvent('ga', action || 'event', { category, action, label, value });
          } else if (hitType === 'pageview') {
            self.addEvent('ga', 'pageview', { page: rest[0] });
          }
          self._detectedProviders.add('ga');
        } else if (command === 'create') {
          self.addEvent('ga', 'create', { trackingId: args[0], ...args[1] });
        }
      }
      return originalGa.call(this, command, ...args);
    };

    this._originalFunctions.ga = originalGa;
  }

  _interceptFbPixel() {
    if (!window.fbq) return;

    const originalFbq = window.fbq;
    const self = this;

    window.fbq = function(command, ...args) {
      if (!self._isPaused) {
        if (command === 'track' || command === 'trackCustom') {
          const [eventName, params] = args;
          self.addEvent('fbpixel', eventName, params || {});
          self._detectedProviders.add('fbpixel');
        } else if (command === 'init') {
          self.addEvent('fbpixel', 'init', { pixelId: args[0] });
        }
      }
      return originalFbq.call(this, command, ...args);
    };

    this._originalFunctions.fbq = originalFbq;
  }

  _interceptTikTok() {
    if (!window.ttq) return;

    const originalTtq = window.ttq;
    const self = this;

    if (originalTtq.track) {
      const originalTrack = originalTtq.track.bind(originalTtq);
      originalTtq.track = function(eventName, params) {
        if (!self._isPaused) {
          self.addEvent('tiktok', eventName, params || {});
          self._detectedProviders.add('tiktok');
        }
        return originalTrack(eventName, params);
      };
      this._originalFunctions.ttqTrack = originalTrack;
    }

    if (originalTtq.page) {
      const originalPage = originalTtq.page.bind(originalTtq);
      originalTtq.page = function() {
        if (!self._isPaused) {
          self.addEvent('tiktok', 'PageView', {});
          self._detectedProviders.add('tiktok');
        }
        return originalPage();
      };
      this._originalFunctions.ttqPage = originalPage;
    }
  }

  _interceptPinterest() {
    if (!window.pintrk) return;

    const originalPintrk = window.pintrk;
    const self = this;

    window.pintrk = function(command, ...args) {
      if (!self._isPaused) {
        if (command === 'track') {
          const [eventName, params] = args;
          self.addEvent('pinterest', eventName, params || {});
          self._detectedProviders.add('pinterest');
        } else if (command === 'load') {
          self.addEvent('pinterest', 'load', { tagId: args[0] });
        }
      }
      return originalPintrk.call(this, command, ...args);
    };

    this._originalFunctions.pintrk = originalPintrk;
  }

  _interceptSnapchat() {
    if (!window.snaptr) return;

    const originalSnaptr = window.snaptr;
    const self = this;

    window.snaptr = function(command, ...args) {
      if (!self._isPaused) {
        if (command === 'track') {
          const [eventName, params] = args;
          self.addEvent('snapchat', eventName, params || {});
          self._detectedProviders.add('snapchat');
        } else if (command === 'init') {
          self.addEvent('snapchat', 'init', { pixelId: args[0] });
        }
      }
      return originalSnaptr.call(this, command, ...args);
    };

    this._originalFunctions.snaptr = originalSnaptr;
  }

  _interceptKlaviyo() {
    if (!window._learnq) return;

    const originalLearnq = window._learnq;
    const self = this;

    if (Array.isArray(originalLearnq)) {
      const originalPush = originalLearnq.push.bind(originalLearnq);
      originalLearnq.push = function(item) {
        if (!self._isPaused && Array.isArray(item)) {
          const [command, ...args] = item;
          if (command === 'track') {
            const [eventName, params] = args;
            self.addEvent('klaviyo', eventName, params || {});
            self._detectedProviders.add('klaviyo');
          } else if (command === 'identify') {
            self.addEvent('klaviyo', 'identify', args[0] || {});
          }
        }
        return originalPush(item);
      };
      this._originalFunctions.learnqPush = originalPush;
    }
  }

  _interceptShopifyAnalytics() {
    if (!window.Shopify?.analytics) return;

    const analytics = window.Shopify.analytics;
    const self = this;

    if (analytics.publish) {
      const originalPublish = analytics.publish.bind(analytics);
      analytics.publish = function(eventName, data) {
        if (!self._isPaused) {
          self.addEvent('shopify', eventName, data || {});
          self._detectedProviders.add('shopify');
        }
        return originalPublish(eventName, data);
      };
      this._originalFunctions.shopifyPublish = originalPublish;
    }
  }

  _interceptWebPixels() {
    if (!window.Shopify?.analytics?.subscribe) return;

    const analytics = window.Shopify.analytics;
    const self = this;
    const originalSubscribe = analytics.subscribe.bind(analytics);

    analytics.subscribe = function(eventName, callback) {
      const wrappedCallback = (event) => {
        if (!self._isPaused) {
          self.addEvent('webpixel', eventName, event || {});
          self._detectedProviders.add('webpixel');
        }
        return callback(event);
      };
      return originalSubscribe(eventName, wrappedCallback);
    };

    this._originalFunctions.webPixelSubscribe = originalSubscribe;
  }

  _interceptCustomEvents() {
    const self = this;

    this._customEventHandler = (e) => {
      if (!self._isPaused && e.detail) {
        self.addEvent('custom', e.type, e.detail);
      }
    };

    ['analytics', 'tracking', 'gtm', 'conversion'].forEach(eventType => {
      document.addEventListener(eventType, this._customEventHandler);
    });
  }
}

export const analyticsService = new AnalyticsService();
export { PROVIDERS as ANALYTICS_PROVIDERS, CONVERSION_EVENTS };
