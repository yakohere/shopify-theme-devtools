import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { cartAPI } from '../../services/cart.js';

export class CartPanel extends LitElement {
  static properties = {
    cart: { type: Object },
    previousCart: { type: Object, state: true },
    diff: { type: Object, state: true },
    showHistory: { type: Boolean, state: true },
    cartHistory: { type: Array, state: true },
    showAddProduct: { type: Boolean, state: true },
    showAttributes: { type: Boolean, state: true },
    showDiscountInput: { type: Boolean, state: true },
    expandedItems: { type: Set, state: true },
    variantIdInput: { type: String, state: true },
    quantityInput: { type: Number, state: true },
    discountInput: { type: String, state: true },
    editingNote: { type: Boolean, state: true },
    noteInput: { type: String, state: true },
    editingAttributes: { type: Boolean, state: true },
    attributesInput: { type: Object, state: true },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 8px 12px;
        height: 100%;
        overflow: auto;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }

      .stats {
        display: flex;
        gap: 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .stats strong {
        color: var(--tdt-text);
        font-weight: 600;
      }

      .actions {
        display: flex;
        gap: 6px;
        margin-left: auto;
      }

      .diff {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 4px 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        margin-bottom: 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .diff__added { color: var(--tdt-success); }
      .diff__removed { color: var(--tdt-danger); }
      .diff__modified { color: var(--tdt-warning); }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      th {
        text-align: left;
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--tdt-border);
        background: var(--tdt-bg-secondary);
        position: sticky;
        top: 0;
      }

      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--tdt-border);
        vertical-align: middle;
      }

      tr:hover td {
        background: var(--tdt-bg-secondary);
      }

      .col-img { width: 32px; }
      .col-qty { width: 50px; }
      .col-price { width: 70px; text-align: right; }
      .col-actions { width: 30px; text-align: center; }

      .item-img {
        width: 28px;
        height: 28px;
        object-fit: cover;
        border-radius: 3px;
        background: var(--tdt-bg);
        display: block;
      }

      .item-title {
        font-weight: 500;
        color: var(--tdt-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      .item-variant {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .item-sku {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        font-family: var(--tdt-font-mono);
      }

      .item-price {
        font-weight: 600;
        color: var(--tdt-accent);
        text-align: right;
      }

      .qty-input {
        width: 70px;
        padding: 2px 4px;
        text-align: center;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .remove-btn {
        padding: 2px 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        line-height: 1;
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: 3px;
        cursor: pointer;
      }

      .remove-btn:hover {
        background: var(--tdt-danger);
        border-color: var(--tdt-danger);
        color: white;
      }

      .history-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .history-toggle:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .history-toggle.active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .history-panel {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
        overflow: hidden;
      }

      .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--tdt-bg);
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
      }

      .history-list {
        max-height: 200px;
        overflow-y: auto;
      }

      .history-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .history-item:last-child {
        border-bottom: none;
      }

      .history-item:hover {
        background: var(--tdt-bg-hover);
      }

      .history-time {
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
      }

      .history-changes {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        flex: 1;
        margin: 0 12px;
        min-width: 0;
      }

      .history-changes span {
        font-size: calc(10px * var(--tdt-scale, 1));
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .history-restore {
        padding: 2px 8px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: var(--tdt-accent);
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }

      .history-restore:hover {
        opacity: 0.9;
      }

      .history-empty {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .copied-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--tdt-success);
        color: white;
        padding: 8px 16px;
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
      }

      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }

      /* Inline quick-add row */
      .quick-add-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        padding: 6px 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .quick-add-row input {
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg);
        color: var(--tdt-text);
      }

      .quick-add-row input[type="text"] {
        width: 120px;
      }

      .quick-add-row input[type="number"] {
        width: 45px;
        text-align: center;
      }

      .quick-add-row .label {
        color: var(--tdt-text-muted);
      }

      .quick-add-row .btn--mini {
        padding: 4px 8px;
        font-size: calc(9px * var(--tdt-scale, 1));
      }

      /* Inline discount display */
      .discount-inline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: 8px;
      }

      .discount-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 6px;
        background: rgba(16, 185, 129, 0.15);
        border-radius: 3px;
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-success);
      }

      .discount-input-inline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .discount-input-inline input {
        width: 80px;
        padding: 2px 6px;
        font-size: calc(9px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
        text-transform: uppercase;
      }

      /* Compact meta row for attributes/note */
      .meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        margin-bottom: 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        flex-wrap: wrap;
      }

      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--tdt-text-muted);
      }

      .meta-item strong {
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
      }

      .meta-toggle {
        padding: 2px 6px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .meta-toggle:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .meta-toggle.active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      /* Expanded meta panel */
      .meta-panel {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        margin-bottom: 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .meta-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .meta-panel-close {
        background: none;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-size: calc(14px * var(--tdt-scale, 1));
        line-height: 1;
        padding: 0;
      }

      .meta-panel-close:hover {
        color: var(--tdt-text);
      }

      .attr-grid {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 4px 8px;
        align-items: center;
      }

      .attr-key {
        color: var(--tdt-text-muted);
      }

      .attr-value {
        font-family: var(--tdt-font-mono);
        color: var(--tdt-text);
      }

      .attr-input {
        padding: 3px 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
      }

      .note-inline {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--tdt-border);
      }

      .note-text {
        font-style: italic;
        color: var(--tdt-text);
        cursor: pointer;
        padding: 4px 6px;
        background: var(--tdt-bg);
        border-radius: 3px;
      }

      .note-text:hover {
        background: var(--tdt-bg-hover);
      }

      .note-textarea {
        width: 100%;
        min-height: 50px;
        padding: 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
        resize: vertical;
        box-sizing: border-box;
      }

      .inline-actions {
        display: flex;
        gap: 4px;
        margin-top: 6px;
      }

      .item-expanded {
        padding: 8px 12px;
        background: var(--tdt-bg);
        border-top: 1px solid var(--tdt-border);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .item-detail-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 4px;
      }

      .item-detail-label {
        color: var(--tdt-text-muted);
        min-width: 80px;
      }

      .item-detail-value {
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        word-break: break-all;
      }

      .item-properties {
        margin-top: 6px;
        padding: 6px 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
      }

      .item-properties-title {
        font-weight: 600;
        color: var(--tdt-text-muted);
        margin-bottom: 4px;
      }

      .selling-plan-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        background: rgba(168, 85, 247, 0.1);
        border: 1px solid #a855f7;
        border-radius: var(--tdt-radius);
        font-size: calc(9px * var(--tdt-scale, 1));
        color: #a855f7;
      }

      .compare-price {
        text-decoration: line-through;
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-right: 4px;
      }

      .sale-badge {
        background: var(--tdt-danger);
        color: white;
        padding: 1px 4px;
        border-radius: 2px;
        font-size: calc(9px * var(--tdt-scale, 1));
        margin-left: 4px;
      }

      .quick-actions {
        display: flex;
        gap: 4px;
        margin-top: 8px;
      }

      .quick-action-btn {
        padding: 3px 8px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .quick-action-btn:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .expand-btn {
        background: none;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 2px 4px;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .expand-btn:hover {
        color: var(--tdt-accent);
      }

      .toggle-row {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
      }

      .toggle-btn {
        padding: 4px 10px;
        font-size: calc(10px * var(--tdt-scale, 1));
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .toggle-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .toggle-btn.active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .item-row {
        cursor: pointer;
      }

      .item-row:hover {
        background: var(--tdt-bg-secondary);
      }

      .item-row.expanded {
        background: var(--tdt-bg-secondary);
      }

      .total-discount {
        color: var(--tdt-success);
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-left: 8px;
      }
    `
  ];

  constructor() {
    super();
    this.cart = null;
    this.previousCart = null;
    this.diff = null;
    this.showHistory = false;
    this.cartHistory = [];
    this.showAddProduct = false;
    this.showAttributes = false;
    this.showDiscountInput = false;
    this.expandedItems = new Set();
    this.variantIdInput = '';
    this.quantityInput = 1;
    this.discountInput = '';
    this.editingNote = false;
    this.noteInput = '';
    this.editingAttributes = false;
    this.attributesInput = {};
    this._toastTimeout = null;
  }

  updated(changedProps) {
    if (changedProps.has('cart') && this.cart) {
      const oldCart = changedProps.get('cart');
      if (oldCart) {
        this.previousCart = oldCart;
        this.diff = cartAPI.diffCart(oldCart, this.cart);
      }
      // Refresh history panel if it's open
      if (this.showHistory) {
        this.cartHistory = [...cartAPI.cartHistory].reverse();
      }
    }
  }

  async _refresh() {
    const cart = await cartAPI.fetch();
    if (cart) cartAPI.setCart(cart);
  }

  async _clear() {
    if (confirm('Clear entire cart?')) {
      await cartAPI.clear();
    }
  }

  async _updateQuantity(index, qty) {
    await cartAPI.change(index + 1, qty);
  }

  async _remove(index) {
    await cartAPI.change(index + 1, 0);
  }

  _formatMoney(cents) {
    if (cents == null) return '—';
    return `$${(cents / 100).toFixed(2)}`;
  }

  _exportCartJSON() {
    if (!this.cart) return;

    const data = JSON.stringify(this.cart, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  _copyCartPermalink() {
    if (!this.cart || this.cart.items.length === 0) return;

    const cartPath = this.cart.items
      .map(item => `${item.variant_id}:${item.quantity}`)
      .join(',');

    const permalink = `${window.location.origin}/cart/${cartPath}`;
    navigator.clipboard.writeText(permalink);
    this._showToast('Cart permalink copied!');
  }

  _showToast(message) {
    if (this._toastTimeout) {
      clearTimeout(this._toastTimeout);
    }

    this._toastMessage = message;
    this.requestUpdate();

    this._toastTimeout = setTimeout(() => {
      this._toastMessage = null;
      this.requestUpdate();
    }, 2000);
  }

  _toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.cartHistory = [...cartAPI.cartHistory].reverse();
    }
  }

  _formatHistoryTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async _restoreCart(historyEntry) {
    if (!historyEntry.snapshot) return;

    const snapshot = historyEntry.snapshot;

    try {
      // Start restore mode - all cart changes will skip history
      cartAPI.startRestore();

      // Clear the cart first
      await cartAPI.clear();

      // Add items with full properties (properties, selling_plan, etc.)
      if (snapshot.items && snapshot.items.length > 0) {
        const items = snapshot.items.map(item => {
          const cartItem = {
            id: item.variant_id,
            quantity: item.quantity
          };

          // Preserve line item properties
          if (item.properties && Object.keys(item.properties).length > 0) {
            cartItem.properties = item.properties;
          }

          // Preserve selling plan allocation (subscriptions)
          if (item.selling_plan_allocation?.selling_plan?.id) {
            cartItem.selling_plan = item.selling_plan_allocation.selling_plan.id;
          }

          return cartItem;
        });

        await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ items })
        });
      }

      // Restore cart attributes and note
      const updatePayload = {};
      if (snapshot.attributes && Object.keys(snapshot.attributes).length > 0) {
        updatePayload.attributes = snapshot.attributes;
      }
      if (snapshot.note) {
        updatePayload.note = snapshot.note;
      }

      if (Object.keys(updatePayload).length > 0) {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });
      }

      // Fetch final cart state while still in restore mode
      const finalCart = await cartAPI.fetch();

      // End restore mode with the final cart state
      // This also sets a 500ms grace period to ignore any pending callbacks
      cartAPI.endRestore(finalCart);

      // Notify listeners of the final cart state
      if (finalCart) {
        cartAPI.notify(finalCart, null);
      }

      this._showToast('Cart restored!');
    } catch (e) {
      cartAPI.endRestore();
      console.error('[Theme Devtools] Cart restore failed:', e);
      this._showToast(`Restore failed: ${e.message}`);
    }
  }

  _getHistoryLabel(diff) {
    const labels = [];

    // Show product titles for added items
    if (diff.items?.added?.length > 0) {
      diff.items.added.forEach(item => {
        const name = item.product_title || item.title || 'Item';
        labels.push({ text: `+ ${name}`, class: 'diff__added' });
      });
    }

    // Show product titles for removed items
    if (diff.items?.removed?.length > 0) {
      diff.items.removed.forEach(item => {
        const name = item.product_title || item.title || 'Item';
        labels.push({ text: `− ${name}`, class: 'diff__removed' });
      });
    }

    // Show quantity changes with product name
    if (diff.items?.modified?.length > 0) {
      diff.items.modified.forEach(mod => {
        const name = mod.item?.product_title || mod.item?.title || 'Item';
        labels.push({
          text: `${name}: ${mod.oldQuantity} → ${mod.newQuantity}`,
          class: 'diff__modified'
        });
      });
    }

    if (diff.noteChanged) {
      labels.push({ text: 'Note updated', class: '' });
    }
    if (diff.attributesChanged) {
      labels.push({ text: 'Attrs updated', class: '' });
    }
    if (diff.discountChanged) {
      labels.push({ text: 'Discount changed', class: '' });
    }

    // Fallback: check item count change
    if (labels.length === 0) {
      const oldCount = diff.itemCount?.old ?? 0;
      const newCount = diff.itemCount?.new ?? 0;
      if (newCount > oldCount) {
        labels.push({ text: `+${newCount - oldCount} item(s) added`, class: 'diff__added' });
      } else if (newCount < oldCount) {
        labels.push({ text: `−${oldCount - newCount} item(s) removed`, class: 'diff__removed' });
      } else if (diff.totalPrice?.old !== diff.totalPrice?.new) {
        labels.push({ text: 'Price changed', class: '' });
      } else {
        labels.push({ text: 'Cart refreshed', class: '' });
      }
    }

    return labels;
  }

  _clearHistory() {
    if (this.cartHistory.length === 0) return;
    if (confirm('Clear cart history?')) {
      cartAPI.cartHistory = [];
      sessionStorage.removeItem(cartAPI.constructor.STORAGE_KEY);
      this.cartHistory = [];
    }
  }

  _renderHistoryPanel() {
    if (!this.showHistory) return '';

    return html`
      <div class="history-panel">
        <div class="history-header">
          <span>Cart History</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: normal; color: var(--tdt-text-muted);">${this.cartHistory.length} changes</span>
            ${this.cartHistory.length > 0 ? html`
              <button class="history-restore" style="background: var(--tdt-danger);" @click=${this._clearHistory} title="Clear history">
                Clear
              </button>
            ` : ''}
          </div>
        </div>
        ${this.cartHistory.length === 0
          ? html`<div class="history-empty">No cart changes recorded yet</div>`
          : html`
            <div class="history-list">
              ${this.cartHistory.map(entry => {
                const labels = this._getHistoryLabel(entry.diff);
                return html`
                  <div class="history-item">
                    <span class="history-time">${this._formatHistoryTime(entry.timestamp)}</span>
                    <div class="history-changes">
                      ${labels.map(label => html`
                        <span class="${label.class}" style="${!label.class ? 'color: var(--tdt-text-muted);' : ''}">${label.text}</span>
                      `)}
                    </div>
                    <button class="history-restore" @click=${() => this._restoreCart(entry)} title="Restore this cart state">
                      Restore
                    </button>
                  </div>
                `;
              })}
            </div>
          `
        }
      </div>
    `;
  }

  // Add Product by Variant ID
  async _addByVariantId() {
    const variantId = this.variantIdInput.trim();
    if (!variantId) return;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{ id: parseInt(variantId, 10), quantity: this.quantityInput || 1 }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        this._showToast(`Error: ${error.message || error.description || 'Failed to add'}`);
        return;
      }

      this.variantIdInput = '';
      this.quantityInput = 1;
      this._showToast('Product added!');
      await this._refresh();
    } catch (e) {
      this._showToast(`Error: ${e.message}`);
    }
  }

  // Discount Code Methods
  async _applyDiscount() {
    const code = this.discountInput.trim().toUpperCase();
    if (!code) return;

    try {
      // Navigate to discount URL to apply
      const url = `/discount/${encodeURIComponent(code)}?redirect=/cart`;
      window.location.href = url;
    } catch (e) {
      this._showToast(`Error: ${e.message}`);
    }
  }

  // Cart Attributes Methods
  async _updateNote() {
    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ note: this.noteInput })
      });
      this.editingNote = false;
      this._showToast('Note updated!');
      await this._refresh();
    } catch (e) {
      this._showToast(`Error: ${e.message}`);
    }
  }

  async _updateAttributes() {
    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ attributes: this.attributesInput })
      });
      this.editingAttributes = false;
      this._showToast('Attributes updated!');
      await this._refresh();
    } catch (e) {
      this._showToast(`Error: ${e.message}`);
    }
  }

  _startEditingAttributes() {
    this.attributesInput = { ...(this.cart?.attributes || {}) };
    this.editingAttributes = true;
  }

  _startEditingNote() {
    this.noteInput = this.cart?.note || '';
    this.editingNote = true;
  }

  // Item Expansion
  _toggleItemExpand(itemKey) {
    const newExpanded = new Set(this.expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    this.expandedItems = newExpanded;
  }

  // Quick Actions
  async _duplicateItem(item) {
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: item.variant_id,
            quantity: item.quantity,
            properties: item.properties || {}
          }]
        })
      });
      this._showToast('Item duplicated!');
      await this._refresh();
    } catch (e) {
      this._showToast(`Error: ${e.message}`);
    }
  }

  _copyVariantId(item) {
    navigator.clipboard.writeText(String(item.variant_id));
    this._showToast('Variant ID copied!');
  }

  _copyProductId(item) {
    navigator.clipboard.writeText(String(item.product_id));
    this._showToast('Product ID copied!');
  }

  _copyItemKey(item) {
    navigator.clipboard.writeText(item.key);
    this._showToast('Item key copied!');
  }

  // Calculate discount percentage
  _getDiscountPercent(originalPrice, finalPrice) {
    if (!originalPrice || originalPrice <= finalPrice) return 0;
    return Math.round((1 - finalPrice / originalPrice) * 100);
  }

  // Render compact inline sections
  _renderQuickAddRow() {
    return html`
      <div class="quick-add-row">
        <span class="label">Add:</span>
        <input
          type="text"
          placeholder="Variant ID"
          .value=${this.variantIdInput}
          @input=${(e) => this.variantIdInput = e.target.value}
          @keypress=${(e) => e.key === 'Enter' && this._addByVariantId()}
        >
        <input
          type="number"
          min="1"
          placeholder="1"
          .value=${this.quantityInput}
          @input=${(e) => this.quantityInput = parseInt(e.target.value, 10) || 1}
        >
        <button class="btn btn--sm btn--mini" @click=${this._addByVariantId}>+Add</button>
        <span style="margin-left: auto; color: var(--tdt-text-muted);">|</span>
        <span class="label">Discount:</span>
        <div class="discount-input-inline">
          <input
            type="text"
            placeholder="CODE"
            .value=${this.discountInput}
            @input=${(e) => this.discountInput = e.target.value}
            @keypress=${(e) => e.key === 'Enter' && this._applyDiscount()}
          >
          <button class="btn btn--sm btn--mini" @click=${this._applyDiscount}>Apply</button>
        </div>
      </div>
    `;
  }

  _renderInlineDiscounts() {
    const discountCodes = this.cart?.discount_codes || [];
    const totalDiscount = this.cart?.total_discount || 0;

    if (discountCodes.length === 0 && totalDiscount === 0) return '';

    return html`
      <span class="discount-inline">
        ${discountCodes.map(dc => html`
          <span class="discount-badge">${dc.code}${dc.amount ? ` -${this._formatMoney(dc.amount)}` : ''}</span>
        `)}
        ${totalDiscount > 0 && discountCodes.length === 0 ? html`
          <span class="discount-badge">-${this._formatMoney(totalDiscount)}</span>
        ` : ''}
      </span>
    `;
  }

  _renderMetaRow() {
    const attributes = this.cart?.attributes || {};
    const note = this.cart?.note || '';
    const attrCount = Object.keys(attributes).length;
    const hasData = attrCount > 0 || note;

    if (!hasData && !this.showAttributes) return '';

    return html`
      <div class="meta-row">
        ${attrCount > 0 ? html`
          <span class="meta-item">Attrs: <strong>${attrCount}</strong></span>
        ` : ''}
        ${note ? html`
          <span class="meta-item">Note: <strong>${note.length > 20 ? note.slice(0, 20) + '...' : note}</strong></span>
        ` : ''}
        <button
          class="meta-toggle ${this.showAttributes ? 'active' : ''}"
          @click=${() => this.showAttributes = !this.showAttributes}
        >
          ${this.showAttributes ? 'Hide' : 'Edit'}
        </button>
      </div>
    `;
  }

  _renderMetaPanel() {
    if (!this.showAttributes) return '';

    const attributes = this.cart?.attributes || {};
    const note = this.cart?.note || '';

    return html`
      <div class="meta-panel">
        <div class="meta-panel-header">
          <span>Cart Attributes & Note</span>
          <button class="meta-panel-close" @click=${() => this.showAttributes = false}>×</button>
        </div>

        ${this.editingAttributes ? html`
          <div class="attr-grid">
            ${Object.entries(this.attributesInput).map(([key, value]) => html`
              <input
                class="attr-input"
                style="width: 80px;"
                placeholder="key"
                .value=${key}
                @input=${(e) => {
                  const newAttrs = { ...this.attributesInput };
                  delete newAttrs[key];
                  newAttrs[e.target.value] = value;
                  this.attributesInput = newAttrs;
                }}
              >
              <input
                class="attr-input"
                placeholder="value"
                .value=${value}
                @input=${(e) => {
                  this.attributesInput = { ...this.attributesInput, [key]: e.target.value };
                }}
              >
              <button class="meta-toggle" @click=${() => {
                const newAttrs = { ...this.attributesInput };
                delete newAttrs[key];
                this.attributesInput = newAttrs;
              }}>×</button>
            `)}
          </div>
          <div class="inline-actions">
            <button class="meta-toggle" @click=${() => {
              this.attributesInput = { ...this.attributesInput, '': '' };
            }}>+ Add</button>
            <button class="btn btn--sm btn--mini" @click=${this._updateAttributes}>Save</button>
            <button class="meta-toggle" @click=${() => this.editingAttributes = false}>Cancel</button>
          </div>
        ` : html`
          ${Object.keys(attributes).length > 0 ? html`
            <div class="attr-grid" style="grid-template-columns: auto 1fr;">
              ${Object.entries(attributes).map(([key, value]) => html`
                <span class="attr-key">${key}:</span>
                <span class="attr-value">${value}</span>
              `)}
            </div>
          ` : html`
            <div style="color: var(--tdt-text-muted);">No attributes</div>
          `}
          <button class="meta-toggle" style="margin-top: 6px;" @click=${this._startEditingAttributes}>Edit Attributes</button>
        `}

        <div class="note-inline">
          <span class="attr-key">Note:</span>
          ${this.editingNote ? html`
            <textarea
              class="note-textarea"
              .value=${this.noteInput}
              @input=${(e) => this.noteInput = e.target.value}
              placeholder="Add order note..."
            ></textarea>
            <div class="inline-actions">
              <button class="btn btn--sm btn--mini" @click=${this._updateNote}>Save</button>
              <button class="meta-toggle" @click=${() => this.editingNote = false}>Cancel</button>
            </div>
          ` : html`
            <span class="note-text" @click=${this._startEditingNote}>
              ${note || 'Click to add...'}
            </span>
          `}
        </div>
      </div>
    `;
  }

  _renderItemExpanded(item) {
    const properties = item.properties || {};
    const hasProperties = Object.keys(properties).length > 0;
    const sellingPlan = item.selling_plan_allocation;
    const hasComparePrice = item.original_line_price && item.original_line_price > item.line_price;

    return html`
      <div class="item-expanded">
        <div class="item-detail-row">
          <span class="item-detail-label">Variant ID:</span>
          <span class="item-detail-value">${item.variant_id}</span>
        </div>
        <div class="item-detail-row">
          <span class="item-detail-label">Product ID:</span>
          <span class="item-detail-value">${item.product_id}</span>
        </div>
        <div class="item-detail-row">
          <span class="item-detail-label">Item Key:</span>
          <span class="item-detail-value">${item.key}</span>
        </div>
        <div class="item-detail-row">
          <span class="item-detail-label">Handle:</span>
          <span class="item-detail-value">${item.handle}</span>
        </div>
        <div class="item-detail-row">
          <span class="item-detail-label">Unit Price:</span>
          <span class="item-detail-value">${this._formatMoney(item.price)}</span>
        </div>
        ${item.original_price && item.original_price !== item.price ? html`
          <div class="item-detail-row">
            <span class="item-detail-label">Original:</span>
            <span class="item-detail-value" style="text-decoration: line-through; color: var(--tdt-text-muted);">
              ${this._formatMoney(item.original_price)}
            </span>
          </div>
        ` : ''}
        ${item.discounts && item.discounts.length > 0 ? html`
          <div class="item-detail-row">
            <span class="item-detail-label">Discounts:</span>
            <span class="item-detail-value" style="color: var(--tdt-success);">
              ${item.discounts.map(d => d.title || d.code).join(', ')}
            </span>
          </div>
        ` : ''}

        ${sellingPlan ? html`
          <div style="margin-top: 8px;">
            <span class="selling-plan-badge">
              🔄 ${sellingPlan.selling_plan?.name || 'Subscription'}
            </span>
            ${sellingPlan.price_adjustments?.length > 0 ? html`
              <div style="margin-top: 4px; font-size: calc(9px * var(--tdt-scale, 1)); color: var(--tdt-text-muted);">
                ${sellingPlan.price_adjustments.map(adj => html`
                  <div>${adj.position}: ${this._formatMoney(adj.price)}</div>
                `)}
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${hasProperties ? html`
          <div class="item-properties">
            <div class="item-properties-title">Line Item Properties:</div>
            ${Object.entries(properties).map(([key, value]) => html`
              <div class="item-detail-row">
                <span class="item-detail-label">${key}:</span>
                <span class="item-detail-value">${value}</span>
              </div>
            `)}
          </div>
        ` : ''}

        <div class="quick-actions">
          <button class="quick-action-btn" @click=${(e) => { e.stopPropagation(); this._duplicateItem(item); }}>
            Duplicate
          </button>
          <button class="quick-action-btn" @click=${(e) => { e.stopPropagation(); this._copyVariantId(item); }}>
            Copy Variant ID
          </button>
          <button class="quick-action-btn" @click=${(e) => { e.stopPropagation(); this._copyProductId(item); }}>
            Copy Product ID
          </button>
          <button class="quick-action-btn" @click=${(e) => { e.stopPropagation(); this._copyItemKey(item); }}>
            Copy Key
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.cart) {
      return html`<div class="empty-state">Loading cart...</div>`;
    }

    const hasDiff = this.diff && (
      this.diff.items.added.length > 0 ||
      this.diff.items.removed.length > 0 ||
      this.diff.items.modified.length > 0
    );

    return html`
      <div class="toolbar">
        <div class="stats">
          <span><strong>${this.cart.item_count}</strong> items</span>
          <span><strong>${this._formatMoney(this.cart.total_price)}</strong> total</span>
          <span>${this.cart.total_weight}g · ${this.cart.currency}</span>
          ${this._renderInlineDiscounts()}
        </div>
        <div class="actions">
          <button
            class="history-toggle ${this.showHistory ? 'active' : ''}"
            @click=${this._toggleHistory}
            title="View cart history"
          >
            History ${cartAPI.cartHistory.length > 0 ? `(${cartAPI.cartHistory.length})` : ''}
          </button>
          <button class="btn btn--sm" @click=${this._copyCartPermalink} title="Copy shareable cart link">
            Link
          </button>
          <button class="btn btn--sm" @click=${this._exportCartJSON} title="Download cart as JSON">
            Export
          </button>
          <button class="btn btn--sm" @click=${this._refresh}>↻ Refresh</button>
          <button class="btn btn--sm btn--danger" @click=${this._clear}>Clear</button>
        </div>
      </div>

      ${this._renderQuickAddRow()}
      ${this._renderMetaRow()}
      ${this._renderMetaPanel()}
      ${this._renderHistoryPanel()}

      ${this._toastMessage ? html`<div class="copied-toast">${this._toastMessage}</div>` : ''}

      ${hasDiff ? html`
        <div class="diff">
          ${this.diff.items.added.map(item => html`
            <span class="diff__added">+ ${item.title} ×${item.quantity}</span>
          `)}
          ${this.diff.items.removed.map(item => html`
            <span class="diff__removed">− ${item.title}</span>
          `)}
          ${this.diff.items.modified.map(({ item, oldQuantity, newQuantity }) => html`
            <span class="diff__modified">~ ${item.title}: ${oldQuantity}→${newQuantity}</span>
          `)}
        </div>
      ` : ''}

      ${this.cart.items.length === 0
        ? html`<div class="empty-state">Cart is empty</div>`
        : html`
          <table>
            <thead>
              <tr>
                <th class="col-img"></th>
                <th>Product</th>
                <th>SKU</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Price</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              ${this.cart.items.map((item, index) => {
                const isExpanded = this.expandedItems.has(item.key);
                const hasComparePrice = item.original_line_price && item.original_line_price > item.line_price;
                const discountPercent = this._getDiscountPercent(item.original_line_price, item.line_price);
                const hasProperties = item.properties && Object.keys(item.properties).length > 0;
                const hasSellingPlan = !!item.selling_plan_allocation;

                return html`
                  <tr class="item-row ${isExpanded ? 'expanded' : ''}" @click=${() => this._toggleItemExpand(item.key)}>
                    <td class="col-img">
                      ${item.image
                        ? html`<img class="item-img" src="${item.image.replace(/(\.[^.]+)$/, '_60x60$1')}" alt="">`
                        : html`<div class="item-img"></div>`
                      }
                    </td>
                    <td>
                      <div class="item-title" title="${item.product_title}">${item.product_title}</div>
                      ${item.variant_title ? html`<div class="item-variant">${item.variant_title}</div>` : ''}
                      ${hasSellingPlan ? html`
                        <span class="selling-plan-badge" style="margin-top: 2px;">
                          🔄 ${item.selling_plan_allocation?.selling_plan?.name || 'Subscription'}
                        </span>
                      ` : ''}
                      ${hasProperties ? html`
                        <div style="font-size: calc(9px * var(--tdt-scale, 1)); color: var(--tdt-text-muted); margin-top: 2px;">
                          ${Object.keys(item.properties).length} properties
                        </div>
                      ` : ''}
                    </td>
                    <td class="item-sku">${item.sku || '—'}</td>
                    <td>
                      <input
                        type="number"
                        class="qty-input"
                        .value=${item.quantity}
                        min="0"
                        @click=${(e) => e.stopPropagation()}
                        @change=${(e) => { e.stopPropagation(); this._updateQuantity(index, parseInt(e.target.value, 10)); }}
                      >
                    </td>
                    <td class="item-price">
                      ${hasComparePrice ? html`
                        <span class="compare-price">${this._formatMoney(item.original_line_price)}</span>
                      ` : ''}
                      ${this._formatMoney(item.line_price)}
                      ${discountPercent > 0 ? html`
                        <span class="sale-badge">-${discountPercent}%</span>
                      ` : ''}
                    </td>
                    <td>
                      <button class="remove-btn" @click=${(e) => { e.stopPropagation(); this._remove(index); }} title="Remove">×</button>
                    </td>
                  </tr>
                  ${isExpanded ? html`
                    <tr>
                      <td colspan="6" style="padding: 0;">
                        ${this._renderItemExpanded(item)}
                      </td>
                    </tr>
                  ` : ''}
                `;
              })}
            </tbody>
          </table>
        `
      }
    `;
  }
}

customElements.define('tdt-cart-panel', CartPanel);

