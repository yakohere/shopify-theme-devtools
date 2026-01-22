import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { aiService } from '../../services/ai.js';
import { contextSerializer, CONTEXT_OPTIONS } from '../../services/context-serializer.js';

/**
 * Lightweight syntax highlighter for code blocks
 * Uses a tokenization approach to avoid regex conflicts
 * Supports Liquid, JavaScript, JSON, HTML, CSS
 */
class SyntaxHighlighter {
  static KEYWORDS = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends',
    'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch',
    'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined',
    'true', 'false'
  ]);

  static LIQUID_KEYWORDS = new Set([
    'if', 'elsif', 'else', 'endif', 'unless', 'endunless', 'case', 'when', 'endcase',
    'for', 'endfor', 'capture', 'endcapture', 'paginate', 'endpaginate', 'form', 'endform',
    'tablerow', 'endtablerow', 'comment', 'endcomment', 'raw', 'endraw',
    'include', 'render', 'section', 'layout', 'assign', 'echo', 'liquid',
    'break', 'continue', 'cycle', 'decrement', 'increment', 'style'
  ]);

  static LIQUID_FILTERS = new Set([
    'money', 'money_with_currency', 'money_without_currency', 'img_url', 'asset_url',
    'file_url', 'link_to', 'date', 'default', 'size', 'first', 'last', 'join', 'sort',
    'map', 'where', 'concat', 'reverse', 'uniq', 'compact', 'split', 'strip',
    'strip_html', 'strip_newlines', 'truncate', 'truncatewords', 'upcase', 'downcase',
    'capitalize', 'escape', 'url_encode', 'url_decode', 'json', 'abs', 'ceil', 'floor',
    'round', 'plus', 'minus', 'times', 'divided_by', 'modulo', 'append', 'prepend',
    'replace', 'replace_first', 'remove', 'remove_first', 'newline_to_br', 'pluralize',
    'slice', 't', 'handle', 'handleize', 'highlight', 'img_tag', 'link_to_tag',
    'link_to_type', 'link_to_vendor', 'placeholder_svg_tag', 'product_img_url',
    'script_tag', 'stylesheet_tag', 'within'
  ]);

  /**
   * Escape HTML entities
   */
  static escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Highlight JavaScript/TypeScript code
   */
  static highlightJS(code) {
    const tokens = [];
    let i = 0;

    while (i < code.length) {
      // Single-line comment
      if (code[i] === '/' && code[i + 1] === '/') {
        const end = code.indexOf('\n', i);
        const commentEnd = end === -1 ? code.length : end;
        tokens.push(`<span class="hl-comment">${this.escapeHtml(code.slice(i, commentEnd))}</span>`);
        i = commentEnd;
        continue;
      }

      // Multi-line comment
      if (code[i] === '/' && code[i + 1] === '*') {
        const end = code.indexOf('*/', i + 2);
        const commentEnd = end === -1 ? code.length : end + 2;
        tokens.push(`<span class="hl-comment">${this.escapeHtml(code.slice(i, commentEnd))}</span>`);
        i = commentEnd;
        continue;
      }

      // String (double quote)
      if (code[i] === '"') {
        let j = i + 1;
        while (j < code.length && (code[j] !== '"' || code[j - 1] === '\\')) j++;
        tokens.push(`<span class="hl-string">${this.escapeHtml(code.slice(i, j + 1))}</span>`);
        i = j + 1;
        continue;
      }

      // String (single quote)
      if (code[i] === "'") {
        let j = i + 1;
        while (j < code.length && (code[j] !== "'" || code[j - 1] === '\\')) j++;
        tokens.push(`<span class="hl-string">${this.escapeHtml(code.slice(i, j + 1))}</span>`);
        i = j + 1;
        continue;
      }

      // Template literal
      if (code[i] === '`') {
        let j = i + 1;
        while (j < code.length && (code[j] !== '`' || code[j - 1] === '\\')) j++;
        tokens.push(`<span class="hl-string">${this.escapeHtml(code.slice(i, j + 1))}</span>`);
        i = j + 1;
        continue;
      }

      // Number
      if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
        let j = i;
        while (j < code.length && /[\d.]/.test(code[j])) j++;
        tokens.push(`<span class="hl-number">${code.slice(i, j)}</span>`);
        i = j;
        continue;
      }

      // Word (identifier, keyword, or function)
      if (/[a-zA-Z_$]/.test(code[i])) {
        let j = i;
        while (j < code.length && /\w/.test(code[j])) j++;
        const word = code.slice(i, j);

        // Check what follows (skip whitespace)
        let k = j;
        while (k < code.length && /\s/.test(code[k])) k++;

        if (this.KEYWORDS.has(word)) {
          tokens.push(`<span class="hl-keyword">${word}</span>`);
        } else if (code[k] === '(') {
          tokens.push(`<span class="hl-function">${word}</span>`);
        } else {
          tokens.push(this.escapeHtml(word));
        }
        i = j;
        continue;
      }

      // Property access
      if (code[i] === '.' && /[a-zA-Z_$]/.test(code[i + 1])) {
        let j = i + 1;
        while (j < code.length && /\w/.test(code[j])) j++;
        tokens.push(`.<span class="hl-property">${code.slice(i + 1, j)}</span>`);
        i = j;
        continue;
      }

      // Default: push single character
      tokens.push(this.escapeHtml(code[i]));
      i++;
    }

    return tokens.join('');
  }

  /**
   * Highlight JSON code
   */
  static highlightJSON(code) {
    const tokens = [];
    let i = 0;

    while (i < code.length) {
      // String
      if (code[i] === '"') {
        let j = i + 1;
        while (j < code.length && (code[j] !== '"' || code[j - 1] === '\\')) j++;
        const str = code.slice(i, j + 1);

        // Check if it's a key (followed by :)
        let k = j + 1;
        while (k < code.length && /\s/.test(code[k])) k++;

        if (code[k] === ':') {
          tokens.push(`<span class="hl-key">${this.escapeHtml(str)}</span>`);
        } else {
          tokens.push(`<span class="hl-string">${this.escapeHtml(str)}</span>`);
        }
        i = j + 1;
        continue;
      }

      // Number
      if (/[-\d]/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
        let j = i;
        if (code[j] === '-') j++;
        while (j < code.length && /[\d.eE+-]/.test(code[j])) j++;
        if (j > i) {
          tokens.push(`<span class="hl-number">${code.slice(i, j)}</span>`);
          i = j;
          continue;
        }
      }

      // Keywords (true, false, null)
      if (/[tfn]/.test(code[i])) {
        const rest = code.slice(i);
        const match = rest.match(/^(true|false|null)\b/);
        if (match) {
          tokens.push(`<span class="hl-keyword">${match[1]}</span>`);
          i += match[1].length;
          continue;
        }
      }

      // Default
      tokens.push(this.escapeHtml(code[i]));
      i++;
    }

    return tokens.join('');
  }

  /**
   * Highlight Liquid code (mixed with HTML/JS)
   */
  static highlightLiquid(code) {
    const tokens = [];
    let i = 0;

    while (i < code.length) {
      // Liquid output {{ }}
      if (code[i] === '{' && code[i + 1] === '{') {
        const end = code.indexOf('}}', i + 2);
        if (end !== -1) {
          const content = code.slice(i, end + 2);
          tokens.push(`<span class="hl-output">${this.escapeHtml(content)}</span>`);
          i = end + 2;
          continue;
        }
      }

      // Liquid tag {% %}
      if (code[i] === '{' && code[i + 1] === '%') {
        const end = code.indexOf('%}', i + 2);
        if (end !== -1) {
          const content = code.slice(i, end + 2);
          // Highlight keywords within the tag
          const highlighted = content.replace(
            /(\{%[-]?\s*)(\w+)/,
            (match, prefix, keyword) => {
              if (this.LIQUID_KEYWORDS.has(keyword)) {
                return `${this.escapeHtml(prefix)}<span class="hl-keyword">${keyword}</span>`;
              }
              return this.escapeHtml(match);
            }
          );
          tokens.push(`<span class="hl-tag">${highlighted.slice(0, 2) === '{%' ? highlighted : this.escapeHtml(content)}</span>`);
          i = end + 2;
          continue;
        }
      }

      // HTML comment
      if (code.slice(i, i + 4) === '<!--') {
        const end = code.indexOf('-->', i + 4);
        const commentEnd = end === -1 ? code.length : end + 3;
        tokens.push(`<span class="hl-comment">${this.escapeHtml(code.slice(i, commentEnd))}</span>`);
        i = commentEnd;
        continue;
      }

      // HTML tag
      if (code[i] === '<' && /[a-zA-Z\/!]/.test(code[i + 1])) {
        const end = code.indexOf('>', i);
        if (end !== -1) {
          const tag = code.slice(i, end + 1);
          // Simple highlighting: tag name
          const highlighted = tag.replace(
            /^(<\/?)([\w-]+)/,
            (match, bracket, name) => `${this.escapeHtml(bracket)}<span class="hl-tag-name">${name}</span>`
          );
          tokens.push(highlighted);
          i = end + 1;
          continue;
        }
      }

      // JS single-line comment
      if (code[i] === '/' && code[i + 1] === '/') {
        const end = code.indexOf('\n', i);
        const commentEnd = end === -1 ? code.length : end;
        tokens.push(`<span class="hl-comment">${this.escapeHtml(code.slice(i, commentEnd))}</span>`);
        i = commentEnd;
        continue;
      }

      // JS multi-line comment
      if (code[i] === '/' && code[i + 1] === '*') {
        const end = code.indexOf('*/', i + 2);
        const commentEnd = end === -1 ? code.length : end + 2;
        tokens.push(`<span class="hl-comment">${this.escapeHtml(code.slice(i, commentEnd))}</span>`);
        i = commentEnd;
        continue;
      }

      // String (double quote)
      if (code[i] === '"') {
        let j = i + 1;
        while (j < code.length && (code[j] !== '"' || code[j - 1] === '\\')) j++;
        tokens.push(`<span class="hl-string">${this.escapeHtml(code.slice(i, j + 1))}</span>`);
        i = j + 1;
        continue;
      }

      // String (single quote)
      if (code[i] === "'") {
        let j = i + 1;
        while (j < code.length && (code[j] !== "'" || code[j - 1] === '\\')) j++;
        tokens.push(`<span class="hl-string">${this.escapeHtml(code.slice(i, j + 1))}</span>`);
        i = j + 1;
        continue;
      }

      // Number
      if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
        let j = i;
        while (j < code.length && /[\d.]/.test(code[j])) j++;
        tokens.push(`<span class="hl-number">${code.slice(i, j)}</span>`);
        i = j;
        continue;
      }

      // Word (keyword, function, or identifier)
      if (/[a-zA-Z_$]/.test(code[i])) {
        let j = i;
        while (j < code.length && /\w/.test(code[j])) j++;
        const word = code.slice(i, j);

        // Check what follows
        let k = j;
        while (k < code.length && /\s/.test(code[k])) k++;

        if (this.KEYWORDS.has(word)) {
          tokens.push(`<span class="hl-keyword">${word}</span>`);
        } else if (code[k] === '(') {
          tokens.push(`<span class="hl-function">${word}</span>`);
        } else {
          tokens.push(this.escapeHtml(word));
        }
        i = j;
        continue;
      }

      // Property access
      if (code[i] === '.' && /[a-zA-Z_$]/.test(code[i + 1])) {
        let j = i + 1;
        while (j < code.length && /\w/.test(code[j])) j++;
        tokens.push(`.<span class="hl-property">${code.slice(i + 1, j)}</span>`);
        i = j;
        continue;
      }

      // Liquid filter
      if (code[i] === '|') {
        let j = i + 1;
        while (j < code.length && /\s/.test(code[j])) j++;
        let k = j;
        while (k < code.length && /\w/.test(code[k])) k++;
        const filter = code.slice(j, k);
        if (this.LIQUID_FILTERS.has(filter)) {
          tokens.push(`| <span class="hl-filter">${filter}</span>`);
          i = k;
          continue;
        }
      }

      // Default
      tokens.push(this.escapeHtml(code[i]));
      i++;
    }

    return tokens.join('');
  }

  /**
   * Main highlight function
   */
  static highlight(code, language) {
    const lang = (language || '').toLowerCase();

    // Determine which highlighter to use
    if (lang === 'json') {
      return this.highlightJSON(code);
    }

    if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
      return this.highlightJS(code);
    }

    // For Liquid, HTML, or auto-detect
    if (lang === 'liquid' || lang === 'html' || !lang) {
      // Check if it contains Liquid syntax
      if (code.includes('{%') || code.includes('{{')) {
        return this.highlightLiquid(code);
      }
      // Plain HTML or unknown - use Liquid highlighter (handles HTML too)
      if (code.includes('<')) {
        return this.highlightLiquid(code);
      }
    }

    // Auto-detect JavaScript
    if (!lang && (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('=>'))) {
      return this.highlightJS(code);
    }

    // Auto-detect JSON
    if (!lang && code.trim().startsWith('{') && code.includes(':')) {
      return this.highlightJSON(code);
    }

    // Fallback: just escape HTML
    return this.escapeHtml(code);
  }
}

