/**
 * Context Serializer for AI Panel
 * Intelligently serializes and summarizes theme context for AI consumption
 * while managing token limits
 */

import { cartAPI } from './cart.js';
import { networkInterceptor } from './network-interceptor.js';
import { accessibilityService } from './accessibility.js';
import { analyticsService } from './analytics.js';

// Approximate token counts (rough estimates)
const MAX_CONTEXT_TOKENS = 8000; // Increased for full context mode
const CHARS_PER_TOKEN = 4; // Rough approximation

// Default options for each mode
export const CONTEXT_OPTIONS = {
  cart: { label: 'Cart', description: 'Current cart state' },
  cartHistory: { label: 'Cart History', description: 'Recent cart changes' },
  metafields: { label: 'Metafields', description: 'Resource metafields' },
  sectionSchemas: { label: 'Section Schemas', description: 'Section settings schemas' },
  network: { label: 'Network', description: 'Recent API requests' },
  networkPayloads: { label: 'Network Payloads', description: 'Request/response bodies' },
  cookies: { label: 'Cookies', description: 'Browser cookies' },
  localStorage: { label: 'localStorage', description: 'Local storage data' },
  sessionStorage: { label: 'sessionStorage', description: 'Session storage data' },
  liquidErrors: { label: 'Liquid Errors', description: 'Detected Liquid errors' },
  accessibility: { label: 'Accessibility', description: 'A11y issues & score' },
  htmlStructure: { label: 'HTML Structure', description: 'Page DOM structure' },
  analytics: { label: 'Analytics', description: 'Tracked events & pixels' },
};

/**
 * Question patterns for smart context detection
 * Maps keywords/phrases to context options that should be included
 */
