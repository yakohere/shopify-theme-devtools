import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { networkInterceptor } from '../../services/network-interceptor.js';

export class NetworkPanel extends LitElement {
  static properties = {
    requests: { type: Array, state: true },
    filter: { type: String, state: true },
    searchQuery: { type: String, state: true },
    expandedId: { type: String, state: true },
    detailTab: { type: String, state: true },
    replayingId: { type: String, state: true },
    copyMenuId: { type: String, state: true },
    toastMessage: { type: String, state: true },
    // Request editor state
    editingId: { type: String, state: true },
    editData: { type: Object, state: true },
    // Blocked sources state
    blockedSources: { type: Array, state: true },
    showBlockedPanel: { type: Boolean, state: true },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 12px;
        height: 100%;
        overflow: auto;
      }

      .toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        align-items: center;
      }

      .filter-select {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .filter-select:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .search-input {
        flex: 1;
        max-width: 250px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .search-input::placeholder {
        color: var(--tdt-text-muted);
      }

      .search-input--active {
        border-color: var(--tdt-accent);
        background: var(--tdt-bg);
      }

      .search-match {
        background: rgba(234, 179, 8, 0.3);
        border-radius: 2px;
        padding: 0 2px;
      }

      .search-clear {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 4px;
        font-size: calc(12px * var(--tdt-scale, 1));
        line-height: 1;
      }

      .search-clear:hover {
        color: var(--tdt-text);
      }

      .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1;
        max-width: 250px;
      }

      .search-wrapper .search-clear {
        position: absolute;
        right: 6px;
      }

      .search-wrapper .search-input {
        padding-right: 24px;
        max-width: none;
        flex: 1;
      }

      .btn-clear {
        background: transparent;
        color: var(--tdt-text-muted);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }

      .btn-clear:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      .request-count {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .request-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .request-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
        transition: border-color 0.15s;
      }

      .request-item:hover {
        border-color: var(--tdt-accent);
      }

      .request-item--expanded {
        border-color: var(--tdt-accent);
      }

      .request-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        cursor: pointer;
      }

      .request-header:hover {
        background: var(--tdt-bg-hover);
      }

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .status-indicator--pending {
        background: var(--tdt-warning);
        animation: pulse 1.5s ease-in-out infinite;
      }

      .status-indicator--success {
        background: var(--tdt-success);
      }

      .status-indicator--error {
        background: var(--tdt-error);
      }

      .status-indicator--stale {
        background: var(--tdt-text-muted);
        opacity: 0.5;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .request-time {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        min-width: 70px;
      }

      .request-method {
        font-size: calc(10px * var(--tdt-scale, 1));
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 3px;
        min-width: 40px;
        text-align: center;
      }

      .request-method--get {
        background: rgba(59, 130, 246, 0.2);
        color: var(--tdt-accent);
      }

      .request-method--post {
        background: rgba(34, 197, 94, 0.2);
        color: var(--tdt-success);
      }

      .request-method--put,
      .request-method--patch {
        background: rgba(234, 179, 8, 0.2);
        color: var(--tdt-warning);
      }

      .request-method--delete {
        background: rgba(239, 68, 68, 0.2);
        color: var(--tdt-error);
      }

      .request-name {
        flex: 1;
        font-size: calc(12px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        font-family: var(--tdt-font);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .request-category {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .request-status {
        font-size: calc(11px * var(--tdt-scale, 1));
        min-width: 30px;
        text-align: center;
      }

      .request-status--success {
        color: var(--tdt-success);
      }

      .request-status--error {
        color: var(--tdt-error);
      }

      .request-duration {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        min-width: 50px;
        text-align: right;
      }

      .request-duration--slow {
        color: var(--tdt-warning);
      }

      .request-duration--very-slow {
        color: var(--tdt-error);
      }

      .request-stale {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-style: italic;
      }

      .request-details {
        border-top: 1px solid var(--tdt-border);
        background: var(--tdt-bg);
        padding: 12px;
      }

      .detail-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
      }

      .detail-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 12px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
      }

      .detail-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .detail-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .detail-meta {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        margin-bottom: 12px;
      }

      .detail-label {
        color: var(--tdt-text-muted);
      }

      .detail-value {
        color: var(--tdt-text);
        word-break: break-all;
      }

      .detail-body {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        font-family: var(--tdt-font);
        font-size: calc(11px * var(--tdt-scale, 1));
        max-height: 300px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .detail-body--json {
        color: var(--tdt-text);
      }

      .empty-state {
        text-align: center;
        color: var(--tdt-text-muted);
        padding: 40px 20px;
        font-style: italic;
      }

      .empty-icon {
        font-size: 32px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .detail-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .btn-replay {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--tdt-accent);
        color: white;
        border: none;
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .btn-replay:hover:not(:disabled) {
        opacity: 0.9;
      }

      .btn-replay:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-replay--loading {
        position: relative;
      }

      .btn-replay--loading::after {
        content: '';
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .replay-result {
        margin-top: 12px;
        padding: 10px;
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .replay-result--success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid var(--tdt-success);
        color: var(--tdt-success);
      }

      .replay-result--error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--tdt-error);
        color: var(--tdt-error);
      }

      .error-diagnosis {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid var(--tdt-error);
        border-radius: var(--tdt-radius);
        padding: 12px;
        margin-bottom: 12px;
      }

      .error-diagnosis__header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--tdt-error);
        margin-bottom: 8px;
        font-size: calc(12px * var(--tdt-scale, 1));
      }

      .error-diagnosis__message {
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        margin-bottom: 8px;
        font-family: var(--tdt-font);
      }

      .error-diagnosis__hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: var(--tdt-bg-secondary);
        padding: 10px;
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        line-height: 1.5;
      }

      .error-diagnosis__hint-icon {
        flex-shrink: 0;
        font-size: calc(14px * var(--tdt-scale, 1));
      }

      .error-diagnosis__details {
        margin-top: 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .error-diagnosis__code {
        font-family: var(--tdt-font);
        background: var(--tdt-bg);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      /* Cart Diff Styles */
      .cart-diff {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 12px;
        margin-bottom: 12px;
      }

      .cart-diff__header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 10px;
        font-size: calc(12px * var(--tdt-scale, 1));
      }

      .cart-diff__summary {
        display: flex;
        gap: 16px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .cart-diff__stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cart-diff__arrow {
        color: var(--tdt-text-muted);
      }

      .cart-diff__changes {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .cart-diff__item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: calc(11px * var(--tdt-scale, 1));
        padding: 6px 8px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg);
      }

      .cart-diff__item--added {
        border-left: 3px solid var(--tdt-success);
      }

      .cart-diff__item--removed {
        border-left: 3px solid var(--tdt-error);
      }

      .cart-diff__item--changed {
        border-left: 3px solid var(--tdt-warning);
      }

      .cart-diff__icon {
        flex-shrink: 0;
        width: 16px;
        text-align: center;
      }

      .cart-diff__icon--added {
        color: var(--tdt-success);
      }

      .cart-diff__icon--removed {
        color: var(--tdt-error);
      }

      .cart-diff__icon--changed {
        color: var(--tdt-warning);
      }

      .cart-diff__item-info {
        flex: 1;
        min-width: 0;
      }

      .cart-diff__item-title {
        color: var(--tdt-text);
        font-weight: 500;
      }

      .cart-diff__item-variant {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
      }

      .cart-diff__item-qty {
        color: var(--tdt-text-muted);
        white-space: nowrap;
      }

      .cart-diff__item-price {
        color: var(--tdt-text);
        font-weight: 500;
        white-space: nowrap;
      }

      /* Request header actions */
      .request-actions {
        display: flex;
        gap: 4px;
        margin-left: auto;
      }

      .request-action-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
        transition: all 0.15s ease;
      }

      .request-action-btn:hover:not(:disabled) {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      .request-action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .request-action-btn--replaying {
        color: var(--tdt-accent);
      }

      /* Copy dropdown */
      .copy-dropdown {
        position: relative;
        display: inline-block;
      }

      .copy-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 100;
        min-width: 120px;
        overflow: hidden;
      }

      .copy-menu-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        text-align: left;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .copy-menu-item:hover {
        background: var(--tdt-bg-hover);
      }

      .copy-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-success);
        color: var(--tdt-success);
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

      /* GraphQL Syntax Highlighting */
      .graphql-body {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        font-family: var(--tdt-font);
        font-size: calc(11px * var(--tdt-scale, 1));
        max-height: 300px;
        overflow: auto;
        white-space: pre;
        line-height: 1.6;
      }

      .gql-keyword {
        color: var(--tdt-boolean);
        font-weight: 600;
      }

      .gql-type {
        color: var(--tdt-warning);
      }

      .gql-field {
        color: var(--tdt-accent);
      }

      .gql-argument {
        color: var(--tdt-key);
      }

      .gql-variable {
        color: var(--tdt-number);
      }

      .gql-string {
        color: var(--tdt-string);
      }

      .gql-number {
        color: var(--tdt-number);
      }

      .gql-boolean {
        color: var(--tdt-boolean);
      }

      .gql-directive {
        color: var(--tdt-success);
        font-style: italic;
      }

      .gql-comment {
        color: var(--tdt-text-muted);
        font-style: italic;
      }

      .gql-punctuation {
        color: var(--tdt-text-muted);
      }

      .gql-fragment-name {
        color: var(--tdt-success);
      }

      /* Request Editor Modal Styles */
      .editor-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .request-editor {
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-accent);
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--tdt-bg-secondary);
        border-bottom: 1px solid var(--tdt-border);
        border-radius: 8px 8px 0 0;
        flex-shrink: 0;
      }

      .editor-title {
        font-weight: 600;
        font-size: calc(13px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .editor-title-url {
        font-weight: 400;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .editor-close {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 4px 8px;
        font-size: calc(18px * var(--tdt-scale, 1));
        line-height: 1;
        border-radius: var(--tdt-radius);
      }

      .editor-close:hover {
        color: var(--tdt-text);
        background: var(--tdt-bg-hover);
      }

      .editor-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }

      .editor-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 16px;
        background: var(--tdt-bg-secondary);
        border-top: 1px solid var(--tdt-border);
        border-radius: 0 0 8px 8px;
        flex-shrink: 0;
      }

      .editor-section {
        margin-bottom: 16px;
      }

      .editor-section:last-child {
        margin-bottom: 0;
      }

      .editor-section-title {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .editor-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .editor-row:last-child {
        margin-bottom: 0;
      }

      .editor-method-select {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 8px 12px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        font-weight: 600;
        cursor: pointer;
        min-width: 80px;
      }

      .editor-method-select:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .editor-url-input {
        flex: 1;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 8px 12px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
      }

      .editor-url-input:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .editor-headers {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .editor-header-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .editor-header-key,
      .editor-header-value {
        flex: 1;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
      }

      .editor-header-key {
        max-width: 180px;
        color: var(--tdt-key);
      }

      .editor-header-key:focus,
      .editor-header-value:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .editor-header-remove {
        background: transparent;
        border: none;
        color: var(--tdt-text-muted);
        cursor: pointer;
        padding: 4px 8px;
        font-size: calc(14px * var(--tdt-scale, 1));
        line-height: 1;
        border-radius: var(--tdt-radius);
      }

      .editor-header-remove:hover {
        color: var(--tdt-error);
        background: rgba(239, 68, 68, 0.1);
      }

      .editor-add-header {
        background: transparent;
        border: 1px dashed var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        width: 100%;
        text-align: center;
        font-family: var(--tdt-font);
      }

      .editor-add-header:hover {
        border-color: var(--tdt-accent);
        color: var(--tdt-accent);
        background: rgba(59, 130, 246, 0.05);
      }

      .editor-body-textarea {
        width: 100%;
        min-height: 120px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        resize: vertical;
        line-height: 1.5;
      }

      .editor-body-textarea:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .editor-body-textarea::placeholder {
        color: var(--tdt-text-muted);
      }

      .btn-send {
        background: var(--tdt-success);
        color: white;
        border: none;
        border-radius: var(--tdt-radius);
        padding: 6px 16px;
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
        cursor: pointer;
        font-family: var(--tdt-font);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .btn-send:hover:not(:disabled) {
        opacity: 0.9;
      }

      .btn-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-cancel {
        background: transparent;
        color: var(--tdt-text-muted);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .btn-cancel:hover {
        color: var(--tdt-text);
        border-color: var(--tdt-text-muted);
      }

      .editor-hint {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 6px;
        font-style: italic;
      }

      .editor-format-btn {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .editor-format-btn:hover {
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      /* Source Blocking Styles */
      .btn-block {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 2px 6px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
        transition: all 0.15s ease;
      }

      .btn-block:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--tdt-error);
        border-color: var(--tdt-error);
      }

      .btn-block--blocked {
        background: rgba(239, 68, 68, 0.1);
        color: var(--tdt-error);
        border-color: var(--tdt-error);
      }

      .blocked-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .blocked-toggle:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .blocked-toggle--active {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--tdt-error);
        color: var(--tdt-error);
      }

      .blocked-count {
        background: var(--tdt-error);
        color: white;
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 1px 5px;
        border-radius: 10px;
        font-weight: 600;
      }

      .blocked-panel {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
        overflow: hidden;
      }

      .blocked-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: rgba(239, 68, 68, 0.05);
        border-bottom: 1px solid var(--tdt-border);
      }

      .blocked-panel__title {
        font-size: calc(12px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .blocked-panel__clear {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .blocked-panel__clear:hover {
        color: var(--tdt-error);
        border-color: var(--tdt-error);
      }

      .blocked-panel__list {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 200px;
        overflow-y: auto;
      }

      .blocked-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 10px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .blocked-item__info {
        flex: 1;
        min-width: 0;
      }

      .blocked-item__label {
        color: var(--tdt-text);
        font-weight: 500;
        margin-bottom: 4px;
        word-break: break-all;
      }

      .blocked-item__source {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        word-break: break-all;
        opacity: 0.8;
      }

      .blocked-item__unblock {
        background: transparent;
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
        white-space: nowrap;
      }

      .blocked-item__unblock:hover {
        color: var(--tdt-success);
        border-color: var(--tdt-success);
      }

      .blocked-panel__empty {
        padding: 20px;
        text-align: center;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      /* Source info in request details */
      .source-info {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        margin-bottom: 12px;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .source-info__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .source-info__title {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .source-info__stack {
        color: var(--tdt-text);
        font-family: var(--tdt-font);
        word-break: break-all;
        line-height: 1.5;
      }

      .source-info__id {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        margin-top: 6px;
      }
    `,
  ];

  constructor() {
    super();
    this.requests = [];
    this.filter = 'all';
    this.searchQuery = '';
    this.expandedId = null;
    this.detailTab = 'request';
    this.replayingId = null;
    this.copyMenuId = null;
    this.toastMessage = null;
    this.editingId = null;
    this.editData = null;
    this._unsubscribe = null;
    this._unsubscribeBlocked = null;
    this.blockedSources = [];
    this.showBlockedPanel = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Install interceptor and subscribe
    networkInterceptor.install();
    this._unsubscribe = networkInterceptor.subscribe((requests) => {
      this.requests = [...requests];
    });
    this._unsubscribeBlocked = networkInterceptor.subscribeToBlockedSources((blockedSources) => {
      this.blockedSources = [...blockedSources];
    });
    // Get initial state
    this.requests = [...networkInterceptor.getRequests()];
    this.blockedSources = [...networkInterceptor.getBlockedSources()];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._unsubscribeBlocked) {
      this._unsubscribeBlocked();
    }
  }

  _formatTime(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) {
      return '--:--:--';
    }
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  _formatDuration(ms) {
    if (ms === null || ms === undefined) return '...';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  _getDurationClass(ms) {
    if (ms === null) return '';
    if (ms > 3000) return 'request-duration--very-slow';
    if (ms > 1000) return 'request-duration--slow';
    return '';
  }

  _getFilteredRequests() {
    let results = this.requests;

    // Filter by category
    if (this.filter !== 'all') {
      results = results.filter(r => r.category === this.filter || r.category === `${this.filter}-mutation`);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(r => this._requestMatchesSearch(r, query));
    }

    return results;
  }

  /**
   * Check if a request matches the search query
   * Searches through URL, request body, and response body
   */
  _requestMatchesSearch(req, query) {
    // Search in URL
    if (req.fullUrl?.toLowerCase().includes(query)) return true;
    if (req.url?.toLowerCase().includes(query)) return true;
    if (req.displayName?.toLowerCase().includes(query)) return true;

    // Search in request body
    if (req.requestBody) {
      const bodyStr = typeof req.requestBody === 'object'
        ? JSON.stringify(req.requestBody)
        : String(req.requestBody);
      if (bodyStr.toLowerCase().includes(query)) return true;
    }

    // Search in response body
    if (req.responseBody) {
      const bodyStr = typeof req.responseBody === 'object'
        ? JSON.stringify(req.responseBody)
        : String(req.responseBody);
      if (bodyStr.toLowerCase().includes(query)) return true;
    }

    return false;
  }

  _handleFilterChange(e) {
    this.filter = e.target.value;
  }

  _handleSearchInput(e) {
    this.searchQuery = e.target.value;
  }

  _clearSearch() {
    this.searchQuery = '';
  }

  _handleClear() {
    networkInterceptor.clear();
  }

  _toggleExpand(id) {
    this.expandedId = this.expandedId === id ? null : id;
    this.detailTab = 'request';
  }

  _setDetailTab(tab) {
    this.detailTab = tab;
  }

  async _replayRequest(req, e) {
    e.stopPropagation();

    if (this.replayingId === req.id) return;

    this.replayingId = req.id;

    try {
      const options = {
        method: req.method,
        headers: { ...req.requestHeaders },
      };

      // Add body for non-GET requests
      if (req.method !== 'GET' && req.requestBody) {
        if (typeof req.requestBody === 'object') {
          // Check if it was FormData (object with entries)
          const contentType = req.requestHeaders?.['content-type'] || '';
          if (contentType.includes('application/json')) {
            options.body = JSON.stringify(req.requestBody);
          } else {
            // Assume form data
            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(req.requestBody)) {
              formData.append(key, value);
            }
            options.body = formData;
          }
        } else {
          options.body = req.requestBody;
        }
      }

      // Make the request - this will be intercepted and show up as a new request
      await fetch(req.fullUrl, options);

    } catch (error) {
      console.error('[TDT Network] Replay failed:', error);
    } finally {
      this.replayingId = null;
    }
  }

  _toggleCopyMenu(reqId, e) {
    e.stopPropagation();
    this.copyMenuId = this.copyMenuId === reqId ? null : reqId;
  }

  _closeCopyMenu() {
    this.copyMenuId = null;
  }

  _showToast(message) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = null;
    }, 2000);
  }

  async _copyToClipboard(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      this._showToast(`Copied as ${label}`);
    } catch {
      console.error('[TDT Network] Copy failed');
    }
    this._closeCopyMenu();
  }

  _generateCurl(req) {
    const parts = ['curl'];

    // Method (only if not GET)
    if (req.method !== 'GET') {
      parts.push(`-X ${req.method}`);
    }

    // URL
    parts.push(`'${req.fullUrl}'`);

    // Headers
    const headers = req.requestHeaders || {};
    for (const [key, value] of Object.entries(headers)) {
      // Skip some headers that curl handles automatically
      if (key.toLowerCase() === 'content-length') continue;
      parts.push(`-H '${key}: ${value}'`);
    }

    // Body
    if (req.requestBody && req.method !== 'GET') {
      let bodyStr;
      if (typeof req.requestBody === 'object') {
        const contentType = headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          bodyStr = JSON.stringify(req.requestBody);
        } else {
          // Form data
          bodyStr = new URLSearchParams(req.requestBody).toString();
        }
      } else {
        bodyStr = req.requestBody;
      }
      parts.push(`-d '${bodyStr.replace(/'/g, "'\\''")}'`);
    }

    return parts.join(' \\\n  ');
  }

  _generateFetch(req) {
    const headers = req.requestHeaders || {};
    const parts = [];

    // Method
    parts.push(`  method: '${req.method}'`);

    // Headers
    if (Object.keys(headers).length > 0) {
      const headersStr = JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ');
      parts.push(`  headers: ${headersStr}`);
    }

    // Body
    if (req.requestBody && req.method !== 'GET') {
      const contentType = headers['content-type'] || '';
      let bodyStr;

      if (contentType.includes('application/json')) {
        // For JSON, we need to pass the object to JSON.stringify
        if (typeof req.requestBody === 'object') {
          bodyStr = `JSON.stringify(${JSON.stringify(req.requestBody, null, 4).replace(/\n/g, '\n  ')})`;
        } else {
          // Already a string - just use it directly (it's already JSON)
          bodyStr = `'${req.requestBody.replace(/'/g, "\\'")}'`;
        }
      } else if (typeof req.requestBody === 'object') {
        // Form data
        bodyStr = `new URLSearchParams(${JSON.stringify(req.requestBody)})`;
      } else {
        bodyStr = `'${String(req.requestBody).replace(/'/g, "\\'")}'`;
      }
      parts.push(`  body: ${bodyStr}`);
    }

    return `fetch('${req.fullUrl}', {
${parts.join(',\n')}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  }

  _copyAsCurl(req, e) {
    e.stopPropagation();
    const curl = this._generateCurl(req);
    this._copyToClipboard(curl, 'cURL');
  }

  _copyAsFetch(req, e) {
    e.stopPropagation();
    const fetchCode = this._generateFetch(req);
    this._copyToClipboard(fetchCode, 'Fetch');
  }

  // ============ Request Editor Methods ============

  _openEditor(req, e) {
    e.stopPropagation();
    this.editingId = req.id;

    // Convert headers object to array for easier editing
    const headers = Object.entries(req.requestHeaders || {}).map(([key, value]) => ({
      key,
      value,
      id: `header_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    }));

    // Format body for editing
    let body = '';
    if (req.requestBody) {
      if (typeof req.requestBody === 'object') {
        body = JSON.stringify(req.requestBody, null, 2);
      } else {
        body = String(req.requestBody);
      }
    }

    this.editData = {
      method: req.method,
      url: req.fullUrl,
      headers,
      body,
      sending: false,
    };
  }

  _closeEditor() {
    this.editingId = null;
    this.editData = null;
  }

  _updateEditMethod(e) {
    this.editData = { ...this.editData, method: e.target.value };
  }

  _updateEditUrl(e) {
    this.editData = { ...this.editData, url: e.target.value };
  }

  _updateEditHeaderKey(headerId, e) {
    const headers = this.editData.headers.map(h =>
      h.id === headerId ? { ...h, key: e.target.value } : h
    );
    this.editData = { ...this.editData, headers };
  }

  _updateEditHeaderValue(headerId, e) {
    const headers = this.editData.headers.map(h =>
      h.id === headerId ? { ...h, value: e.target.value } : h
    );
    this.editData = { ...this.editData, headers };
  }

  _removeEditHeader(headerId) {
    const headers = this.editData.headers.filter(h => h.id !== headerId);
    this.editData = { ...this.editData, headers };
  }

  _addEditHeader() {
    const newHeader = {
      key: '',
      value: '',
      id: `header_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    this.editData = { ...this.editData, headers: [...this.editData.headers, newHeader] };
  }

  _updateEditBody(e) {
    this.editData = { ...this.editData, body: e.target.value };
  }

  _formatEditBody() {
    if (!this.editData.body) return;
    try {
      const parsed = JSON.parse(this.editData.body);
      const formatted = JSON.stringify(parsed, null, 2);
      this.editData = { ...this.editData, body: formatted };
    } catch {
      this._showToast('Invalid JSON - cannot format');
    }
  }

  async _sendEditedRequest() {
    if (!this.editData || this.editData.sending) return;

    this.editData = { ...this.editData, sending: true };

    try {
      // Build headers object from array
      const headers = {};
      this.editData.headers.forEach(h => {
        if (h.key.trim()) {
          headers[h.key.trim()] = h.value;
        }
      });

      const options = {
        method: this.editData.method,
        headers,
      };

      // Add body for non-GET requests
      if (this.editData.method !== 'GET' && this.editData.body.trim()) {
        const contentType = headers['content-type'] || headers['Content-Type'] || '';

        if (contentType.includes('application/json') || this.editData.body.trim().startsWith('{')) {
          // Try to parse as JSON to validate, then stringify
          try {
            const parsed = JSON.parse(this.editData.body);
            options.body = JSON.stringify(parsed);
            if (!headers['content-type'] && !headers['Content-Type']) {
              headers['content-type'] = 'application/json';
              options.headers = headers;
            }
          } catch {
            // Not valid JSON, send as-is
            options.body = this.editData.body;
          }
        } else {
          options.body = this.editData.body;
        }
      }

      // Make the request - will be intercepted and show up as new request
      await fetch(this.editData.url, options);

      this._showToast('Request sent');
      this._closeEditor();
    } catch (error) {
      console.error('[TDT Network] Send edited request failed:', error);
      this._showToast('Request failed: ' + error.message);
      this.editData = { ...this.editData, sending: false };
    }
  }

  _handleOverlayClick(e) {
    // Close modal when clicking the overlay background
    if (e.target.classList.contains('editor-overlay')) {
      this._closeEditor();
    }
  }

  // ============ Source Blocking Methods ============

  _toggleBlockedPanel() {
    this.showBlockedPanel = !this.showBlockedPanel;
  }

  _blockSource(req, e) {
    e?.stopPropagation();
    if (!req.sourceId) {
      this._showToast('No source info available');
      return;
    }

    const label = `${req.method} ${req.displayName}`;
    networkInterceptor.blockSource(req.sourceId, req.callStack, label);
    this._showToast('Source blocked');
  }

  _unblockSource(sourceId, e) {
    e?.stopPropagation();
    networkInterceptor.unblockSource(sourceId);
    this._showToast('Source unblocked');
  }

  _clearAllBlocked() {
    networkInterceptor.clearBlockedSources();
    this._showToast('All sources unblocked');
  }

  _renderBlockedPanel() {
    if (!this.showBlockedPanel) return '';

    return html`
      <div class="blocked-panel">
        <div class="blocked-panel__header">
          <div class="blocked-panel__title">
            <span>Blocked Sources</span>
            <span class="blocked-count">${this.blockedSources.length}</span>
          </div>
          ${this.blockedSources.length > 0 ? html`
            <button class="blocked-panel__clear" @click=${() => this._clearAllBlocked()}>
              Unblock All
            </button>
          ` : ''}
        </div>
        ${this.blockedSources.length === 0 ? html`
          <div class="blocked-panel__empty">
            No blocked sources. Click "Block" on a request to hide all requests from that code location.
          </div>
        ` : html`
          <div class="blocked-panel__list">
            ${this.blockedSources.map(blocked => html`
              <div class="blocked-item">
                <div class="blocked-item__info">
                  <div class="blocked-item__label">${blocked.label}</div>
                  <div class="blocked-item__source">${blocked.source}</div>
                </div>
                <button
                  class="blocked-item__unblock"
                  @click=${(e) => this._unblockSource(blocked.id, e)}
                >
                  Unblock
                </button>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  _renderSourceInfo(req) {
    if (!req.callStack && !req.sourceId) return '';

    const isBlocked = networkInterceptor.isBlocked(req.sourceId);

    return html`
      <div class="source-info">
        <div class="source-info__header">
          <span class="source-info__title">Request Source</span>
          <button
            class="btn-block ${isBlocked ? 'btn-block--blocked' : ''}"
            @click=${(e) => isBlocked ? this._unblockSource(req.sourceId, e) : this._blockSource(req, e)}
            title="${isBlocked ? 'Unblock this source' : 'Block all requests from this source'}"
          >
            ${isBlocked ? 'Unblock' : 'Block Source'}
          </button>
        </div>
        ${req.callStack ? html`
          <div class="source-info__stack">${req.callStack}</div>
        ` : ''}
        ${req.sourceId ? html`
          <div class="source-info__id">ID: ${req.sourceId}</div>
        ` : ''}
      </div>
    `;
  }

  _renderEditorModal() {
    if (!this.editingId || !this.editData) return '';

    return html`
      <div class="editor-overlay" @click=${(e) => this._handleOverlayClick(e)}>
        <div class="request-editor">
          <div class="editor-header">
            <div class="editor-title">
              <span>Edit & Resend</span>
            </div>
            <button class="editor-close" @click=${() => this._closeEditor()} title="Close">×</button>
          </div>

          <div class="editor-body">
            <!-- Method & URL -->
            <div class="editor-section">
              <div class="editor-section-title">Request</div>
              <div class="editor-row">
                <select
                  class="editor-method-select"
                  .value=${this.editData.method}
                  @change=${(e) => this._updateEditMethod(e)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  class="editor-url-input"
                  .value=${this.editData.url}
                  @input=${(e) => this._updateEditUrl(e)}
                  placeholder="URL"
                />
              </div>
            </div>

            <!-- Headers -->
            <div class="editor-section">
              <div class="editor-section-title">Headers</div>
              <div class="editor-headers">
                ${this.editData.headers.map(header => html`
                  <div class="editor-header-row">
                    <input
                      type="text"
                      class="editor-header-key"
                      .value=${header.key}
                      @input=${(e) => this._updateEditHeaderKey(header.id, e)}
                      placeholder="Header name"
                    />
                    <input
                      type="text"
                      class="editor-header-value"
                      .value=${header.value}
                      @input=${(e) => this._updateEditHeaderValue(header.id, e)}
                      placeholder="Header value"
                    />
                    <button
                      class="editor-header-remove"
                      @click=${() => this._removeEditHeader(header.id)}
                      title="Remove header"
                    >×</button>
                  </div>
                `)}
                <button class="editor-add-header" @click=${() => this._addEditHeader()}>
                  + Add Header
                </button>
              </div>
            </div>

            <!-- Body -->
            ${this.editData.method !== 'GET' ? html`
              <div class="editor-section">
                <div class="editor-section-title" style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Body</span>
                  <button class="editor-format-btn" @click=${() => this._formatEditBody()}>
                    Format JSON
                  </button>
                </div>
                <textarea
                  class="editor-body-textarea"
                  .value=${this.editData.body}
                  @input=${(e) => this._updateEditBody(e)}
                  placeholder='{"key": "value"}'
                ></textarea>
                <div class="editor-hint">
                  Tip: JSON body will be automatically parsed and sent with Content-Type: application/json
                </div>
              </div>
            ` : ''}
          </div>

          <div class="editor-footer">
            <button class="btn-cancel" @click=${() => this._closeEditor()}>
              Cancel
            </button>
            <button
              class="btn-send"
              @click=${() => this._sendEditedRequest()}
              ?disabled=${this.editData.sending}
            >
              ${this.editData.sending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _formatBody(body) {
    if (body === null || body === undefined) return 'No body';
    if (typeof body === 'object') {
      try {
        return JSON.stringify(body, null, 2);
      } catch {
        return String(body);
      }
    }
    // Try to parse and pretty-print JSON strings
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    }
    return String(body);
  }

  /**
   * Extract GraphQL query from a request body
   */
  _extractGraphQLQuery(body) {
    if (!body) return null;

    let data = body;
    if (typeof body === 'string') {
      try {
        data = JSON.parse(body);
      } catch {
        return null;
      }
    }

    // GraphQL queries are typically in a 'query' field
    return data.query || null;
  }

  /**
   * Extract GraphQL variables from a request body
   */
  _extractGraphQLVariables(body) {
    if (!body) return null;

    let data = body;
    if (typeof body === 'string') {
      try {
        data = JSON.parse(body);
      } catch {
        return null;
      }
    }

    return data.variables || null;
  }

  /**
   * Prettify a GraphQL query string with proper indentation
   */
  _prettifyGraphQL(query) {
    if (!query || typeof query !== 'string') return query;

    let indent = 0;
    let result = '';
    let inString = false;
    let stringChar = '';
    let i = 0;

    // Remove extra whitespace first
    query = query.replace(/\s+/g, ' ').trim();

    const addNewline = () => {
      result += '\n' + '  '.repeat(indent);
    };

    while (i < query.length) {
      const char = query[i];
      const nextChar = query[i + 1];

      // Handle strings
      if ((char === '"' || char === "'") && query[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        result += char;
        i++;
        continue;
      }

      if (inString) {
        result += char;
        i++;
        continue;
      }

      // Handle block strings (triple quotes)
      if (char === '"' && nextChar === '"' && query[i + 2] === '"') {
        result += '"""';
        i += 3;
        // Find closing triple quotes
        while (i < query.length) {
          if (query[i] === '"' && query[i + 1] === '"' && query[i + 2] === '"') {
            result += '"""';
            i += 3;
            break;
          }
          result += query[i];
          i++;
        }
        continue;
      }

      // Handle opening braces
      if (char === '{') {
        result += ' {';
        indent++;
        addNewline();
        i++;
        // Skip whitespace after brace
        while (query[i] === ' ') i++;
        continue;
      }

      // Handle closing braces
      if (char === '}') {
        indent--;
        addNewline();
        result += '}';
        i++;
        // Skip whitespace after brace
        while (query[i] === ' ') i++;
        // Add newline if not followed by another closing brace or end
        if (query[i] && query[i] !== '}' && query[i] !== ')') {
          addNewline();
        }
        continue;
      }

      // Handle opening parentheses (arguments)
      if (char === '(') {
        result += '(';
        i++;
        // Skip whitespace
        while (query[i] === ' ') i++;
        continue;
      }

      // Handle closing parentheses
      if (char === ')') {
        result += ')';
        i++;
        continue;
      }

      // Handle commas
      if (char === ',') {
        result += ',';
        i++;
        // Skip whitespace
        while (query[i] === ' ') i++;
        // Add space after comma
        if (query[i] && query[i] !== ')' && query[i] !== '}') {
          result += ' ';
        }
        continue;
      }

      // Handle colons
      if (char === ':') {
        result += ': ';
        i++;
        // Skip whitespace
        while (query[i] === ' ') i++;
        continue;
      }

      // Handle comments
      if (char === '#') {
        // Find end of comment
        let comment = '#';
        i++;
        while (i < query.length && query[i] !== '\n') {
          comment += query[i];
          i++;
        }
        result += comment;
        if (i < query.length) {
          addNewline();
          i++;
        }
        continue;
      }

      // Regular character
      result += char;
      i++;
    }

    return result.trim();
  }

  /**
   * Apply syntax highlighting to a prettified GraphQL query
   * Returns an array of lit-html templates
   */
  _highlightGraphQL(query) {
    if (!query) return html`<span class="gql-comment">No query</span>`;

    const keywords = ['query', 'mutation', 'subscription', 'fragment', 'on', 'type', 'interface', 'union', 'enum', 'input', 'scalar', 'extend', 'schema', 'directive'];
    const booleans = ['true', 'false', 'null'];

    const parts = [];
    let i = 0;

    const escapeHtml = (str) => {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    while (i < query.length) {
      const char = query[i];

      // Handle comments
      if (char === '#') {
        let comment = '';
        while (i < query.length && query[i] !== '\n') {
          comment += query[i];
          i++;
        }
        parts.push(html`<span class="gql-comment">${comment}</span>`);
        continue;
      }

      // Handle strings
      if (char === '"') {
        let str = '"';
        i++;
        // Check for block string
        if (query[i] === '"' && query[i + 1] === '"') {
          str = '"""';
          i += 2;
          while (i < query.length) {
            if (query[i] === '"' && query[i + 1] === '"' && query[i + 2] === '"') {
              str += '"""';
              i += 3;
              break;
            }
            str += query[i];
            i++;
          }
        } else {
          // Regular string
          while (i < query.length && query[i] !== '"') {
            if (query[i] === '\\' && query[i + 1]) {
              str += query[i] + query[i + 1];
              i += 2;
            } else {
              str += query[i];
              i++;
            }
          }
          if (query[i] === '"') {
            str += '"';
            i++;
          }
        }
        parts.push(html`<span class="gql-string">${str}</span>`);
        continue;
      }

      // Handle variables ($varName)
      if (char === '$') {
        let varName = '$';
        i++;
        while (i < query.length && /[a-zA-Z0-9_]/.test(query[i])) {
          varName += query[i];
          i++;
        }
        parts.push(html`<span class="gql-variable">${varName}</span>`);
        continue;
      }

      // Handle directives (@directive)
      if (char === '@') {
        let directive = '@';
        i++;
        while (i < query.length && /[a-zA-Z0-9_]/.test(query[i])) {
          directive += query[i];
          i++;
        }
        parts.push(html`<span class="gql-directive">${directive}</span>`);
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(query[i + 1]))) {
        let num = char;
        i++;
        while (i < query.length && /[0-9.eE+-]/.test(query[i])) {
          num += query[i];
          i++;
        }
        parts.push(html`<span class="gql-number">${num}</span>`);
        continue;
      }

      // Handle words (keywords, types, fields, arguments)
      if (/[a-zA-Z_]/.test(char)) {
        let word = '';
        while (i < query.length && /[a-zA-Z0-9_]/.test(query[i])) {
          word += query[i];
          i++;
        }

        // Skip whitespace to check what comes next
        let lookahead = i;
        while (lookahead < query.length && query[lookahead] === ' ') {
          lookahead++;
        }

        if (keywords.includes(word.toLowerCase())) {
          parts.push(html`<span class="gql-keyword">${word}</span>`);
        } else if (booleans.includes(word.toLowerCase())) {
          parts.push(html`<span class="gql-boolean">${word}</span>`);
        } else if (query[lookahead] === ':') {
          // This is an argument name
          parts.push(html`<span class="gql-argument">${word}</span>`);
        } else if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word)) {
          // PascalCase = type name
          parts.push(html`<span class="gql-type">${word}</span>`);
        } else {
          // Field name
          parts.push(html`<span class="gql-field">${word}</span>`);
        }
        continue;
      }

      // Handle punctuation
      if (/[{}()[\]:,!=]/.test(char)) {
        parts.push(html`<span class="gql-punctuation">${char}</span>`);
        i++;
        continue;
      }

      // Handle spread operator (...)
      if (char === '.' && query[i + 1] === '.' && query[i + 2] === '.') {
        parts.push(html`<span class="gql-punctuation">...</span>`);
        i += 3;
        continue;
      }

      // Whitespace and other characters
      parts.push(char);
      i++;
    }

    return parts;
  }

  /**
   * Check if a request is a GraphQL request
   */
  _isGraphQLRequest(req) {
    return req.category === 'graphql' || req.url?.includes('graphql');
  }

  /**
   * Render a GraphQL request body with pretty formatting and syntax highlighting
   */
  _renderGraphQLBody(req) {
    const query = this._extractGraphQLQuery(req.requestBody);
    const variables = this._extractGraphQLVariables(req.requestBody);

    if (!query) {
      return html`<div class="detail-body detail-body--json">${this._formatBody(req.requestBody)}</div>`;
    }

    const prettified = this._prettifyGraphQL(query);
    const highlighted = this._highlightGraphQL(prettified);

    return html`
      <div style="margin-bottom: 8px; font-size: calc(10px * var(--tdt-scale, 1)); color: var(--tdt-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Query</div>
      <div class="graphql-body">${highlighted}</div>
      ${variables && Object.keys(variables).length > 0 ? html`
        <div style="margin-top: 12px; margin-bottom: 8px; font-size: calc(10px * var(--tdt-scale, 1)); color: var(--tdt-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Variables</div>
        <div class="detail-body detail-body--json">${JSON.stringify(variables, null, 2)}</div>
      ` : ''}
    `;
  }

  /**
   * Diagnose Shopify-specific errors and return helpful hints
   */
  _diagnoseError(req) {
    if (req.status !== 'error' || !req.responseBody) return null;

    const response = req.responseBody;
    const statusCode = req.statusCode;
    const url = req.url || '';
    const requestBody = req.requestBody;

    // Extract error message from response
    let errorMessage = '';
    let errorDescription = '';

    if (typeof response === 'object') {
      errorMessage = response.message || response.error || response.description || '';
      errorDescription = response.description || response.errors || '';
    } else if (typeof response === 'string') {
      errorMessage = response;
    }

    // Normalize for comparison
    const errorLower = (errorMessage + ' ' + JSON.stringify(errorDescription)).toLowerCase();

    // Cart-specific errors
    if (url.includes('/cart/')) {
      // Product not available / out of stock
      if (errorLower.includes('not available') || errorLower.includes('out of stock') || errorLower.includes('inventory')) {
        const variantId = requestBody?.id || requestBody?.items?.[0]?.id || 'unknown';
        return {
          type: 'Product Unavailable',
          message: errorMessage || 'Product is not available',
          hint: `Variant ${variantId} may be out of stock, discontinued, or not published to this sales channel.`,
          suggestions: [
            'Check inventory levels in Shopify Admin',
            'Verify the variant is published to Online Store',
            'The product may have been archived or deleted',
          ],
        };
      }

      // Quantity limits
      if (errorLower.includes('quantity') || errorLower.includes('limit') || errorLower.includes('maximum')) {
        return {
          type: 'Quantity Limit',
          message: errorMessage || 'Quantity limit exceeded',
          hint: 'The requested quantity exceeds the available stock or cart limits.',
          suggestions: [
            'Check the max quantity settings for this product',
            'Verify inventory policy (continue selling when out of stock)',
            'Customer may have hit a purchase limit',
          ],
        };
      }

      // Invalid variant
      if (errorLower.includes('invalid') || errorLower.includes('not found') || errorLower.includes('does not exist')) {
        const variantId = requestBody?.id || requestBody?.items?.[0]?.id;
        return {
          type: 'Invalid Variant',
          message: errorMessage || 'Variant not found',
          hint: `Variant ID ${variantId || 'unknown'} does not exist or is invalid.`,
          suggestions: [
            'The variant may have been deleted',
            'Check if the variant ID is correct',
            'Product options may have changed',
          ],
        };
      }

      // Cart token issues
      if (errorLower.includes('cart') && (errorLower.includes('token') || errorLower.includes('session'))) {
        return {
          type: 'Cart Session Error',
          message: errorMessage || 'Cart session issue',
          hint: 'The cart session may have expired or become invalid.',
          suggestions: [
            'Try refreshing the page',
            'Clear cookies and try again',
            'Cart may have been modified in another tab',
          ],
        };
      }

      // Properties errors
      if (errorLower.includes('properties') || errorLower.includes('line item')) {
        return {
          type: 'Line Item Properties Error',
          message: errorMessage || 'Invalid line item properties',
          hint: 'There is an issue with the custom properties being sent.',
          suggestions: [
            'Check property key/value format',
            'Properties must be strings',
            'Some reserved keys may not be allowed',
          ],
        };
      }
    }

    // Search errors
    if (url.includes('/search')) {
      if (statusCode === 429) {
        return {
          type: 'Rate Limited',
          message: 'Too many search requests',
          hint: 'Search requests are being rate limited by Shopify.',
          suggestions: [
            'Add debouncing to search input',
            'Reduce search request frequency',
            'Consider using predictive search API instead',
          ],
        };
      }
    }

    // GraphQL errors
    if (url.includes('graphql')) {
      if (response.errors && Array.isArray(response.errors)) {
        const gqlError = response.errors[0];
        return {
          type: 'GraphQL Error',
          message: gqlError.message || 'GraphQL query failed',
          hint: 'The Storefront API query returned an error.',
          suggestions: [
            'Check query syntax and field names',
            'Verify you have access to requested fields',
            'Check if required variables are provided',
          ],
          details: gqlError.locations ? `Location: Line ${gqlError.locations[0]?.line}, Column ${gqlError.locations[0]?.column}` : null,
        };
      }
    }

    // Generic HTTP errors
    if (statusCode === 400) {
      return {
        type: 'Bad Request',
        message: errorMessage || 'Invalid request',
        hint: 'The request was malformed or missing required fields.',
        suggestions: [
          'Check request body format',
          'Verify all required fields are present',
          'Ensure data types are correct',
        ],
      };
    }

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: 'Authentication Error',
        message: errorMessage || 'Access denied',
        hint: 'The request lacks valid authentication or permissions.',
        suggestions: [
          'Check if API credentials are valid',
          'Verify the request is from an allowed origin',
          'Some endpoints require customer authentication',
        ],
      };
    }

    if (statusCode === 404) {
      return {
        type: 'Not Found',
        message: errorMessage || 'Resource not found',
        hint: 'The requested resource does not exist.',
        suggestions: [
          'Check if the URL/endpoint is correct',
          'The resource may have been deleted',
          'Verify product/collection handles',
        ],
      };
    }

    if (statusCode === 422) {
      return {
        type: 'Validation Error',
        message: errorMessage || 'Unprocessable entity',
        hint: 'The request was understood but could not be processed.',
        suggestions: [
          'Check the request data for validation errors',
          'Required fields may be missing or invalid',
          'Business rules may prevent this action',
        ],
      };
    }

    if (statusCode === 429) {
      return {
        type: 'Rate Limited',
        message: 'Too many requests',
        hint: 'You have exceeded the API rate limit.',
        suggestions: [
          'Reduce request frequency',
          'Implement request throttling',
          'Use batch operations where possible',
        ],
      };
    }

    if (statusCode >= 500) {
      return {
        type: 'Server Error',
        message: errorMessage || 'Shopify server error',
        hint: 'Shopify experienced an internal error processing this request.',
        suggestions: [
          'This is usually temporary - try again',
          'Check Shopify Status page for outages',
          'If persistent, contact Shopify Support',
        ],
      };
    }

    // Network error (no status code)
    if (req.error && !statusCode) {
      return {
        type: 'Network Error',
        message: req.error,
        hint: 'The request failed to reach the server.',
        suggestions: [
          'Check your internet connection',
          'The request may have been blocked by CORS',
          'Ad blockers may interfere with requests',
        ],
      };
    }

    // Generic fallback
    if (errorMessage) {
      return {
        type: 'Request Failed',
        message: errorMessage,
        hint: 'The request was not successful.',
        suggestions: [
          'Check the response body for details',
          'Verify the request parameters',
        ],
      };
    }

    return null;
  }

  _renderErrorDiagnosis(req) {
    const diagnosis = this._diagnoseError(req);
    if (!diagnosis) return '';

    return html`
      <div class="error-diagnosis">
        <div class="error-diagnosis__header">
          <span>⚠️</span>
          <span>${diagnosis.type}</span>
        </div>
        <div class="error-diagnosis__message">"${diagnosis.message}"</div>
        <div class="error-diagnosis__hint">
          <span class="error-diagnosis__hint-icon">💡</span>
          <div>
            <div>${diagnosis.hint}</div>
            ${diagnosis.suggestions ? html`
              <ul style="margin: 8px 0 0 0; padding-left: 16px;">
                ${diagnosis.suggestions.map(s => html`<li>${s}</li>`)}
              </ul>
            ` : ''}
            ${diagnosis.details ? html`
              <div class="error-diagnosis__details">${diagnosis.details}</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _formatPrice(cents) {
    if (cents === null || cents === undefined) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  }

  _renderCartDiff(req) {
    const diff = req.cartDiff;
    if (!diff) return '';

    return html`
      <div class="cart-diff">
        <div class="cart-diff__header">
          <span>📦</span>
          <span>Cart Changes</span>
        </div>

        <div class="cart-diff__summary">
          <div class="cart-diff__stat">
            <span>Items:</span>
            <span>${diff.itemsBefore}</span>
            <span class="cart-diff__arrow">→</span>
            <span>${diff.itemsAfter}</span>
          </div>
          <div class="cart-diff__stat">
            <span>Total:</span>
            <span>${this._formatPrice(diff.totalBefore)}</span>
            <span class="cart-diff__arrow">→</span>
            <span>${this._formatPrice(diff.totalAfter)}</span>
          </div>
        </div>

        <div class="cart-diff__changes">
          ${diff.added.map(item => html`
            <div class="cart-diff__item cart-diff__item--added">
              <span class="cart-diff__icon cart-diff__icon--added">+</span>
              <div class="cart-diff__item-info">
                <div class="cart-diff__item-title">${item.title}</div>
                ${item.variant_title ? html`
                  <div class="cart-diff__item-variant">${item.variant_title}</div>
                ` : ''}
              </div>
              <span class="cart-diff__item-qty">× ${item.quantity}</span>
              <span class="cart-diff__item-price">${this._formatPrice(item.price)}</span>
            </div>
          `)}

          ${diff.removed.map(item => html`
            <div class="cart-diff__item cart-diff__item--removed">
              <span class="cart-diff__icon cart-diff__icon--removed">−</span>
              <div class="cart-diff__item-info">
                <div class="cart-diff__item-title">${item.title}</div>
                ${item.variant_title ? html`
                  <div class="cart-diff__item-variant">${item.variant_title}</div>
                ` : ''}
              </div>
              <span class="cart-diff__item-qty">× ${item.quantity}</span>
              <span class="cart-diff__item-price">${this._formatPrice(item.price)}</span>
            </div>
          `)}

          ${diff.changed.map(item => html`
            <div class="cart-diff__item cart-diff__item--changed">
              <span class="cart-diff__icon cart-diff__icon--changed">~</span>
              <div class="cart-diff__item-info">
                <div class="cart-diff__item-title">${item.title}</div>
                ${item.variant_title ? html`
                  <div class="cart-diff__item-variant">${item.variant_title}</div>
                ` : ''}
              </div>
              <span class="cart-diff__item-qty">
                ${item.quantityBefore} → ${item.quantityAfter}
              </span>
              <span class="cart-diff__item-price">
                ${this._formatPrice(item.priceBefore)} → ${this._formatPrice(item.priceAfter)}
              </span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderRequest(req) {
    const isExpanded = this.expandedId === req.id;
    const isReplaying = this.replayingId === req.id;
    const showCopyMenu = this.copyMenuId === req.id;

    return html`
      <div class="request-item ${isExpanded ? 'request-item--expanded' : ''}">
        <div class="request-header" @click=${() => this._toggleExpand(req.id)}>
          <div class="status-indicator status-indicator--${req.status}"></div>
          <span class="request-time">${this._formatTime(req.startTime)}</span>
          <span class="request-method request-method--${req.method.toLowerCase()}">${req.method}</span>
          <span class="request-name">${req.displayName}</span>
          <span class="request-category">${req.category}</span>
          ${req.statusCode ? html`
            <span class="request-status ${req.statusCode >= 200 && req.statusCode < 300 ? 'request-status--success' : 'request-status--error'}">
              ${req.statusCode}
            </span>
          ` : ''}
          <span class="request-duration ${this._getDurationClass(req.duration)}">
            ${this._formatDuration(req.duration)}
          </span>
          ${req.status === 'stale' ? html`<span class="request-stale">(stale)</span>` : ''}

          <div class="request-actions">
            <button
              class="request-action-btn"
              @click=${(e) => this._openEditor(req, e)}
              ?disabled=${req.status === 'pending'}
              title="Edit and resend"
            >Edit</button>

            <button
              class="request-action-btn ${isReplaying ? 'request-action-btn--replaying' : ''}"
              @click=${(e) => this._replayRequest(req, e)}
              ?disabled=${isReplaying || req.status === 'pending'}
              title="Replay request"
            >${isReplaying ? '...' : 'Replay'}</button>

            <div class="copy-dropdown">
              <button
                class="request-action-btn"
                @click=${(e) => this._toggleCopyMenu(req.id, e)}
                title="Copy as..."
              >Copy</button>
              ${showCopyMenu ? html`
                <div class="copy-menu">
                  <button class="copy-menu-item" @click=${(e) => this._copyAsCurl(req, e)}>
                    Copy as cURL
                  </button>
                  <button class="copy-menu-item" @click=${(e) => this._copyAsFetch(req, e)}>
                    Copy as Fetch
                  </button>
                </div>
              ` : ''}
            </div>

            ${req.sourceId ? html`
              <button
                class="btn-block"
                @click=${(e) => this._blockSource(req, e)}
                title="Block all requests from this source"
              >Block</button>
            ` : ''}
          </div>
        </div>
        ${isExpanded ? this._renderDetails(req) : ''}
      </div>
    `;
  }

  _renderDetails(req) {
    return html`
      <div class="request-details">
        ${this._renderSourceInfo(req)}
        ${this._renderCartDiff(req)}
        ${this._renderErrorDiagnosis(req)}

        <div class="detail-tabs">
          <button
            class="detail-tab ${this.detailTab === 'request' ? 'detail-tab--active' : ''}"
            @click=${() => this._setDetailTab('request')}
          >Request</button>
          <button
            class="detail-tab ${this.detailTab === 'response' ? 'detail-tab--active' : ''}"
            @click=${() => this._setDetailTab('response')}
          >Response</button>
          <button
            class="detail-tab ${this.detailTab === 'headers' ? 'detail-tab--active' : ''}"
            @click=${() => this._setDetailTab('headers')}
          >Headers</button>
        </div>

        <div class="detail-meta">
          <span class="detail-label">URL:</span>
          <span class="detail-value">${req.fullUrl}</span>
          <span class="detail-label">Status:</span>
          <span class="detail-value">${req.statusCode || 'Pending'} ${req.error ? `(${req.error})` : ''}</span>
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${this._formatDuration(req.duration)}</span>
        </div>

        ${this.detailTab === 'response' ? html`
          <div class="detail-body detail-body--json">${this._formatBody(req.responseBody)}</div>
        ` : ''}

        ${this.detailTab === 'request' ? (
          this._isGraphQLRequest(req)
            ? this._renderGraphQLBody(req)
            : html`<div class="detail-body detail-body--json">${this._formatBody(req.requestBody)}</div>`
        ) : ''}

        ${this.detailTab === 'headers' ? html`
          <div class="detail-body">
            <strong>Request Headers:</strong>
${Object.entries(req.requestHeaders || {}).map(([k, v]) => `${k}: ${v}`).join('\n') || 'None'}

<strong>Response Headers:</strong>
${Object.entries(req.responseHeaders || {}).map(([k, v]) => `${k}: ${v}`).join('\n') || 'None'}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const filteredRequests = this._getFilteredRequests();

    return html`
      <div class="toolbar">
        <select class="filter-select" .value=${this.filter} @change=${this._handleFilterChange}>
          <option value="all">All requests</option>
          <option value="cart">Cart</option>
          <option value="product">Products</option>
          <option value="collection">Collections</option>
          <option value="search">Search</option>
          <option value="graphql">GraphQL</option>
          <option value="other">Other</option>
        </select>
        <div class="search-wrapper">
          <input
            type="text"
            class="search-input ${this.searchQuery ? 'search-input--active' : ''}"
            placeholder="Search requests... (e.g. variant ID)"
            .value=${this.searchQuery}
            @input=${this._handleSearchInput}
          />
          ${this.searchQuery ? html`
            <button class="search-clear" @click=${this._clearSearch} title="Clear search">x</button>
          ` : ''}
        </div>
        <button
          class="blocked-toggle ${this.showBlockedPanel ? 'blocked-toggle--active' : ''}"
          @click=${() => this._toggleBlockedPanel()}
          title="Manage blocked sources"
        >
          Blocked
          ${this.blockedSources.length > 0 ? html`
            <span class="blocked-count">${this.blockedSources.length}</span>
          ` : ''}
        </button>
        <span class="request-count">${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}</span>
        <button class="btn-clear" @click=${this._handleClear}>Clear</button>
      </div>

      ${this._renderBlockedPanel()}

      ${filteredRequests.length === 0
        ? html`
          <div class="empty-state">
            <div class="empty-icon">${this.searchQuery ? '🔍' : '📡'}</div>
            <div>${this.searchQuery ? `No requests matching "${this.searchQuery}"` : 'No Shopify API requests captured yet.'}</div>
            <div style="margin-top: 8px; font-size: calc(10px * var(--tdt-scale, 1));">
              ${this.searchQuery ? 'Try a different search term or clear the filter.' : 'Interact with the store (add to cart, search, etc.) to see requests.'}
            </div>
          </div>
        `
        : html`
          <div class="request-list">
            ${filteredRequests.map(req => this._renderRequest(req))}
          </div>
        `
      }

      ${this.toastMessage ? html`
        <div class="copy-toast">${this.toastMessage}</div>
      ` : ''}

      ${this._renderEditorModal()}
    `;
  }
}

customElements.define('network-panel', NetworkPanel);
