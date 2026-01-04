/**
 * Expression Evaluator Service
 * Evaluates Shopify Liquid expressions using liquidjs
 */

import { Liquid } from 'liquidjs';
import { cartAPI } from './cart.js';
import { productAPI } from './product.js';

class ExpressionEvaluator {
  constructor() {
    this.context = null;
    this.flattenedContext = null;
    this.history = [];
    this.maxHistory = 50;

    // Initialize Liquid engine
    this.engine = new Liquid({
      strictFilters: false,
      strictVariables: false,
      lenientIf: true,
    });

    // Register custom Shopify filters
    this._registerShopifyFilters();
  }

  /**
   * Register Shopify-specific filters that aren't in standard Liquid
   */
  _registerShopifyFilters() {
    // Money filters
    this.engine.registerFilter('money', (value) => {
      const num = Number(value) / 100;
      return '$' + num.toFixed(2);
    });

    this.engine.registerFilter('money_without_currency', (value) => {
      const num = Number(value) / 100;
      return num.toFixed(2);
    });

    this.engine.registerFilter('money_with_currency', (value) => {
      const num = Number(value) / 100;
      const currency = this.context?.objects?.shop?.currency || 'USD';
      return '$' + num.toFixed(2) + ' ' + currency;
    });

    // Type checking helper
    this.engine.registerFilter('type_of', (value) => {
      if (value === null || value === undefined) return 'nil';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    });

    // JSON output (pretty print)
    this.engine.registerFilter('json_pretty', (value) => {
      return JSON.stringify(value, null, 2);
    });

    // Handle URL filters
    this.engine.registerFilter('asset_url', (value) => {
      return `/assets/${value}`;
    });

    this.engine.registerFilter('img_url', (value, size = 'medium') => {
      if (typeof value === 'string') return value;
      return value?.src || '';
    });

    // Shopify-specific string filters
    this.engine.registerFilter('handle', (value) => {
      return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    });

    this.engine.registerFilter('handleize', (value) => {
      return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    });

    // Pluralize filter
    this.engine.registerFilter('pluralize', (count, singular, plural) => {
      return count === 1 ? singular : (plural || singular + 's');
    });

    // Within filter for collections
    this.engine.registerFilter('within', (url, collection) => {
      if (!collection || !collection.url) return url;
      return `${collection.url}${url}`;
    });

    // Link filters (return simplified versions)
    this.engine.registerFilter('link_to', (text, url, title = '') => {
      return `<a href="${url}" title="${title}">${text}</a>`;
    });

    this.engine.registerFilter('link_to_tag', (tag, link = null) => {
      return `<a href="/collections/all/${tag}">${tag}</a>`;
    });

    this.engine.registerFilter('link_to_vendor', (vendor) => {
      return `<a href="/collections/vendors?q=${encodeURIComponent(vendor)}">${vendor}</a>`;
    });

    this.engine.registerFilter('link_to_type', (type) => {
      return `<a href="/collections/types?q=${encodeURIComponent(type)}">${type}</a>`;
    });

    // Highlight filter
    this.engine.registerFilter('highlight', (text, term) => {
      if (!term) return text;
      const regex = new RegExp(`(${term})`, 'gi');
      return String(text).replace(regex, '<strong>$1</strong>');
    });

    // Metafield value filter (unwrap metafield objects)
    this.engine.registerFilter('metafield_value', (metafield) => {
      if (metafield && typeof metafield === 'object' && 'value' in metafield) {
        return metafield.value;
      }
      return metafield;
    });
  }

  /**
   * Set the context data from the parsed Shopify context
   */
  setContext(context) {
    this.context = context;
    this.flattenedContext = null; // Reset cache
  }

