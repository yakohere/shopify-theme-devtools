## Introduction: Why Cart Debugging is Painful

If you've developed Shopify themes, you know the pain:

- Manually adding products to test cart states
- Using `console.log({{ cart | json }})` to debug
- Rebuilding complex carts after every page refresh
- No way to test edge cases like gift-with-purchase items or subscriptions
- Tracking down which JavaScript is modifying your cart

**Shopify Theme Devtools** solves all of this with a dedicated Cart Panel that transforms how you debug and test cart functionality.

---

## What is Shopify Theme Devtools?

Shopify Theme Devtools is an **open-source, in-browser developer panel** for Shopify theme development. Think of it as Chrome DevTools, but specifically designed for Liquid and Shopify.

The Cart Panel is one of its most powerful features—a complete cart management and debugging toolkit that runs directly in your development theme.

**Key Features:**
- Real-time cart state inspection
- Visual cart history with diff tracking
- Saveable cart scenarios for testing
- Automated cart validation tests
- AJAX request interception
- One-click cart restoration

---

## Getting Started

### Installation

```bash
npx shopify-theme-devtools init
```

This adds the Liquid snippet to your theme. The devtools only render on **unpublished themes**, so your live store is never affected.

### Accessing the Cart Panel

Once installed, you'll see a floating devtools panel on your development theme. Click the **Cart** tab to access all cart debugging features.

---

## Feature 1: Real-Time Cart Inspector

### The Problem
Debugging cart state usually means adding `{{ cart | json }}` to your template, refreshing, copying the JSON, and pasting it into a formatter. Repeat for every change.

### The Solution
The Cart Panel shows your complete cart state in a clean, interactive interface:

**At a glance, you see:**
- Total items and price
- Currency and total weight
- Active discount codes with savings
- Cart attributes and notes

**For each line item:**
- Product thumbnail, title, and variant
- SKU and quantity
- Original price vs. discounted price (with percentage saved)
- Selling plan details for subscriptions

### Expandable Item Details

Click any item to reveal:
- Variant ID, Product ID, and Item Key
- Vendor and product type
- Complete line item properties
- Discount breakdowns by code
- Selling plan allocation details

**Quick Actions:**
- Copy Variant ID, Product ID, or Item Key to clipboard
- Duplicate item (preserves all properties)
- Remove item instantly

### Example Use Case

You're debugging why a discount isn't applying correctly. Instead of digging through JSON:

1. Open Cart Panel
2. Expand the item in question
3. See the exact discount allocation and compare with expected values
4. Notice the discount is applying to `line_price` but your theme is displaying `original_line_price`

**Time saved: 15+ minutes per debugging session**

---

## Feature 2: Cart History & Time Travel

### The Problem
You've finally reproduced a cart bug after 10 minutes of adding products. You refresh the page to test your fix—and the cart state is gone or changed.

### The Solution
Cart History automatically tracks every cart change with timestamps and visual diffs.

**What gets tracked:**
- Items added (green)
- Items removed (red)
- Quantity changes (orange with old→new values)
- Attribute modifications
- Note changes
- Discount code applications

### One-Click Restoration

See a historical cart state you need? Click **Restore** and the Cart Panel:

1. Clears your current cart
2. Re-adds all items with their exact properties
3. Restores cart attributes and notes
4. Maintains selling plan allocations

**The entire process takes ~2 seconds.**

### Example Use Case

You're testing a "free gift at $100" promotion:

1. Build a cart worth $95
2. Add a $10 item → gift appears
3. Test your Liquid display logic
4. Realize you need to test the $95 state again
5. Click **Restore** on the $95 history entry
6. Continue testing

**Time saved: 5-10 minutes per cart rebuild**

---

## Feature 3: Cart Scenarios (Saved Cart States)

### The Problem
You have 8 different cart configurations you need to test:
- Empty cart
- Single item
- Multiple items
- Items with properties (personalization)
- Subscription items
- Gift-with-purchase items
- Mixed cart with discounts
- Maximum quantity cart

Rebuilding these manually for every test cycle is exhausting.

### The Solution
**Cart Scenarios** let you save, name, and instantly load predefined cart states.

### Creating a Scenario

1. Build your desired cart state
2. Click **Scenarios** → **Save Current Cart**
3. Name it (e.g., "GWP Test - $100 threshold")
4. The scenario saves all items, quantities, properties, attributes, and notes

