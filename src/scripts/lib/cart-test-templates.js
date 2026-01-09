/**
 * Pre-built cart test templates
 * Each template demonstrates a specific rule type for validating cart items
 */

export const CART_TEST_TEMPLATES = [
  // ===== PROPERTY DEPENDENCY EXAMPLES =====
  // Use when: Items with specific properties must have other required properties
  {
    name: '[Property] GWP Validation',
    description: 'Gift-with-purchase items need price & source tracking',
    rules: [{
      id: 1,
      name: 'GWP has required metadata',
      type: 'property-dependency',
      config: {
        ifProperty: { key: '_is_gwp', value: 'true', operator: 'equals' },
        requiredProperties: ['_gwp_price', '_gwp_source', '_gwp_campaign']
      }
    }]
  },
  {
    name: '[Property] Personalization Check',
    description: 'Personalized items must have engraving text',
    rules: [{
      id: 1,
      name: 'Engraving requires text',
      type: 'property-dependency',
      config: {
        ifProperty: { key: '_personalized', value: 'true', operator: 'equals' },
        requiredProperties: ['_engraving_text', '_engraving_font']
      }
    }]
  },
  {
    name: '[Property] Pre-order Validation',
    description: 'Pre-order items must have expected ship date',
    rules: [{
      id: 1,
      name: 'Pre-order has ship date',
      type: 'property-dependency',
      config: {
        ifProperty: { key: '_preorder', operator: 'exists', value: '' },
        requiredProperties: ['_expected_ship_date']
      }
    }]
  },

  // ===== FIELD VALUE EXAMPLES =====
  // Use when: Checking item field values meet certain conditions
  {
    name: '[Field] Gift Card Qty = 1',
    description: 'Gift cards cannot have quantity > 1',
    rules: [{
      id: 1,
      name: 'Gift card single qty',
      type: 'field-value',
      config: {
        ifField: { field: 'product_type', value: 'Gift Card', operator: 'equals' },
        thenField: { field: 'quantity', value: '1', operator: 'equals' }
      }
    }]
  },
  {
    name: '[Field] Subscription Valid',
    description: 'Items with selling plans must have valid plan ID',
    rules: [{
      id: 1,
      name: 'Selling plan exists',
      type: 'field-value',
      config: {
        ifField: { field: 'selling_plan_allocation', value: '', operator: 'exists' },
        thenField: { field: 'selling_plan_allocation.selling_plan.id', value: '', operator: 'exists' }
      }
    }]
  },
  {
    name: '[Field] Digital Products Check',
    description: 'Digital products should not require shipping',
    rules: [{
      id: 1,
      name: 'Digital = no shipping',
      type: 'field-value',
      config: {
        ifField: { field: 'product_type', value: 'Digital', operator: 'equals' },
        thenField: { field: 'requires_shipping', value: 'false', operator: 'equals' }
      }
    }]
  },
  {
    name: '[Field] SKU Required',
    description: 'All items must have a SKU assigned',
    rules: [{
      id: 1,
      name: 'SKU exists',
      type: 'field-value',
      config: {
        ifField: { field: 'variant_id', value: '', operator: 'exists' },
        thenField: { field: 'sku', value: '', operator: 'exists' }
      }
    }]
  },

  // ===== CART COMPOSITION EXAMPLES =====
  // Use when: Certain items require other items to be in cart
  {
    name: '[Composition] Warranty Required',
    description: 'Electronics must have warranty in cart',
    rules: [{
      id: 1,
      name: 'Electronics need warranty',
      type: 'cart-composition',
      config: {
        ifItem: { field: 'product_type', value: 'Electronics' },
        requiresItem: { field: 'product_type', value: 'Warranty' }
      }
    }]
  },
  {
    name: '[Composition] Bundle Check',
    description: 'Main product requires accessory',
    rules: [{
      id: 1,
      name: 'Phone needs case',
      type: 'cart-composition',
      config: {
        ifItem: { field: 'handle', value: 'iphone-15-pro' },
        requiresItem: { field: 'product_type', value: 'Phone Case' }
      }
    }]
  },
  {
    name: '[Composition] Subscription + Setup',
    description: 'Subscription box needs setup fee on first order',
    rules: [{
      id: 1,
      name: 'Sub box needs setup',
      type: 'cart-composition',
      config: {
        ifItem: { field: 'product_type', value: 'Subscription Box' },
        requiresItem: { field: 'handle', value: 'setup-fee' }
      }
    }]
  },

  // ===== QUANTITY EXAMPLES =====
  // Use when: Enforcing quantity limits or requirements
  {
    name: '[Qty] Max Per Item (10)',
    description: 'No item can have more than 10 quantity',
    rules: [{
      id: 1,
      name: 'Max 10 each',
      type: 'quantity',
      config: {
        scope: 'per-item',
        min: null,
        max: 10,
        multiple: null,
        filterField: '',
        filterValue: ''
      }
    }]
  },
  {
    name: '[Qty] Cart Max (50 items)',
    description: 'Total cart cannot exceed 50 items',
    rules: [{
      id: 1,
      name: 'Cart max 50',
      type: 'quantity',
      config: {
        scope: 'cart-total',
        min: null,
        max: 50,
        multiple: null,
        filterField: '',
        filterValue: ''
      }
    }]
  },
  {
    name: '[Qty] Minimum Order (2+)',
    description: 'Cart must have at least 2 items',
    rules: [{
      id: 1,
      name: 'Min 2 items',
      type: 'quantity',
      config: {
        scope: 'cart-total',
        min: 2,
        max: null,
        multiple: null,
        filterField: '',
        filterValue: ''
      }
    }]
  },
  {
    name: '[Qty] Pack of 6 Only',
    description: 'Items must be bought in multiples of 6',
    rules: [{
      id: 1,
      name: 'Multiples of 6',
      type: 'quantity',
      config: {
        scope: 'per-item',
        min: null,
        max: null,
        multiple: 6,
        filterField: '',
        filterValue: ''
      }
    }]
  },
  {
    name: '[Qty] Samples Max 3',
    description: 'Sample products limited to 3 total',
    rules: [{
      id: 1,
      name: 'Max 3 samples',
      type: 'quantity',
      config: {
        scope: 'cart-total',
        min: null,
        max: 3,
        multiple: null,
        filterField: 'product_type',
        filterValue: 'Sample'
      }
    }]
  },
  {
    name: '[Qty] B2B Min 10 per SKU',
    description: 'Wholesale orders require min 10 of each item',
    rules: [{
      id: 1,
      name: 'Min 10 per item',
      type: 'quantity',
      config: {
        scope: 'per-item',
        min: 10,
        max: null,
        multiple: null,
        filterField: '',
        filterValue: ''
      }
    }]
  }
];
