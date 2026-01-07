function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

class CartAPI {
  static STORAGE_KEY = 'tdt-cart-history';

  constructor() {
    this.listeners = new Set();
    this.currentCart = null;
    this.cartHistory = [];
    this.pollInterval = null;
    this._isRestoring = false;
    this._restoreEndTime = 0;
    this._loadPersistedHistory();
  }

  /**
   * Start a restore operation - all cart changes will be ignored for history
   */
  startRestore() {
    this._isRestoring = true;
  }

  /**
   * End a restore operation
   * @param {Object} finalCart - The final cart state after restore
   */
  endRestore(finalCart = null) {
    this._isRestoring = false;
    // Set a grace period - ignore history for the next 500ms to let pending callbacks settle
    this._restoreEndTime = Date.now() + 500;
    // Update currentCart to the final restored state
    if (finalCart) {
      this.currentCart = finalCart;
    }
  }

  /**
   * Check if we're currently in a restore operation or in the grace period after restore
   */
  isRestoring() {
    return this._isRestoring || Date.now() < this._restoreEndTime;
  }

  _loadPersistedHistory() {
    try {
      const stored = sessionStorage.getItem(CartAPI.STORAGE_KEY);
      if (stored) {
        this.cartHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Theme Devtools] Failed to load cart history:', e);
    }
  }

