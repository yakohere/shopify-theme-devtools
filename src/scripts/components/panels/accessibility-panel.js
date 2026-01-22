import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { accessibilityService } from '../../services/accessibility.js';

export class AccessibilityPanel extends LitElement {
  static properties = {
    issues: { type: Array, state: true },
    isScanning: { type: Boolean, state: true },
    lastScanTime: { type: Object, state: true },
    activeFilter: { type: String, state: true },
    activeCategory: { type: String, state: true },
    searchQuery: { type: String, state: true },
    expandedIssueId: { type: String, state: true },
    score: { type: Number, state: true },
    copiedField: { type: String, state: true },
    hasScanned: { type: Boolean, state: true },
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
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s ease;
      }

      .btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .btn--primary {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn--primary:hover {
        filter: brightness(1.1);
      }

      .btn--scanning {
        opacity: 0.7;
        cursor: wait;
      }

      .search {
        flex: 1;
        min-width: 120px;
        max-width: 200px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        font-family: var(--tdt-font);
      }

      .search:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      .filter-tabs {
        display: flex;
        gap: 4px;
      }

      .filter-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .filter-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .filter-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .filter-tab--error.filter-tab--active {
        background: var(--tdt-error);
        border-color: var(--tdt-error);
      }

      .filter-tab--warning.filter-tab--active {
        background: var(--tdt-warning);
        border-color: var(--tdt-warning);
        color: var(--tdt-bg);
      }

      .filter-tab--info.filter-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
      }

      .stats {
        display: flex;
        gap: 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .stat-count {
        font-weight: 600;
      }

      .stat-count--error { color: var(--tdt-error); }
      .stat-count--warning { color: var(--tdt-warning); }
      .stat-count--info { color: var(--tdt-accent); }

      .score-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
      }

      .score {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(14px * var(--tdt-scale, 1));
        font-weight: 700;
        flex-shrink: 0;
        font-family: var(--tdt-font);
      }

      .score--good {
        background: rgba(34, 197, 94, 0.2);
        color: var(--tdt-success);
        border: 2px solid var(--tdt-success);
      }

      .score--warning {
        background: rgba(255, 193, 100, 0.2);
        color: var(--tdt-warning);
        border: 2px solid var(--tdt-warning);
      }

      .score--error {
        background: rgba(255, 77, 77, 0.2);
        color: var(--tdt-error);
        border: 2px solid var(--tdt-error);
      }

      .score-details {
        flex: 1;
      }

      .score-title {
        font-weight: 600;
        font-size: calc(12px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        margin-bottom: 2px;
      }

      .score-summary {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
      }

      .category-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
      }

      .category-tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 3px 8px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .category-tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .category-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .category-tab__count {
        font-size: calc(9px * var(--tdt-scale, 1));
        opacity: 0.7;
        margin-left: 3px;
      }

