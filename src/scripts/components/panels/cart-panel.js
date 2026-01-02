import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { cartAPI } from '../../services/cart.js';

export class CartPanel extends LitElement {
  static properties = {
    cart: { type: Object },
    previousCart: { type: Object, state: true },
    diff: { type: Object, state: true },
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
        font-size: 11px;
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
        font-size: 10px;
      }

      .diff__added { color: var(--tdt-success); }
      .diff__removed { color: var(--tdt-danger); }
      .diff__modified { color: var(--tdt-warning); }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }

      th {
        text-align: left;
        padding: 4px 8px;
        font-size: 10px;
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
        font-size: 10px;
      }

      .item-sku {
        color: var(--tdt-text-muted);
        font-size: 10px;
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
        font-size: 11px;
      }

      .remove-btn {
        padding: 2px 6px;
        font-size: 10px;
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
    `
  ];

  constructor() {
    super();
    this.cart = null;
    this.previousCart = null;
    this.diff = null;
  }

  updated(changedProps) {
    if (changedProps.has('cart') && this.cart) {
      const oldCart = changedProps.get('cart');
      if (oldCart) {
        this.previousCart = oldCart;
        this.diff = cartAPI.diffCart(oldCart, this.cart);
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
        </div>
        <div class="actions">
          <button class="btn btn--sm" @click=${this._refresh}>↻ Refresh</button>
          <button class="btn btn--sm btn--danger" @click=${this._clear}>Clear</button>
        </div>
      </div>

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
              ${this.cart.items.map((item, index) => html`
                <tr>
                  <td class="col-img">
                    ${item.image 
                      ? html`<img class="item-img" src="${item.image.replace(/(\.[^.]+)$/, '_60x60$1')}" alt="">`
                      : html`<div class="item-img"></div>`
                    }
                  </td>
                  <td>
                    <div class="item-title" title="${item.product_title}">${item.product_title}</div>
                    ${item.variant_title ? html`<div class="item-variant">${item.variant_title}</div>` : ''}
                  </td>
                  <td class="item-sku">${item.sku || '—'}</td>
                  <td>
                    <input 
                      type="number" 
                      class="qty-input" 
                      .value=${item.quantity}
                      min="0"
                      @change=${(e) => this._updateQuantity(index, parseInt(e.target.value, 10))}
                    >
                  </td>
                  <td class="item-price">${this._formatMoney(item.line_price)}</td>
                  <td>
                    <button class="remove-btn" @click=${() => this._remove(index)} title="Remove">×</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        `
      }
    `;
  }
}

customElements.define('tdt-cart-panel', CartPanel);