  /**
   * Build the Liquid context from Shopify context
   */
  _buildLiquidContext() {
    if (!this.context) return {};

    // Get live cart from cartAPI if available
    const liveCart = cartAPI.currentCart;

    // Get live product from productAPI if available (includes variants/images)
    const liveProduct = productAPI.currentProduct;

    const liquidContext = {
      // Objects (product, collection, cart, shop, etc.)
      ...(this.context.objects || {}),
      // Override cart with live cart data if available
      ...(liveCart ? { cart: liveCart } : {}),
      // Override product with live product data if available (includes variants/images)
      ...(liveProduct ? { product: liveProduct } : {}),
      // Meta info
      template: this.context.meta?.template,
      request: this.context.meta?.request,
      theme: this.context.meta?.theme,
      localization: this.context.meta?.localization,
      // Settings
      settings: this.context.settings,
    };

    // Merge metafields into objects
    if (this.context.metafields) {
      for (const [resource, namespaces] of Object.entries(this.context.metafields)) {
        if (liquidContext[resource]) {
          // Create metafields object that auto-unwraps values
          const metafieldsProxy = {};
          for (const [namespace, fields] of Object.entries(namespaces)) {
            metafieldsProxy[namespace] = {};
            for (const [field, data] of Object.entries(fields)) {
              // Store the unwrapped value directly for easier access
              metafieldsProxy[namespace][field] = data?.value ?? data;
            }
          }
          liquidContext[resource] = {
            ...liquidContext[resource],
            metafields: metafieldsProxy
          };
        }
      }
    }

    return liquidContext;
  }

  /**
   * Evaluate an expression and return the result (async)
   * @param {string} expression - e.g., "{{ product.title | upcase }}"
   * @returns {Promise<{ success: boolean, value: any, error?: string, expression: string }>}
   */
  async evaluate(expression) {
    if (!expression || !expression.trim()) {
      return { success: false, error: 'Empty expression', expression };
    }

    const trimmed = expression.trim();
    const liquidContext = this._buildLiquidContext();

    try {
      // Check if this is a simple path expression (no filters, no tags)
      // e.g., "cart", "product.title", "cart.items[0].title"
      const isSimplePath = /^[\w.\[\]0-9]+$/.test(trimmed) &&
                           !trimmed.includes('{%') &&
                           !trimmed.includes('{{') &&
                           !trimmed.includes('|');

      if (isSimplePath) {
        // Resolve path directly to preserve object types
        const value = this._resolvePath(trimmed, liquidContext);
        // If value is undefined but we have context, it might just be an invalid path
        // Still return it so user sees undefined
        this.addToHistory(trimmed);
        return { success: true, value, expression: trimmed };
      }

      // For complex expressions, use liquidjs
      let template = trimmed;
      if (!trimmed.includes('{%') && !trimmed.includes('{{')) {
        template = `{{ ${trimmed} }}`;
      }

      const result = await this.engine.parseAndRender(template, liquidContext);

      // Add to history
      this.addToHistory(trimmed);

      // Try to parse the result back to a proper type
      const parsedValue = this._parseResult(result.trim());

      return { success: true, value: parsedValue, expression: trimmed };
    } catch (error) {
      return { success: false, error: error.message, expression: trimmed };
    }
  }

  /**
   * Resolve a simple dot-notation path to get raw value
   * @param {string} path - e.g., "cart.items[0].title"
   * @param {object} context - The liquid context object
   */
  _resolvePath(path, context) {
    if (!context) return undefined;

    // Handle array notation: cart.items[0] -> cart.items.0
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.').filter(p => p !== '');

    let value = context;
    for (const part of parts) {
      if (value == null) return undefined;
      value = value[part];
    }
    return value;
  }

  /**
   * Try to parse the rendered result back to appropriate type
   */
  _parseResult(result) {
    // Empty string
    if (result === '') return '';

    // Check for undefined/nil
    if (result === '' || result === 'nil' || result === 'null') {
      return null;
    }

    // Check for boolean
    if (result === 'true') return true;
    if (result === 'false') return false;

    // Check for number
    if (/^-?\d+(\.\d+)?$/.test(result)) {
      return Number(result);
    }

    // Check for JSON array or object
    if ((result.startsWith('[') && result.endsWith(']')) ||
        (result.startsWith('{') && result.endsWith('}'))) {
      try {
        return JSON.parse(result);
      } catch {
        // Not valid JSON, return as string
      }
    }

    return result;
  }