  _persistHistory() {
    try {
      // Keep last 50 entries
      const toStore = this.cartHistory.slice(-50);
      sessionStorage.setItem(CartAPI.STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      // Storage full or unavailable
    }
  }

  /**
   * Compare two cart snapshots for equality (items, attributes, note)
   */
  cartsEqual(cart1, cart2) {
    if (!cart1 || !cart2) return false;

    // Compare item count first (quick check)
    if (cart1.item_count !== cart2.item_count) return false;
    if (cart1.total_price !== cart2.total_price) return false;

    // Compare note
    if ((cart1.note || '') !== (cart2.note || '')) return false;

    // Compare attributes
    const attrs1 = JSON.stringify(cart1.attributes || {});
    const attrs2 = JSON.stringify(cart2.attributes || {});
    if (attrs1 !== attrs2) return false;

    // Compare items (including properties and selling plans)
    const items1 = cart1.items || [];
    const items2 = cart2.items || [];
    if (items1.length !== items2.length) return false;

    for (let i = 0; i < items1.length; i++) {
      const a = items1[i];
      const b = items2[i];
      if (a.variant_id !== b.variant_id) return false;
      if (a.quantity !== b.quantity) return false;
      if (JSON.stringify(a.properties || {}) !== JSON.stringify(b.properties || {})) return false;
      const aPlan = a.selling_plan_allocation?.selling_plan?.id;
      const bPlan = b.selling_plan_allocation?.selling_plan?.id;
      if (aPlan !== bPlan) return false;
    }

    return true;
  }

  async fetch() {
    try {
      const response = await fetch('/cart.js', {
        headers: { 'Accept': 'application/json' },
        // Mark as internal TDT request to hide from Network panel
        _tdtInternal: true
      });
      return await response.json();
    } catch (e) {
      console.error('[Theme Devtools] Cart fetch failed:', e);
      return null;
    }
  }

  async update(updates) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ updates })
      });
      const cart = await response.json();
      this.setCart(cart);
      return cart;
    } catch (e) {
      console.error('[Theme Devtools] Cart update failed:', e);
      return null;
    }
  }

  async change(line, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ line, quantity })
      });
      const cart = await response.json();
      this.setCart(cart);
      return cart;
    } catch (e) {
      console.error('[Theme Devtools] Cart change failed:', e);
      return null;
    }
  }

  async clear() {
    try {
      const response = await fetch('/cart/clear.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      const cart = await response.json();
      this.setCart(cart);
      return cart;
    } catch (e) {
      console.error('[Theme Devtools] Cart clear failed:', e);
      return null;
    }
  }

  setCart(cart) {
    const oldCart = this.currentCart;
    this.currentCart = cart;

    // Skip history recording during restore operations or grace period
    if (this.isRestoring()) {
      this.notify(cart, oldCart);
      return;
    }

    // Also skip if old and new cart are identical
    if (oldCart && this.cartsEqual(oldCart, cart)) {
      this.notify(cart, oldCart);
      return;
    }

    if (oldCart) {
      // Check if last history entry has identical snapshot - skip if duplicate
      const lastEntry = this.cartHistory[this.cartHistory.length - 1];
      const isDuplicate = lastEntry && this.cartsEqual(lastEntry.snapshot, oldCart);

      if (!isDuplicate) {
        this.cartHistory.push({
          timestamp: Date.now(),
          diff: this.diffCart(oldCart, cart),
          snapshot: deepClone(oldCart)
        });
        if (this.cartHistory.length > 50) {
          this.cartHistory.shift();
        }
        this._persistHistory();
      }
    }

    this.notify(cart, oldCart);
  }

  diffCart(oldCart, newCart) {
    const diff = {
      itemCount: { old: oldCart?.item_count || 0, new: newCart?.item_count || 0 },
      totalPrice: { old: oldCart?.total_price || 0, new: newCart?.total_price || 0 },
      items: { added: [], removed: [], modified: [] },
      noteChanged: (oldCart?.note || '') !== (newCart?.note || ''),
      attributesChanged: JSON.stringify(oldCart?.attributes || {}) !== JSON.stringify(newCart?.attributes || {}),
      discountChanged: JSON.stringify(oldCart?.discount_codes || []) !== JSON.stringify(newCart?.discount_codes || [])
    };

    const oldItems = new Map((oldCart?.items || []).map(item => [item.key, item]));
    const newItems = new Map((newCart?.items || []).map(item => [item.key, item]));

    newItems.forEach((item, key) => {
      const oldItem = oldItems.get(key);
      if (!oldItem) {
        diff.items.added.push(item);
      } else if (oldItem.quantity !== item.quantity) {
        diff.items.modified.push({
          item,
          oldQuantity: oldItem.quantity,
          newQuantity: item.quantity
        });
      }
    });

    oldItems.forEach((item, key) => {
      if (!newItems.has(key)) {
        diff.items.removed.push(item);
      }
    });

    return diff;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(cart, oldCart) {
    this.listeners.forEach(callback => {
      try {
        callback(cart, oldCart);
      } catch (e) {
        console.error('[Theme Devtools] Cart listener error:', e);
      }
    });
  }

  startPolling(interval = 2000) {
    if (this.pollInterval) return;
    
    const poll = async () => {
      const cart = await this.fetch();
      if (cart && JSON.stringify(cart) !== JSON.stringify(this.currentCart)) {
        this.setCart(cart);
      }
    };

    poll();
    this.pollInterval = setInterval(poll, interval);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  interceptAjax() {
    const self = this;
    const originalFetch = window.fetch;

    window.fetch = async function(url, options) {
      const response = await originalFetch.apply(this, arguments);

      if (typeof url === 'string' && url.includes('/cart')) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (data && typeof data.item_count !== 'undefined') {
            // During restore or grace period, update cart directly without history
            if (self.isRestoring()) {
              self.currentCart = data;
              self.notify(data, null);
            } else {
              // Use setTimeout to let the original caller finish first
              setTimeout(() => self.setCart(data), 0);
            }
          }
        } catch {}
      }

      return response;
    };

    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string' && url.includes('/cart')) {
        this.addEventListener('load', function() {
          try {
            const data = JSON.parse(this.responseText);
            if (data && typeof data.item_count !== 'undefined') {
              // During restore or grace period, update cart directly without history
              if (self.isRestoring()) {
                self.currentCart = data;
                self.notify(data, null);
              } else {
                setTimeout(() => self.setCart(data), 0);
              }
            }
          } catch {}
        });
      }
      return originalXHR.apply(this, arguments);
    };
  }
}

export const cartAPI = new CartAPI();
