/**
 * Product API Service
 * Fetches full product data including variants and images via /products/{handle}.json
 */

class ProductAPI {
  constructor() {
    this.currentProduct = null;
    this.listeners = new Set();
    this._fetchPromise = null;
  }

  /**
   * Fetch full product data from the JSON endpoint
   * @param {string} handle - Product handle
   * @returns {Promise<Object|null>}
   */
  async fetch(handle) {
    if (!handle) return null;

    try {
      const response = await fetch(`/products/${handle}.json`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.warn(`[Theme Devtools] Product fetch failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.product || null;
    } catch (e) {
      console.error('[Theme Devtools] Product fetch failed:', e);
      return null;
    }
  }

  /**
   * Initialize with product handle from context
   * Merges fetched data with existing context data
   * @param {Object} contextProduct - Product object from Liquid context
   * @returns {Promise<Object|null>}
   */
  async initialize(contextProduct) {
    if (!contextProduct?.handle) {
      this.currentProduct = contextProduct;
      return contextProduct;
    }

    // Avoid duplicate fetches
    if (this._fetchPromise) {
      return this._fetchPromise;
    }

    this._fetchPromise = this._doInitialize(contextProduct);
    const result = await this._fetchPromise;
    this._fetchPromise = null;
    return result;
  }

  async _doInitialize(contextProduct) {
    const fetchedProduct = await this.fetch(contextProduct.handle);

    if (fetchedProduct) {
      // Merge fetched data with context data
      // Context has some properties not in JSON (like selected_variant, metafields_count)
      // JSON has variants and images arrays
      this.currentProduct = {
        ...contextProduct,
        variants: fetchedProduct.variants || [],
        images: fetchedProduct.images || [],
        options: fetchedProduct.options || contextProduct.options,
        body_html: fetchedProduct.body_html,
        // Keep these from context as they may have Liquid-specific data
        selected_variant: contextProduct.selected_variant,
        selected_or_first_available_variant: contextProduct.selected_or_first_available_variant,
        metafields_count: contextProduct.metafields_count
      };
    } else {
      // Fallback to context product if fetch fails
      this.currentProduct = contextProduct;
    }

    this.notify(this.currentProduct);
    return this.currentProduct;
  }

  /**
   * Get a variant by ID
   * @param {number} variantId
   * @returns {Object|null}
   */
  getVariant(variantId) {
    if (!this.currentProduct?.variants) return null;
    return this.currentProduct.variants.find(v => v.id === variantId) || null;
  }

  /**
   * Get all variants
   * @returns {Array}
   */
  getVariants() {
    return this.currentProduct?.variants || [];
  }

  /**
   * Get all images
   * @returns {Array}
   */
  getImages() {
    return this.currentProduct?.images || [];
  }

  /**
   * Subscribe to product updates
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   * @param {Object} product
   */
  notify(product) {
    this.listeners.forEach(callback => {
      try {
        callback(product);
      } catch (e) {
        console.error('[Theme Devtools] Product listener error:', e);
      }
    });
  }
}

export const productAPI = new ProductAPI();