const SMART_CONTEXT_PATTERNS = {
  // Cart-related questions
  cart: {
    patterns: [
      /\bcart\b/i,
      /\bcheckout\b/i,
      /\badd(ed|ing)?\s+(to\s+)?cart\b/i,
      /\bremov(e|ed|ing)\s+(from\s+)?cart\b/i,
      /\bline\s*items?\b/i,
      /\bquantity\b/i,
      /\bdiscount(s|ed|ing)?\b/i,
      /\bcoupon\b/i,
      /\bpromo(tion)?\s*code\b/i,
      /\btotal\s*(price|cost)?\b/i,
      /\bsubtotal\b/i,
      /\bshopping\b/i,
    ],
    options: { cart: true, cartHistory: true },
  },

  // Network/API questions
  network: {
    patterns: [
      /\bnetwork\b/i,
      /\bapi\s*(call|request|response)?\b/i,
      /\brequest(s|ed|ing)?\b/i,
      /\bresponse(s)?\b/i,
      /\bfetch(ed|ing)?\b/i,
      /\bajax\b/i,
      /\bhttp\b/i,
      /\bendpoint\b/i,
      /\bpayload\b/i,
      /\bstatus\s*code\b/i,
      /\b(get|post|put|delete)\s+request\b/i,
      /\bapi\s*error\b/i,
      /\bfailed\s*(to\s*)?(load|fetch|request)\b/i,
    ],
    options: { network: true, networkPayloads: true },
  },

  // Metafield questions
  metafields: {
    patterns: [
      /\bmetafield(s)?\b/i,
      /\bcustom\s*(field|data|attribute)\b/i,
      /\bnamespace\b/i,
      /\bproduct\s*data\b/i,
      /\bcollection\s*data\b/i,
      /\bcustomer\s*data\b/i,
    ],
    options: { metafields: true },
  },

  // Storage questions
  storage: {
    patterns: [
      /\blocal\s*storage\b/i,
      /\bsession\s*storage\b/i,
      /\bstor(e|ed|age|ing)\b/i,
      /\bpersist(ed|ent|ing)?\b/i,
      /\bcache(d|ing)?\b/i,
      /\bsave(d)?\s*(data|state)?\b/i,
      /\bremember(ed|ing)?\b/i,
    ],
    options: { localStorage: true, sessionStorage: true },
  },

  // Cookie questions
  cookies: {
    patterns: [
      /\bcookie(s)?\b/i,
      /\btrack(er|ing)?\b/i,
      /\bsession\s*(id|token)?\b/i,
      /\blogin\s*state\b/i,
      /\bauthenticat(e|ed|ion)\b/i,
      /\blogged\s*(in|out)\b/i,
    ],
    options: { cookies: true },
  },

  // Accessibility questions
  accessibility: {
    patterns: [
      /\baccessib(le|ility)\b/i,
      /\ba11y\b/i,
      /\bwcag\b/i,
      /\bscreen\s*reader\b/i,
      /\baria\b/i,
      /\balt\s*(text|tag|attribute)\b/i,
      /\bcontrast\b/i,
      /\bkeyboard\s*(nav|access|focus)\b/i,
      /\bfocus\s*(state|ring|indicator)\b/i,
      /\bheading(s)?\s*(hierarchy|structure|order)\b/i,
      /\bskip\s*link\b/i,
      /\blandmark(s)?\b/i,
      /\blabel(led|s)?\s*(input|field|form)\b/i,
    ],
    options: { accessibility: true },
  },

  // Liquid error questions
  liquidErrors: {
    patterns: [
      /\bliquid\s*(error|issue|problem|bug)\b/i,
      /\btemplate\s*(error|issue|problem)\b/i,
      /\brender(ing)?\s*(error|issue|problem|fail)\b/i,
      /\bundefined\s*(variable|object|property)\b/i,
      /\bnil\b/i,
      /\bempty\s*(output|value|result)\b/i,
      /\bnot\s*(showing|displaying|rendering)\b/i,
      /\bmissing\s*(data|content|value)\b/i,
    ],
    options: { liquidErrors: true },
  },

  // Product questions (ensure product data is fresh)
  product: {
    patterns: [
      /\bproduct\b/i,
      /\bvariant(s)?\b/i,
      /\bprice\b/i,
      /\bsku\b/i,
      /\binventory\b/i,
      /\bstock\b/i,
      /\bavailab(le|ility)\b/i,
      /\boption(s)?\b/i,
      /\bselect(ed|ion)?\s*(variant|option)\b/i,
    ],
    options: { /* product context is always included */ },
  },

  // Customer questions
  customer: {
    patterns: [
      /\bcustomer\b/i,
      /\buser\b/i,
      /\baccount\b/i,
      /\blogin\b/i,
      /\border(s)?\s*history\b/i,
      /\baddress(es)?\b/i,
      /\btag(s|ged)?\s*customer\b/i,
    ],
    options: { /* customer context is always included */ },
  },

  // Debugging/troubleshooting questions
  debug: {
    patterns: [
      /\bdebug(ging)?\b/i,
      /\btroubleshoot(ing)?\b/i,
      /\bwhy\s*(is|isn't|doesn't|won't|can't)\b/i,
      /\bnot\s*working\b/i,
      /\bbroken\b/i,
      /\bbug\b/i,
      /\bissue\b/i,
      /\bproblem\b/i,
      /\berror\b/i,
      /\bfail(ed|ing|s)?\b/i,
      /\bfix\b/i,
    ],
    options: { network: true, liquidErrors: true },
  },

  // Section/schema questions
  sections: {
    patterns: [
      /\bsection(s)?\b/i,
      /\bschema\b/i,
      /\bsetting(s)?\b/i,
      /\bblock(s)?\b/i,
      /\bpreset(s)?\b/i,
      /\bcustomiz(e|ation)\b/i,
      /\btheme\s*editor\b/i,
      /\bconfig(uration)?\b/i,
    ],
    options: { sectionSchemas: true },
  },

  // Code/HTML structure questions
  codeStructure: {
    patterns: [
      /\bhtml\b/i,
      /\bdom\b/i,
      /\belement(s)?\b/i,
      /\bstructure\b/i,
      /\bclass(es)?\b/i,
      /\bselector(s)?\b/i,
      /\bmarkup\b/i,
      /\btemplate\b/i,
      /\blayout\b/i,
      /\bwrapper\b/i,
      /\bcontainer\b/i,
    ],
    options: { htmlStructure: true },
  },

  // Code generation questions
  codeGen: {
    patterns: [
      /\bgenerate\b/i,
      /\bcreate\b/i,
      /\bwrite\b/i,
      /\badd\b/i,
      /\bimplement\b/i,
      /\bbuild\b/i,
      /\bcode\b/i,
      /\bliquid\b/i,
    ],
    options: { sectionSchemas: true, htmlStructure: true },
  },

  // Analytics/tracking questions
  analytics: {
    patterns: [
      /\banalytics\b/i,
      /\btrack(ing|ed|er)?\b/i,
      /\bpixel(s)?\b/i,
      /\bga4\b/i,
      /\bgoogle\s*analytics\b/i,
      /\bfacebook\s*(pixel|tracking)\b/i,
      /\bfbq?\b/i,
      /\btiktok\s*(pixel|tracking)\b/i,
      /\bttq\b/i,
      /\bpinterest\b/i,
      /\bsnapchat\b/i,
      /\bklaviyo\b/i,
      /\bdatalayer\b/i,
      /\bgtm\b/i,
      /\btag\s*manager\b/i,
      /\bconversion(s)?\b/i,
      /\bevent(s)?\s*(track|fire|send)\b/i,
      /\bpurchase\s*(event|tracking)\b/i,
      /\badd\s*to\s*cart\s*(event|tracking)\b/i,
      /\bpage\s*view\b/i,
      /\becommerce\s*(tracking|events)\b/i,
    ],
    options: { analytics: true },
  },
};

class ContextSerializer {
  constructor() {
    this.contextCache = null;
    this.lastContext = null;
    // External data providers (set by AI panel)
    this.liquidErrorsProvider = null;
    this.accessibilityProvider = null;
  }

  /**
   * Set external data providers for liquid errors and accessibility
   */
  setProviders({ liquidErrors, accessibility }) {
    if (liquidErrors) this.liquidErrorsProvider = liquidErrors;
    if (accessibility) this.accessibilityProvider = accessibility;
  }

