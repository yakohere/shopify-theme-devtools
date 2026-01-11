/**
 * Network Interceptor Service
 * Intercepts fetch and XMLHttpRequest calls to track Shopify API requests
 */

// Patterns to track
const SHOPIFY_PATTERNS = [
  /\/cart\.js$/,
  /\/cart\/(add|update|change|clear)\.js/,
  /\/products\/[^/]+\.js$/,
  /\/collections\/[^/]+\.js$/,
  /\/search/,
  /\/recommendations\/products/,
  /\/api\/\d+(-\d+)?\/graphql\.json/,  // Storefront API
  /\/variants\.js/,
  /\/localization\.json/,
];

// Categorize URL by type
function categorize(url) {
  if (/\/cart\/(add|update|change|clear)\.js/.test(url)) return 'cart-mutation';
  if (/\/cart\.js/.test(url)) return 'cart';
  if (/\/products\//.test(url)) return 'product';
  if (/\/collections\//.test(url)) return 'collection';
  if (/\/search/.test(url)) return 'search';
  if (/\/recommendations/.test(url)) return 'recommendation';
  if (/graphql/.test(url)) return 'graphql';
  if (/\/localization/.test(url)) return 'localization';
  return 'other';
}

// Get short display name from URL
function getDisplayName(url) {
  try {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;

    // Cart endpoints
    if (/\/cart\/(add|update|change|clear)\.js/.test(path)) {
      const match = path.match(/\/cart\/(\w+)\.js/);
      return `cart/${match[1]}.js`;
    }
    if (/\/cart\.js$/.test(path)) return 'cart.js';

    // Product/Collection
    if (/\/products\//.test(path)) {
      const match = path.match(/\/products\/([^/]+)\.js/);
      return match ? `products/${match[1]}.js` : path;
    }
    if (/\/collections\//.test(path)) {
      const match = path.match(/\/collections\/([^/]+)\.js/);
      return match ? `collections/${match[1]}.js` : path;
    }

    // Search
    if (/\/search/.test(path)) {
      const q = urlObj.searchParams.get('q');
      return q ? `search?q=${q.substring(0, 20)}${q.length > 20 ? '...' : ''}` : 'search';
    }

    // GraphQL
    if (/graphql/.test(path)) return 'graphql';

    // Recommendations
    if (/\/recommendations/.test(path)) return 'recommendations';

    // Localization
    if (/\/localization/.test(path)) return 'localization.json';

    return path;
  } catch {
    return url;
  }
}

// Check if URL matches Shopify patterns
function shouldTrack(url) {
  try {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    return SHOPIFY_PATTERNS.some(pattern => pattern.test(path));
  } catch {
    return false;
  }
}

// Check if this is an internal TDT request (polling, etc.)
function isInternalRequest(init) {
  // Check for our internal marker header
  return init?.headers?.['X-TDT-Internal'] === 'true' ||
         init?.['_tdtInternal'] === true;
}

// Check if this is a cart mutation request
function isCartMutation(url) {
  return /\/cart\/(add|update|change|clear)\.js/.test(url);
}

// Fetch current cart state (internal, won't be tracked)
async function fetchCartState(originalFetch) {
  try {
    const response = await originalFetch('/cart.js', {
      headers: { 'Accept': 'application/json' },
      _tdtInternal: true
    });
    return await response.json();
  } catch {
    return null;
  }
}

// Generate unique ID
function generateId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Storage key for persisted requests
const STORAGE_KEY = 'tdt_network_requests';
const BLOCKED_SOURCES_KEY = 'tdt_blocked_sources';
const MAX_PERSISTED_REQUESTS = 32;

/**
 * Capture and normalize call stack to identify request origin
 * Returns a simplified stack trace that can be used to identify the source
 */
function captureCallStack() {
  const stack = new Error().stack || '';
  const lines = stack.split('\n').slice(2); // Skip Error and captureCallStack frames

  // Filter out our interceptor frames and browser internals
  const filteredLines = lines.filter(line => {
    const lineLower = line.toLowerCase();
    return !lineLower.includes('network-interceptor') &&
           !lineLower.includes('theme-devtools') &&
           !lineLower.includes('native code') &&
           !lineLower.includes('<anonymous>') &&
           line.trim().length > 0;
  });

  // Take up to 5 meaningful stack frames
  const meaningfulFrames = filteredLines.slice(0, 5);

  // Create a normalized source identifier
  // This helps group requests from the same code location
  return meaningfulFrames.map(frame => {
    // Extract the meaningful part of the stack frame
    // Formats vary: "at functionName (url:line:col)" or "functionName@url:line:col"
    const match = frame.match(/(?:at\s+)?([^\s@]+)?(?:\s+\(|\@)?([^:]+:\d+:\d+)/);
    if (match) {
      const funcName = match[1] || 'anonymous';
      const location = match[2] || '';
      // Simplify the location - just keep filename and line
      const locMatch = location.match(/([^/]+:\d+):\d+$/);
      return locMatch ? `${funcName}@${locMatch[1]}` : `${funcName}@${location}`;
    }
    return frame.trim().substring(0, 100);
  }).join(' -> ');
}

/**
 * Generate a short hash for a source identifier
 * Used as a stable ID for blocking
 */
function hashSource(source) {
  if (!source) return 'unknown';
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'src_' + Math.abs(hash).toString(36);
}

class NetworkInterceptor {
  constructor() {
    this.requests = [];
    this.listeners = new Set();
    this.blockedSourceListeners = new Set();
    this._originalFetch = null;
    this._originalXHROpen = null;
    this._originalXHRSend = null;
    this._installed = false;
    this._staleTimeout = 30000; // 30 seconds

    // Blocked sources: Map of sourceId -> { source: string, label: string, blockedAt: Date }
    this.blockedSources = new Map();

    // Load persisted requests and blocked sources on init
    this._loadFromStorage();
    this._loadBlockedSources();
  }

  /**
   * Load requests from localStorage
   */
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Restore Date objects and mark as stale
        this.requests = parsed.map(req => ({
          ...req,
          startTime: new Date(req.startTime),
          endTime: req.endTime ? new Date(req.endTime) : null,
          status: req.status === 'pending' ? 'stale' : 'stale', // Mark all loaded as stale
        }));
      }
    } catch (e) {
      console.error('[TDT Network] Failed to load from storage:', e);
      this.requests = [];
    }
  }

  /**
   * Load blocked sources from localStorage
   */
  _loadBlockedSources() {
    try {
      const stored = localStorage.getItem(BLOCKED_SOURCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.blockedSources = new Map(
          parsed.map(item => [item.id, {
            source: item.source,
            label: item.label,
            blockedAt: new Date(item.blockedAt),
          }])
        );
      }
    } catch (e) {
      console.error('[TDT Network] Failed to load blocked sources:', e);
      this.blockedSources = new Map();
    }
  }

  /**
   * Save blocked sources to localStorage
   */
  _saveBlockedSources() {
    try {
      const toSave = Array.from(this.blockedSources.entries()).map(([id, data]) => ({
        id,
        source: data.source,
        label: data.label,
        blockedAt: data.blockedAt.toISOString(),
      }));
      localStorage.setItem(BLOCKED_SOURCES_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('[TDT Network] Failed to save blocked sources:', e);
    }
  }

  /**
   * Check if a source is blocked
   */
  _isSourceBlocked(sourceId) {
    return this.blockedSources.has(sourceId);
  }

  /**
   * Save requests to localStorage (only completed, non-cart-diff heavy data)
   */
  _saveToStorage() {
    try {
      // Only save completed requests, limit to MAX_PERSISTED_REQUESTS
      const toSave = this.requests
        .filter(req => req.status !== 'pending')
        .slice(0, MAX_PERSISTED_REQUESTS)
        .map(req => ({
          ...req,
          // Convert dates to ISO strings for JSON
          startTime: req.startTime instanceof Date ? req.startTime.toISOString() : req.startTime,
          endTime: req.endTime instanceof Date ? req.endTime.toISOString() : req.endTime,
          // Omit large cart diff data to save space
          cartBefore: null,
          cartAfter: null,
        }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('[TDT Network] Failed to save to storage:', e);
    }
  }

  /**
   * Install interceptors
   */
  install() {
    if (this._installed) return;

    this._interceptFetch();
    this._interceptXHR();
    this._installed = true;

    // Start stale checker
    this._staleInterval = setInterval(() => this._checkStale(), 5000);
  }

  /**
   * Uninstall interceptors
   */
  uninstall() {
    if (!this._installed) return;

    // Restore original fetch
    if (this._originalFetch) {
      window.fetch = this._originalFetch;
    }

    // Restore original XHR
    if (this._originalXHROpen) {
      XMLHttpRequest.prototype.open = this._originalXHROpen;
    }
    if (this._originalXHRSend) {
      XMLHttpRequest.prototype.send = this._originalXHRSend;
    }

    if (this._staleInterval) {
      clearInterval(this._staleInterval);
    }

    this._installed = false;
  }

  /**
   * Intercept fetch API
   */
  _interceptFetch() {
    this._originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url;

      // Skip non-Shopify URLs and internal TDT requests (like cart polling)
      if (!shouldTrack(url) || isInternalRequest(init)) {
        return self._originalFetch.apply(this, arguments);
      }

      // Capture call stack to identify the source
      const callStack = captureCallStack();
      const sourceId = hashSource(callStack);

      // Check if this source is blocked - if so, still make the request but don't log it
      if (self._isSourceBlocked(sourceId)) {
        return self._originalFetch.apply(this, arguments);
      }

      const requestId = generateId();
      const method = init.method || 'GET';
      let requestBody = null;

      // Capture request body
      if (init.body) {
        try {
          if (typeof init.body === 'string') {
            requestBody = init.body;
          } else if (init.body instanceof FormData) {
            requestBody = Object.fromEntries(init.body.entries());
          } else if (init.body instanceof URLSearchParams) {
            requestBody = Object.fromEntries(init.body.entries());
          }
        } catch {
          requestBody = '[Unable to parse body]';
        }
      }

      // Check if this is a cart mutation - capture cart state before
      const isCartMut = isCartMutation(url);
      let cartBefore = null;
      if (isCartMut) {
        cartBefore = await fetchCartState(self._originalFetch);
      }

      // Create request record
      const request = {
        id: requestId,
        url: url,
        fullUrl: new URL(url, window.location.origin).href,
        displayName: getDisplayName(url),
        method: method.toUpperCase(),
        category: categorize(url),
        startTime: new Date(),
        endTime: null,
        duration: null,
        status: 'pending',
        statusCode: null,
        requestBody: requestBody,
        requestHeaders: init.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {},
        responseBody: null,
        responseHeaders: {},
        error: null,
        // Cart diff data
        cartBefore: cartBefore,
        cartAfter: null,
        cartDiff: null,
        // Source tracking for blocking
        sourceId: sourceId,
        callStack: callStack,
      };

      self._addRequest(request);

      try {
        const response = await self._originalFetch.apply(this, arguments);

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();

        request.endTime = new Date();
        request.duration = request.endTime - request.startTime;
        request.statusCode = response.status;
        request.status = response.ok ? 'success' : 'error';
        request.responseHeaders = Object.fromEntries(response.headers.entries());

        // Try to read response body
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            request.responseBody = await clonedResponse.json();
          } else {
            request.responseBody = await clonedResponse.text();
          }
        } catch {
          request.responseBody = '[Unable to parse response]';
        }

        // For cart mutations, fetch the actual cart state after the mutation
        // Note: /cart/add.js response only contains added items, not full cart
        // So we need to fetch /cart.js to get the complete cart state
        if (isCartMut && response.ok) {
          const cartAfter = await fetchCartState(self._originalFetch);
          if (cartAfter) {
            request.cartAfter = cartAfter;
            request.cartDiff = self._calculateCartDiff(cartBefore, cartAfter);
          }
        }

        self._updateRequest(request);
        return response;
      } catch (error) {
        request.endTime = new Date();
        request.duration = request.endTime - request.startTime;
        request.status = 'error';
        request.error = error.message;
        self._updateRequest(request);
        throw error;
      }
    };
  }

  /**
   * Intercept XMLHttpRequest
   */
  _interceptXHR() {
    this._originalXHROpen = XMLHttpRequest.prototype.open;
    this._originalXHRSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._tdtUrl = url;
      this._tdtMethod = method;
      return self._originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
      const url = this._tdtUrl;

      if (!shouldTrack(url)) {
        return self._originalXHRSend.apply(this, arguments);
      }

      // Capture call stack to identify the source
      const callStack = captureCallStack();
      const sourceId = hashSource(callStack);

      // Check if this source is blocked - if so, still make the request but don't log it
      if (self._isSourceBlocked(sourceId)) {
        return self._originalXHRSend.apply(this, arguments);
      }

      const requestId = generateId();
      let requestBody = null;

      // Capture request body
      if (body) {
        try {
          if (typeof body === 'string') {
            requestBody = body;
          } else if (body instanceof FormData) {
            requestBody = Object.fromEntries(body.entries());
          }
        } catch {
          requestBody = '[Unable to parse body]';
        }
      }

      const request = {
        id: requestId,
        url: url,
        fullUrl: new URL(url, window.location.origin).href,
        displayName: getDisplayName(url),
        method: (this._tdtMethod || 'GET').toUpperCase(),
        category: categorize(url),
        startTime: new Date(),
        endTime: null,
        duration: null,
        status: 'pending',
        statusCode: null,
        requestBody: requestBody,
        requestHeaders: {},
        responseBody: null,
        responseHeaders: {},
        error: null,
        // Source tracking for blocking
        sourceId: sourceId,
        callStack: callStack,
      };

      self._addRequest(request);

      // Listen for completion
      this.addEventListener('load', function() {
        request.endTime = new Date();
        request.duration = request.endTime - request.startTime;
        request.statusCode = this.status;
        request.status = this.status >= 200 && this.status < 300 ? 'success' : 'error';

        // Parse response headers
        const headerString = this.getAllResponseHeaders();
        if (headerString) {
          headerString.split('\r\n').forEach(line => {
            const parts = line.split(': ');
            if (parts.length === 2) {
              request.responseHeaders[parts[0].toLowerCase()] = parts[1];
            }
          });
        }

        // Parse response body
        try {
          const contentType = this.getResponseHeader('content-type') || '';
          if (contentType.includes('application/json')) {
            request.responseBody = JSON.parse(this.responseText);
          } else {
            request.responseBody = this.responseText;
          }
        } catch {
          request.responseBody = this.responseText || '[Unable to parse response]';
        }

        self._updateRequest(request);
      });

      this.addEventListener('error', function() {
        request.endTime = new Date();
        request.duration = request.endTime - request.startTime;
        request.status = 'error';
        request.error = 'Network error';
        self._updateRequest(request);
      });

      this.addEventListener('abort', function() {
        request.endTime = new Date();
        request.duration = request.endTime - request.startTime;
        request.status = 'error';
        request.error = 'Request aborted';
        self._updateRequest(request);
      });

      return self._originalXHRSend.apply(this, arguments);
    };
  }

  /**
   * Calculate the diff between two cart states
   * Uses Shopify's items_added/items_removed when available for accuracy
   */
  _calculateCartDiff(before, after) {
    if (!after) return null;

    const diff = {
      itemsBefore: before?.item_count || 0,
      itemsAfter: after.item_count || 0,
      totalBefore: before?.total_price || 0,
      totalAfter: after.total_price || 0,
      added: [],
      removed: [],
      changed: [],
    };

    // Shopify provides items_added and items_removed in the response - use these if available
    // These are more accurate than our manual diff calculation
    if (after.items_added && after.items_added.length > 0) {
      after.items_added.forEach(item => {
        diff.added.push({
          title: item.title || item.product_title,
          variant_title: item.variant_title,
          quantity: item.quantity,
          price: item.price ? Math.round(parseFloat(item.price) * 100) : (item.final_line_price || item.line_price),
          variant_id: item.variant_id,
        });
      });
    }

    if (after.items_removed && after.items_removed.length > 0) {
      after.items_removed.forEach(item => {
        diff.removed.push({
          title: item.title || item.product_title,
          variant_title: item.variant_title,
          quantity: item.quantity,
          price: item.price ? Math.round(parseFloat(item.price) * 100) : (item.final_line_price || item.line_price),
          variant_id: item.variant_id,
        });
      });
    }

    // If Shopify provided the data, we're done - skip manual calculation
    if (after.items_added?.length > 0 || after.items_removed?.length > 0) {
      // Still check for quantity changes by comparing before/after items
      if (before) {
        const getItemKey = (item) => {
          const propsHash = item.properties ? JSON.stringify(item.properties) : '';
          return `${item.variant_id}:${propsHash}`;
        };

        const beforeItems = new Map();
        const afterItems = new Map();

        (before.items || []).forEach(item => {
          beforeItems.set(getItemKey(item), item);
        });

        (after.items || []).forEach(item => {
          afterItems.set(getItemKey(item), item);
        });

        // Check for quantity changes in items that exist in both
        afterItems.forEach((afterItem, key) => {
          const beforeItem = beforeItems.get(key);
          if (beforeItem && beforeItem.quantity !== afterItem.quantity) {
            diff.changed.push({
              title: afterItem.title,
              variant_title: afterItem.variant_title,
              quantityBefore: beforeItem.quantity,
              quantityAfter: afterItem.quantity,
              priceBefore: beforeItem.final_line_price || beforeItem.line_price,
              priceAfter: afterItem.final_line_price || afterItem.line_price,
              variant_id: afterItem.variant_id,
            });
          }
        });
      }

      if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
        return null;
      }
      return diff;
    }

    // Fallback: Manual calculation if Shopify didn't provide items_added/items_removed
    if (!before) return null;

    // Create maps of items by key (variant_id + properties hash)
    const getItemKey = (item) => {
      const propsHash = item.properties ? JSON.stringify(item.properties) : '';
      return `${item.variant_id}:${propsHash}`;
    };

    const beforeItems = new Map();
    const afterItems = new Map();

    (before.items || []).forEach(item => {
      const key = getItemKey(item);
      beforeItems.set(key, item);
    });

    (after.items || []).forEach(item => {
      const key = getItemKey(item);
      afterItems.set(key, item);
    });

    // Find added and changed items
    afterItems.forEach((afterItem, key) => {
      const beforeItem = beforeItems.get(key);
      if (!beforeItem) {
        // Item was added
        diff.added.push({
          title: afterItem.title,
          variant_title: afterItem.variant_title,
          quantity: afterItem.quantity,
          price: afterItem.final_line_price || afterItem.line_price,
          variant_id: afterItem.variant_id,
        });
      } else if (beforeItem.quantity !== afterItem.quantity) {
        // Quantity changed
        diff.changed.push({
          title: afterItem.title,
          variant_title: afterItem.variant_title,
          quantityBefore: beforeItem.quantity,
          quantityAfter: afterItem.quantity,
          priceBefore: beforeItem.final_line_price || beforeItem.line_price,
          priceAfter: afterItem.final_line_price || afterItem.line_price,
          variant_id: afterItem.variant_id,
        });
      }
    });

    // Find removed items
    beforeItems.forEach((beforeItem, key) => {
      if (!afterItems.has(key)) {
        diff.removed.push({
          title: beforeItem.title,
          variant_title: beforeItem.variant_title,
          quantity: beforeItem.quantity,
          price: beforeItem.final_line_price || beforeItem.line_price,
          variant_id: beforeItem.variant_id,
        });
      }
    });

    // Only return diff if there were actual changes
    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
      return null;
    }

    return diff;
  }

  /**
   * Add a new request
   */
  _addRequest(request) {
    this.requests.push(request);
    // Keep last 100 requests
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(-100);
    }
    this._notify();
  }

  /**
   * Update an existing request
   */
  _updateRequest(request) {
    const index = this.requests.findIndex(r => r.id === request.id);
    if (index !== -1) {
      this.requests[index] = request;
    }
    this._notify();
  }

  /**
   * Check for stale requests
   */
  _checkStale() {
    const now = Date.now();
    let changed = false;

    this.requests.forEach(req => {
      if (req.status === 'success' && req.endTime) {
        const age = now - req.endTime.getTime();
        if (age > this._staleTimeout && req.status !== 'stale') {
          req.status = 'stale';
          changed = true;
        }
      }
    });

    if (changed) {
      this._notify();
    }
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  _notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.requests);
      } catch (e) {
        console.error('[TDT Network] Listener error:', e);
      }
    });

    // Persist to storage after notify
    this._saveToStorage();
  }

  /**
   * Clear all requests
   */
  clear() {
    this.requests = [];
    // Also clear storage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[TDT Network] Failed to clear storage:', e);
    }
    this._notify();
  }

  /**
   * Get all requests
   */
  getRequests() {
    return this.requests;
  }

  /**
   * Get requests filtered by category
   */
  getRequestsByCategory(category) {
    if (category === 'all') return this.requests;
    return this.requests.filter(r => r.category === category);
  }

  // ============ Source Blocking API ============

  /**
   * Block a source by its ID
   * @param {string} sourceId - The source ID to block
   * @param {string} source - The full source/callstack string for display
   * @param {string} label - A friendly label (e.g., URL or description)
   */
  blockSource(sourceId, source, label) {
    if (!sourceId) return;

    this.blockedSources.set(sourceId, {
      source: source || sourceId,
      label: label || 'Unknown source',
      blockedAt: new Date(),
    });

    this._saveBlockedSources();
    this._notifyBlockedSourcesChange();
  }

  /**
   * Unblock a source by its ID
   * @param {string} sourceId - The source ID to unblock
   */
  unblockSource(sourceId) {
    if (!sourceId) return;

    const deleted = this.blockedSources.delete(sourceId);
    if (deleted) {
      this._saveBlockedSources();
      this._notifyBlockedSourcesChange();
    }
  }

  /**
   * Get all blocked sources
   * @returns {Array} Array of { id, source, label, blockedAt }
   */
  getBlockedSources() {
    return Array.from(this.blockedSources.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }

  /**
   * Check if a specific source ID is blocked
   * @param {string} sourceId
   * @returns {boolean}
   */
  isBlocked(sourceId) {
    return this.blockedSources.has(sourceId);
  }

  /**
   * Clear all blocked sources
   */
  clearBlockedSources() {
    this.blockedSources.clear();
    this._saveBlockedSources();
    this._notifyBlockedSourcesChange();
  }

  /**
   * Subscribe to blocked sources changes
   */
  subscribeToBlockedSources(callback) {
    this.blockedSourceListeners.add(callback);
    return () => this.blockedSourceListeners.delete(callback);
  }

  /**
   * Notify blocked sources listeners
   */
  _notifyBlockedSourcesChange() {
    const blockedSources = this.getBlockedSources();
    this.blockedSourceListeners.forEach(callback => {
      try {
        callback(blockedSources);
      } catch (e) {
        console.error('[TDT Network] Blocked source listener error:', e);
      }
    });
  }
}

// Singleton instance
export const networkInterceptor = new NetworkInterceptor();
