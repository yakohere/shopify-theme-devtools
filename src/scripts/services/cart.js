function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

class CartAPI {
  constructor() {
    this.listeners = new Set();
    this.currentCart = null;
    this.cartHistory = [];
    this.pollInterval = null;
  }

  async fetch() {
    try {
      const response = await fetch('/cart.js', {
        headers: { 'Accept': 'application/json' }
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
    
    if (oldCart) {
      this.cartHistory.push({
        timestamp: Date.now(),
        diff: this.diffCart(oldCart, cart),
        snapshot: deepClone(oldCart)
      });
      if (this.cartHistory.length > 50) {
        this.cartHistory.shift();
      }
    }
    
    this.notify(cart, oldCart);
  }

  diffCart(oldCart, newCart) {
    const diff = {
      itemCount: { old: oldCart?.item_count || 0, new: newCart?.item_count || 0 },
      totalPrice: { old: oldCart?.total_price || 0, new: newCart?.total_price || 0 },
      items: { added: [], removed: [], modified: [] }
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
            setTimeout(() => self.setCart(data), 0);
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
              setTimeout(() => self.setCart(data), 0);
            }
          } catch {}
        });
      }
      return originalXHR.apply(this, arguments);
    };
  }
}

export const cartAPI = new CartAPI();