export class AIPanel extends LitElement {
  static properties = {
    context: { type: Object },
    messages: { type: Array, state: true },
    inputValue: { type: String, state: true },
    isLoading: { type: Boolean, state: true },
    error: { type: String, state: true },
    hasApiKey: { type: Boolean, state: true },
    showSettings: { type: Boolean, state: true },
    streamingContent: { type: String, state: true },
    contextMode: { type: String, state: true },
    copiedIndex: { type: String, state: true },
    customContextOptions: { type: Object, state: true },
    showContextOptions: { type: Boolean, state: true },
    // Search functionality
    isSearching: { type: Boolean, state: true },
    searchQuery: { type: String, state: true },
    searchResults: { type: Array, state: true },
    currentSearchIndex: { type: Number, state: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--tdt-bg);
      color: var(--tdt-text);
      font-family: var(--tdt-font);
      font-size: calc(12px * var(--tdt-scale, 1));
    }

    .panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--tdt-bg-secondary);
      border-bottom: 1px solid var(--tdt-border);
      flex-shrink: 0;
    }

    .header__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--tdt-text);
    }

    .header__badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: calc(9px * var(--tdt-scale, 1));
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .header__actions {
      display: flex;
      gap: 8px;
    }

    .header__btn {
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      color: var(--tdt-text-muted);
      padding: 4px 8px;
      border-radius: var(--tdt-radius);
      cursor: pointer;
      font-size: calc(11px * var(--tdt-scale, 1));
      font-family: var(--tdt-font);
      transition: all 0.15s ease;
    }

    .header__btn:hover {
      background: var(--tdt-bg-hover);
      color: var(--tdt-text);
      border-color: var(--tdt-accent);
    }

    .header__btn--danger:hover {
      border-color: var(--tdt-error);
      color: var(--tdt-error);
    }

    /* Setup Screen */
    .setup {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
      background: linear-gradient(180deg, var(--tdt-bg) 0%, var(--tdt-bg-secondary) 100%);
    }

    .setup__icon {
      font-size: 56px;
      margin-bottom: 20px;
      filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
    }

    .setup__title {
      font-size: calc(20px * var(--tdt-scale, 1));
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .setup__description {
      color: var(--tdt-text-muted);
      margin-bottom: 28px;
      max-width: 400px;
      line-height: 1.6;
    }

    .setup__form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 360px;
    }

    .setup__input {
      background: var(--tdt-bg);
      border: 2px solid var(--tdt-border);
      border-radius: 8px;
      padding: 14px 16px;
      color: var(--tdt-text);
      font-family: var(--tdt-font);
      font-size: calc(13px * var(--tdt-scale, 1));
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .setup__input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    .setup__input::placeholder {
      color: var(--tdt-text-muted);
    }

    .setup__btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: calc(13px * var(--tdt-scale, 1));
      font-family: var(--tdt-font);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .setup__btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .setup__btn:active {
      transform: translateY(0);
    }

    .setup__btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .setup__note {
      font-size: calc(10px * var(--tdt-scale, 1));
      color: var(--tdt-text-muted);
      margin-top: 12px;
      opacity: 0.8;
    }

    /* Messages Area */
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--tdt-bg);
    }

    /* Message Bubbles */
    .message {
      display: flex;
      gap: 12px;
      max-width: 70%;
      animation: messageIn 0.3s ease;
    }

    @keyframes messageIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message--user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message--assistant {
      align-self: flex-start;
    }

    .message__bubble {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message__content {
      padding: 12px 16px;
      border-radius: 16px;
      line-height: 1.6;
      font-size: calc(12.5px * var(--tdt-scale, 1));
    }

    .message--user .message__content {
      background: linear-gradient(135deg, var(--tdt-accent) 0%, #8b5cf6 100%);
      color: white;
      border-bottom-right-radius: 6px;
      box-shadow: 0 2px 8px rgba(147, 130, 255, 0.3);
    }

    .message--assistant .message__content {
      background: var(--tdt-bg-secondary);
      border: 1px solid var(--tdt-border);
      border-bottom-left-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .message__time {
      font-size: calc(9px * var(--tdt-scale, 1));
      color: var(--tdt-text-muted);
      opacity: 0.7;
      padding: 0 4px;
    }

    .message--user .message__time {
      text-align: right;
    }

    /* Code Blocks with Syntax Highlighting */
    .message__content .code-block {
      position: relative;
      margin: 12px 0;
      border-radius: 10px;
      overflow: hidden;
      background: #1e1e2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .message__content .code-block__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .message__content .code-block__header br {
      display: none;
    }

    .message__content .code-block__lang {
      font-size: calc(10px * var(--tdt-scale, 1));
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .message__content .code-block__copy {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: rgba(255, 255, 255, 0.7);
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: calc(10px * var(--tdt-scale, 1));
      font-family: var(--tdt-font);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .message__content .code-block__copy:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .message__content .code-block__copy--copied {
      background: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .message__content pre {
      margin: 0;
      padding: 14px 16px;
      overflow-x: auto;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: calc(11.5px * var(--tdt-scale, 1));
      line-height: 1.5;
      color: #cdd6f4;
    }

    .message__content pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-family: inherit;
    }

    /* Syntax Highlighting Colors (Catppuccin-inspired) */
    .message__content .hl-keyword { color: #cba6f7; font-weight: 500; }
    .message__content .hl-string { color: #a6e3a1; }
    .message__content .hl-number { color: #fab387; }
    .message__content .hl-comment { color: #6c7086; font-style: italic; }
    .message__content .hl-function { color: #89b4fa; }
    .message__content .hl-property { color: #89dceb; }
    .message__content .hl-tag { color: #f38ba8; }
    .message__content .hl-tag-name { color: #f38ba8; }
    .message__content .hl-output { color: #f9e2af; }
    .message__content .hl-filter { color: #94e2d5; font-weight: 500; }
    .message__content .hl-attr { color: #fab387; }
    .message__content .hl-selector { color: #f5c2e7; }
    .message__content .hl-key { color: #89b4fa; }
    .message__content .hl-unit { color: #f38ba8; }
    .message__content .hl-color { color: #f5c2e7; }

    /* Inline Code */
    .message__content code:not(pre code) {
      background: rgba(147, 130, 255, 0.15);
      color: #7c0efe;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: calc(11px * var(--tdt-scale, 1));
      font-weight: 500;
    }

    .message--user .message__content code:not(pre code) {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    /* Typography in messages */
    .message__content p {
      margin: 0 0 10px 0;
    }

    .message__content p:last-child {
      margin-bottom: 0;
    }

    .message__content ul, .message__content ol {
      margin: 10px 0;
      padding-left: 20px;
    }

    .message__content li {
      margin: 6px 0;
    }

    .message__content strong {
      font-weight: 600;
      color: var(--tdt-text);
    }

    .message--user .message__content strong {
      color: white;
    }

    .message__content em {
      font-style: italic;
      opacity: 0.9;
    }

    .message__content h1, .message__content h2, .message__content h3 {
      margin: 16px 0 8px 0;
      font-weight: 600;
    }

    .message__content h1 { font-size: calc(16px * var(--tdt-scale, 1)); }
    .message__content h2 { font-size: calc(14px * var(--tdt-scale, 1)); }
    .message__content h3 { font-size: calc(13px * var(--tdt-scale, 1)); }

    /* Streaming indicator */
    .message--streaming .message__content::after {
      content: '▋';
      color: var(--tdt-accent);
      animation: cursor-blink 1s infinite;
      margin-left: 2px;
    }

    @keyframes cursor-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    /* Loading */
    .loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
    }

    .loading__avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .loading__bubble {
      background: var(--tdt-bg-secondary);
      border: 1px solid var(--tdt-border);
      border-radius: 16px;
      border-bottom-left-radius: 6px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading__dots {
      display: flex;
      gap: 4px;
    }

    .loading__dot {
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      animation: loading-bounce 1.4s infinite ease-in-out both;
    }

    .loading__dot:nth-child(1) { animation-delay: -0.32s; }
    .loading__dot:nth-child(2) { animation-delay: -0.16s; }
    .loading__dot:nth-child(3) { animation-delay: 0s; }

    @keyframes loading-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Error */
    .error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      padding: 12px 16px;
      margin: 12px;
      color: var(--tdt-error);
      font-size: calc(11px * var(--tdt-scale, 1));
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error__icon {
      font-size: 16px;
    }

    /* Input Area */
    .input-area {
      padding: 12px 16px;
      background: var(--tdt-bg-secondary);
      border-top: 1px solid var(--tdt-border);
      flex-shrink: 0;
    }

    .input-wrapper {
      display: flex;
      gap: 10px;
      align-items: flex-end;
      background: var(--tdt-bg);
      border: 2px solid var(--tdt-border);
      border-radius: 12px;
      padding: 8px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: var(--tdt-accent);
      box-shadow: 0 0 0 3px rgba(147, 130, 255, 0.15);
    }

    .input-field {
      flex: 1;
      background: transparent;
      border: none;
      padding: 6px 8px;
      color: var(--tdt-text);
      font-family: var(--tdt-font);
      font-size: calc(13px * var(--tdt-scale, 1));
      resize: none;
      min-height: 24px;
      max-height: 120px;
      line-height: 1.5;
    }

    .input-field:focus {
      outline: none;
    }

    .input-field::placeholder {
      color: var(--tdt-text-muted);
    }

    .send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      flex-shrink: 0;
    }

    .send-btn svg {
      width: 18px;
      height: 18px;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .send-btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Context Mode Selector */
    .context-mode {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .context-mode__label {
      color: var(--tdt-text-muted);
      font-size: calc(10px * var(--tdt-scale, 1));
    }

    .context-mode__btn {
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      color: var(--tdt-text-muted);
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: calc(10px * var(--tdt-scale, 1));
      font-family: var(--tdt-font);
      transition: all 0.15s ease;
    }

    .context-mode__btn:hover {
      background: var(--tdt-bg-hover);
      color: var(--tdt-text);
    }

    .context-mode__btn--active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
    }

    /* Custom Context Options - Compact Chips */
    .context-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }

    .context-chip {
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      color: var(--tdt-text-muted);
      padding: 2px 8px;
      border-radius: 10px;
      cursor: pointer;
      font-size: calc(9px * var(--tdt-scale, 1));
      font-family: var(--tdt-font);
      transition: all 0.1s ease;
      user-select: none;
    }

    .context-chip:hover {
      border-color: var(--tdt-accent);
      color: var(--tdt-text);
    }

    .context-chip--active {
      background: var(--tdt-accent);
      border-color: var(--tdt-accent);
      color: white;
    }

    /* Empty State */
    .empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
      background: linear-gradient(180deg, var(--tdt-bg) 0%, var(--tdt-bg-secondary) 100%);
    }

    .empty__icon {
      font-size: 48px;
      margin-bottom: 16px;
      filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.2));
    }

    .empty__title {
      font-weight: 600;
      font-size: calc(15px * var(--tdt-scale, 1));
      color: var(--tdt-text);
      margin-bottom: 6px;
    }

    .empty__subtitle {
      color: var(--tdt-text-muted);
      font-size: calc(12px * var(--tdt-scale, 1));
      margin-bottom: 24px;
    }

    .empty__suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      max-width: 500px;
    }

    .empty__suggestion {
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: calc(11px * var(--tdt-scale, 1));
      color: var(--tdt-text);
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .empty__suggestion:hover {
      border-color: var(--tdt-accent);
      background: var(--tdt-bg-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Settings Panel */
    .settings {
      padding: 16px;
      background: var(--tdt-bg-secondary);
      border-bottom: 1px solid var(--tdt-border);
    }

    .settings__title {
      font-weight: 600;
      margin-bottom: 12px;
    }

    .settings__field {
      margin-bottom: 12px;
    }

    .settings__label {
      display: block;
      color: var(--tdt-text-muted);
      font-size: calc(10px * var(--tdt-scale, 1));
      margin-bottom: 4px;
    }

    .settings__input {
      width: 100%;
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      border-radius: var(--tdt-radius);
      padding: 8px 12px;
      color: var(--tdt-text);
      font-family: var(--tdt-font);
      font-size: calc(12px * var(--tdt-scale, 1));
      box-sizing: border-box;
    }

    .settings__input:focus {
      outline: none;
      border-color: var(--tdt-accent);
    }

    .settings__actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    /* Search Bar */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--tdt-bg-secondary);
      border-bottom: 1px solid var(--tdt-border);
    }

    .search-bar__input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--tdt-bg);
      border: 1px solid var(--tdt-border);
      border-radius: var(--tdt-radius);
      padding: 0 8px;
    }

    .search-bar__input-wrapper:focus-within {
      border-color: var(--tdt-accent);
    }

    .search-bar__icon {
      color: var(--tdt-text-muted);
      font-size: calc(12px * var(--tdt-scale, 1));
    }

    .search-bar__input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 6px 8px;
      color: var(--tdt-text);
      font-family: var(--tdt-font);
      font-size: calc(12px * var(--tdt-scale, 1));
    }

    .search-bar__input:focus {
      outline: none;
    }

    .search-bar__input::placeholder {
      color: var(--tdt-text-muted);
    }

    .search-bar__count {
      color: var(--tdt-text-muted);
      font-size: calc(10px * var(--tdt-scale, 1));
      padding: 0 8px;
      white-space: nowrap;
    }

    .search-bar__nav {
      display: flex;
      gap: 2px;
    }

    .search-bar__nav-btn {
      background: transparent;
      border: 1px solid var(--tdt-border);
      color: var(--tdt-text-muted);
      width: 24px;
      height: 24px;
      border-radius: var(--tdt-radius);
      cursor: pointer;
      font-size: calc(10px * var(--tdt-scale, 1));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-bar__nav-btn:hover:not(:disabled) {
      background: var(--tdt-bg-hover);
      color: var(--tdt-text);
    }

    .search-bar__nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .search-bar__close {
      background: transparent;
      border: none;
      color: var(--tdt-text-muted);
      cursor: pointer;
      padding: 4px;
      font-size: calc(14px * var(--tdt-scale, 1));
      line-height: 1;
    }

    .search-bar__close:hover {
      color: var(--tdt-text);
    }

    /* Search highlight */
    .search-highlight {
      background: rgba(255, 235, 59, 0.4);
      border-radius: 2px;
      padding: 0 2px;
    }

    .search-highlight--current {
      background: rgba(255, 152, 0, 0.6);
      box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3);
    }

    /* Search results indicator on messages */
    .message--search-match {
      border-left: 3px solid var(--tdt-accent);
    }

    .message--search-current {
      border-left: 3px solid #ff9800;
      background: rgba(255, 152, 0, 0.05);
    }
  `;

  constructor() {
    super();
    this.context = null;
    this.messages = [];
    this.inputValue = '';
    this.isLoading = false;
    this.error = null;
    this.hasApiKey = aiService.hasApiKey();
    this.showSettings = false;
    this.streamingContent = '';
    this.contextMode = 'auto';
    this.copiedIndex = '';
    this._unsubscribe = null;
    this.showContextOptions = false;
    // Initialize custom context options with defaults
    this.customContextOptions = {
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
    };
    // Search state
    this.isSearching = false;
    this.searchQuery = '';
    this.searchResults = []; // Array of { messageIndex, matches: [{ start, end }] }
    this.currentSearchIndex = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadMessages();
    this._unsubscribe = aiService.subscribe(() => {
      this._loadMessages();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  _loadMessages() {
    this.messages = aiService.getConversation();
    this.hasApiKey = aiService.hasApiKey();
  }

  _handleApiKeySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input');
    const apiKey = input.value.trim();

    if (apiKey) {
      aiService.setApiKey(apiKey);
      this.hasApiKey = true;
      this.showSettings = false;
    }
  }

  _toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  _clearConversation() {
    aiService.clearConversation();
    this.messages = [];
  }

  _removeApiKey() {
    if (confirm('Remove your API key? You will need to re-enter it to use the AI assistant.')) {
      aiService.setApiKey(null);
      this.hasApiKey = false;
      this.showSettings = false;
    }
  }

  async _sendMessage() {
    const message = this.inputValue.trim();
    if (!message || this.isLoading) return;

    this.inputValue = '';
    this.error = null;
    this.isLoading = true;
    this.streamingContent = '';

    // Reset textarea height
    const textarea = this.shadowRoot?.querySelector('.input-field');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      // Set up providers for liquid errors and accessibility
      this._setupContextProviders();

      let serializedContext;
      let smartContextInfo = null;

      if (this.contextMode === 'minimal') {
        serializedContext = contextSerializer.serializeMinimal(this.context);
      } else if (this.contextMode === 'full') {
        serializedContext = contextSerializer.serializeFull(this.context);
      } else if (this.contextMode === 'custom') {
        serializedContext = contextSerializer.serializeCustom(this.context, this.customContextOptions);
      } else {
        // Auto mode: Use smart context detection based on the question
        const smartResult = contextSerializer.serializeSmart(this.context, message);
        serializedContext = smartResult.serialized;
        smartContextInfo = {
          includedContext: smartResult.includedContext,
          detectedCategories: smartResult.detectedCategories,
        };
        // Log what context was included
        if (smartResult.detectedCategories.length > 0) {
          console.debug('[AI Panel] Smart context detected:', smartResult.detectedCategories.join(', '));
          console.debug('[AI Panel] Including:', smartResult.includedContext.join(', '));
        }
      }

      await aiService.chat(message, serializedContext, (chunk, fullContent) => {
        this.streamingContent = fullContent;
        this._scrollToBottom();
      });

      this.streamingContent = '';
      this._loadMessages();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
      this._scrollToBottom();
    }
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._sendMessage();
    }
  }

  _handleInput(e) {
    this.inputValue = e.target.value;
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  _scrollToBottom() {
    this.updateComplete.then(() => {
      const messagesEl = this.shadowRoot?.querySelector('.messages');
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });
  }

  _useSuggestion(text) {
    this.inputValue = text;
    this._sendMessage();
  }

  _setContextMode(mode) {
    this.contextMode = mode;
    // Show options panel when custom is selected
    if (mode === 'custom') {
      this.showContextOptions = true;
    }
  }

  _toggleContextOptions() {
    this.showContextOptions = !this.showContextOptions;
  }

  _toggleContextOption(optionKey) {
    this.customContextOptions = {
      ...this.customContextOptions,
      [optionKey]: !this.customContextOptions[optionKey]
    };
  }

  _selectAllOptions() {
    const newOptions = {};
    for (const key of Object.keys(this.customContextOptions)) {
      newOptions[key] = true;
    }
    this.customContextOptions = newOptions;
  }

  _selectNoneOptions() {
    const newOptions = {};
    for (const key of Object.keys(this.customContextOptions)) {
      newOptions[key] = false;
    }
    // Always keep basic context (cart at minimum)
    newOptions.cart = true;
    this.customContextOptions = newOptions;
  }

  _setupContextProviders() {
    // Set up provider for liquid errors
    // Note: Accessibility data is now accessed directly via accessibilityService
    contextSerializer.setProviders({
      liquidErrors: () => {
        // Try to get liquid errors from the console panel
        const consolePanel = document.querySelector('tdt-console-panel');
        if (consolePanel && consolePanel.liquidErrors) {
          return consolePanel.liquidErrors;
        }
        // Fallback: check for errors in the DOM
        return this._detectLiquidErrors();
      }
    });
  }

  _detectLiquidErrors() {
    // Simple detection of liquid errors in the page
    const errors = [];
    const errorElements = document.querySelectorAll('[data-liquid-error], .liquid-error');
    errorElements.forEach((el, i) => {
      errors.push({
        category: 'liquid',
        message: el.textContent || el.getAttribute('data-liquid-error') || 'Unknown error',
        element: el.tagName
      });
    });
    return errors;
  }

  async _copyCode(code, index) {
    try {
      await navigator.clipboard.writeText(code);
      this.copiedIndex = index;
      setTimeout(() => {
        this.copiedIndex = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _formatMessage(content, messageIndex = 0) {
    let codeBlockIndex = 0;
    const self = this;

    // Process code blocks with syntax highlighting
    let formatted = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      const highlighted = SyntaxHighlighter.highlight(code.trim(), language);
      const blockIndex = `${messageIndex}-${codeBlockIndex++}`;
      const isCopied = self.copiedIndex === blockIndex;

      return `<div class="code-block">
        <div class="code-block__header">
          <span class="code-block__lang">${language}</span>
          <button class="code-block__copy ${isCopied ? 'code-block__copy--copied' : ''}" data-code="${encodeURIComponent(code.trim())}" data-index="${blockIndex}">
            ${isCopied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>
        <pre><code>${highlighted}</code></pre>
      </div>`;
    });

    // Process inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Process headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Process bold and italic
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Process lists
    formatted = formatted.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Process line breaks (but not inside code blocks)
    formatted = formatted.replace(/\n/g, '<br>');

    // Clean up extra breaks around block elements
    formatted = formatted.replace(/<br>\s*(<\/?(?:ul|ol|li|h[1-3]|div|pre))/g, '$1');
    formatted = formatted.replace(/(<\/(?:ul|ol|li|h[1-3]|div|pre)>)\s*<br>/g, '$1');

    return formatted;
  }

  _handleContentClick(e) {
    const copyBtn = e.target.closest('.code-block__copy');
    if (copyBtn) {
      const code = decodeURIComponent(copyBtn.dataset.code);
      const index = copyBtn.dataset.index;
      this._copyCode(code, index);
    }
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Search functionality
  _toggleSearch() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this._clearSearch();
    } else {
      // Focus the search input after render
      this.updateComplete.then(() => {
        const searchInput = this.shadowRoot?.querySelector('.search-bar__input');
        searchInput?.focus();
      });
    }
  }

  _clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.currentSearchIndex = -1;
  }

  _handleSearchInput(e) {
    this.searchQuery = e.target.value;
    this._performSearch();
  }

  _handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      this._toggleSearch();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        this._searchPrev();
      } else {
        this._searchNext();
      }
    }
  }

  _performSearch() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.searchResults = [];
      this.currentSearchIndex = -1;
      return;
    }

    const results = [];

    this.messages.forEach((msg, messageIndex) => {
      const content = msg.content.toLowerCase();
      const matches = [];
      let pos = 0;

      // Find all occurrences
      while (true) {
        const index = content.indexOf(query, pos);
        if (index === -1) break;
        matches.push({
          start: index,
          end: index + query.length,
        });
        pos = index + 1;
      }

      if (matches.length > 0) {
        results.push({
          messageIndex,
          matches,
          role: msg.role,
          timestamp: msg.timestamp,
        });
      }
    });

    this.searchResults = results;

    // Reset to first result if we have results
    if (results.length > 0 && this.currentSearchIndex === -1) {
      this.currentSearchIndex = 0;
      this._scrollToCurrentResult();
    } else if (results.length === 0) {
      this.currentSearchIndex = -1;
    }
  }

  _searchNext() {
    if (this.searchResults.length === 0) return;
    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
    this._scrollToCurrentResult();
  }

  _searchPrev() {
    if (this.searchResults.length === 0) return;
    this.currentSearchIndex = this.currentSearchIndex <= 0
      ? this.searchResults.length - 1
      : this.currentSearchIndex - 1;
    this._scrollToCurrentResult();
  }

  _scrollToCurrentResult() {
    if (this.currentSearchIndex < 0 || this.currentSearchIndex >= this.searchResults.length) return;

    const currentResult = this.searchResults[this.currentSearchIndex];
    this.updateComplete.then(() => {
      const messagesEl = this.shadowRoot?.querySelector('.messages');
      const messageEl = messagesEl?.querySelectorAll('.message')[currentResult.messageIndex];
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  _getTotalMatchCount() {
    return this.searchResults.reduce((total, result) => total + result.matches.length, 0);
  }

  _isMessageInSearchResults(messageIndex) {
    return this.searchResults.some(r => r.messageIndex === messageIndex);
  }

  _isCurrentSearchMessage(messageIndex) {
    if (this.currentSearchIndex < 0) return false;
    const current = this.searchResults[this.currentSearchIndex];
    return current?.messageIndex === messageIndex;
  }

  _highlightSearchTerms(content, messageIndex) {
    if (!this.searchQuery || this.searchResults.length === 0) {
      return content;
    }

    const result = this.searchResults.find(r => r.messageIndex === messageIndex);
    if (!result) return content;

    const query = this.searchQuery.trim();
    const regex = new RegExp(`(${this._escapeRegex(query)})`, 'gi');
    const isCurrentMessage = this._isCurrentSearchMessage(messageIndex);

    return content.replace(regex, (match) => {
      const highlightClass = isCurrentMessage ? 'search-highlight search-highlight--current' : 'search-highlight';
      return `<mark class="${highlightClass}">${match}</mark>`;
    });
  }

  _escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _renderSetup() {
    return html`
      <div class="setup">
        <div class="setup__icon">✨</div>
        <div class="setup__title">AI Theme Assistant</div>
        <div class="setup__description">
          Get intelligent help with your Shopify theme. Ask questions, debug issues, and generate Liquid code with full access to your theme context.
        </div>
        <form class="setup__form" @submit=${this._handleApiKeySubmit}>
          <input
            type="password"
            class="setup__input"
            placeholder="Enter your OpenAI API key"
            autocomplete="off"
          />
          <button type="submit" class="setup__btn">
            Connect to OpenAI
          </button>
        </form>
        <div class="setup__note">
          🔒 Your API key is stored locally and only sent to OpenAI.
        </div>
      </div>
    `;
  }

  _renderSettings() {
    return html`
      <div class="settings">
        <div class="settings__title">Settings</div>
        <div class="settings__field">
          <label class="settings__label">OpenAI API Key</label>
          <input
            type="password"
            class="settings__input"
            value=${aiService.getApiKey() || ''}
            placeholder="sk-..."
            @change=${(e) => aiService.setApiKey(e.target.value.trim())}
          />
        </div>
        <div class="settings__actions">
          <button class="header__btn" @click=${this._toggleSettings}>
            Done
          </button>
          <button class="header__btn header__btn--danger" @click=${this._removeApiKey}>
            Remove Key
          </button>
        </div>
      </div>
    `;
  }

  _renderEmpty() {
    return html`
      <div class="empty">
        <div class="empty__icon">💬</div>
        <div class="empty__title">Ask me anything about your theme</div>
        <div class="empty__subtitle">I have access to your page context, cart, metafields, and more.</div>
        <div class="empty__suggestions">
          <button class="empty__suggestion" @click=${() => this._useSuggestion("What data is available on this page?")}>
            📊 Available data
          </button>
          <button class="empty__suggestion" @click=${() => this._useSuggestion("Show me the current cart state")}>
            🛒 Cart state
          </button>
          <button class="empty__suggestion" @click=${() => this._useSuggestion("What metafields does this product have?")}>
            🏷️ Metafields
          </button>
          <button class="empty__suggestion" @click=${() => this._useSuggestion("Help me write Liquid to display the product price with compare at price")}>
            💧 Write Liquid
          </button>
        </div>
      </div>
    `;
  }

  _renderMessages() {
    const allMessages = [...this.messages];

    if (this.streamingContent) {
      allMessages.push({
        role: 'assistant',
        content: this.streamingContent,
        streaming: true
      });
    }

    return html`
      <div class="messages" @click=${this._handleContentClick}>
        ${allMessages.map((msg, index) => {
          const isMatch = this.isSearching && this._isMessageInSearchResults(index);
          const isCurrent = this.isSearching && this._isCurrentSearchMessage(index);

          // Apply search highlighting to content before formatting
          let content = msg.content;
          if (this.isSearching && this.searchQuery) {
            content = this._highlightSearchTerms(content, index);
          }

          return html`
            <div class="message message--${msg.role} ${msg.streaming ? 'message--streaming' : ''} ${isMatch ? 'message--search-match' : ''} ${isCurrent ? 'message--search-current' : ''}">
              <div class="message__bubble">
                <div class="message__content">
                  ${unsafeHTML(this._formatMessage(content, index))}
                </div>
                ${msg.timestamp ? html`
                  <div class="message__time">${this._formatTime(msg.timestamp)}</div>
                ` : ''}
              </div>
            </div>
          `;
        })}

        ${this.isLoading && !this.streamingContent ? html`
          <div class="loading">
            <div class="loading__avatar">✨</div>
            <div class="loading__bubble">
              <div class="loading__dots">
                <div class="loading__dot"></div>
                <div class="loading__dot"></div>
                <div class="loading__dot"></div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.hasApiKey) {
      return html`
        <div class="panel">
          ${this._renderSetup()}
        </div>
      `;
    }

    return html`
      <div class="panel">
        <div class="header">
          <div class="header__title">
            <span>AI Assistant</span>
            <span class="header__badge">Beta</span>
          </div>
          <div class="header__actions">
            ${this.messages.length > 0 ? html`
              <button class="header__btn" @click=${this._toggleSearch} title="Search conversations (Ctrl+F)">
                🔍 Search
              </button>
            ` : ''}
            <button class="header__btn" @click=${this._toggleSettings}>
              ⚙️ Settings
            </button>
            ${this.messages.length > 0 ? html`
              <button class="header__btn header__btn--danger" @click=${this._clearConversation}>
                Clear
              </button>
            ` : ''}
          </div>
        </div>

        ${this.isSearching ? html`
          <div class="search-bar">
            <div class="search-bar__input-wrapper">
              <span class="search-bar__icon">🔍</span>
              <input
                type="text"
                class="search-bar__input"
                placeholder="Search in conversation..."
                .value=${this.searchQuery}
                @input=${this._handleSearchInput}
                @keydown=${this._handleSearchKeydown}
              />
              ${this.searchQuery ? html`
                <span class="search-bar__count">
                  ${this.searchResults.length > 0
                    ? `${this.currentSearchIndex + 1}/${this.searchResults.length} messages`
                    : 'No results'}
                </span>
              ` : ''}
            </div>
            <div class="search-bar__nav">
              <button
                class="search-bar__nav-btn"
                @click=${this._searchPrev}
                ?disabled=${this.searchResults.length === 0}
                title="Previous (Shift+Enter)"
              >▲</button>
              <button
                class="search-bar__nav-btn"
                @click=${this._searchNext}
                ?disabled=${this.searchResults.length === 0}
                title="Next (Enter)"
              >▼</button>
            </div>
            <button class="search-bar__close" @click=${this._toggleSearch} title="Close search (Esc)">×</button>
          </div>
        ` : ''}

        ${this.showSettings ? this._renderSettings() : ''}

        ${this.error ? html`
          <div class="error">
            <span class="error__icon">⚠️</span>
            <span>${this.error}</span>
          </div>
        ` : ''}

        ${this.messages.length === 0 && !this.isLoading && !this.streamingContent
          ? this._renderEmpty()
          : this._renderMessages()
        }

        <div class="input-area">
          <div class="input-wrapper">
            <textarea
              class="input-field"
              placeholder="Ask about your theme..."
              .value=${this.inputValue}
              @input=${this._handleInput}
              @keydown=${this._handleKeydown}
              ?disabled=${this.isLoading}
              rows="1"
            ></textarea>
            <button
              class="send-btn"
              @click=${this._sendMessage}
              ?disabled=${this.isLoading || !this.inputValue.trim()}
              title="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            </button>
          </div>
          <div class="context-mode">
            <span class="context-mode__label">Context:</span>
            <button
              class="context-mode__btn ${this.contextMode === 'auto' ? 'context-mode__btn--active' : ''}"
              @click=${() => this._setContextMode('auto')}
              title="Include relevant context automatically"
            >
              Auto
            </button>
            <button
              class="context-mode__btn ${this.contextMode === 'minimal' ? 'context-mode__btn--active' : ''}"
              @click=${() => this._setContextMode('minimal')}
              title="Include minimal context (faster)"
            >
              Minimal
            </button>
            <button
              class="context-mode__btn ${this.contextMode === 'full' ? 'context-mode__btn--active' : ''}"
              @click=${() => this._setContextMode('full')}
              title="Include everything (cookies, storage, errors, a11y)"
            >
              Full
            </button>
            <button
              class="context-mode__btn ${this.contextMode === 'custom' ? 'context-mode__btn--active' : ''}"
              @click=${() => this._setContextMode('custom')}
              title="Pick specific context to include"
            >
              Custom
            </button>
          </div>

          ${this.contextMode === 'custom' ? html`
            <div class="context-chips">
              ${Object.entries(CONTEXT_OPTIONS).map(([key, option]) => html`
                <button
                  class="context-chip ${this.customContextOptions[key] ? 'context-chip--active' : ''}"
                  @click=${() => this._toggleContextOption(key)}
                  title="${option.description}"
                >${option.label}</button>
              `)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('tdt-ai-panel', AIPanel);