  /**
   * Get autocomplete suggestions for a partial expression
   * @param {string} partial - The partial expression being typed
   * @returns {Array<{ value: string, type: string, preview?: any }>}
   */
  getCompletions(partial) {
    if (!this.context) return [];

    // Clean up the partial - remove {{ }} and trim
    let cleaned = partial.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();

    // Check if we're in a tag context
    const tagMatch = cleaned.match(/\{%\s*(\w+)?\s*$/);
    if (tagMatch) {
      return this._getTagCompletions(tagMatch[1] || '');
    }

    // Check if we're completing a filter
    const pipeIndex = cleaned.lastIndexOf('|');
    if (pipeIndex !== -1) {
      const afterPipe = cleaned.slice(pipeIndex + 1).trim();
      // Only show filter completions if we're right after | or typing a filter name
      if (afterPipe === '' || /^\w*$/.test(afterPipe)) {
        return this._getFilterCompletions(afterPipe);
      }
    }

    // Check if we're typing after a dot or bracket (need dynamic resolution)
    // e.g., "cart.items[0]." or "product.variants[0]."
    const bracketDotMatch = cleaned.match(/^(.+\[\d+\])\.(\w*)$/);
    if (bracketDotMatch) {
      const basePath = bracketDotMatch[1]; // e.g., "cart.items[0]"
      const propertyPrefix = bracketDotMatch[2]; // e.g., "" or partial property name
      return this._getDynamicCompletions(basePath, propertyPrefix);
    }

    // Get path completions from pre-cached paths
    const allPaths = this._getAllPaths();

    // Filter by partial match
    const lowerPartial = cleaned.toLowerCase();
    return allPaths
      .filter(item => item.path.toLowerCase().startsWith(lowerPartial))
      .slice(0, 20)
      .map(item => ({
        value: item.path,
        type: item.type,
        preview: item.preview
      }));
  }

  /**
   * Get dynamic completions by resolving a path at runtime
   * Used for array access like cart.items[0].
   */
  _getDynamicCompletions(basePath, propertyPrefix) {
    const liquidContext = this._buildLiquidContext();
    const baseValue = this._resolvePath(basePath, liquidContext);

    if (baseValue == null || typeof baseValue !== 'object') {
      return [];
    }

    const completions = [];
    const lowerPrefix = propertyPrefix.toLowerCase();

    for (const [key, value] of Object.entries(baseValue)) {
      if (key.toLowerCase().startsWith(lowerPrefix)) {
        const fullPath = `${basePath}.${key}`;
        let type = 'property';
        let preview = value;

        if (Array.isArray(value)) {
          type = 'array';
          preview = `[${value.length} items]`;
        } else if (typeof value === 'object' && value !== null) {
          type = 'object';
          preview = `{${Object.keys(value).length} keys}`;
        } else if (typeof value === 'string') {
          type = 'string';
          preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        }

        completions.push({
          value: fullPath,
          type,
          preview
        });
      }
    }

    return completions.slice(0, 20);
  }

  /**
   * Get tag completions
   */
  _getTagCompletions(partial) {
    const tags = [
      { value: 'if', type: 'tag', preview: 'Conditional' },
      { value: 'elsif', type: 'tag', preview: 'Else if' },
      { value: 'else', type: 'tag', preview: 'Else' },
      { value: 'endif', type: 'tag', preview: 'End if' },
      { value: 'unless', type: 'tag', preview: 'Negative conditional' },
      { value: 'endunless', type: 'tag', preview: 'End unless' },
      { value: 'case', type: 'tag', preview: 'Switch statement' },
      { value: 'when', type: 'tag', preview: 'Case option' },
      { value: 'endcase', type: 'tag', preview: 'End case' },
      { value: 'for', type: 'tag', preview: 'Loop' },
      { value: 'endfor', type: 'tag', preview: 'End loop' },
      { value: 'break', type: 'tag', preview: 'Exit loop' },
      { value: 'continue', type: 'tag', preview: 'Skip iteration' },
      { value: 'assign', type: 'tag', preview: 'Assign variable' },
      { value: 'capture', type: 'tag', preview: 'Capture output' },
      { value: 'endcapture', type: 'tag', preview: 'End capture' },
      { value: 'increment', type: 'tag', preview: 'Increment counter' },
      { value: 'decrement', type: 'tag', preview: 'Decrement counter' },
      { value: 'comment', type: 'tag', preview: 'Comment block' },
      { value: 'endcomment', type: 'tag', preview: 'End comment' },
      { value: 'raw', type: 'tag', preview: 'Raw output' },
      { value: 'endraw', type: 'tag', preview: 'End raw' },
      { value: 'render', type: 'tag', preview: 'Render snippet' },
      { value: 'section', type: 'tag', preview: 'Render section' },
      { value: 'form', type: 'tag', preview: 'Form tag' },
      { value: 'endform', type: 'tag', preview: 'End form' },
      { value: 'paginate', type: 'tag', preview: 'Pagination' },
      { value: 'endpaginate', type: 'tag', preview: 'End pagination' },
    ];

    const lowerPartial = partial.toLowerCase();
    return tags
      .filter(tag => tag.value.startsWith(lowerPartial))
      .slice(0, 15);
  }

  /**
   * Get filter completions
   */
  _getFilterCompletions(partial) {
    const filters = [
      // String filters
      { value: 'append', preview: 'Append string' },
      { value: 'prepend', preview: 'Prepend string' },
      { value: 'capitalize', preview: 'Capitalize first letter' },
      { value: 'downcase', preview: 'Convert to lowercase' },
      { value: 'upcase', preview: 'Convert to uppercase' },
      { value: 'strip', preview: 'Trim whitespace' },
      { value: 'lstrip', preview: 'Trim left whitespace' },
      { value: 'rstrip', preview: 'Trim right whitespace' },
      { value: 'strip_html', preview: 'Remove HTML tags' },
      { value: 'strip_newlines', preview: 'Remove newlines' },
      { value: 'newline_to_br', preview: 'Convert newlines to <br>' },
      { value: 'replace', preview: 'Replace substring' },
      { value: 'replace_first', preview: 'Replace first occurrence' },
      { value: 'remove', preview: 'Remove substring' },
      { value: 'remove_first', preview: 'Remove first occurrence' },
      { value: 'truncate', preview: 'Truncate to length' },
      { value: 'truncatewords', preview: 'Truncate to word count' },
      { value: 'split', preview: 'Split into array' },
      { value: 'slice', preview: 'Extract substring' },
      { value: 'escape', preview: 'HTML escape' },
      { value: 'escape_once', preview: 'HTML escape once' },
      { value: 'url_encode', preview: 'URL encode' },
      { value: 'url_decode', preview: 'URL decode' },
      { value: 'base64_encode', preview: 'Base64 encode' },
      { value: 'base64_decode', preview: 'Base64 decode' },
      { value: 'handle', preview: 'Convert to handle' },
      { value: 'handleize', preview: 'Convert to handle' },

      // Number filters
      { value: 'abs', preview: 'Absolute value' },
      { value: 'ceil', preview: 'Round up' },
      { value: 'floor', preview: 'Round down' },
      { value: 'round', preview: 'Round to precision' },
      { value: 'plus', preview: 'Add number' },
      { value: 'minus', preview: 'Subtract number' },
      { value: 'times', preview: 'Multiply' },
      { value: 'divided_by', preview: 'Divide' },
      { value: 'modulo', preview: 'Remainder' },
      { value: 'at_least', preview: 'Minimum value' },
      { value: 'at_most', preview: 'Maximum value' },

      // Array filters
      { value: 'join', preview: 'Join array' },
      { value: 'first', preview: 'Get first element' },
      { value: 'last', preview: 'Get last element' },
      { value: 'size', preview: 'Get length' },
      { value: 'reverse', preview: 'Reverse array' },
      { value: 'sort', preview: 'Sort array' },
      { value: 'sort_natural', preview: 'Natural sort' },
      { value: 'uniq', preview: 'Remove duplicates' },
      { value: 'map', preview: 'Extract property' },
      { value: 'where', preview: 'Filter array' },
      { value: 'compact', preview: 'Remove nil values' },
      { value: 'concat', preview: 'Concatenate arrays' },

      // Date filters
      { value: 'date', preview: 'Format date' },

      // Utility filters
      { value: 'default', preview: 'Default if nil' },
      { value: 'json', preview: 'Convert to JSON' },
      { value: 'json_pretty', preview: 'Pretty JSON' },
      { value: 'type_of', preview: 'Get type' },

      // Shopify money filters
      { value: 'money', preview: 'Format as money' },
      { value: 'money_with_currency', preview: 'Money with currency' },
      { value: 'money_without_currency', preview: 'Money without currency' },

      // Shopify URL filters
      { value: 'asset_url', preview: 'Asset URL' },
      { value: 'img_url', preview: 'Image URL' },
      { value: 'link_to', preview: 'Create link' },

      // Other Shopify filters
      { value: 'pluralize', preview: 'Pluralize word' },
      { value: 'highlight', preview: 'Highlight text' },
      { value: 'metafield_value', preview: 'Get metafield value' },
    ];

    const lowerPartial = partial.toLowerCase();
    return filters
      .filter(f => f.value.startsWith(lowerPartial))
      .slice(0, 15)
      .map(f => ({ ...f, type: 'filter' }));
  }

  /**
   * Get all available paths for autocomplete
   */
  _getAllPaths() {
    // Build base paths from context (cached)
    if (!this.flattenedContext) {
      const paths = [];

      // Add object paths (excluding cart and product - we'll add live data separately)
      if (this.context?.objects) {
        for (const [key, value] of Object.entries(this.context.objects)) {
          if (value != null && key !== 'cart' && key !== 'product') {
            this._addPaths(paths, key, value, 3);
          }
        }
      }

      // Add meta paths
      if (this.context?.meta) {
        this._addPaths(paths, 'template', this.context.meta.template, 2);
        this._addPaths(paths, 'request', this.context.meta.request, 2);
        this._addPaths(paths, 'theme', this.context.meta.theme, 2);
      }

      // Add metafield paths
      if (this.context?.metafields) {
        for (const [resource, namespaces] of Object.entries(this.context.metafields)) {
          if (namespaces && this.context.objects?.[resource]) {
            for (const [namespace, fields] of Object.entries(namespaces)) {
              for (const [field, data] of Object.entries(fields)) {
                paths.push({
                  path: `${resource}.metafields.${namespace}.${field}`,
                  type: data?.type || 'metafield',
                  preview: data?.value
                });
              }
            }
          }
        }
      }

      this.flattenedContext = paths;
    }

    // Always add fresh cart paths from live cart
    const allPaths = [...this.flattenedContext];
    const liveCart = cartAPI.currentCart;
    if (liveCart) {
      this._addPaths(allPaths, 'cart', liveCart, 3);
    } else if (this.context?.objects?.cart) {
      // Fall back to context cart if no live cart
      this._addPaths(allPaths, 'cart', this.context.objects.cart, 3);
    }

    // Always add fresh product paths from live product (includes variants/images)
    const liveProduct = productAPI.currentProduct;
    if (liveProduct) {
      this._addPaths(allPaths, 'product', liveProduct, 3);
    } else if (this.context?.objects?.product) {
      // Fall back to context product if no live product
      this._addPaths(allPaths, 'product', this.context.objects.product, 3);
    }

    return allPaths;
  }

  /**
   * Recursively add paths from an object
   */
  _addPaths(paths, prefix, obj, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth || obj == null) return;

    const type = Array.isArray(obj) ? 'array' : typeof obj;

    paths.push({
      path: prefix,
      type,
      preview: this._getPreview(obj)
    });

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('_')) continue;
        this._addPaths(paths, `${prefix}.${key}`, value, maxDepth, currentDepth + 1);
      }
    } else if (Array.isArray(obj) && obj.length > 0) {
      this._addPaths(paths, `${prefix}[0]`, obj[0], maxDepth, currentDepth + 1);
    }
  }

  /**
   * Get a preview string for a value
   */
  _getPreview(value) {
    if (value == null) return 'null';
    if (typeof value === 'string') {
      return value.length > 50 ? value.slice(0, 50) + '...' : value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (Array.isArray(value)) {
      return `Array(${value.length})`;
    }
    if (typeof value === 'object') {
      return `Object(${Object.keys(value).length})`;
    }
    return String(value);
  }

  /**
   * Add expression to history
   */
  addToHistory(expression) {
    if (this.history[this.history.length - 1] === expression) {
      return;
    }

    this.history.push(expression);

    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * Get history array
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }
}

export const expressionEvaluator = new ExpressionEvaluator();