      .issues-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .issue-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
        transition: all 0.15s ease;
      }

      .issue-item--error {
        border-left: 3px solid var(--tdt-error);
      }

      .issue-item--warning {
        border-left: 3px solid var(--tdt-warning);
      }

      .issue-item--info {
        border-left: 3px solid var(--tdt-accent);
      }

      .issue-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        cursor: pointer;
      }

      .issue-header:hover {
        background: var(--tdt-bg-hover);
      }

      .issue-severity {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .issue-severity--error {
        background: var(--tdt-error);
        color: white;
      }

      .issue-severity--warning {
        background: var(--tdt-warning);
        color: var(--tdt-bg);
      }

      .issue-severity--info {
        background: var(--tdt-accent);
        color: white;
      }

      .issue-title {
        flex: 1;
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        font-weight: 500;
      }

      .issue-wcag {
        font-size: calc(9px * var(--tdt-scale, 1));
        padding: 2px 5px;
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font-mono);
        flex-shrink: 0;
      }

      .issue-expand {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        transition: transform 0.15s ease;
      }

      .issue-item--expanded .issue-expand {
        transform: rotate(90deg);
      }

      .issue-details {
        padding: 0 10px 10px 10px;
        border-top: 1px solid var(--tdt-border);
        background: var(--tdt-bg);
      }

      .issue-description {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin: 8px 0;
        line-height: 1.4;
      }

      .issue-selector {
        font-size: calc(10px * var(--tdt-scale, 1));
        font-family: var(--tdt-font-mono);
        color: var(--tdt-accent);
        background: var(--tdt-bg-secondary);
        padding: 4px 8px;
        border-radius: var(--tdt-radius);
        margin-bottom: 8px;
        word-break: break-all;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .issue-selector-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .issue-fix {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text);
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: var(--tdt-radius);
        padding: 6px 8px;
        margin-bottom: 8px;
      }

      .issue-fix-label {
        font-weight: 600;
        color: var(--tdt-success);
        margin-bottom: 2px;
      }

      .issue-actions {
        display: flex;
        gap: 6px;
      }

      .btn-small {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 3px 8px;
        font-size: calc(10px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
        transition: all 0.15s ease;
      }

      .btn-small:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn-small--copied {
        background: var(--tdt-success) !important;
        border-color: var(--tdt-success) !important;
        color: white !important;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state-icon {
        font-size: 32px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-state-title {
        font-size: calc(14px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 4px;
      }

      .empty-state-text {
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .scanning-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .scanning-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--tdt-border);
        border-top-color: var(--tdt-accent);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .export-dropdown {
        position: relative;
      }

      .export-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
        min-width: 120px;
        overflow: hidden;
      }

      .export-menu-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: none;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        text-align: left;
        cursor: pointer;
      }

      .export-menu-item:hover {
        background: var(--tdt-bg-hover);
      }

      .no-results {
        text-align: center;
        padding: 24px;
        color: var(--tdt-text-muted);
        font-size: calc(11px * var(--tdt-scale, 1));
      }
    `
  ];

  constructor() {
    super();
    this.issues = [];
    this.isScanning = false;
    this.lastScanTime = null;
    this.activeFilter = 'all';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.expandedIssueId = null;
    this.score = 100;
    this.copiedField = null;
    this.hasScanned = false;
    this._showExportMenu = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Auto-scan when panel becomes visible
    this._scanPage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeHighlight();
  }

  // ============ Core Scanning Methods ============

  async _scanPage() {
    if (this.isScanning) return;

    this.isScanning = true;
    this.issues = [];

    // Small delay to show scanning state
    await new Promise(r => setTimeout(r, 100));

    try {
      const allIssues = [
        ...this._checkImagesWithoutAlt(),
        ...this._checkFormInputsWithoutLabels(),
        ...this._checkColorContrast(),
        ...this._checkHeadingHierarchy(),
        ...this._checkEmptyLinks(),
        ...this._checkEmptyButtons(),
        ...this._checkLangAttribute(),
        ...this._checkTabIndex(),
        ...this._checkSkipLink(),
        ...this._checkGenericLinkText(),
        ...this._checkTouchTargets(),
        ...this._checkLandmarks(),
        ...this._checkAutoplayMedia(),
      ];

      this.issues = allIssues;
      this._calculateScore();
      this.lastScanTime = new Date();
      this.hasScanned = true;

      // Store results in shared service so AI panel can access them
      accessibilityService.setResults({
        score: this.score,
        issues: this.issues,
      });
    } finally {
      this.isScanning = false;
    }
  }

  _calculateScore() {
    const weights = { error: 10, warning: 3, info: 1 };
    const maxDeductions = 100;

    let deductions = this.issues.reduce((sum, issue) => {
      return sum + (weights[issue.severity] || 0);
    }, 0);

    deductions = Math.min(deductions, maxDeductions);
    this.score = Math.max(0, 100 - deductions);
  }

  // ============ Accessibility Checks ============

  _checkImagesWithoutAlt() {
    const issues = [];
    const images = document.querySelectorAll('img');

    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.src || img.dataset?.src;

      // Skip tracking pixels, tiny images, data URIs
      if (!src) return;
      if (src.startsWith('data:image/gif;base64,R0lGOD')) return;
      const rect = img.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return;

      if (alt === null) {
        issues.push({
          id: `img-no-alt-${index}`,
          severity: 'error',
          category: 'images',
          title: 'Image missing alt attribute',
          description: 'Screen readers cannot describe this image. All images need an alt attribute.',
          wcagRef: '1.1.1',
          wcagLevel: 'A',
          suggestedFix: 'Add alt="" for decorative images, or descriptive text for meaningful images.',
          element: img,
          selector: this._getElementSelector(img),
        });
      } else if (alt === '' && img.getAttribute('role') !== 'presentation' && !img.hasAttribute('aria-hidden')) {
        issues.push({
          id: `img-empty-alt-${index}`,
          severity: 'warning',
          category: 'images',
          title: 'Image has empty alt (verify if decorative)',
          description: 'Empty alt text marks this as decorative. Verify this is intentional.',
          wcagRef: '1.1.1',
          wcagLevel: 'A',
          suggestedFix: 'If decorative, add role="presentation". If meaningful, add descriptive alt text.',
          element: img,
          selector: this._getElementSelector(img),
        });
      }
    });

    return issues;
  }

  _checkFormInputsWithoutLabels() {
    const issues = [];
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea'
    );

    inputs.forEach((input, index) => {
      const id = input.id;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      const title = input.getAttribute('title');
      const placeholder = input.getAttribute('placeholder');

      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasParentLabel = input.closest('label');
      const hasAriaLabel = ariaLabel || ariaLabelledby;

      // Skip hidden/invisible inputs
      const style = window.getComputedStyle(input);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      if (!hasLabel && !hasParentLabel && !hasAriaLabel && !title) {
        issues.push({
          id: `input-no-label-${index}`,
          severity: 'error',
          category: 'forms',
          title: `${input.tagName.toLowerCase()} missing accessible label`,
          description: 'Form fields must have labels so screen readers can identify them.',
          wcagRef: '1.3.1',
          wcagLevel: 'A',
          suggestedFix: `Add a <label for="${id || '[id]'}"> element or aria-label attribute.`,
          element: input,
          selector: this._getElementSelector(input),
        });
      } else if (placeholder && !hasLabel && !hasParentLabel && !ariaLabel) {
        issues.push({
          id: `input-placeholder-only-${index}`,
          severity: 'warning',
          category: 'forms',
          title: 'Input relies only on placeholder',
          description: 'Placeholders disappear when typing and are not reliable labels.',
          wcagRef: '3.3.2',
          wcagLevel: 'A',
          suggestedFix: 'Add a persistent label in addition to the placeholder.',
          element: input,
          selector: this._getElementSelector(input),
        });
      }
    });

    return issues;
  }

  _checkColorContrast() {
    const issues = [];
    const textElements = document.querySelectorAll(
      'p, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, button, div'
    );
    const checked = new Set();
    let issueCount = 0;
    const maxIssues = 30;

    for (const el of textElements) {
      if (issueCount >= maxIssues) break;

      const text = el.textContent?.trim();
      if (!text || text.length < 2) continue;
      if (checked.has(el)) continue;

      // Skip if has child elements with text (to avoid duplicate checking)
      if (el.children.length > 0 && el.querySelector('p, span, h1, h2, h3, h4, h5, h6, a')) continue;

      checked.add(el);

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (parseFloat(style.opacity) < 0.1) continue;

      const foregroundColor = style.color;
      const backgroundColor = this._getComputedBackgroundColor(el);

      if (!foregroundColor || !backgroundColor) continue;

      const fgRgb = this._parseColor(foregroundColor);
      const bgRgb = this._parseColor(backgroundColor);

      if (!fgRgb || !bgRgb) continue;

      const ratio = this._getContrastRatio(fgRgb, bgRgb);

      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight) || 400;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

      const requiredRatio = isLargeText ? 3 : 4.5;

      if (ratio < requiredRatio) {
        issueCount++;
        issues.push({
          id: `contrast-fail-${issueCount}`,
          severity: 'error',
          category: 'contrast',
          title: `Low contrast: ${ratio.toFixed(1)}:1 (needs ${requiredRatio}:1)`,
          description: `Text "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}" has insufficient contrast.`,
          wcagRef: '1.4.3',
          wcagLevel: 'AA',
          suggestedFix: `Increase contrast ratio from ${ratio.toFixed(1)}:1 to at least ${requiredRatio}:1.`,
          element: el,
          selector: this._getElementSelector(el),
          metadata: { ratio, foregroundColor, backgroundColor },
        });
      }
    }

    return issues;
  }

  _checkHeadingHierarchy() {
    const issues = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let h1Count = 0;
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const style = window.getComputedStyle(heading);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const level = parseInt(heading.tagName[1]);

      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          issues.push({
            id: `heading-multiple-h1-${index}`,
            severity: 'warning',
            category: 'headings',
            title: 'Multiple H1 elements found',
            description: 'Pages should typically have only one H1 as the main heading.',
            wcagRef: '1.3.1',
            wcagLevel: 'A',
            suggestedFix: 'Use only one H1 per page; use H2-H6 for subsections.',
            element: heading,
            selector: this._getElementSelector(heading),
          });
        }
      }

      if (previousLevel > 0 && level > previousLevel + 1) {
        issues.push({
          id: `heading-skip-${index}`,
          severity: 'error',
          category: 'headings',
          title: `Skipped heading level: H${previousLevel} to H${level}`,
          description: 'Heading levels should not skip (e.g., H2 should not jump to H4).',
          wcagRef: '1.3.1',
          wcagLevel: 'A',
          suggestedFix: `Change to H${previousLevel + 1} or add intermediate heading levels.`,
          element: heading,
          selector: this._getElementSelector(heading),
        });
      }

      previousLevel = level;
    });

    if (h1Count === 0) {
      issues.push({
        id: 'heading-no-h1',
        severity: 'error',
        category: 'headings',
        title: 'No H1 element found',
        description: 'Every page should have an H1 element as the main heading.',
        wcagRef: '1.3.1',
        wcagLevel: 'A',
        suggestedFix: 'Add an H1 element for the main page heading.',
        element: null,
        selector: null,
      });
    }

    return issues;
  }

  _checkEmptyLinks() {
    const issues = [];
    const links = document.querySelectorAll('a[href]');

    links.forEach((link, index) => {
      const style = window.getComputedStyle(link);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute('aria-label');
      const ariaLabelledby = link.getAttribute('aria-labelledby');
      const title = link.getAttribute('title');
      const imgAlt = link.querySelector('img[alt]:not([alt=""])');
      const svgTitle = link.querySelector('svg title, svg[aria-label]');

      if (!text && !ariaLabel && !ariaLabelledby && !title && !imgAlt && !svgTitle) {
        issues.push({
          id: `link-empty-${index}`,
          severity: 'error',
          category: 'links',
          title: 'Link has no accessible name',
          description: 'Links must have text content or accessible label for screen readers.',
          wcagRef: '2.4.4',
          wcagLevel: 'A',
          suggestedFix: 'Add link text, aria-label, or include an image with alt text.',
          element: link,
          selector: this._getElementSelector(link),
        });
      }
    });

    return issues;
  }

  _checkEmptyButtons() {
    const issues = [];
    const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');

    buttons.forEach((button, index) => {
      const style = window.getComputedStyle(button);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const text = button.textContent?.trim();
      const ariaLabel = button.getAttribute('aria-label');
      const ariaLabelledby = button.getAttribute('aria-labelledby');
      const title = button.getAttribute('title');
      const value = button.value;
      const imgAlt = button.querySelector('img[alt]:not([alt=""])');
      const svgTitle = button.querySelector('svg title, svg[aria-label]');

      if (!text && !ariaLabel && !ariaLabelledby && !title && !value && !imgAlt && !svgTitle) {
        issues.push({
          id: `button-empty-${index}`,
          severity: 'error',
          category: 'buttons',
          title: 'Button has no accessible name',
          description: 'Buttons must have text content or accessible label.',
          wcagRef: '4.1.2',
          wcagLevel: 'A',
          suggestedFix: 'Add button text or aria-label attribute.',
          element: button,
          selector: this._getElementSelector(button),
        });
      }
    });

    return issues;
  }

  _checkLangAttribute() {
    const html = document.documentElement;
    const lang = html.getAttribute('lang');

    if (!lang) {
      return [{
        id: 'lang-missing',
        severity: 'error',
        category: 'document',
        title: 'Missing lang attribute on <html>',
        description: 'Screen readers need the language attribute to pronounce text correctly.',
        wcagRef: '3.1.1',
        wcagLevel: 'A',
        suggestedFix: 'Add lang attribute: <html lang="en">',
        element: html,
        selector: 'html',
      }];
    }
    return [];
  }

  _checkTabIndex() {
    const issues = [];
    const elements = document.querySelectorAll('[tabindex]');

    elements.forEach((el, index) => {
      const tabindex = parseInt(el.getAttribute('tabindex'));
      if (tabindex > 0) {
        issues.push({
          id: `tabindex-positive-${index}`,
          severity: 'warning',
          category: 'focus',
          title: `Positive tabindex (${tabindex}) disrupts navigation`,
          description: 'Positive tabindex values override natural tab order, confusing keyboard users.',
          wcagRef: '2.4.3',
          wcagLevel: 'A',
          suggestedFix: 'Use tabindex="0" to add to tab order or "-1" for programmatic focus.',
          element: el,
          selector: this._getElementSelector(el),
        });
      }
    });

    return issues;
  }

  _checkSkipLink() {
    const skipLink = document.querySelector(
      'a[href^="#main"], a[href^="#content"], a[href="#maincontent"], .skip-link, .skip-to-content, [class*="skip-link"], [class*="skip-to"]'
    );
    const mainContent = document.querySelector('main, #main, #content, #maincontent, [role="main"]');

    if (!skipLink && mainContent) {
      return [{
        id: 'skip-link-missing',
        severity: 'warning',
        category: 'navigation',
        title: 'No skip link found',
        description: 'Skip links help keyboard users bypass repetitive navigation.',
        wcagRef: '2.4.1',
        wcagLevel: 'A',
        suggestedFix: 'Add a skip link at the start: <a href="#main" class="skip-link">Skip to content</a>',
        element: null,
        selector: null,
      }];
    }
    return [];
  }

  _checkGenericLinkText() {
    const genericTexts = ['click here', 'read more', 'learn more', 'here', 'more', 'link', 'click'];
    const issues = [];
    const links = document.querySelectorAll('a');
    let count = 0;
    const maxIssues = 10;

    for (const link of links) {
      if (count >= maxIssues) break;

      const text = link.textContent?.trim().toLowerCase();
      if (text && genericTexts.includes(text)) {
        count++;
        issues.push({
          id: `link-generic-${count}`,
          severity: 'info',
          category: 'links',
          title: `Generic link text: "${link.textContent?.trim()}"`,
          description: 'Link text should describe the destination, not be generic.',
          wcagRef: '2.4.4',
          wcagLevel: 'A',
          suggestedFix: 'Use descriptive text like "View product details" instead of "Click here".',
          element: link,
          selector: this._getElementSelector(link),
        });
      }
    }

    return issues;
  }

  _checkTouchTargets() {
    const issues = [];
    const interactives = document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select');
    const minSize = 44;
    let count = 0;
    const maxIssues = 15;

    for (const el of interactives) {
      if (count >= maxIssues) break;

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      if (rect.width < minSize || rect.height < minSize) {
        count++;
        issues.push({
          id: `touch-target-${count}`,
          severity: 'info',
          category: 'touch',
          title: `Small touch target: ${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          description: `Interactive elements should be at least ${minSize}x${minSize}px for touch accessibility.`,
          wcagRef: '2.5.5',
          wcagLevel: 'AAA',
          suggestedFix: `Increase size to at least ${minSize}x${minSize}px.`,
          element: el,
          selector: this._getElementSelector(el),
        });
      }
    }

    return issues;
  }

  _checkLandmarks() {
    const issues = [];

    const main = document.querySelector('main, [role="main"]');
    const nav = document.querySelector('nav, [role="navigation"]');

    if (!main) {
      issues.push({
        id: 'landmark-no-main',
        severity: 'warning',
        category: 'landmarks',
        title: 'No main landmark found',
        description: 'Main content should be in a <main> element for screen reader navigation.',
        wcagRef: '1.3.6',
        wcagLevel: 'AAA',
        suggestedFix: 'Wrap main content in a <main> element.',
        element: null,
        selector: null,
      });
    }

    if (!nav) {
      issues.push({
        id: 'landmark-no-nav',
        severity: 'info',
        category: 'landmarks',
        title: 'No navigation landmark found',
        description: 'Navigation areas should use <nav> element for better structure.',
        wcagRef: '1.3.6',
        wcagLevel: 'AAA',
        suggestedFix: 'Wrap navigation menus in <nav> elements.',
        element: null,
        selector: null,
      });
    }

    return issues;
  }

  _checkAutoplayMedia() {
    const issues = [];
    const media = document.querySelectorAll('video[autoplay], audio[autoplay]');

    media.forEach((el, index) => {
      const muted = el.hasAttribute('muted') || el.muted;
      if (!muted) {
        issues.push({
          id: `autoplay-${index}`,
          severity: 'error',
          category: 'media',
          title: 'Autoplaying media with sound',
          description: 'Autoplaying audio can be disorienting and disruptive to users.',
          wcagRef: '1.4.2',
          wcagLevel: 'A',
          suggestedFix: 'Add muted attribute or provide visible audio controls.',
          element: el,
          selector: this._getElementSelector(el),
        });
      }
    });

    return issues;
  }

  // ============ Utility Methods ============

  _getComputedBackgroundColor(element) {
    let el = element;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        return bg;
      }
      el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }

  _parseColor(colorString) {
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return null;
  }

  _getRelativeLuminance({ r, g, b }) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  _getContrastRatio(fg, bg) {
    if (!fg || !bg) return 21;
    const l1 = this._getRelativeLuminance(fg);
    const l2 = this._getRelativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  _getElementSelector(element) {
    if (!element) return '';

    const parts = [];
    let el = element;

    while (el && el !== document.body && parts.length < 3) {
      let selector = el.tagName.toLowerCase();

      if (el.id) {
        selector = `#${el.id}`;
        parts.unshift(selector);
        break;
      }

      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\s+/).slice(0, 2);
        if (classes.length && classes[0]) {
          selector += '.' + classes.join('.');
        }
      }

      parts.unshift(selector);
      el = el.parentElement;
    }

    return parts.join(' > ');
  }

  // ============ UI Interaction Methods ============

  _highlightElement(element) {
    if (!element) return;

    this._removeHighlight();

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const overlay = document.createElement('div');
      overlay.id = 'tdt-a11y-highlight';
      overlay.style.cssText = `
        position: fixed;
        top: ${rect.top - 4}px;
        left: ${rect.left - 4}px;
        width: ${rect.width + 8}px;
        height: ${rect.height + 8}px;
        border: 3px solid #ef4444;
        background: rgba(239, 68, 68, 0.15);
        pointer-events: none;
        z-index: 2147483646;
        border-radius: 4px;
        animation: tdt-pulse 1s ease-in-out infinite;
      `;

      // Add animation keyframes if not exists
      if (!document.getElementById('tdt-a11y-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'tdt-a11y-styles';
        styleEl.textContent = `
          @keyframes tdt-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.02); }
          }
        `;
        document.head.appendChild(styleEl);
      }

      document.body.appendChild(overlay);

      // Auto-remove after 5 seconds
      setTimeout(() => this._removeHighlight(), 5000);
    }, 300);
  }

  _removeHighlight() {
    const existing = document.getElementById('tdt-a11y-highlight');
    if (existing) existing.remove();
  }

  _toggleIssue(id) {
    this.expandedIssueId = this.expandedIssueId === id ? null : id;
  }

  _copySelector(selector) {
    navigator.clipboard.writeText(selector);
    this.copiedField = selector;
    setTimeout(() => { this.copiedField = null; }, 1500);
  }

  _toggleExportMenu() {
    this._showExportMenu = !this._showExportMenu;
    this.requestUpdate();
  }

  _closeExportMenu() {
    this._showExportMenu = false;
    this.requestUpdate();
  }

  _exportIssues(format) {
    this._closeExportMenu();

    const exportData = {
      exportedAt: new Date().toISOString(),
      url: window.location.href,
      score: this.score,
      summary: {
        total: this.issues.length,
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        info: this.issues.filter(i => i.severity === 'info').length,
      },
      issues: this.issues.map(issue => ({
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        wcagRef: issue.wcagRef,
        wcagLevel: issue.wcagLevel,
        suggestedFix: issue.suggestedFix,
        selector: issue.selector,
      })),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      this._downloadBlob(blob, `a11y-report-${new Date().toISOString().slice(0, 10)}.json`);
    } else if (format === 'csv') {
      const csv = this._convertToCSV(exportData.issues);
      const blob = new Blob([csv], { type: 'text/csv' });
      this._downloadBlob(blob, `a11y-report-${new Date().toISOString().slice(0, 10)}.csv`);
    }
  }

  _convertToCSV(issues) {
    const headers = ['Severity', 'Category', 'Title', 'Description', 'WCAG Ref', 'Level', 'Suggested Fix', 'Selector'];
    const rows = issues.map(i => [
      i.severity, i.category, i.title, i.description,
      i.wcagRef, i.wcagLevel, i.suggestedFix, i.selector
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============ Filtered Issues ============

  get filteredIssues() {
    let filtered = [...this.issues];

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(i => i.severity === this.activeFilter);
    }

    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(i => i.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.selector?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get categories() {
    const cats = {};
    this.issues.forEach(issue => {
      cats[issue.category] = (cats[issue.category] || 0) + 1;
    });
    return cats;
  }

  get errorCount() {
    return this.issues.filter(i => i.severity === 'error').length;
  }

  get warningCount() {
    return this.issues.filter(i => i.severity === 'warning').length;
  }

  get infoCount() {
    return this.issues.filter(i => i.severity === 'info').length;
  }

  // ============ Render Methods ============

  render() {
    return html`
      ${this._renderToolbar()}
      ${this.isScanning ? this._renderScanning() : ''}
      ${!this.isScanning && this.hasScanned ? html`
        ${this._renderScoreCard()}
        ${this._renderCategoryTabs()}
        ${this._renderIssuesList()}
      ` : ''}
      ${!this.isScanning && !this.hasScanned ? this._renderInitial() : ''}
    `;
  }

  _renderToolbar() {
    return html`
      <div class="toolbar">
        <button
          class="btn btn--primary ${this.isScanning ? 'btn--scanning' : ''}"
          @click=${this._scanPage}
          ?disabled=${this.isScanning}
        >
          ${this.isScanning ? 'Scanning...' : 'Re-scan'}
        </button>

        <div class="stats">
          <div class="stat">
            <span class="stat-count stat-count--error">${this.errorCount}</span> errors
          </div>
          <div class="stat">
            <span class="stat-count stat-count--warning">${this.warningCount}</span> warnings
          </div>
          <div class="stat">
            <span class="stat-count stat-count--info">${this.infoCount}</span> info
          </div>
        </div>

        <div class="toolbar-spacer"></div>

        <input
          type="search"
          class="search"
          placeholder="Search issues..."
          .value=${this.searchQuery}
          @input=${(e) => this.searchQuery = e.target.value}
        >

        <div class="filter-tabs">
          <button
            class="filter-tab ${this.activeFilter === 'all' ? 'filter-tab--active' : ''}"
            @click=${() => this.activeFilter = 'all'}
          >All</button>
          <button
            class="filter-tab filter-tab--error ${this.activeFilter === 'error' ? 'filter-tab--active' : ''}"
            @click=${() => this.activeFilter = 'error'}
          >Errors</button>
          <button
            class="filter-tab filter-tab--warning ${this.activeFilter === 'warning' ? 'filter-tab--active' : ''}"
            @click=${() => this.activeFilter = 'warning'}
          >Warnings</button>
          <button
            class="filter-tab filter-tab--info ${this.activeFilter === 'info' ? 'filter-tab--active' : ''}"
            @click=${() => this.activeFilter = 'info'}
          >Info</button>
        </div>

        <div class="export-dropdown">
          <button class="btn" @click=${this._toggleExportMenu}>
            Export
          </button>
          ${this._showExportMenu ? html`
            <div class="export-menu">
              <button class="export-menu-item" @click=${() => this._exportIssues('json')}>
                Export as JSON
              </button>
              <button class="export-menu-item" @click=${() => this._exportIssues('csv')}>
                Export as CSV
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderScoreCard() {
    const scoreClass = this.score >= 80 ? 'good' : this.score >= 50 ? 'warning' : 'error';

    return html`
      <div class="score-card">
        <div class="score score--${scoreClass}">${this.score}%</div>
        <div class="score-details">
          <div class="score-title">Accessibility Score</div>
          <div class="score-summary">
            ${this.errorCount} critical issue${this.errorCount !== 1 ? 's' : ''},
            ${this.warningCount} warning${this.warningCount !== 1 ? 's' : ''},
            ${this.infoCount} suggestion${this.infoCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    `;
  }

  _renderCategoryTabs() {
    const categories = this.categories;
    const categoryLabels = {
      images: 'Images',
      forms: 'Forms',
      contrast: 'Contrast',
      headings: 'Headings',
      links: 'Links',
      buttons: 'Buttons',
      document: 'Document',
      focus: 'Focus',
      navigation: 'Navigation',
      touch: 'Touch',
      landmarks: 'Landmarks',
      media: 'Media',
    };

    return html`
      <div class="category-tabs">
        <button
          class="category-tab ${this.activeCategory === 'all' ? 'category-tab--active' : ''}"
          @click=${() => this.activeCategory = 'all'}
        >
          All<span class="category-tab__count">(${this.issues.length})</span>
        </button>
        ${Object.entries(categories).map(([cat, count]) => html`
          <button
            class="category-tab ${this.activeCategory === cat ? 'category-tab--active' : ''}"
            @click=${() => this.activeCategory = cat}
          >
            ${categoryLabels[cat] || cat}<span class="category-tab__count">(${count})</span>
          </button>
        `)}
      </div>
    `;
  }

  _renderIssuesList() {
    const issues = this.filteredIssues;

    if (issues.length === 0) {
      if (this.searchQuery || this.activeFilter !== 'all' || this.activeCategory !== 'all') {
        return html`<div class="no-results">No issues match your filters</div>`;
      }
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">✓</div>
          <div class="empty-state-title">No issues found!</div>
          <div class="empty-state-text">Great job! No accessibility issues were detected.</div>
        </div>
      `;
    }

    return html`
      <div class="issues-list">
        ${issues.map(issue => this._renderIssueItem(issue))}
      </div>
    `;
  }

  _renderIssueItem(issue) {
    const isExpanded = this.expandedIssueId === issue.id;

    return html`
      <div class="issue-item issue-item--${issue.severity} ${isExpanded ? 'issue-item--expanded' : ''}">
        <div class="issue-header" @click=${() => this._toggleIssue(issue.id)}>
          <span class="issue-severity issue-severity--${issue.severity}">
            ${issue.severity}
          </span>
          <span class="issue-title">${issue.title}</span>
          <span class="issue-wcag">${issue.wcagRef} (${issue.wcagLevel})</span>
          <span class="issue-expand">▶</span>
        </div>
        ${isExpanded ? html`
          <div class="issue-details">
            <div class="issue-description">${issue.description}</div>
            ${issue.selector ? html`
              <div class="issue-selector">
                <span class="issue-selector-text">${issue.selector}</span>
                <button
                  class="btn-small ${this.copiedField === issue.selector ? 'btn-small--copied' : ''}"
                  @click=${(e) => { e.stopPropagation(); this._copySelector(issue.selector); }}
                >
                  ${this.copiedField === issue.selector ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ` : ''}
            <div class="issue-fix">
              <div class="issue-fix-label">Suggested Fix</div>
              ${issue.suggestedFix}
            </div>
            <div class="issue-actions">
              ${issue.element ? html`
                <button class="btn-small" @click=${(e) => { e.stopPropagation(); this._highlightElement(issue.element); }}>
                  Highlight Element
                </button>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderScanning() {
    return html`
      <div class="scanning-state">
        <div class="scanning-spinner"></div>
        <div>Scanning page for accessibility issues...</div>
      </div>
    `;
  }

  _renderInitial() {
    return html`
      <div class="empty-state">
        <div class="empty-state-icon">♿</div>
        <div class="empty-state-title">Accessibility Checker</div>
        <div class="empty-state-text">Click "Re-scan" to check this page for accessibility issues.</div>
      </div>
    `;
  }
}

customElements.define('tdt-accessibility-panel', AccessibilityPanel);