### Loading a Scenario

1. Click **Scenarios**
2. Select your saved scenario
3. Choose to **clear cart first** or **add to existing**
4. Cart is populated instantly

### Scenario Editor

Need to tweak a scenario without rebuilding the cart?

- Add/remove items by variant ID
- Modify quantities
- Add line item properties
- Set cart attributes
- Include cart notes

### Import/Export

Share scenarios with your team:

```json
// Exported scenario file
{
  "name": "GWP Test Cart",
  "items": [
    { "variant_id": "12345678", "quantity": 2, "properties": { "_is_gwp": "true" } }
  ],
  "attributes": { "gift_message": "Happy Birthday!" },
  "note": "Test order - do not fulfill"
}
```

### Example Use Case

Your QA team needs to test 12 different cart states for a new promotion:

1. Developer creates all 12 scenarios
2. Exports as JSON file
3. QA imports into their devtools
4. QA can now test all 12 states in under a minute

**Time saved: Hours of manual cart building across team members**

---

## Feature 4: Automated Cart Tests

### The Problem
Cart validation logic is complex. Gift-with-purchase items need specific properties. Quantity limits must be enforced. Bundles require companion products. How do you catch these issues before they reach production?

### The Solution
**Cart Tests** let you define validation rules that run automatically against your cart state.

### Four Rule Types

#### 1. Property Dependency Rules
*"If item has property X, it must also have properties Y and Z"*

```
IF item has property "_is_gwp" = "true"
THEN item MUST have properties: "_gwp_price", "_gwp_source", "_gwp_campaign"
```

**Use cases:**
- Gift-with-purchase validation
- Personalization requirements
- Pre-order expected ship dates
- Custom product data integrity

#### 2. Field Value Rules
*"If item field equals X, then another field must equal Y"*

```
IF item product_type = "Gift Card"
THEN item quantity MUST equal 1
```

**Use cases:**
- Gift card quantity limits
- Digital product shipping flags
- SKU requirements
- Subscription validation

#### 3. Cart Composition Rules
*"If cart contains item X, cart must also contain item Y"*

```
IF cart contains item with product_type = "Electronics"
THEN cart MUST contain item with product_type = "Warranty"
```

**Use cases:**
- Required accessories
- Bundle completeness
- Warranty requirements
- Cross-sell validation

#### 4. Quantity Rules
*"Item/cart quantities must meet min/max/multiple constraints"*

```
SCOPE: per-item
MAX: 10
(No item can have quantity > 10)
```

```
SCOPE: cart-total
FILTER: product_type = "Sample"
MAX: 3
(Maximum 3 sample products in cart)
```

**Use cases:**
- Per-item limits
- Cart maximums
- Bulk order minimums (B2B)
- Sample product limits
- Pack quantity enforcement (multiples of 6)

### Pre-Built Templates

Don't want to configure from scratch? Choose from 13 pre-built templates:

- `[Property] GWP Validation`
- `[Property] Personalization Check`
- `[Property] Pre-order Validation`
- `[Field] Gift Card Qty = 1`
- `[Field] Subscription Valid`
- `[Field] Digital Products Check`
- `[Field] SKU Required`
- `[Composition] Warranty Required`
- `[Composition] Bundle Check`
- `[Qty] Max Per Item (10)`
- `[Qty] Cart Max (50 items)`
- `[Qty] Pack of 6 Only`
- `[Qty] Samples Max 3`

### Auto-Run Tests

Enable **Auto-run** and tests execute automatically whenever your cart changes. Failed items are highlighted with a red border directly in the cart display.

### Test Results

- Summary shows pass/fail count
- Failed tests show detailed error messages
- Specific items causing failures are identified
- First 5 failures displayed with "+N more" indicator

### Example Use Case

You're implementing a gift-with-purchase promotion:

1. Create a test: "GWP items must have `_gwp_price` property"
2. Enable auto-run
3. Add a GWP item to cart
4. Test immediately fails—missing required property
5. Fix your GWP logic to include the property
6. Test passes automatically
7. Ship with confidence

**Time saved: Catching bugs before they reach production = priceless**

---

## Feature 5: Quick Cart Actions

### Add Items Instantly

No need to browse to product pages. Enter a **variant ID** and **quantity**, click **Add**, and the item is in your cart.