  /**
   * Analyze a question and determine which context options are relevant
   * @param {string} question - The user's question
   * @returns {Object} - Options object with relevant context flags
   */
  analyzeQuestion(question) {
    if (!question || typeof question !== 'string') {
      return this._getDefaultOptions();
    }

    const detectedOptions = {
      cart: true, // Always include cart by default
      cartHistory: false,
      metafields: false,
      sectionSchemas: false,
      network: false,
      networkPayloads: false,
      cookies: false,
      localStorage: false,
      sessionStorage: false,
      liquidErrors: false,
      accessibility: false,
      htmlStructure: false,
      analytics: false,
    };

    const matchedCategories = [];

    // Check each pattern category
    for (const [category, config] of Object.entries(SMART_CONTEXT_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(question)) {
          matchedCategories.push(category);
          // Merge the options for this category
          Object.assign(detectedOptions, config.options);
          break; // Only need one match per category
        }
      }
    }

    // Log detected context for debugging (can be removed in production)
    if (matchedCategories.length > 0) {
      console.debug('[AI Context] Detected categories:', matchedCategories.join(', '));
    }

    return {
      options: detectedOptions,
      categories: matchedCategories,
    };
  }

  /**
   * Get default options for when no specific context is detected
   */
  _getDefaultOptions() {
    return {
      options: {
        cart: true,
        cartHistory: false,
        metafields: true,
        sectionSchemas: false,
        network: false,
        networkPayloads: false,
        cookies: false,
        localStorage: false,
        sessionStorage: false,
        liquidErrors: false,
        accessibility: false,
        htmlStructure: false,
        analytics: false,
      },
      categories: [],
    };
  }

  /**
   * Serialize context with smart detection based on question
   * @param {Object} context - The theme devtools context
   * @param {string} question - The user's question to analyze
   * @returns {Object} - { serialized: string, includedContext: string[] }
   */
  serializeSmart(context, question) {
    const { options, categories } = this.analyzeQuestion(question);

    const serialized = this.serialize(context, {
      includeCart: options.cart,
      includeCartHistory: options.cartHistory,
      includeMetafields: options.metafields,
      includeSectionSchemas: options.sectionSchemas,
      includeNetwork: options.network,
      includeNetworkPayloads: options.networkPayloads,
      includeCookies: options.cookies,
      includeLocalStorage: options.localStorage,
      includeSessionStorage: options.sessionStorage,
      includeLiquidErrors: options.liquidErrors,
      includeAccessibility: options.accessibility,
      includeHtmlStructure: options.htmlStructure,
      includeAnalytics: options.analytics,
    });

    // Build list of included context for display
    const includedContext = ['Page Info', 'Shop Info'];
    if (options.cart) includedContext.push('Cart');
    if (options.cartHistory) includedContext.push('Cart History');
    if (options.metafields) includedContext.push('Metafields');
    if (options.sectionSchemas) includedContext.push('Section Schemas');
    if (options.network) includedContext.push('Network');
    if (options.networkPayloads) includedContext.push('Network Payloads');
    if (options.cookies) includedContext.push('Cookies');
    if (options.localStorage) includedContext.push('localStorage');
    if (options.sessionStorage) includedContext.push('sessionStorage');
    if (options.liquidErrors) includedContext.push('Liquid Errors');
    if (options.accessibility) includedContext.push('Accessibility');
    if (options.htmlStructure) includedContext.push('HTML Structure');
    if (options.analytics) includedContext.push('Analytics');

    return {
      serialized,
      includedContext,
      detectedCategories: categories,
    };
  }

  /**
   * Serialize the full context for AI consumption
   * @param {Object} context - The theme devtools context
   * @param {Object} options - Serialization options
   * @returns {string} Serialized context string
   */
  serialize(context, options = {}) {
    const {
      includeCart = true,
      includeCartHistory = false,
      includeMetafields = true,
      includeSectionSchemas = false,
      includeNetwork = false,
      includeNetworkPayloads = false,
      includeCookies = false,
      includeLocalStorage = false,
      includeSessionStorage = false,
      includeLiquidErrors = false,
      includeAccessibility = false,
      includeHtmlStructure = false,
      includeAnalytics = false,
    } = options;

    const sections = [];

    // 1. Page Info (always include - small)
    sections.push(this._serializePageInfo(context));

    // 2. Shop Info (always include - small)
    sections.push(this._serializeShopInfo(context));

    // 3. Current Resource (product/collection/article/page)
    const resourceSection = this._serializeCurrentResource(context);
    if (resourceSection) {
      sections.push(resourceSection);
    }

    // 4. Customer Info (if logged in)
    const customerSection = this._serializeCustomer(context);
    if (customerSection) {
      sections.push(customerSection);
    }

    // 5. Cart (live data)
    if (includeCart) {
      sections.push(this._serializeCart());
    }

    // 6. Cart History (optional, can be large)
    if (includeCartHistory) {
      sections.push(this._serializeCartHistory());
    }

    // 7. Metafields (can be large)
    if (includeMetafields) {
      sections.push(this._serializeMetafields(context));
    }

    // 7b. Section Schemas (extracted from page)
    if (includeSectionSchemas) {
      sections.push(this._serializeSectionSchemas());
    }

    // 8. Recent Network Requests
    if (includeNetwork) {
      sections.push(this._serializeNetworkRequests(includeNetworkPayloads));
    }

    // 9. Cookies
    if (includeCookies) {
      sections.push(this._serializeCookies());
    }

    // 10. localStorage
    if (includeLocalStorage) {
      sections.push(this._serializeStorage('localStorage'));
    }

    // 11. sessionStorage
    if (includeSessionStorage) {
      sections.push(this._serializeStorage('sessionStorage'));
    }

    // 12. Liquid Errors
    if (includeLiquidErrors) {
      sections.push(this._serializeLiquidErrors());
    }

    // 13. Accessibility Issues
    if (includeAccessibility) {
      sections.push(this._serializeAccessibility());
    }

    // 14. HTML Structure
    if (includeHtmlStructure) {
      sections.push(this._serializeHtmlStructure());
    }

    // 15. Analytics Events
    if (includeAnalytics) {
      sections.push(this._serializeAnalytics());
    }

    // Join sections and check token limit
    let result = sections.filter(Boolean).join('\n\n');

    // Truncate if too long
    const maxChars = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;
    if (result.length > maxChars) {
      result = result.substring(0, maxChars) + '\n\n[Context truncated due to size limits]';
    }

    return result;
  }

  /**
   * Get a minimal context summary for quick questions
   */
  serializeMinimal(context) {
    return this.serialize(context, {
      includeCart: true,
      includeCartHistory: false,
      includeMetafields: false,
      includeNetwork: false,
    });
  }

  /**
   * Get full context including everything
   */
  serializeFull(context) {
    return this.serialize(context, {
      includeCart: true,
      includeCartHistory: true,
      includeMetafields: true,
      includeSectionSchemas: true,
      includeNetwork: true,
      includeNetworkPayloads: true,
      includeCookies: true,
      includeLocalStorage: true,
      includeSessionStorage: true,
      includeLiquidErrors: true,
      includeAccessibility: true,
      includeHtmlStructure: true,
      includeAnalytics: true,
    });
  }

  /**
   * Serialize with custom options selected by user
   */
  serializeCustom(context, customOptions) {
    return this.serialize(context, {
      includeCart: customOptions.cart ?? true,
      includeCartHistory: customOptions.cartHistory ?? false,
      includeMetafields: customOptions.metafields ?? false,
      includeSectionSchemas: customOptions.sectionSchemas ?? false,
      includeNetwork: customOptions.network ?? false,
      includeNetworkPayloads: customOptions.networkPayloads ?? false,
      includeCookies: customOptions.cookies ?? false,
      includeLocalStorage: customOptions.localStorage ?? false,
      includeSessionStorage: customOptions.sessionStorage ?? false,
      includeLiquidErrors: customOptions.liquidErrors ?? false,
      includeAccessibility: customOptions.accessibility ?? false,
      includeHtmlStructure: customOptions.htmlStructure ?? false,
      includeAnalytics: customOptions.analytics ?? false,
    });
  }

  _serializePageInfo(context) {
    const { meta } = context || {};
    if (!meta) return null;

    return `## Page Info
- Template: ${meta.template?.name || 'unknown'}${meta.template?.suffix ? `.${meta.template.suffix}` : ''}
- Page Type: ${meta.request?.page_type || 'unknown'}
- Path: ${meta.request?.path || '/'}
- Design Mode: ${meta.request?.design_mode ? 'Yes' : 'No'}
- Theme: ${meta.theme?.name || 'unknown'} (${meta.theme?.role || 'unknown'})
- Locale: ${meta.request?.locale?.iso_code || 'unknown'}
- Market: ${meta.localization?.market?.handle || 'default'}
- Currency: ${meta.localization?.country?.currency?.iso_code || 'unknown'}`;
  }

  _serializeShopInfo(context) {
    const shop = context?.objects?.shop;
    if (!shop) return null;

    return `## Shop
- Name: ${shop.name}
- Domain: ${shop.domain}
- Currency: ${shop.currency}
- Money Format: ${shop.money_format}
- Enabled Currencies: ${(shop.enabled_currencies || []).join(', ')}
- Enabled Locales: ${(shop.enabled_locales || []).join(', ')}`;
  }

  _serializeCurrentResource(context) {
    const { objects } = context || {};
    if (!objects) return null;

    // Product
    if (objects.product) {
      const p = objects.product;
      return `## Current Product
- ID: ${p.id}
- Title: ${p.title}
- Handle: ${p.handle}
- Type: ${p.type || 'N/A'}
- Vendor: ${p.vendor || 'N/A'}
- Available: ${p.available}
- Price: ${p.price} cents (${this._formatMoney(p.price)})
- Compare at Price: ${p.compare_at_price ? `${p.compare_at_price} cents (${this._formatMoney(p.compare_at_price)})` : 'N/A'}
- Price Range: ${this._formatMoney(p.price_min)} - ${this._formatMoney(p.price_max)}
- Variants Count: ${p.variants_count}
- Options: ${JSON.stringify(p.options)}
- Tags: ${(p.tags || []).join(', ') || 'None'}
- Has Only Default Variant: ${p.has_only_default_variant}
- Requires Selling Plan: ${p.requires_selling_plan}
- Selected Variant: ${p.selected_variant?.id ? `ID ${p.selected_variant.id} - ${p.selected_variant.title} (${this._formatMoney(p.selected_variant.price)})` : 'None'}
- First Available Variant: ${p.selected_or_first_available_variant?.id ? `ID ${p.selected_or_first_available_variant.id} - ${p.selected_or_first_available_variant.title}` : 'None'}`;
    }

    // Collection
    if (objects.collection) {
      const c = objects.collection;
      return `## Current Collection
- ID: ${c.id}
- Title: ${c.title}
- Handle: ${c.handle}
- Products Count: ${c.products_count}
- All Products Count: ${c.all_products_count}
- Sort By: ${c.sort_by || 'default'}
- Default Sort: ${c.default_sort_by}
- Tags: ${(c.all_tags || []).slice(0, 10).join(', ')}${(c.all_tags || []).length > 10 ? '...' : ''}
- Vendors: ${(c.all_vendors || []).slice(0, 10).join(', ')}${(c.all_vendors || []).length > 10 ? '...' : ''}`;
    }

    // Article
    if (objects.article) {
      const a = objects.article;
      return `## Current Article
- ID: ${a.id}
- Title: ${a.title}
- Handle: ${a.handle}
- Author: ${a.author}
- Published: ${a.published_at}
- Tags: ${(a.tags || []).join(', ') || 'None'}
- Comments: ${a.comments_count} (${a.comments_enabled ? 'enabled' : 'disabled'})`;
    }

    // Page
    if (objects.page) {
      const pg = objects.page;
      return `## Current Page
- ID: ${pg.id}
- Title: ${pg.title}
- Handle: ${pg.handle}
- Author: ${pg.author}
- Template Suffix: ${pg.template_suffix || 'None'}`;
    }

    // Blog
    if (objects.blog) {
      const b = objects.blog;
      return `## Current Blog
- ID: ${b.id}
- Title: ${b.title}
- Handle: ${b.handle}
- Articles Count: ${b.articles_count}
- Tags: ${(b.all_tags || []).join(', ') || 'None'}
- Comments: ${b.comments_enabled ? 'enabled' : 'disabled'}`;
    }

    return null;
  }

  _serializeCustomer(context) {
    const customer = context?.objects?.customer;
    if (!customer) return '## Customer\nNot logged in';

    return `## Customer
- ID: ${customer.id}
- Name: ${customer.first_name} ${customer.last_name}
- Email: ${customer.email}
- Has Account: ${customer.has_account}
- Accepts Marketing: ${customer.accepts_marketing}
- Orders Count: ${customer.orders_count}
- Total Spent: ${this._formatMoney(customer.total_spent)}
- Tags: ${(customer.tags || []).join(', ') || 'None'}
- Location: ${[customer.default_address?.city, customer.default_address?.province, customer.default_address?.country].filter(Boolean).join(', ') || 'N/A'}`;
  }

  _serializeCart() {
    const cart = cartAPI.currentCart;
    if (!cart) return '## Cart\nNo cart data available';

    const lines = [
      '## Cart',
      `- Items: ${cart.item_count}`,
      `- Total: ${this._formatMoney(cart.total_price)}`,
      `- Currency: ${cart.currency}`,
      `- Note: ${cart.note || 'None'}`,
      `- Attributes: ${Object.keys(cart.attributes || {}).length > 0 ? JSON.stringify(cart.attributes) : 'None'}`
    ];

    if (cart.items && cart.items.length > 0) {
      lines.push('\n### Cart Items:');
      cart.items.forEach((item, i) => {
        lines.push(`${i + 1}. ${item.title}${item.variant_title ? ` - ${item.variant_title}` : ''}`);
        lines.push(`   - Variant ID: ${item.variant_id}`);
        lines.push(`   - Quantity: ${item.quantity}`);
        lines.push(`   - Price: ${this._formatMoney(item.price)} each`);
        lines.push(`   - Line Price: ${this._formatMoney(item.line_price)}`);
        if (item.properties && Object.keys(item.properties).length > 0) {
          lines.push(`   - Properties: ${JSON.stringify(item.properties)}`);
        }
        if (item.selling_plan_allocation) {
          lines.push(`   - Selling Plan: ${item.selling_plan_allocation.selling_plan?.name || 'Yes'}`);
        }
      });
    }

    if (cart.cart_level_discount_applications?.length > 0) {
      lines.push('\n### Discounts:');
      cart.cart_level_discount_applications.forEach(d => {
        lines.push(`- ${d.title}: -${this._formatMoney(d.total_allocated_amount)}`);
      });
    }

    return lines.join('\n');
  }

  _serializeCartHistory() {
    const history = cartAPI.cartHistory;
    if (!history || history.length === 0) return null;

    const lines = ['## Recent Cart Changes'];

    // Show last 5 changes
    const recent = history.slice(-5);
    recent.forEach((entry, i) => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const diff = entry.diff;
      lines.push(`\n### Change ${i + 1} (${time})`);
      lines.push(`- Items: ${diff.itemCount.old} → ${diff.itemCount.new}`);
      lines.push(`- Total: ${this._formatMoney(diff.totalPrice.old)} → ${this._formatMoney(diff.totalPrice.new)}`);

      if (diff.items.added.length > 0) {
        lines.push(`- Added: ${diff.items.added.map(i => i.title).join(', ')}`);
      }
      if (diff.items.removed.length > 0) {
        lines.push(`- Removed: ${diff.items.removed.map(i => i.title).join(', ')}`);
      }
      if (diff.items.modified.length > 0) {
        lines.push(`- Modified: ${diff.items.modified.map(i => `${i.item.title} (${i.oldQuantity} → ${i.newQuantity})`).join(', ')}`);
      }
    });

    return lines.join('\n');
  }

  _serializeMetafields(context) {
    const { metafields } = context || {};
    if (!metafields) return null;

    const lines = ['## Metafields'];
    let hasAny = false;

    const resources = ['shop', 'product', 'collection', 'customer', 'article', 'page', 'blog'];

    for (const resource of resources) {
      const resourceMf = metafields[resource];
      if (!resourceMf || Object.keys(resourceMf).length === 0) continue;

      hasAny = true;
      lines.push(`\n### ${resource.charAt(0).toUpperCase() + resource.slice(1)} Metafields`);

      for (const [namespace, fields] of Object.entries(resourceMf)) {
        for (const [key, data] of Object.entries(fields)) {
          const value = this._truncateValue(data.value);
          lines.push(`- ${resource}.metafields.${namespace}.${key}`);
          lines.push(`  Type: ${data.type}`);
          lines.push(`  Value: ${value}`);
        }
      }
    }

    return hasAny ? lines.join('\n') : null;
  }

  _serializeNetworkRequests(includePayloads = false) {
    const requests = networkInterceptor.getRequests();
    if (!requests || requests.length === 0) return null;

    const lines = ['## Recent Network Requests'];

    // Show last 10 requests (or 5 if including payloads to save tokens)
    const limit = includePayloads ? 5 : 10;
    const recent = requests.slice(-limit);
    recent.forEach((req, i) => {
      const time = new Date(req.startTime).toLocaleTimeString();
      lines.push(`\n${i + 1}. ${req.method} ${req.displayName} (${time})`);
      lines.push(`   URL: ${req.url}`);
      lines.push(`   Status: ${req.statusCode || 'pending'} (${req.duration ? req.duration + 'ms' : 'pending'})`);

      if (req.category === 'cart-mutation' && req.cartDiff) {
        lines.push(`   Cart Change: ${req.cartDiff.itemsBefore} → ${req.cartDiff.itemsAfter} items`);
      }

      if (includePayloads) {
        // Include request body
        if (req.requestBody) {
          const body = this._truncateValue(
            typeof req.requestBody === 'string' ? req.requestBody : JSON.stringify(req.requestBody),
            500
          );
          lines.push(`   Request Body: ${body}`);
        }
        // Include response body
        if (req.responseBody) {
          const response = this._truncateValue(
            typeof req.responseBody === 'string' ? req.responseBody : JSON.stringify(req.responseBody),
            500
          );
          lines.push(`   Response: ${response}`);
        }
      }
    });

    return lines.join('\n');
  }

  _serializeCookies() {
    const cookieString = document.cookie;
    if (!cookieString) return '## Cookies\nNo cookies found';

    const cookies = cookieString.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      const value = valueParts.join('=');
      return { name: name.trim(), value: decodeURIComponent(value || '') };
    }).filter(c => c.name);

    if (cookies.length === 0) return '## Cookies\nNo cookies found';

    const lines = [`## Cookies (${cookies.length} total)`];

    // Categorize cookies
    const shopifyCookies = cookies.filter(c =>
      c.name.startsWith('_shopify') ||
      c.name.startsWith('cart') ||
      c.name.startsWith('secure_customer') ||
      c.name === 'localization'
    );
    const otherCookies = cookies.filter(c => !shopifyCookies.includes(c));

    if (shopifyCookies.length > 0) {
      lines.push('\n### Shopify Cookies');
      shopifyCookies.forEach(c => {
        const truncatedValue = this._truncateValue(c.value, 80);
        lines.push(`- ${c.name}: ${truncatedValue}`);
      });
    }

    if (otherCookies.length > 0) {
      lines.push('\n### Other Cookies');
      otherCookies.slice(0, 15).forEach(c => {
        const truncatedValue = this._truncateValue(c.value, 80);
        lines.push(`- ${c.name}: ${truncatedValue}`);
      });
      if (otherCookies.length > 15) {
        lines.push(`... and ${otherCookies.length - 15} more`);
      }
    }

    return lines.join('\n');
  }

  _serializeStorage(storageType) {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    const label = storageType === 'localStorage' ? 'localStorage' : 'sessionStorage';

    if (storage.length === 0) return `## ${label}\nNo items stored`;

    const lines = [`## ${label} (${storage.length} items)`];

    // Filter out devtools' own storage
    const items = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      // Skip theme devtools internal storage
      if (key.startsWith('tdt-')) continue;

      const value = storage.getItem(key);
      let parsedValue = value;
      let isJson = false;

      try {
        parsedValue = JSON.parse(value);
        isJson = typeof parsedValue === 'object' && parsedValue !== null;
      } catch {
        isJson = false;
      }

      items.push({ key, value, parsedValue, isJson });
    }

    if (items.length === 0) return `## ${label}\nNo relevant items (only devtools internal storage)`;

    // Categorize by Shopify-related vs other
    const shopifyItems = items.filter(i =>
      i.key.includes('shopify') ||
      i.key.includes('cart') ||
      i.key.includes('customer') ||
      i.key.includes('checkout')
    );
    const otherItems = items.filter(i => !shopifyItems.includes(i));

    if (shopifyItems.length > 0) {
      lines.push('\n### Shopify-related');
      shopifyItems.forEach(item => {
        const value = item.isJson
          ? this._truncateValue(JSON.stringify(item.parsedValue), 200)
          : this._truncateValue(item.value, 200);
        lines.push(`- ${item.key} (${item.isJson ? 'JSON' : 'string'}): ${value}`);
      });
    }

    if (otherItems.length > 0) {
      lines.push('\n### Other');
      otherItems.slice(0, 10).forEach(item => {
        const value = item.isJson
          ? this._truncateValue(JSON.stringify(item.parsedValue), 150)
          : this._truncateValue(item.value, 150);
        lines.push(`- ${item.key} (${item.isJson ? 'JSON' : 'string'}): ${value}`);
      });
      if (otherItems.length > 10) {
        lines.push(`... and ${otherItems.length - 10} more`);
      }
    }

    return lines.join('\n');
  }

  _serializeLiquidErrors() {
    // Get errors from provider if available
    const errors = this.liquidErrorsProvider?.() || [];

    if (errors.length === 0) return '## Liquid Errors\nNo Liquid errors detected on page';

    const lines = [`## Liquid Errors (${errors.length} found)`];

    errors.forEach((error, i) => {
      lines.push(`\n${i + 1}. [${error.category?.toUpperCase() || 'ERROR'}] ${error.message}`);
      if (error.element) {
        lines.push(`   Location: ${error.element}`);
      }
    });

    return lines.join('\n');
  }

  _serializeAccessibility() {
    // Get accessibility data from the shared service
    const a11yData = accessibilityService.getForAI();

    if (!a11yData) return '## Accessibility\nNo accessibility scan data available. Open the Accessibility panel to run a scan.';

    const { score, issues } = a11yData;

    const lines = [`## Accessibility (Score: ${score || 'N/A'}%)`];

    if (!issues || issues.length === 0) {
      lines.push('No accessibility issues detected');
      return lines.join('\n');
    }

    // Group by severity
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const info = issues.filter(i => i.severity === 'info');

    lines.push(`- Errors: ${errors.length}`);
    lines.push(`- Warnings: ${warnings.length}`);
    lines.push(`- Info: ${info.length}`);

    if (errors.length > 0) {
      lines.push('\n### Critical Issues');
      errors.slice(0, 10).forEach(issue => {
        lines.push(`- [${issue.wcagRef}] ${issue.title}`);
        if (issue.selector) {
          lines.push(`  Element: ${issue.selector}`);
        }
        if (issue.suggestedFix) {
          lines.push(`  Fix: ${issue.suggestedFix}`);
        }
      });
      if (errors.length > 10) {
        lines.push(`... and ${errors.length - 10} more errors`);
      }
    }

    if (warnings.length > 0) {
      lines.push('\n### Warnings');
      warnings.slice(0, 5).forEach(issue => {
        lines.push(`- [${issue.wcagRef}] ${issue.title}`);
      });
      if (warnings.length > 5) {
        lines.push(`... and ${warnings.length - 5} more warnings`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Extract and serialize section schemas from the page
   * Shopify stores section data in data-shopify-editor-* attributes
   */
  _serializeSectionSchemas() {
    const lines = ['## Section Schemas'];
    const sections = [];

    // Find all sections with Shopify editor data
    const sectionElements = document.querySelectorAll('[data-shopify-editor-section]');

    if (sectionElements.length === 0) {
      lines.push('No section schemas found on page (not in theme editor mode or no sections present)');
      return lines.join('\n');
    }

    sectionElements.forEach(el => {
      try {
        const sectionData = JSON.parse(el.getAttribute('data-shopify-editor-section') || '{}');
        if (sectionData.type || sectionData.id) {
          sections.push({
            id: sectionData.id,
            type: sectionData.type,
            disabled: sectionData.disabled || false,
            settings: sectionData.settings || {},
            blocks: sectionData.blocks || [],
            blockOrder: sectionData.block_order || [],
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    if (sections.length === 0) {
      lines.push('No parseable section schemas found');
      return lines.join('\n');
    }

    lines.push(`Found ${sections.length} section(s) on page:\n`);

    sections.forEach((section, i) => {
      lines.push(`### ${i + 1}. ${section.type || 'Unknown Section'}`);
      lines.push(`- ID: ${section.id}`);
      lines.push(`- Disabled: ${section.disabled}`);

      // Show settings
      const settingsKeys = Object.keys(section.settings || {});
      if (settingsKeys.length > 0) {
        lines.push(`- Settings (${settingsKeys.length}):`);
        settingsKeys.slice(0, 15).forEach(key => {
          const value = this._truncateValue(section.settings[key], 80);
          lines.push(`    ${key}: ${value}`);
        });
        if (settingsKeys.length > 15) {
          lines.push(`    ... and ${settingsKeys.length - 15} more settings`);
        }
      }

      // Show blocks
      if (section.blocks && Object.keys(section.blocks).length > 0) {
        const blockIds = section.blockOrder?.length > 0
          ? section.blockOrder
          : Object.keys(section.blocks);
        lines.push(`- Blocks (${blockIds.length}):`);
        blockIds.slice(0, 10).forEach(blockId => {
          const block = section.blocks[blockId];
          if (block) {
            lines.push(`    [${block.type}] ${blockId}`);
          }
        });
        if (blockIds.length > 10) {
          lines.push(`    ... and ${blockIds.length - 10} more blocks`);
        }
      }
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Serialize a simplified view of the HTML structure
   * Focuses on main content areas and semantic elements
   */
  _serializeHtmlStructure() {
    const lines = ['## HTML Structure'];

    // Get main structural elements
    const mainContent = document.querySelector('main') || document.body;

    // Build a simplified tree of the structure
    const getElementSummary = (el, depth = 0, maxDepth = 3) => {
      if (depth > maxDepth) return [];
      const results = [];
      const indent = '  '.repeat(depth);

      // Get element info
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className && typeof el.className === 'string'
        ? '.' + el.className.split(' ').filter(c => c && !c.startsWith('tdt-')).slice(0, 3).join('.')
        : '';
      const dataSection = el.getAttribute('data-section-id') || el.getAttribute('data-section-type');
      const sectionInfo = dataSection ? ` [section: ${dataSection}]` : '';

      // Skip script, style, and devtools elements
      if (['script', 'style', 'noscript', 'theme-devtools'].includes(tag)) return [];
      if (el.id && el.id.startsWith('__THEME_DEVTOOLS')) return [];

      const selector = `${tag}${id}${classes}${sectionInfo}`;
      results.push(`${indent}${selector}`);

      // Recurse into children for semantic elements
      const semanticTags = ['header', 'main', 'footer', 'nav', 'section', 'article', 'aside', 'div', 'form'];
      if (semanticTags.includes(tag) || dataSection) {
        const children = Array.from(el.children);
        // Only show first 8 children to keep output manageable
        children.slice(0, 8).forEach(child => {
          results.push(...getElementSummary(child, depth + 1, maxDepth));
        });
        if (children.length > 8) {
          results.push(`${indent}  ... +${children.length - 8} more elements`);
        }
      }

      return results;
    };

    // Get body structure
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      lines.push(...getElementSummary(child, 0, 4));
    });

    // Add section count
    const shopifySections = document.querySelectorAll('[data-section-id], [data-shopify-editor-section]');
    if (shopifySections.length > 0) {
      lines.push(`\n### Shopify Sections: ${shopifySections.length}`);
      shopifySections.forEach(section => {
        const sectionId = section.getAttribute('data-section-id') || 'unknown';
        const sectionType = section.getAttribute('data-section-type') || 'unknown';
        lines.push(`- ${sectionType} (${sectionId})`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Serialize analytics events data
   */
  _serializeAnalytics() {
    const analyticsData = analyticsService.getForAI();

    if (!analyticsData) {
      return '## Analytics\nNo analytics events captured yet. Browse the site to capture tracking events.';
    }

    const { totalEvents, conversionCount, detectedProviders, recentEvents, providerCounts } = analyticsData;

    const lines = [`## Analytics (${totalEvents} events captured)`];

    // Summary
    lines.push(`- Total Events: ${totalEvents}`);
    lines.push(`- Conversions: ${conversionCount}`);
    lines.push(`- Detected Providers: ${detectedProviders.length > 0 ? detectedProviders.join(', ') : 'None'}`);

    // Provider breakdown
    if (Object.keys(providerCounts).length > 0) {
      lines.push('\n### Events by Provider');
      for (const [provider, count] of Object.entries(providerCounts)) {
        lines.push(`- ${provider}: ${count} events`);
      }
    }

    // Recent events
    if (recentEvents && recentEvents.length > 0) {
      lines.push('\n### Recent Events');
      recentEvents.slice().reverse().forEach((event, i) => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        const countStr = event.count > 1 ? ` (x${event.count})` : '';
        const conversionStr = event.isConversion ? ' [CONVERSION]' : '';

        lines.push(`\n${i + 1}. [${event.provider.toUpperCase()}] ${event.eventName}${countStr}${conversionStr}`);
        lines.push(`   Time: ${time}`);

        // Show important data fields
        if (event.data && Object.keys(event.data).length > 0) {
          const dataStr = Object.entries(event.data)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          lines.push(`   Data: ${this._truncateValue(dataStr, 150)}`);
        }
      });
    }

    return lines.join('\n');
  }

  _formatMoney(cents) {
    if (cents == null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  }

  _truncateValue(value, maxLength = 100) {
    if (value == null) return 'null';

    const str = typeof value === 'string' ? value : JSON.stringify(value);
    if (str.length <= maxLength) return str;

    return str.substring(0, maxLength) + '...';
  }
}

export const contextSerializer = new ContextSerializer();
