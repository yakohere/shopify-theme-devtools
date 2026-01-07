import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';
import { expressionEvaluator } from '../../services/expression-evaluator.js';

export class ConsolePanel extends LitElement {
  static properties = {
    liquidErrors: { type: Array, state: true },
    evalLogs: { type: Array, state: true },
    expandedLogs: { type: Set, state: true },
    // Expression input properties
    inputValue: { type: String, state: true },
    historyIndex: { type: Number, state: true },
    suggestions: { type: Array, state: true },
    selectedSuggestion: { type: Number, state: true },
    showSuggestions: { type: Boolean, state: true },
    context: { type: Object },
  };

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 12px;
        height: 100%;
        overflow: hidden;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        position: sticky;
        top: 0;
        background: var(--tdt-bg);
        z-index: 10;
        margin: 0;
        padding: 0 0 12px 0;
      }

      .toolbar-title {
        font-size: calc(12px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text);
      }

      .toolbar-spacer {
        flex: 1;
      }

      .btn-clear {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .btn-clear:hover {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
        color: white;
      }

      .btn-rescan {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
      }

      .btn-rescan:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .log-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        font-size: calc(11px * var(--tdt-scale, 1));
        overflow: hidden;
        margin-bottom: 4px;
      }

      .log-item--liquid {
        border-left: 3px solid #9382ff;
        background: rgba(147, 130, 255, 0.05);
      }

      .log-item--drop {
        border-left: 3px solid #f97316;
        background: rgba(249, 115, 22, 0.05);
      }

      .log-item--asset {
        border-left: 3px solid #eab308;
        background: rgba(234, 179, 8, 0.05);
      }

      .log-item--schema {
        border-left: 3px solid #ec4899;
        background: rgba(236, 72, 153, 0.05);
      }

      .log-item--json {
        border-left: 3px solid #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }

      .log-item--eval {
        border-left: 3px solid var(--tdt-accent);
        background: rgba(59, 130, 246, 0.05);
      }

      .log-header {
        display: flex;
        align-items: flex-start;
        padding: 8px 10px;
        cursor: pointer;
        gap: 8px;
      }

      .log-header:hover {
        background: var(--tdt-bg-hover);
      }

      .log-type {
        font-size: calc(10px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .log-type--liquid {
        background: #9382ff;
        color: white;
      }

      .log-type--drop {
        background: #f97316;
        color: white;
      }

      .log-type--asset {
        background: #eab308;
        color: var(--tdt-bg);
      }

      .log-type--schema {
        background: #ec4899;
        color: white;
      }

      .log-type--json {
        background: #ef4444;
        color: white;
      }

      .log-type--eval {
        background: var(--tdt-accent);
        color: white;
      }

      .log-message {
        flex: 1;
        font-family: var(--tdt-font-mono);
        color: var(--tdt-text);
      }

      .log-time {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        flex-shrink: 0;
      }

      .log-content {
        border-top: 1px solid var(--tdt-border);
        padding: 10px;
        background: var(--tdt-bg);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state__icon {
        font-size: calc(32px * var(--tdt-scale, 1));
        margin-bottom: 8px;
      }

      .liquid-section {
        margin-bottom: 16px;
      }

      .section-title {
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--tdt-border);
      }

      .liquid-category {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 1px 4px;
        border-radius: 3px;
        background: var(--tdt-bg);
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        margin-left: 6px;
      }

      .element-path {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        margin-top: 4px;
        padding: 4px 8px;
        background: var(--tdt-bg);
        border-radius: var(--tdt-radius);
      }

      .liquid-hint {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 6px;
        padding: 6px 8px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: var(--tdt-radius);
        border-left: 2px solid #6366f1;
      }

      .liquid-hint code {
        background: var(--tdt-bg-secondary);
        padding: 1px 4px;
        border-radius: 2px;
        color: var(--tdt-success);
      }

      /* Console Input Styles */
      .console-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .console-content {
        flex: 1;
        overflow: auto;
        padding-bottom: 8px;
      }

      .console-input-container {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 0;
        border-top: 1px solid var(--tdt-border);
        background: var(--tdt-bg);
        margin-top: auto;
      }

      .console-prompt {
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
        font-size: calc(14px * var(--tdt-scale, 1));
        font-weight: 600;
        flex-shrink: 0;
        user-select: none;
        padding-top: 4px;
      }

      .console-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
        font-size: calc(12px * var(--tdt-scale, 1));
        padding: 4px 0;
        resize: none;
        min-height: 20px;
        max-height: 150px;
        overflow-y: auto;
        line-height: 1.4;
      }

      .console-input::placeholder {
        color: var(--tdt-text-muted);
        opacity: 0.6;
      }

      .console-input-hint {
        position: absolute;
        right: 0;
        bottom: 100%;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        opacity: 0.6;
        padding: 2px 4px;
      }

      .console-disclaimer {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        opacity: 0.7;
        padding: 4px 0 0 20px;
        font-style: italic;
      }

      .autocomplete-dropdown {
        position: absolute;
        bottom: 100%;
        left: 20px;
        right: 0;
        max-height: 200px;
        overflow-y: auto;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.25);
        z-index: 100;
        margin-bottom: 4px;
      }

      .autocomplete-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-family: var(--tdt-font-mono);
        font-size: calc(11px * var(--tdt-scale, 1));
        border-bottom: 1px solid var(--tdt-border);
      }

      .autocomplete-item:last-child {
        border-bottom: none;
      }

      .autocomplete-item:hover:not(.autocomplete-item--selected) {
        background: var(--tdt-bg-hover);
      }

      .autocomplete-item--selected {
        background: var(--tdt-accent);
      }

      .autocomplete-item--selected .autocomplete-path {
        color: white;
        font-weight: 500;
      }

      .autocomplete-item--selected .autocomplete-type {
        background: rgba(0, 0, 0, 0.2);
        color: white;
        border-color: transparent;
      }

      .autocomplete-item--selected .autocomplete-preview {
        color: rgba(255, 255, 255, 0.8);
      }

      .autocomplete-path {
        flex: 1;
        color: var(--tdt-text);
      }

      .autocomplete-type {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: 3px;
        background: var(--tdt-bg-hover);
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        font-weight: 600;
        border: 1px solid var(--tdt-border);
        flex-shrink: 0;
      }

      .autocomplete-type--filter {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .autocomplete-preview {
        color: var(--tdt-text-muted);
        font-size: calc(10px * var(--tdt-scale, 1));
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .eval-expression {
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        margin-bottom: 4px;
      }

      .eval-result {
        color: var(--tdt-text);
        font-family: var(--tdt-font-mono);
      }

      .eval-result--error {
        color: var(--tdt-error);
      }

      .eval-result--undefined {
        color: var(--tdt-text-muted);
        font-style: italic;
      }

      .eval-result--string {
        color: #22c55e;
      }

      .eval-result--number {
        color: #3b82f6;
      }

      .eval-result--boolean {
        color: #a855f7;
      }

      .eval-result--null {
        color: var(--tdt-text-muted);
      }
    `
  ];

  constructor() {
    super();
    this.liquidErrors = [];
    this.evalLogs = [];
    this.expandedLogs = new Set();

    // Expression input state
    this.inputValue = '';
    this.historyIndex = -1;
    this.suggestions = [];
    this.selectedSuggestion = -1;
    this.showSuggestions = false;
    this.context = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._scanForLiquidErrors();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('context') && this.context) {
      expressionEvaluator.setContext(this.context);
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('context') && this.context && !expressionEvaluator.context) {
      expressionEvaluator.setContext(this.context);
    }
  }

  _scanForLiquidErrors() {
    const errors = [];
    const seenMessages = new Set();

    const addError = (message, category, element = null) => {
      const trimmed = message.trim();
      if (seenMessages.has(trimmed)) return;
      seenMessages.add(trimmed);

      errors.push({
        id: Date.now() + Math.random(),
        type: 'liquid',
        category,
        message: trimmed,
        timestamp: new Date(),
        element: element ? this._getElementPath(element) : null
      });
    };

    // 1. Scan HTML comments for Liquid errors
    const comments = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    while (comments.nextNode()) {
      const text = comments.currentNode.textContent;
      if (text.includes('Liquid error') || text.includes('Liquid syntax error')) {
        addError(text, 'comment');
      }
    }

    // 2. Scan visible text content for various Liquid error patterns
    const pageContent = document.body.innerHTML;

    // Liquid error patterns
    const liquidErrorPatterns = [
      // Standard Liquid errors
      { pattern: /Liquid\s+error\s*\(line\s*\d+\):\s*[^<\n]+/gi, category: 'inline' },
      { pattern: /Liquid\s+error:\s*[^<\n]+/gi, category: 'inline' },
      { pattern: /Liquid\s+syntax\s+error\s*\(line\s*\d+\):\s*[^<\n]+/gi, category: 'inline' },
      { pattern: /Liquid\s+syntax\s+error:\s*[^<\n]+/gi, category: 'inline' },

      // Schema/JSON errors
      { pattern: /Error\s+in\s+schema:\s*[^<\n]+/gi, category: 'schema' },
      { pattern: /Invalid\s+JSON\s+in\s+schema\s+tag/gi, category: 'schema' },
      { pattern: /Error\s+parsing\s+schema:\s*[^<\n]+/gi, category: 'schema' },
    ];

    liquidErrorPatterns.forEach(({ pattern, category }) => {
      let match;
      while ((match = pattern.exec(pageContent)) !== null) {
        addError(match[0], category);
      }
    });

    // 2b. Detect JSON filter errors (appears as {"error":"..."} in page)
    const jsonErrorPattern = /\{"error"\s*:\s*"([^"]+)"\}/gi;
    let jsonMatch;
    while ((jsonMatch = jsonErrorPattern.exec(pageContent)) !== null) {
      const errorMsg = jsonMatch[1];
      addError(
        `JSON filter error: ${errorMsg} — This occurs when using | json on objects that cannot be serialized`,
        'json'
      );
    }

    // 3. Detect Drop objects rendered as strings
    // Pattern 1: #<ProductDrop:0x...> format
    const dropPattern = /#<(?:Shopify::)?(?:Liquid::)?(\w+)Drop:0x[a-f0-9]+>/gi;
    let dropMatch;
    while ((dropMatch = dropPattern.exec(pageContent)) !== null) {
      const dropType = dropMatch[1];
      addError(
        `Raw ${dropType} Drop object rendered: ${dropMatch[0]} — Use .title, .url, or other property instead of outputting the object directly`,
        'drop'
      );
    }

    // Pattern 2: Simple "ShopDrop", "ProductDrop", etc. format (newer Shopify output)
    const simpleDropPattern = /\b(Shop|Product|Collection|Cart|Customer|Article|Blog|Page|Variant|Image|Metafield|Address|Order|LineItem|Fulfillment|Transaction|Country|Currency|Locale|Market|Policy|Section|Block|Theme|Font|Link|Linklist|Comment|Form|Paginate|TableRow|ForLoop)Drop\b/g;
    let simpleDropMatch;
    while ((simpleDropMatch = simpleDropPattern.exec(pageContent)) !== null) {
      const dropType = simpleDropMatch[1];
      addError(
        `Raw ${dropType}Drop object rendered on page — Use a property like .title, .name, .url instead of outputting {{ ${dropType.toLowerCase()} }} directly`,
        'drop'
      );
    }

    // 4. Scan text nodes for errors that might be in visible content
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tagName = parent.tagName?.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      const text = walker.currentNode.textContent;

      // Check for Liquid errors in text
      if (/Liquid\s+(error|syntax error)/i.test(text)) {
        const match = text.match(/Liquid\s+(?:error|syntax error)[^]*/i);
        if (match) {
          addError(match[0], 'text', walker.currentNode.parentElement);
        }
      }

      // Check for Drop objects in text
      if (/#<\w+Drop:0x/i.test(text)) {
        const match = text.match(/#<(?:Shopify::)?(?:Liquid::)?(\w+)Drop:0x[a-f0-9]+>/i);
        if (match) {
          addError(
            `Raw ${match[1]} Drop object in page: ${match[0]}`,
            'drop',
            walker.currentNode.parentElement
          );
        }
      }

      // Check for "unknown image file" or asset errors
      if (/unknown\s+image\s+file/i.test(text)) {
        addError(`Unknown image file error: ${text.substring(0, 200)}`, 'asset', walker.currentNode.parentElement);
      }
    }

    // 5. Check for broken images that might indicate asset errors
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src || img.dataset.src;
      const alt = img.alt;

      // Check if alt text contains error indicators
      if (alt && /Liquid\s+error|Could\s+not\s+find\s+asset/i.test(alt)) {
        addError(`Image error: ${alt}`, 'asset', img);
      }

      // Check for broken image indicators in src
      if (src && /Liquid%20error|Could%20not%20find/i.test(src)) {
        addError(`Broken image URL contains error: ${decodeURIComponent(src.substring(0, 200))}`, 'asset', img);
      }
    });

    // 6. Look for common error patterns in specific elements
    const errorContainers = document.querySelectorAll('.shopify-section, [data-section-type], .template-');
    errorContainers.forEach(container => {
      const text = container.textContent;

      // Check for form errors
      if (/form\s+'product'\s+needs\s+a\s+product\s+object/i.test(text)) {
        addError("Liquid error: form 'product' needs a product object", 'form', container);
      }
      if (/form\s+'customer_address'\s+requires\s+an\s+address/i.test(text)) {
        addError("Liquid error: form 'customer_address' requires an address", 'form', container);
      }
      if (/invalid\s+form\s+type/i.test(text)) {
        const match = text.match(/invalid\s+form\s+type\s*['"]?(\w+)['"]?/i);
        addError(`Liquid error: invalid form type '${match?.[1] || 'unknown'}'`, 'form', container);
      }
    });

    this.liquidErrors = errors;
  }

  _getElementPath(element) {
    if (!element) return null;
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 5) {
      let selector = current.tagName?.toLowerCase() || '';
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').filter(c => c && !c.startsWith('js-')).slice(0, 2);
        if (classes.length) selector += `.${classes.join('.')}`;
      }
      if (selector) parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  _clearEvalLogs() {
    this.evalLogs = [];
  }

  _toggleExpand(logId) {
    const newExpanded = new Set(this.expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    this.expandedLogs = newExpanded;
  }

  // Expression input methods
  _handleInputKeydown(e) {
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
          return;
        }
        e.preventDefault();
        if (this.showSuggestions && this.selectedSuggestion >= 0) {
          this._selectSuggestion(this.selectedSuggestion);
        } else {
          this._evaluateExpression();
        }
        break;

      case 'ArrowUp':
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          this.selectedSuggestion = this.selectedSuggestion <= 0
            ? this.suggestions.length - 1
            : this.selectedSuggestion - 1;
          this._scrollSuggestionIntoView();
        } else if (!this.inputValue.includes('\n') || this._isAtFirstLine(e.target)) {
          e.preventDefault();
          this._navigateHistory(-1);
        }
        break;

      case 'ArrowDown':
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          this.selectedSuggestion = this.selectedSuggestion >= this.suggestions.length - 1
            ? 0
            : this.selectedSuggestion + 1;
          this._scrollSuggestionIntoView();
        } else if (!this.inputValue.includes('\n') || this._isAtLastLine(e.target)) {
          e.preventDefault();
          this._navigateHistory(1);
        }
        break;

      case 'Tab':
        if (this.showSuggestions && this.suggestions.length > 0) {
          e.preventDefault();
          const index = this.selectedSuggestion >= 0 ? this.selectedSuggestion : 0;
          this._selectSuggestion(index);
        }
        break;

      case 'Escape':
        if (this.showSuggestions) {
          e.preventDefault();
          this.showSuggestions = false;
          this.selectedSuggestion = -1;
        }
        break;
    }
  }

  _isAtFirstLine(textarea) {
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    return !textBefore.includes('\n');
  }

  _isAtLastLine(textarea) {
    const cursorPos = textarea.selectionStart;
    const textAfter = textarea.value.substring(cursorPos);
    return !textAfter.includes('\n');
  }

  _scrollSuggestionIntoView() {
    this.updateComplete.then(() => {
      const dropdown = this.shadowRoot.querySelector('.autocomplete-dropdown');
      const selectedItem = this.shadowRoot.querySelector('.autocomplete-item--selected');
      if (dropdown && selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  _handleInput(e) {
    this.inputValue = e.target.value;
    this.historyIndex = -1;
    this._updateSuggestions();
    this._autoGrowTextarea(e.target);
  }

  _autoGrowTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  _updateSuggestions() {
    if (!this.inputValue.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.selectedSuggestion = -1;
      return;
    }

    this.suggestions = expressionEvaluator.getCompletions(this.inputValue);
    this.showSuggestions = this.suggestions.length > 0;
    this.selectedSuggestion = -1;
  }

  _selectSuggestion(index) {
    const suggestion = this.suggestions[index];
    if (!suggestion) return;

    const pipeIndex = this.inputValue.lastIndexOf('|');
    if (pipeIndex !== -1 && suggestion.type === 'filter') {
      this.inputValue = this.inputValue.slice(0, pipeIndex + 1) + ' ' + suggestion.value;
    } else {
      this.inputValue = suggestion.value;
    }

    this.showSuggestions = false;
    this.selectedSuggestion = -1;

    this.updateComplete.then(() => {
      const textarea = this.shadowRoot.querySelector('.console-input');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        this._autoGrowTextarea(textarea);
      }
    });
  }

  _navigateHistory(direction) {
    const history = expressionEvaluator.getHistory();
    if (history.length === 0) return;

    if (direction === -1) {
      if (this.historyIndex < history.length - 1) {
        this.historyIndex++;
        this.inputValue = history[history.length - 1 - this.historyIndex];
      }
    } else {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputValue = history[history.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.inputValue = '';
      }
    }

    this.showSuggestions = false;
  }

  async _evaluateExpression() {
    if (!this.inputValue.trim()) return;

    const expression = this.inputValue;

    this.inputValue = '';
    this.historyIndex = -1;
    this.showSuggestions = false;

    const result = await expressionEvaluator.evaluate(expression);

    const logEntry = {
      id: Date.now() + Math.random(),
      type: 'eval',
      expression: result.expression,
      result: result.success ? result.value : null,
      error: result.success ? null : result.error,
      success: result.success,
      timestamp: new Date(),
    };

    this.evalLogs = [...this.evalLogs, logEntry];

    this.updateComplete.then(() => {
      const content = this.shadowRoot.querySelector('.console-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    });
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
      fractionalSecondDigits: 3
    });
  }

  _renderEvalResult(log) {
    if (!log.success) {
      return html`<span class="eval-result eval-result--error">${log.error}</span>`;
    }

    const value = log.result;

    if (value === undefined) {
      return html`<span class="eval-result eval-result--undefined">undefined</span>`;
    }

    if (value === null) {
      return html`<span class="eval-result eval-result--null">null</span>`;
    }

    if (typeof value === 'string') {
      return html`<span class="eval-result eval-result--string">"${value}"</span>`;
    }

    if (typeof value === 'number') {
      return html`<span class="eval-result eval-result--number">${value}</span>`;
    }

    if (typeof value === 'boolean') {
      return html`<span class="eval-result eval-result--boolean">${value}</span>`;
    }

    if (typeof value === 'object') {
      return html`
        <div class="eval-result">
          <tdt-object-inspector .data=${value} .path=${'result'}></tdt-object-inspector>
        </div>
      `;
    }

    return html`<span class="eval-result">${String(value)}</span>`;
  }

  _renderLiquidErrors() {
    if (this.liquidErrors.length === 0) return null;

    const getCategoryStyle = (category) => {
      switch (category) {
        case 'drop': return 'log-item--drop';
        case 'asset': return 'log-item--asset';
        case 'schema': return 'log-item--schema';
        case 'json': return 'log-item--json';
        default: return 'log-item--liquid';
      }
    };

    const getTypeStyle = (category) => {
      switch (category) {
        case 'drop': return 'log-type--drop';
        case 'asset': return 'log-type--asset';
        case 'schema': return 'log-type--schema';
        case 'json': return 'log-type--json';
        default: return 'log-type--liquid';
      }
    };

    const getTypeLabel = (category) => {
      switch (category) {
        case 'drop': return 'DROP';
        case 'asset': return 'ASSET';
        case 'schema': return 'SCHEMA';
        case 'json': return 'JSON';
        case 'form': return 'FORM';
        default: return 'LIQUID';
      }
    };

    const getHint = (error) => {
      if (error.category === 'drop') {
        const match = error.message.match(/Raw\s+(\w+)\s+Drop/i);
        const dropType = match?.[1]?.toLowerCase() || 'object';
        return html`
          <div class="liquid-hint">
            Instead of <code>{{ ${dropType} }}</code>, use a specific property like
            <code>{{ ${dropType}.title }}</code>, <code>{{ ${dropType}.url }}</code>, or
            <code>{{ ${dropType}.handle }}</code>
          </div>
        `;
      }
      if (error.message.includes('Could not find snippet')) {
        const match = error.message.match(/Could not find snippet '([^']+)'/i);
        const snippetName = match?.[1] || 'snippet-name';
        return html`
          <div class="liquid-hint">
            Create the missing snippet file: <code>snippets/${snippetName}.liquid</code>
          </div>
        `;
      }
      if (error.message.includes('Could not find asset')) {
        const match = error.message.match(/Could not find asset '([^']+)'/i);
        const assetName = match?.[1] || 'asset-name';
        return html`
          <div class="liquid-hint">
            Upload the missing asset to: <code>assets/${assetName}</code>
          </div>
        `;
      }
      if (error.message.includes('Unknown filter')) {
        const match = error.message.match(/Unknown filter '([^']+)'/i);
        const filterName = match?.[1] || 'filter';
        return html`
          <div class="liquid-hint">
            The filter <code>${filterName}</code> doesn't exist in Shopify Liquid. Check the
            <a href="https://shopify.dev/docs/api/liquid/filters" target="_blank" style="color: var(--tdt-accent)">Liquid filters reference</a>.
          </div>
        `;
      }
      if (error.message.includes('Unknown tag')) {
        const match = error.message.match(/Unknown tag '([^']+)'/i);
        const tagName = match?.[1] || 'tag';
        return html`
          <div class="liquid-hint">
            The tag <code>${tagName}</code> doesn't exist in Shopify Liquid. Check the
            <a href="https://shopify.dev/docs/api/liquid/tags" target="_blank" style="color: var(--tdt-accent)">Liquid tags reference</a>.
          </div>
        `;
      }
      if (error.message.includes('divided by 0')) {
        return html`
          <div class="liquid-hint">
            Add a check before dividing: <code>{% if divisor != 0 %}{{ value | divided_by: divisor }}{% endif %}</code>
          </div>
        `;
      }
      if (error.category === 'json') {
        return html`
          <div class="liquid-hint">
            The <code>| json</code> filter cannot serialize certain objects like forms, images, or media.
            Use specific properties instead: <code>{{ object.property | json }}</code> or manually build the JSON structure.
          </div>
        `;
      }
      return null;
    };

    return html`
      <div class="liquid-section">
        <div class="section-title">Liquid Errors Found on Page (${this.liquidErrors.length})</div>
        ${this.liquidErrors.map(error => {
          const isExpanded = this.expandedLogs.has(error.id);
          const hasDetails = error.element || error.category === 'drop' || error.category === 'json';
          return html`
            <div class="log-item ${getCategoryStyle(error.category)}">
              <div class="log-header" @click=${() => hasDetails && this._toggleExpand(error.id)}>
                <span class="log-type ${getTypeStyle(error.category)}">${getTypeLabel(error.category)}</span>
                <span class="log-message">${error.message}</span>
                ${error.category && error.category !== 'inline' ? html`
                  <span class="liquid-category">${error.category}</span>
                ` : ''}
                <span class="log-time">${this._formatTime(error.timestamp)}</span>
              </div>
              ${isExpanded ? html`
                <div class="log-content">
                  ${error.element ? html`
                    <div class="element-path">Found in: ${error.element}</div>
                  ` : ''}
                  ${getHint(error)}
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderEvalLogs() {
    if (this.evalLogs.length === 0) return null;

    return html`
      <div class="liquid-section">
        <div class="section-title">Expression Results (${this.evalLogs.length})</div>
        ${this.evalLogs.map(log => html`
          <div class="log-item log-item--eval">
            <div class="log-header">
              <span class="log-type log-type--eval">EVAL</span>
              <span class="log-message">
                <span class="eval-expression">${log.expression}</span>
              </span>
              <span class="log-time">${this._formatTime(log.timestamp)}</span>
            </div>
            <div class="log-content">
              ${this._renderEvalResult(log)}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    const hasContent = this.liquidErrors.length > 0 || this.evalLogs.length > 0;

    return html`
      <div class="console-container">
        <div class="console-content">
          <div class="toolbar">
            <span class="toolbar-title">Liquid Inspector</span>
            <span class="toolbar-spacer"></span>
            <button class="btn-rescan" @click=${() => this._scanForLiquidErrors()}>
              Rescan Page
            </button>
            ${this.evalLogs.length > 0 ? html`
              <button class="btn-clear" @click=${this._clearEvalLogs}>
                Clear Results
              </button>
            ` : ''}
          </div>

          ${this._renderLiquidErrors()}
          ${this._renderEvalLogs()}

          ${!hasContent ? html`
            <div class="empty-state">
              <div class="empty-state__icon">✓</div>
              <div>No Liquid errors found on this page</div>
              <div style="font-size: 11px; margin-top: 8px;">Use the expression input below to evaluate Liquid variables</div>
            </div>
          ` : ''}
        </div>

        <div class="console-input-container">
          ${this.showSuggestions && this.suggestions.length > 0 ? html`
            <div class="autocomplete-dropdown">
              ${this.suggestions.map((suggestion, index) => html`
                <div
                  class="autocomplete-item ${index === this.selectedSuggestion ? 'autocomplete-item--selected' : ''}"
                  @click=${() => this._selectSuggestion(index)}
                  @mouseenter=${() => this.selectedSuggestion = index}
                >
                  <span class="autocomplete-path">${suggestion.value}</span>
                  <span class="autocomplete-type ${suggestion.type === 'filter' ? 'autocomplete-type--filter' : ''}">${suggestion.type}</span>
                  ${suggestion.preview ? html`
                    <span class="autocomplete-preview">${typeof suggestion.preview === 'object' ? JSON.stringify(suggestion.preview) : suggestion.preview}</span>
                  ` : ''}
                </div>
              `)}
            </div>
          ` : ''}
          ${this.inputValue.includes('\n') ? html`
            <span class="console-input-hint">Shift+Enter for newline</span>
          ` : ''}
          <span class="console-prompt">></span>
          <textarea
            class="console-input"
            placeholder="Type expression... (e.g., product.title | upcase)"
            .value=${this.inputValue}
            @input=${this._handleInput}
            @keydown=${this._handleInputKeydown}
            @blur=${() => setTimeout(() => this.showSuggestions = false, 200)}
            @focus=${() => this._updateSuggestions()}
            rows="1"
          ></textarea>
        </div>
        <div class="console-disclaimer">
          Uses LiquidJS engine — results may differ slightly from Shopify's native Liquid
        </div>
      </div>
    `;
  }
}

customElements.define('tdt-console-panel', ConsolePanel);