```
Variant ID: 12345678901234
Quantity: 2
[Add]
```

### Apply Discount Codes

Test discount logic directly from the panel without going through checkout:

```
Discount Code: SAVE20
[Apply]
```

### Cart Permalink

Need to share a specific cart state? Click **Link** to copy a permalink:

```
https://yourstore.com/cart/12345678:2,87654321:1
```

### Export Cart JSON

Click **Export** to download your complete cart state as JSON for documentation or bug reports.

---

## Feature 6: Network Request Tracking

### The Problem
Something is modifying your cart unexpectedly. Is it a third-party app? A theme script? A Shopify feature?

### The Solution
The Cart Panel intercepts and logs all cart-related AJAX requests:

**Tracked endpoints:**
- `/cart.js`
- `/cart/add.js`
- `/cart/update.js`
- `/cart/change.js`
- `/cart/clear.js`

**For each request, you see:**
- HTTP method and status
- Request/response timing
- Request body and headers
- Response data
- **Source identification** (which script made the request)

### Request Blocking

Found a rogue script modifying your cart? **Block requests by source** to isolate the issue:

1. Identify the problematic request
2. Click **Block Source**
3. Future requests from that script are prevented
4. Continue debugging without interference

---

## Best Practices

### 1. Create Scenario Libraries

Build a comprehensive set of scenarios for your store:

```
├── Basic States
│   ├── Empty cart
│   ├── Single item
│   └── Multiple items
├── Edge Cases
│   ├── Max quantity (per item)
│   ├── Max items (cart limit)
│   └── Zero-price items
├── Features
│   ├── Gift with purchase
│   ├── Subscription items
│   ├── Personalized items
│   └── Pre-order items
└── Promotions
    ├── Percentage discount
    ├── Fixed amount discount
    ├── Free shipping threshold
    └── BOGO promotion
```

### 2. Write Tests for Business Rules

Document your business logic as automated tests:

| Business Rule | Test Type | Configuration |
|--------------|-----------|---------------|
| Gift cards qty = 1 | Field Value | `product_type = "Gift Card"` → `quantity = 1` |
| GWP has tracking | Property Dependency | `_is_gwp = true` → requires `_gwp_source` |
| Electronics need warranty | Cart Composition | `product_type = "Electronics"` → requires `product_type = "Warranty"` |
| Max 3 samples | Quantity | `cart-total`, `max: 3`, filter: `product_type = "Sample"` |

### 3. Use History for Regression Testing

1. Build the cart state for your bug
2. Fix the bug
3. Use History to restore the original state
4. Verify the fix
5. Save as a scenario for future regression testing

### 4. Share Scenarios with Your Team

- Export scenarios as JSON
- Commit to your repository
- Import on each developer's machine
- Everyone can test the same edge cases

### 5. Enable Auto-Run Tests During Development

Keep tests running automatically while you code. Instant feedback when something breaks.

---

## Comparison: Before vs. After

| Task | Without Devtools | With Cart Panel |
|------|------------------|-----------------|
| Inspect cart state | Add Liquid, refresh, copy JSON, format | Click Cart tab |
| Rebuild specific cart | 5-10 min manual work | 2 seconds (scenario load) |
| Test 10 cart states | 50-100 minutes | 5 minutes |
| Track cart changes | Custom logging code | Automatic history |
| Validate GWP logic | Manual testing | Automated tests |
| Find rogue cart scripts | Console debugging | Request tracking |
| Share cart states | Screenshots, instructions | JSON export |

---

## Common Questions

### Does this work on live stores?
No. The devtools only render on **unpublished themes** for security.

### Does it modify my theme code?
It adds a single Liquid snippet that conditionally loads the devtools JavaScript.

### Can I use it with any Shopify plan?
Yes. It works with Basic, Shopify, Advanced, and Plus plans.

### Is it free?
Yes. Shopify Theme Devtools is open source.

---

## Conclusion

The Cart Panel in Shopify Theme Devtools transforms cart debugging from a tedious, time-consuming task into a streamlined workflow. Whether you're:

- Debugging a discount issue
- Testing gift-with-purchase logic
- Validating subscription cart behavior
- Building complex promotional carts
- Catching cart validation bugs

...you'll save hours of development time.

**Get started:**

```bash
npx shopify-theme-devtools init
```