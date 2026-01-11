import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { cartAPI } from '../../services/cart.js';
import { CART_TEST_TEMPLATES } from '../../lib/cart-test-templates.js';

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
    // Scenario builder
    showScenarios: { type: Boolean, state: true },
    scenarios: { type: Array, state: true },
    editingScenario: { type: Object, state: true },
    scenarioNameInput: { type: String, state: true },
    // Cart Tests
    showTests: { type: Boolean, state: true },
    tests: { type: Array, state: true },
    editingTest: { type: Object, state: true },
    testResults: { type: Object, state: true },
    autoRunTests: { type: Boolean, state: true },
    showTemplatesMenu: { type: Boolean, state: true },
  };

  static SCENARIOS_STORAGE_KEY = 'tdt_cart_scenarios';
  static TESTS_STORAGE_KEY = 'tdt_cart_tests';
  static TESTS_AUTORUN_KEY = 'tdt_cart_tests_autorun';

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
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .item-properties-title {
        font-weight: 600;
        color: var(--tdt-text-muted);
        padding: 4px 8px;
        background: var(--tdt-bg-tertiary);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .item-properties-table {
        width: 100%;
        border-collapse: collapse;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .item-properties-table td {
        padding: 3px 8px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .item-properties-table tr:last-child td {
        border-bottom: none;
      }

      .item-properties-table .prop-key {
        color: var(--tdt-text-muted);
        white-space: nowrap;
        width: 1%;
        padding-right: 12px;
      }

      .item-properties-table .prop-value {
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        word-break: break-all;
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

      /* Scenario Builder Styles */
      .scenario-panel {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
        overflow: hidden;
      }

      .scenario-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--tdt-bg);
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
      }

      .scenario-header-actions {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .scenario-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .scenario-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .scenario-item:last-child {
        border-bottom: none;
      }

      .scenario-item:hover {
        background: var(--tdt-bg-hover);
      }

      .scenario-info {
        flex: 1;
        min-width: 0;
      }

      .scenario-name {
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 2px;
      }

      .scenario-meta {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .scenario-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .scenario-btn {
        padding: 4px 8px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .scenario-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .scenario-btn--primary {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .scenario-btn--primary:hover {
        opacity: 0.9;
      }

      .scenario-btn--danger {
        color: var(--tdt-danger);
      }

      .scenario-btn--danger:hover {
        background: var(--tdt-danger);
        border-color: var(--tdt-danger);
        color: white;
      }

      .scenario-empty {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      /* Scenario Editor */
      .scenario-editor {
        padding: 12px;
        background: var(--tdt-bg);
        border-top: 1px solid var(--tdt-border);
      }

      .scenario-editor-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .scenario-editor-header input {
        flex: 1;
        padding: 6px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text);
      }

      .scenario-items-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
        max-height: 200px;
        overflow-y: auto;
      }

      .scenario-item-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .scenario-item-row input {
        padding: 4px 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
      }

      .scenario-item-row input.variant-input {
        width: 100px;
      }

      .scenario-item-row input.qty-input {
        width: 45px;
        text-align: center;
      }

      .scenario-item-props {
        flex: 1;
        min-width: 0;
      }

      .scenario-item-props-row {
        display: flex;
        gap: 4px;
        margin-bottom: 4px;
      }

      .scenario-item-props-row input {
        flex: 1;
      }

      .scenario-add-prop-btn {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-accent);
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 4px;
      }

      .scenario-add-prop-btn:hover {
        text-decoration: underline;
      }

      .scenario-editor-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid var(--tdt-border);
      }

      .scenario-add-item-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        background: var(--tdt-bg-secondary);
        border: 1px dashed var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-bottom: 12px;
      }

      .scenario-add-item-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      /* Cart Tests Styles */
      .tests-panel {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
      }

      .tests-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--tdt-bg);
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
      }

      .tests-header-actions {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .tests-status {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: calc(10px * var(--tdt-scale, 1));
        font-weight: 500;
      }

      .tests-status--pass {
        background: rgba(16, 185, 129, 0.15);
        color: var(--tdt-success);
      }

      .tests-status--fail {
        background: rgba(239, 68, 68, 0.15);
        color: var(--tdt-danger);
      }

      .tests-status--idle {
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text-muted);
      }

      .test-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .test-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(11px * var(--tdt-scale, 1));
        gap: 10px;
      }

      .test-item:last-child {
        border-bottom: none;
      }

      .test-item:hover {
        background: var(--tdt-bg-hover);
      }

      .test-item--failed {
        background: rgba(239, 68, 68, 0.05);
      }

      .test-toggle {
        width: 32px;
        height: 18px;
        border-radius: 9px;
        background: var(--tdt-bg-tertiary);
        border: 1px solid var(--tdt-border);
        cursor: pointer;
        position: relative;
        flex-shrink: 0;
        transition: background 0.2s;
      }

      .test-toggle::after {
        content: '';
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: white;
        top: 1px;
        left: 1px;
        transition: transform 0.2s;
      }

      .test-toggle.enabled {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
      }

      .test-toggle.enabled::after {
        transform: translateX(14px);
      }

      .test-info {
        flex: 1;
        min-width: 0;
      }

      .test-name {
        font-weight: 600;
        color: var(--tdt-text);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .test-meta {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      .test-badge {
        display: inline-flex;
        align-items: center;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: calc(9px * var(--tdt-scale, 1));
        font-weight: 500;
      }

      .test-badge--pass {
        background: rgba(16, 185, 129, 0.15);
        color: var(--tdt-success);
      }

      .test-badge--fail {
        background: rgba(239, 68, 68, 0.15);
        color: var(--tdt-danger);
      }

      .test-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .test-btn {
        padding: 4px 8px;
        font-size: calc(9px * var(--tdt-scale, 1));
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .test-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .test-btn--primary {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .test-btn--primary:hover {
        opacity: 0.9;
      }

      .test-btn--danger {
        color: var(--tdt-danger);
      }

      .test-btn--danger:hover {
        background: var(--tdt-danger);
        border-color: var(--tdt-danger);
        color: white;
      }

      .tests-empty {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      /* Test Editor */
      .test-editor {
        padding: 12px;
        background: var(--tdt-bg);
        border-top: 1px solid var(--tdt-border);
      }

      .test-editor-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .test-editor-header input {
        flex: 1;
        padding: 6px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text);
      }

      .rules-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
        max-height: 250px;
        overflow-y: auto;
      }

      .rule-item {
        padding: 10px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        border: 1px solid var(--tdt-border);
      }

      .rule-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .rule-header input {
        flex: 1;
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
      }

      .rule-header select {
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
        cursor: pointer;
      }

      .rule-config {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .rule-config-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .rule-config-row label {
        color: var(--tdt-text-muted);
        min-width: 50px;
      }

      .rule-config-row input,
      .rule-config-row select {
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text);
      }

      .rule-config-row input {
        flex: 1;
        min-width: 80px;
      }

      .rule-props-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }

      .rule-prop-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: 3px;
        font-size: calc(9px * var(--tdt-scale, 1));
      }

      .rule-prop-tag button {
        background: none;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 0;
        font-size: calc(10px * var(--tdt-scale, 1));
        line-height: 1;
      }

      .rule-prop-tag button:hover {
        color: var(--tdt-danger);
      }

      .add-rule-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        background: var(--tdt-bg-secondary);
        border: 1px dashed var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-bottom: 12px;
      }

      .add-rule-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      .test-editor-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid var(--tdt-border);
      }

      /* Test Results */
      .test-results {
        padding: 10px 12px;
        background: var(--tdt-bg);
        border-top: 1px solid var(--tdt-border);
      }

      .test-results-summary {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .test-failures {
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .test-failure-item {
        padding: 6px 8px;
        background: rgba(239, 68, 68, 0.05);
        border-left: 2px solid var(--tdt-danger);
        margin-bottom: 4px;
        border-radius: 0 3px 3px 0;
      }

      .test-failure-item:last-child {
        margin-bottom: 0;
      }

      .failure-rule {
        font-weight: 600;
        color: var(--tdt-danger);
      }

      .failure-message {
        color: var(--tdt-text);
        margin-top: 2px;
      }

      .failure-item-ref {
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        font-size: calc(9px * var(--tdt-scale, 1));
        margin-top: 2px;
      }

      /* Templates dropdown */
      .templates-dropdown {
        position: relative;
      }

      .templates-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 220px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 100;
        margin-top: 4px;
      }

      .templates-menu-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--tdt-border);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .templates-menu-item:last-child {
        border-bottom: none;
      }

      .templates-menu-item:hover {
        background: var(--tdt-bg-hover);
      }

      .templates-menu-item-name {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .templates-menu-item-desc {
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      /* Auto-run toggle */
      .autorun-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--tdt-radius);
      }

      .autorun-toggle:hover {
        background: var(--tdt-bg-hover);
      }

      .autorun-toggle input {
        cursor: pointer;
      }

      /* Failed item indicator in cart table */
      .item-row.test-failed {
        background: rgba(239, 68, 68, 0.05);
      }

      .item-row.test-failed td:first-child {
        border-left: 3px solid var(--tdt-danger);
      }

      .test-fail-indicator {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 1px 5px;
        background: rgba(239, 68, 68, 0.15);
        border-radius: 3px;
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-danger);
        margin-left: 6px;
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
    // Scenario builder
    this.showScenarios = false;
    this.scenarios = [];
    this.editingScenario = null;
    this.scenarioNameInput = '';
    this._loadScenarios();
    // Cart Tests
    this.showTests = false;
    this.tests = [];
    this.editingTest = null;
    this.testResults = null;
    this.autoRunTests = false;
    this.showTemplatesMenu = false;
    this._testNameInput = '';
    this._newPropInput = '';
    this._loadTests();
  }

  _loadScenarios() {
    try {
      const stored = localStorage.getItem(CartPanel.SCENARIOS_STORAGE_KEY);
      if (stored) {
        this.scenarios = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[TDT] Failed to load scenarios:', err);
    }
  }

  _saveScenarios() {
    try {
      localStorage.setItem(CartPanel.SCENARIOS_STORAGE_KEY, JSON.stringify(this.scenarios));
    } catch (err) {
      console.warn('[TDT] Failed to save scenarios:', err);
    }
  }

  _exportScenarios() {
    if (this.scenarios.length === 0) {
      this._showToast('No scenarios to export');
      return;
    }
    const data = JSON.stringify(this.scenarios, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this._showToast('Scenarios exported!');
  }

  async _handleImportScenariosFile(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected array of scenarios');
        }
        const newScenarios = imported.map(scenario => ({
          ...scenario,
          id: Date.now() + Math.random(),
          createdAt: scenario.createdAt || new Date().toISOString()
        }));
        this.scenarios = [...this.scenarios, ...newScenarios];
        this._saveScenarios();
        this._showToast(`Imported ${newScenarios.length} scenario(s)`);
      } catch (err) {
        this._showToast(`Import failed: ${err.message}`);
      }
    }
    // Reset so same file can be selected again
    e.target.value = '';
  }

  _loadTests() {
    try {
      const stored = localStorage.getItem(CartPanel.TESTS_STORAGE_KEY);
      if (stored) {
        this.tests = JSON.parse(stored);
      }
      const autoRun = localStorage.getItem(CartPanel.TESTS_AUTORUN_KEY);
      this.autoRunTests = autoRun === 'true';
    } catch (err) {
      console.warn('[TDT] Failed to load tests:', err);
    }
  }

  _saveTests() {
    try {
      localStorage.setItem(CartPanel.TESTS_STORAGE_KEY, JSON.stringify(this.tests));
      localStorage.setItem(CartPanel.TESTS_AUTORUN_KEY, String(this.autoRunTests));
    } catch (err) {
      console.warn('[TDT] Failed to save tests:', err);
    }
  }

  _exportTests() {
    if (this.tests.length === 0) {
      this._showToast('No tests to export');
      return;
    }
    const data = JSON.stringify(this.tests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-tests-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this._showToast('Tests exported!');
  }

  async _handleImportFile(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected array of tests');
        }
        const newTests = imported.map(test => ({
          ...test,
          id: Date.now() + Math.random(),
          createdAt: test.createdAt || new Date().toISOString()
        }));
        this.tests = [...this.tests, ...newTests];
        this._saveTests();
        this._showToast(`Imported ${newTests.length} test(s)`);
      } catch (err) {
        this._showToast(`Import failed: ${err.message}`);
      }
    }
    // Reset so same file can be selected again
    e.target.value = '';
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
      // Auto-run tests if enabled
      if (this.autoRunTests && this.tests.length > 0) {
        this._runAllTests();
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

  // ============ Cart Tests Methods ============

  _toggleTests() {
    this.showTests = !this.showTests;
    if (!this.showTests) {
      this.editingTest = null;
      this.showTemplatesMenu = false;
    }
  }

  _toggleAutoRun() {
    this.autoRunTests = !this.autoRunTests;
    this._saveTests();
    if (this.autoRunTests && this.cart) {
      this._runAllTests();
    }
  }

  _createNewTest() {
    this.editingTest = {
      id: null,
      name: '',
      enabled: true,
      rules: [{
        id: Date.now(),
        name: 'New Rule',
        type: 'property-dependency',
        config: {
          ifProperty: { key: '', value: '', operator: 'equals' },
          requiredProperties: []
        }
      }]
    };
    this._testNameInput = '';
  }

  _createTestFromTemplate(template) {
    this.editingTest = {
      id: null,
      name: template.name,
      enabled: true,
      rules: template.rules.map(r => ({ ...r, id: Date.now() + Math.random() }))
    };
    this._testNameInput = template.name;
    this.showTemplatesMenu = false;
  }

  _editTest(test) {
    this.editingTest = {
      ...test,
      rules: test.rules.map(r => ({
        ...r,
        config: JSON.parse(JSON.stringify(r.config))
      }))
    };
    this._testNameInput = test.name;
  }

  _deleteTest(testId) {
    if (!confirm('Delete this test?')) return;
    this.tests = this.tests.filter(t => t.id !== testId);
    this._saveTests();
    this._showToast('Test deleted');
    // Clear results for deleted test
    if (this.testResults) {
      const newResults = { ...this.testResults };
      delete newResults[testId];
      this.testResults = newResults;
    }
  }

  _cancelEditTest() {
    this.editingTest = null;
    this._testNameInput = '';
  }

  _saveEditingTest() {
    if (!this._testNameInput.trim()) {
      this._showToast('Please enter a test name');
      return;
    }

    const validRules = this.editingTest.rules.filter(r => r.name.trim());
    if (validRules.length === 0) {
      this._showToast('Add at least one rule');
      return;
    }

    const test = {
      ...this.editingTest,
      name: this._testNameInput.trim(),
      rules: validRules,
      id: this.editingTest.id || Date.now(),
      createdAt: this.editingTest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.editingTest.id) {
      this.tests = this.tests.map(t => t.id === test.id ? test : t);
    } else {
      this.tests = [...this.tests, test];
    }

    this._saveTests();
    this.editingTest = null;
    this._testNameInput = '';
    this._showToast('Test saved!');

    // Run tests after save
    if (this.cart) {
      this._runAllTests();
    }
  }

  _toggleTestEnabled(testId) {
    this.tests = this.tests.map(t =>
      t.id === testId ? { ...t, enabled: !t.enabled } : t
    );
    this._saveTests();
    if (this.cart) {
      this._runAllTests();
    }
  }

  _addRule() {
    const newRule = {
      id: Date.now(),
      name: 'New Rule',
      type: 'property-dependency',
      config: {
        ifProperty: { key: '', value: '', operator: 'equals' },
        requiredProperties: []
      }
    };
    this.editingTest = {
      ...this.editingTest,
      rules: [...this.editingTest.rules, newRule]
    };
  }

  _removeRule(ruleId) {
    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.filter(r => r.id !== ruleId)
    };
  }

  _updateRule(ruleId, updates) {
    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.map(r =>
        r.id === ruleId ? { ...r, ...updates } : r
      )
    };
  }

  _updateRuleConfig(ruleId, configPath, value) {
    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.map(r => {
        if (r.id !== ruleId) return r;
        const newConfig = JSON.parse(JSON.stringify(r.config));
        const parts = configPath.split('.');
        let obj = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
        return { ...r, config: newConfig };
      })
    };
  }

  _changeRuleType(ruleId, newType) {
    const defaultConfigs = {
      'property-dependency': {
        ifProperty: { key: '', value: '', operator: 'equals' },
        requiredProperties: []
      },
      'field-value': {
        ifField: { field: '', value: '', operator: 'equals' },
        thenField: { field: '', value: '', operator: 'equals' }
      },
      'cart-composition': {
        ifItem: { field: 'handle', value: '' },
        requiresItem: { field: 'handle', value: '' }
      },
      'quantity': {
        scope: 'per-item',
        min: null,
        max: null,
        multiple: null,
        filterField: '',
        filterValue: ''
      }
    };

    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.map(r =>
        r.id === ruleId ? { ...r, type: newType, config: defaultConfigs[newType] } : r
      )
    };
  }

  _addRequiredProperty(ruleId, value) {
    const propValue = (value || this._newPropInput || '').trim();
    if (!propValue) return;
    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.map(r => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          config: {
            ...r.config,
            requiredProperties: [...(r.config.requiredProperties || []), propValue]
          }
        };
      })
    };
    this._newPropInput = '';
  }

  _removeRequiredProperty(ruleId, prop) {
    this.editingTest = {
      ...this.editingTest,
      rules: this.editingTest.rules.map(r => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          config: {
            ...r.config,
            requiredProperties: r.config.requiredProperties.filter(p => p !== prop)
          }
        };
      })
    };
  }

  // Test Runner
  _runAllTests() {
    if (!this.cart) return;

    const results = {};
    const enabledTests = this.tests.filter(t => t.enabled);

    enabledTests.forEach(test => {
      results[test.id] = this._runTest(test);
    });

    this.testResults = results;
  }

  _runTest(test) {
    const failures = [];

    test.rules.forEach(rule => {
      const ruleFailures = this._evaluateRule(rule);
      failures.push(...ruleFailures);
    });

    return {
      testId: test.id,
      passed: failures.length === 0,
      timestamp: new Date().toISOString(),
      failures
    };
  }

  _evaluateRule(rule) {
    const failures = [];
    const items = this.cart?.items || [];

    switch (rule.type) {
      case 'property-dependency':
        items.forEach(item => {
          if (this._matchesCondition(item, rule.config.ifProperty, 'property')) {
            const properties = item.properties || {};
            const missing = rule.config.requiredProperties.filter(
              prop => !(prop in properties)
            );
            if (missing.length > 0) {
              failures.push({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `Missing required properties: ${missing.join(', ')}`,
                itemKey: item.key,
                itemTitle: item.product_title
              });
            }
          }
        });
        break;

      case 'field-value':
        items.forEach(item => {
          if (this._matchesCondition(item, rule.config.ifField, 'field')) {
            if (!this._matchesCondition(item, rule.config.thenField, 'field')) {
              const expected = rule.config.thenField;
              failures.push({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `${expected.field} should ${expected.operator} "${expected.value}"`,
                itemKey: item.key,
                itemTitle: item.product_title
              });
            }
          }
        });
        break;

      case 'cart-composition':
        const matchingItems = items.filter(item =>
          this._getNestedValue(item, rule.config.ifItem.field) === rule.config.ifItem.value
        );
        if (matchingItems.length > 0) {
          const hasRequired = items.some(item =>
            this._getNestedValue(item, rule.config.requiresItem.field) === rule.config.requiresItem.value
          );
          if (!hasRequired) {
            failures.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: `Cart should contain item with ${rule.config.requiresItem.field}="${rule.config.requiresItem.value}"`,
              itemKey: matchingItems[0].key,
              itemTitle: matchingItems[0].product_title
            });
          }
        }
        break;

      case 'quantity':
        const { scope, min, max, multiple, filterField, filterValue } = rule.config;

        // Filter items if filter is specified
        let targetItems = items;
        if (filterField && filterValue) {
          targetItems = items.filter(item =>
            String(this._getNestedValue(item, filterField)) === String(filterValue)
          );
        }

        if (scope === 'per-item') {
          // Check each item individually
          targetItems.forEach(item => {
            const qty = item.quantity;

            if (min !== null && min !== '' && qty < Number(min)) {
              failures.push({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `Quantity ${qty} is below minimum ${min}`,
                itemKey: item.key,
                itemTitle: item.product_title
              });
            }

            if (max !== null && max !== '' && qty > Number(max)) {
              failures.push({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `Quantity ${qty} exceeds maximum ${max}`,
                itemKey: item.key,
                itemTitle: item.product_title
              });
            }

            if (multiple !== null && multiple !== '' && qty % Number(multiple) !== 0) {
              failures.push({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `Quantity ${qty} must be a multiple of ${multiple}`,
                itemKey: item.key,
                itemTitle: item.product_title
              });
            }
          });
        } else if (scope === 'cart-total') {
          // Check total quantity across all (filtered) items
          const totalQty = targetItems.reduce((sum, item) => sum + item.quantity, 0);

          if (min !== null && min !== '' && totalQty < Number(min)) {
            failures.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: `Cart total quantity ${totalQty} is below minimum ${min}`,
              itemKey: targetItems[0]?.key || 'cart',
              itemTitle: 'Cart Total'
            });
          }

          if (max !== null && max !== '' && totalQty > Number(max)) {
            failures.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: `Cart total quantity ${totalQty} exceeds maximum ${max}`,
              itemKey: targetItems[0]?.key || 'cart',
              itemTitle: 'Cart Total'
            });
          }

          if (multiple !== null && multiple !== '' && totalQty % Number(multiple) !== 0) {
            failures.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: `Cart total quantity ${totalQty} must be a multiple of ${multiple}`,
              itemKey: targetItems[0]?.key || 'cart',
              itemTitle: 'Cart Total'
            });
          }
        }
        break;
    }

    return failures;
  }

  _matchesCondition(item, condition, type) {
    let value;
    if (type === 'property') {
      value = (item.properties || {})[condition.key];
    } else {
      value = this._getNestedValue(item, condition.field);
    }

    switch (condition.operator) {
      case 'equals':
        return String(value) === String(condition.value);
      case 'not-equals':
        return String(value) !== String(condition.value);
      case 'contains':
        return String(value || '').includes(condition.value);
      case 'exists':
        return value !== undefined && value !== null && value !== '';
      case 'less-than':
        return Number(value) < Number(condition.value);
      case 'greater-than':
        return Number(value) > Number(condition.value);
      default:
        return false;
    }
  }

  _getNestedValue(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  _getFailedItemKeys() {
    if (!this.testResults) return new Set();
    const keys = new Set();
    Object.values(this.testResults).forEach(result => {
      result.failures.forEach(f => keys.add(f.itemKey));
    });
    return keys;
  }

  _getTestsSummary() {
    if (!this.testResults) return { total: 0, passed: 0, failed: 0 };
    const results = Object.values(this.testResults);
    return {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    };
  }

  _getAllFailures() {
    if (!this.testResults) return [];
    const failures = [];
    Object.values(this.testResults).forEach(result => {
      failures.push(...result.failures);
    });
    return failures;
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
        <span style="margin-left: auto; color: var(--tdt-text-muted);"></span>
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
          <span class="item-detail-label">Vendor:</span>
          <span class="item-detail-value">${item.vendor || '—'}</span>
        </div>
        <div class="item-detail-row">
          <span class="item-detail-label">Product Type:</span>
          <span class="item-detail-value">${item.product_type || '—'}</span>
        </div>
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
            <div class="item-properties-title">Properties</div>
            <table class="item-properties-table">
              <tbody>
                ${Object.entries(properties).map(([key, value]) => html`
                  <tr>
                    <td class="prop-key">${key}</td>
                    <td class="prop-value">${value}</td>
                  </tr>
                `)}
              </tbody>
            </table>
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

  // ============ Scenario Builder Methods ============

  _toggleScenarios() {
    this.showScenarios = !this.showScenarios;
    if (!this.showScenarios) {
      this.editingScenario = null;
    }
  }

  _createNewScenario() {
    this.editingScenario = {
      id: null,
      name: '',
      items: [{ variantId: '', quantity: 1, properties: {} }],
      note: '',
      attributes: {}
    };
    this.scenarioNameInput = '';
  }

  _saveCurrentCartAsScenario() {
    if (!this.cart || this.cart.items.length === 0) {
      this._showToast('Cart is empty');
      return;
    }

    const name = prompt('Enter scenario name:', `Cart ${new Date().toLocaleDateString()}`);
    if (!name) return;

    const scenario = {
      id: Date.now(),
      name,
      items: this.cart.items.map(item => ({
        variantId: String(item.variant_id),
        quantity: item.quantity,
        properties: item.properties || {},
        // Store metadata for display
        _title: item.product_title,
        _variant: item.variant_title,
        _sku: item.sku
      })),
      note: this.cart.note || '',
      attributes: this.cart.attributes || {},
      createdAt: new Date().toISOString()
    };

    this.scenarios = [...this.scenarios, scenario];
    this._saveScenarios();
    this._showToast('Scenario saved!');
  }

  _editScenario(scenario) {
    this.editingScenario = {
      ...scenario,
      items: scenario.items.map(item => ({ ...item, properties: { ...item.properties } }))
    };
    this.scenarioNameInput = scenario.name;
  }

  _deleteScenario(scenarioId) {
    if (!confirm('Delete this scenario?')) return;
    this.scenarios = this.scenarios.filter(s => s.id !== scenarioId);
    this._saveScenarios();
    this._showToast('Scenario deleted');
  }

  _cancelEditScenario() {
    this.editingScenario = null;
    this.scenarioNameInput = '';
  }

  _saveEditingScenario() {
    if (!this.scenarioNameInput.trim()) {
      this._showToast('Please enter a scenario name');
      return;
    }

    const validItems = this.editingScenario.items.filter(item => item.variantId.trim());
    if (validItems.length === 0) {
      this._showToast('Add at least one item with a variant ID');
      return;
    }

    const scenario = {
      ...this.editingScenario,
      name: this.scenarioNameInput.trim(),
      items: validItems,
      id: this.editingScenario.id || Date.now(),
      createdAt: this.editingScenario.createdAt || new Date().toISOString()
    };

    if (this.editingScenario.id) {
      // Update existing
      this.scenarios = this.scenarios.map(s => s.id === scenario.id ? scenario : s);
    } else {
      // Add new
      this.scenarios = [...this.scenarios, scenario];
    }

    this._saveScenarios();
    this.editingScenario = null;
    this.scenarioNameInput = '';
    this._showToast('Scenario saved!');
  }

  _addScenarioItem() {
    this.editingScenario = {
      ...this.editingScenario,
      items: [...this.editingScenario.items, { variantId: '', quantity: 1, properties: {} }]
    };
  }

  _removeScenarioItem(index) {
    const items = [...this.editingScenario.items];
    items.splice(index, 1);
    this.editingScenario = { ...this.editingScenario, items };
  }

  _updateScenarioItem(index, field, value) {
    const items = [...this.editingScenario.items];
    items[index] = { ...items[index], [field]: value };
    this.editingScenario = { ...this.editingScenario, items };
  }

  _addScenarioItemProperty(index) {
    const items = [...this.editingScenario.items];
    const props = { ...items[index].properties, '': '' };
    items[index] = { ...items[index], properties: props };
    this.editingScenario = { ...this.editingScenario, items };
  }

  _updateScenarioItemProperty(itemIndex, oldKey, newKey, newValue) {
    const items = [...this.editingScenario.items];
    const props = { ...items[itemIndex].properties };
    if (oldKey !== newKey) {
      delete props[oldKey];
    }
    props[newKey] = newValue;
    items[itemIndex] = { ...items[itemIndex], properties: props };
    this.editingScenario = { ...this.editingScenario, items };
  }

  _removeScenarioItemProperty(itemIndex, key) {
    const items = [...this.editingScenario.items];
    const props = { ...items[itemIndex].properties };
    delete props[key];
    items[itemIndex] = { ...items[itemIndex], properties: props };
    this.editingScenario = { ...this.editingScenario, items };
  }

  async _loadScenario(scenario, clearFirst = false) {
    try {
      if (clearFirst) {
        await cartAPI.clear();
      }

      const items = scenario.items.map(item => {
        const cartItem = {
          id: parseInt(item.variantId, 10),
          quantity: item.quantity
        };
        if (item.properties && Object.keys(item.properties).length > 0) {
          cartItem.properties = item.properties;
        }
        return cartItem;
      });

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.description || 'Failed to add items');
      }

      // Update note and attributes if present
      const updatePayload = {};
      if (scenario.note) {
        updatePayload.note = scenario.note;
      }
      if (scenario.attributes && Object.keys(scenario.attributes).length > 0) {
        updatePayload.attributes = scenario.attributes;
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

      await this._refresh();
      this._showToast(`Loaded "${scenario.name}"`);
    } catch (err) {
      this._showToast(`Error: ${err.message}`);
    }
  }

  _renderScenarioPanel() {
    if (!this.showScenarios) return '';

    return html`
      <div class="scenario-panel">
        <div class="scenario-header">
          <span>Cart Scenarios</span>
          <div class="scenario-header-actions">
            <span style="font-weight: normal; color: var(--tdt-text-muted);">${this.scenarios.length} saved</span>
            <label class="scenario-btn" title="Import scenarios" style="cursor:pointer;">
              Import
              <input
                type="file"
                accept=".json"
                style="display:none;"
                @change=${this._handleImportScenariosFile}
              />
            </label>
            <button class="scenario-btn" @click=${this._exportScenarios} title="Export scenarios">
              Export
            </button>
            <button class="scenario-btn" @click=${this._saveCurrentCartAsScenario} title="Save current cart as scenario">
              Save Current
            </button>
            <button class="scenario-btn scenario-btn--primary" @click=${this._createNewScenario}>
              + New
            </button>
          </div>
        </div>

        ${this.editingScenario ? this._renderScenarioEditor() : html`
          ${this.scenarios.length === 0 ? html`
            <div class="scenario-empty">
              No scenarios saved yet. Save your current cart or create a new scenario.
            </div>
          ` : html`
            <div class="scenario-list">
              ${this.scenarios.map(scenario => html`
                <div class="scenario-item">
                  <div class="scenario-info">
                    <div class="scenario-name">${scenario.name}</div>
                    <div class="scenario-meta">
                      ${scenario.items.length} item${scenario.items.length !== 1 ? 's' : ''}
                      ${scenario.items.slice(0, 2).map(i => i._title || `#${i.variantId}`).join(', ')}
                      ${scenario.items.length > 2 ? '...' : ''}
                    </div>
                  </div>
                  <div class="scenario-actions">
                    <button class="scenario-btn scenario-btn--primary" @click=${() => this._loadScenario(scenario, true)} title="Clear cart and load">
                      Replace
                    </button>
                    <button class="scenario-btn" @click=${() => this._loadScenario(scenario, false)} title="Add to existing cart">
                      Append
                    </button>
                    <button class="scenario-btn" @click=${() => this._editScenario(scenario)} title="Edit scenario">
                      Edit
                    </button>
                    <button class="scenario-btn scenario-btn--danger" @click=${() => this._deleteScenario(scenario.id)} title="Delete">
                      ×
                    </button>
                  </div>
                </div>
              `)}
            </div>
          `}
        `}
      </div>
    `;
  }

  _renderScenarioEditor() {
    return html`
      <div class="scenario-editor">
        <div class="scenario-editor-header">
          <input
            type="text"
            placeholder="Scenario name..."
            .value=${this.scenarioNameInput}
            @input=${(e) => this.scenarioNameInput = e.target.value}
          >
        </div>

        <div class="scenario-items-list">
          ${this.editingScenario.items.map((item, index) => html`
            <div class="scenario-item-row">
              <input
                type="text"
                class="variant-input"
                placeholder="Variant ID"
                .value=${item.variantId}
                @input=${(e) => this._updateScenarioItem(index, 'variantId', e.target.value)}
              >
              <input
                type="number"
                class="qty-input"
                min="1"
                .value=${item.quantity}
                @input=${(e) => this._updateScenarioItem(index, 'quantity', parseInt(e.target.value, 10) || 1)}
              >
              <div class="scenario-item-props">
                ${Object.entries(item.properties).map(([key, value], propIndex) => html`
                  <div class="scenario-item-props-row" data-prop-index="${propIndex}">
                    <input
                      type="text"
                      placeholder="key"
                      .value=${key}
                      @change=${(e) => this._updateScenarioItemProperty(index, key, e.target.value, value)}
                      @blur=${(e) => this._updateScenarioItemProperty(index, key, e.target.value, value)}
                    >
                    <input
                      type="text"
                      placeholder="value"
                      .value=${value}
                      @input=${(e) => this._updateScenarioItemProperty(index, key, key, e.target.value)}
                    >
                    <button class="scenario-btn scenario-btn--danger" style="padding: 2px 6px;" @click=${() => this._removeScenarioItemProperty(index, key)}>×</button>
                  </div>
                `)}
                <button class="scenario-add-prop-btn" @click=${() => this._addScenarioItemProperty(index)}>+ property</button>
              </div>
              ${this.editingScenario.items.length > 1 ? html`
                <button class="scenario-btn scenario-btn--danger" @click=${() => this._removeScenarioItem(index)}>×</button>
              ` : ''}
            </div>
          `)}
        </div>

        <button class="scenario-add-item-btn" @click=${this._addScenarioItem}>
          + Add Item
        </button>

        <div class="scenario-editor-actions">
          <button class="scenario-btn" @click=${this._cancelEditScenario}>Cancel</button>
          <button class="scenario-btn scenario-btn--primary" @click=${this._saveEditingScenario}>Save Scenario</button>
        </div>
      </div>
    `;
  }

  // ============ Tests Panel Rendering ============

  _renderTestsPanel() {
    if (!this.showTests) return '';

    const summary = this._getTestsSummary();
    const allFailures = this._getAllFailures();

    return html`
      <div class="tests-panel">
        <div class="tests-header">
          <span>Cart Tests</span>
          <div class="tests-header-actions">
            ${summary.total > 0 ? html`
              <span class="tests-status ${summary.failed > 0 ? 'tests-status--fail' : 'tests-status--pass'}">
                ${summary.failed > 0 ? `${summary.failed} failed` : `${summary.passed} passed`}
              </span>
            ` : html`
              <span class="tests-status tests-status--idle">No tests</span>
            `}
            <label class="autorun-toggle" title="Auto-run tests when cart changes">
              <input type="checkbox" ?checked=${this.autoRunTests} @change=${this._toggleAutoRun}>
              Auto
            </label>
            <button class="test-btn" @click=${this._runAllTests} title="Run all tests">
              Run
            </button>
            <div class="templates-dropdown">
              <button class="test-btn" @click=${() => this.showTemplatesMenu = !this.showTemplatesMenu}>
                Templates ▾
              </button>
              ${this.showTemplatesMenu ? html`
                <div class="templates-menu">
                  ${CART_TEST_TEMPLATES.map(t => html`
                    <div class="templates-menu-item" @click=${() => this._createTestFromTemplate(t)}>
                      <div class="templates-menu-item-name">${t.name}</div>
                      <div class="templates-menu-item-desc">${t.description}</div>
                    </div>
                  `)}
                </div>
              ` : ''}
            </div>
            <label class="test-btn" title="Import tests" style="cursor:pointer;">
              Import
              <input
                type="file"
                accept=".json"
                style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;"
                @change=${this._handleImportFile}
              >
            </label>
            <button class="test-btn" @click=${this._exportTests} title="Export tests">
              Export
            </button>
            <button class="test-btn test-btn--primary" @click=${this._createNewTest}>
              + New
            </button>
          </div>
        </div>

        ${this.editingTest ? this._renderTestEditor() : html`
          ${this.tests.length === 0 ? html`
            <div class="tests-empty">
              No tests created yet. Create a new test or use a template.
            </div>
          ` : html`
            <div class="test-list">
              ${this.tests.map(test => {
                const result = this.testResults?.[test.id];
                const hasFailed = result && !result.passed;
                return html`
                  <div class="test-item ${hasFailed ? 'test-item--failed' : ''}">
                    <div
                      class="test-toggle ${test.enabled ? 'enabled' : ''}"
                      @click=${() => this._toggleTestEnabled(test.id)}
                      title="${test.enabled ? 'Disable test' : 'Enable test'}"
                    ></div>
                    <div class="test-info">
                      <div class="test-name">
                        ${test.name}
                        ${result ? html`
                          <span class="test-badge ${result.passed ? 'test-badge--pass' : 'test-badge--fail'}">
                            ${result.passed ? '✓ Pass' : `✗ ${result.failures.length} fail`}
                          </span>
                        ` : ''}
                      </div>
                      <div class="test-meta">
                        ${test.rules.length} rule${test.rules.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div class="test-actions">
                      <button class="test-btn" @click=${() => this._editTest(test)} title="Edit test">
                        Edit
                      </button>
                      <button class="test-btn test-btn--danger" @click=${() => this._deleteTest(test.id)} title="Delete">
                        ×
                      </button>
                    </div>
                  </div>
                `;
              })}
            </div>
          `}
        `}

        ${allFailures.length > 0 && !this.editingTest ? html`
          <div class="test-results">
            <div class="test-results-summary">
              <span style="color: var(--tdt-danger); font-weight: 600;">
                ${allFailures.length} failure${allFailures.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div class="test-failures">
              ${allFailures.slice(0, 5).map(f => html`
                <div class="test-failure-item">
                  <div class="failure-rule">${f.ruleName}</div>
                  <div class="failure-message">${f.message}</div>
                  <div class="failure-item-ref">Item: ${f.itemTitle}</div>
                </div>
              `)}
              ${allFailures.length > 5 ? html`
                <div style="padding: 6px 8px; color: var(--tdt-text-muted); font-size: calc(10px * var(--tdt-scale, 1));">
                  ... and ${allFailures.length - 5} more
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderTestEditor() {
    return html`
      <div class="test-editor">
        <div class="test-editor-header">
          <input
            type="text"
            placeholder="Test name..."
            .value=${this._testNameInput}
            @input=${(e) => this._testNameInput = e.target.value}
          >
        </div>

        <div class="rules-list">
          ${this.editingTest.rules.map(rule => html`
            <div class="rule-item">
              <div class="rule-header">
                <input
                  type="text"
                  placeholder="Rule name"
                  .value=${rule.name}
                  @input=${(e) => this._updateRule(rule.id, { name: e.target.value })}
                >
                <select
                  .value=${rule.type}
                  @change=${(e) => this._changeRuleType(rule.id, e.target.value)}
                >
                  <option value="property-dependency">Property Dependency</option>
                  <option value="field-value">Field Value</option>
                  <option value="cart-composition">Cart Composition</option>
                  <option value="quantity">Quantity</option>
                </select>
                ${this.editingTest.rules.length > 1 ? html`
                  <button class="test-btn test-btn--danger" @click=${() => this._removeRule(rule.id)}>×</button>
                ` : ''}
              </div>

              <div class="rule-config">
                ${this._renderRuleConfig(rule)}
              </div>
            </div>
          `)}
        </div>

        <button class="add-rule-btn" @click=${this._addRule}>
          + Add Rule
        </button>

        <div class="test-editor-actions">
          <button class="test-btn" @click=${this._cancelEditTest}>Cancel</button>
          <button class="test-btn test-btn--primary" @click=${this._saveEditingTest}>Save Test</button>
        </div>
      </div>
    `;
  }

  _renderRuleConfig(rule) {
    switch (rule.type) {
      case 'property-dependency':
        return html`
          <div class="rule-config-row">
            <label>IF property</label>
            <input
              type="text"
              placeholder="key"
              style="max-width: 100px;"
              .value=${rule.config.ifProperty?.key || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'ifProperty.key', e.target.value)}
            >
            <select
              .value=${rule.config.ifProperty?.operator || 'equals'}
              @change=${(e) => this._updateRuleConfig(rule.id, 'ifProperty.operator', e.target.value)}
            >
              <option value="equals">equals</option>
              <option value="exists">exists</option>
              <option value="contains">contains</option>
            </select>
            ${rule.config.ifProperty?.operator !== 'exists' ? html`
              <input
                type="text"
                placeholder="value"
                .value=${rule.config.ifProperty?.value || ''}
                @input=${(e) => this._updateRuleConfig(rule.id, 'ifProperty.value', e.target.value)}
              >
            ` : ''}
          </div>
          <div class="rule-config-row">
            <label>THEN require properties:</label>
          </div>
          <div class="rule-props-list">
            ${(rule.config.requiredProperties || []).map(prop => html`
              <span class="rule-prop-tag">
                ${prop}
                <button @click=${() => this._removeRequiredProperty(rule.id, prop)}>×</button>
              </span>
            `)}
            <input
              type="text"
              placeholder="+ add property"
              style="width: 100px; font-size: calc(9px * var(--tdt-scale, 1));"
              @keypress=${(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  this._addRequiredProperty(rule.id, e.target.value);
                  e.target.value = '';
                }
              }}
            >
          </div>
        `;

      case 'field-value':
        return html`
          <div class="rule-config-row">
            <label>IF field</label>
            <input
              type="text"
              placeholder="field (e.g. product_type)"
              .value=${rule.config.ifField?.field || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'ifField.field', e.target.value)}
            >
            <select
              .value=${rule.config.ifField?.operator || 'equals'}
              @change=${(e) => this._updateRuleConfig(rule.id, 'ifField.operator', e.target.value)}
            >
              <option value="equals">equals</option>
              <option value="not-equals">not equals</option>
              <option value="contains">contains</option>
              <option value="exists">exists</option>
            </select>
            ${rule.config.ifField?.operator !== 'exists' ? html`
              <input
                type="text"
                placeholder="value"
                .value=${rule.config.ifField?.value || ''}
                @input=${(e) => this._updateRuleConfig(rule.id, 'ifField.value', e.target.value)}
              >
            ` : ''}
          </div>
          <div class="rule-config-row">
            <label>THEN field</label>
            <input
              type="text"
              placeholder="field (e.g. quantity)"
              .value=${rule.config.thenField?.field || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'thenField.field', e.target.value)}
            >
            <select
              .value=${rule.config.thenField?.operator || 'equals'}
              @change=${(e) => this._updateRuleConfig(rule.id, 'thenField.operator', e.target.value)}
            >
              <option value="equals">equals</option>
              <option value="not-equals">not equals</option>
              <option value="less-than">less than</option>
              <option value="greater-than">greater than</option>
              <option value="exists">exists</option>
            </select>
            ${rule.config.thenField?.operator !== 'exists' ? html`
              <input
                type="text"
                placeholder="value"
                .value=${rule.config.thenField?.value || ''}
                @input=${(e) => this._updateRuleConfig(rule.id, 'thenField.value', e.target.value)}
              >
            ` : ''}
          </div>
        `;

      case 'cart-composition':
        return html`
          <div class="rule-config-row">
            <label>IF cart has item with</label>
            <input
              type="text"
              placeholder="field"
              style="max-width: 80px;"
              .value=${rule.config.ifItem?.field || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'ifItem.field', e.target.value)}
            >
            <span>=</span>
            <input
              type="text"
              placeholder="value"
              .value=${rule.config.ifItem?.value || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'ifItem.value', e.target.value)}
            >
          </div>
          <div class="rule-config-row">
            <label>THEN cart must also have item with</label>
            <input
              type="text"
              placeholder="field"
              style="max-width: 80px;"
              .value=${rule.config.requiresItem?.field || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'requiresItem.field', e.target.value)}
            >
            <span>=</span>
            <input
              type="text"
              placeholder="value"
              .value=${rule.config.requiresItem?.value || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'requiresItem.value', e.target.value)}
            >
          </div>
        `;

      case 'quantity':
        return html`
          <div class="rule-config-row">
            <label>Scope</label>
            <select
              .value=${rule.config.scope || 'per-item'}
              @change=${(e) => this._updateRuleConfig(rule.id, 'scope', e.target.value)}
            >
              <option value="per-item">Per Item</option>
              <option value="cart-total">Cart Total</option>
            </select>
          </div>
          <div class="rule-config-row">
            <label>Min</label>
            <input
              type="number"
              placeholder="—"
              style="width: 60px;"
              .value=${rule.config.min ?? ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'min', e.target.value ? Number(e.target.value) : null)}
            >
            <label>Max</label>
            <input
              type="number"
              placeholder="—"
              style="width: 60px;"
              .value=${rule.config.max ?? ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'max', e.target.value ? Number(e.target.value) : null)}
            >
            <label>Multiple of</label>
            <input
              type="number"
              placeholder="—"
              style="width: 60px;"
              .value=${rule.config.multiple ?? ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'multiple', e.target.value ? Number(e.target.value) : null)}
            >
          </div>
          <div class="rule-config-row">
            <label>Filter (optional)</label>
            <input
              type="text"
              placeholder="field"
              style="width: 80px;"
              .value=${rule.config.filterField || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'filterField', e.target.value)}
            >
            <span>=</span>
            <input
              type="text"
              placeholder="value"
              .value=${rule.config.filterValue || ''}
              @input=${(e) => this._updateRuleConfig(rule.id, 'filterValue', e.target.value)}
            >
          </div>
        `;

      default:
        return html`<div>Unknown rule type</div>`;
    }
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
            class="history-toggle ${this.showTests ? 'active' : ''}"
            @click=${this._toggleTests}
            title="Cart tests"
          >
            Tests ${this.tests.length > 0 ? `(${this.tests.length})` : ''}
            ${this._getTestsSummary().failed > 0 ? html`<span style="color: var(--tdt-danger);">!</span>` : ''}
          </button>
          <button
            class="history-toggle ${this.showScenarios ? 'active' : ''}"
            @click=${this._toggleScenarios}
            title="Cart scenarios"
          >
            Scenarios ${this.scenarios.length > 0 ? `(${this.scenarios.length})` : ''}
          </button>
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
      ${this._renderTestsPanel()}
      ${this._renderScenarioPanel()}
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
                const failedItemKeys = this._getFailedItemKeys();
                const isTestFailed = failedItemKeys.has(item.key);

                return html`
                  <tr class="item-row ${isExpanded ? 'expanded' : ''} ${isTestFailed ? 'test-failed' : ''}" @click=${() => this._toggleItemExpand(item.key)}>
                    <td class="col-img">
                      ${item.image
                        ? html`<img class="item-img" src="${item.image.replace(/(\.[^.]+)$/, '_60x60$1')}" alt="">`
                        : html`<div class="item-img"></div>`
                      }
                    </td>
                    <td>
                      <div class="item-title" title="${item.product_title}">
                        ${item.product_title}
                        ${isTestFailed ? html`<span class="test-fail-indicator">✗ Test failed</span>` : ''}
                      </div>
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

