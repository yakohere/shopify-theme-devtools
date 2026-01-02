import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import '../object-inspector.js';

export class SeoPanel extends LitElement {
  static properties = {
    metaTags: { type: Array, state: true },
    jsonLdData: { type: Array, state: true },
    openGraph: { type: Object, state: true },
    twitterCard: { type: Object, state: true },
    images: { type: Array, state: true },
    issues: { type: Array, state: true },
    activeTab: { type: String, state: true },
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

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .tab {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .tab:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .tab--warning {
        border-color: var(--tdt-warning);
      }

      .tab--warning.tab--active {
        background: var(--tdt-warning);
        color: #000;
      }

      .tab--error {
        border-color: var(--tdt-error);
      }

      .tab--error.tab--active {
        background: var(--tdt-error);
      }

      .tab__count {
        font-size: 10px;
        opacity: 0.8;
        background: rgba(255,255,255,0.15);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .score-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 12px;
      }

      .score {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
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
        font-size: 12px;
        color: var(--tdt-text);
        margin-bottom: 2px;
      }

      .score-summary {
        font-size: 10px;
        color: var(--tdt-text-muted);
      }

      .section {
        margin-bottom: 12px;
      }

      .section-title {
        font-size: 10px;
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

      .meta-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .meta-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 10px;
      }

      .meta-item--success {
        border-left: 3px solid var(--tdt-success);
      }

      .meta-item--warning {
        border-left: 3px solid var(--tdt-warning);
        background: rgba(255, 193, 100, 0.05);
      }

      .meta-item--error {
        border-left: 3px solid var(--tdt-error);
        background: rgba(255, 77, 77, 0.05);
      }

      .meta-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
      }

      .meta-name {
        font-weight: 600;
        font-size: 10px;
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
      }

      .meta-badge {
        font-size: 9px;
        padding: 1px 5px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        font-family: var(--tdt-font);
      }

      .meta-badge--success {
        background: var(--tdt-success);
        color: white;
      }

      .meta-badge--warning {
        background: var(--tdt-warning);
        color: #000;
      }

      .meta-badge--error {
        background: var(--tdt-error);
        color: white;
      }

      .meta-value {
        font-size: 11px;
        color: var(--tdt-text);
        word-break: break-word;
      }

      .meta-value--missing {
        color: var(--tdt-error);
        font-style: italic;
      }

      .meta-hint {
        font-size: 9px;
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      .meta-length {
        font-size: 9px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .meta-length--warning {
        color: var(--tdt-warning);
      }

      .meta-length--error {
        color: var(--tdt-error);
      }

      .og-preview {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
        max-width: 400px;
      }

      .og-preview__image {
        width: 100%;
        height: 180px;
        background: var(--tdt-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--tdt-text-muted);
        font-size: 11px;
        overflow: hidden;
        font-family: var(--tdt-font);
      }

      .og-preview__image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .og-preview__content {
        padding: 8px 10px;
      }

      .og-preview__site {
        font-size: 9px;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        margin-bottom: 2px;
        font-family: var(--tdt-font);
      }

      .og-preview__title {
        font-weight: 600;
        font-size: 12px;
        color: var(--tdt-text);
        margin-bottom: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-family: var(--tdt-font);
      }

      .og-preview__description {
        font-size: 11px;
        color: var(--tdt-text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-family: var(--tdt-font);
      }

      .twitter-preview {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: 12px;
        overflow: hidden;
        max-width: 400px;
      }

      .twitter-preview__image {
        width: 100%;
        height: 180px;
        background: var(--tdt-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--tdt-text-muted);
        font-size: 11px;
        overflow: hidden;
        font-family: var(--tdt-font);
      }

      .twitter-preview__image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .twitter-preview__content {
        padding: 8px 10px;
      }

      .twitter-preview__title {
        font-weight: 600;
        font-size: 12px;
        color: var(--tdt-text);
        margin-bottom: 2px;
        font-family: var(--tdt-font);
      }

      .twitter-preview__description {
        font-size: 11px;
        color: var(--tdt-text-muted);
        margin-bottom: 2px;
        font-family: var(--tdt-font);
      }

      .twitter-preview__domain {
        font-size: 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .schema-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 4px;
        overflow: hidden;
      }

      .schema-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        cursor: pointer;
      }

      .schema-header:hover {
        background: var(--tdt-bg-hover);
      }

      .schema-type {
        font-weight: 600;
        color: var(--tdt-accent);
        font-size: 11px;
        font-family: var(--tdt-font);
      }

      .schema-badge {
        font-size: 9px;
        padding: 1px 5px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-success);
        color: white;
        font-family: var(--tdt-font);
      }

      .schema-content {
        border-top: 1px solid var(--tdt-border);
        padding: 8px 10px;
        background: var(--tdt-bg);
      }

      .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
      }

      .image-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        overflow: hidden;
      }

      .image-item--error {
        border-color: var(--tdt-error);
      }

      .image-item__preview {
        width: 100%;
        height: 70px;
        background: var(--tdt-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .image-item__preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .image-item__info {
        padding: 6px;
        font-size: 9px;
        font-family: var(--tdt-font);
      }

      .image-item__alt {
        color: var(--tdt-text);
        word-break: break-word;
        line-height: 1.3;
      }

      .image-item__alt--missing {
        color: var(--tdt-error);
        font-style: italic;
      }

      .image-item__size {
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      .issue-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .issue-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
      }

      .issue-item--error {
        border-left: 3px solid var(--tdt-error);
      }

      .issue-item--warning {
        border-left: 3px solid var(--tdt-warning);
      }

      .issue-icon {
        font-size: 12px;
        flex-shrink: 0;
      }

      .issue-content {
        flex: 1;
      }

      .issue-title {
        font-weight: 600;
        font-size: 11px;
        color: var(--tdt-text);
        margin-bottom: 1px;
        font-family: var(--tdt-font);
      }

      .issue-description {
        font-size: 10px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .empty-state {
        text-align: center;
        padding: 24px 16px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .preview-tabs {
        display: flex;
        gap: 6px;
        margin-bottom: 10px;
      }

      .preview-tab {
        padding: 4px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        font-size: 11px;
        cursor: pointer;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
      }

      .preview-tab:hover {
        background: var(--tdt-bg-hover);
      }

      .preview-tab--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }
    `
  ];

  static REQUIRED_META = [
    { name: 'title', selector: 'title', maxLength: 60, minLength: 30 },
    { name: 'description', selector: 'meta[name="description"]', attr: 'content', maxLength: 160, minLength: 70 },
    { name: 'viewport', selector: 'meta[name="viewport"]', attr: 'content' },
    { name: 'charset', selector: 'meta[charset]', attr: 'charset' },
  ];

  static OG_TAGS = [
    { name: 'og:title', required: true },
    { name: 'og:description', required: true },
    { name: 'og:image', required: true },
    { name: 'og:url', required: true },
    { name: 'og:type', required: false },
    { name: 'og:site_name', required: false },
  ];

  static TWITTER_TAGS = [
    { name: 'twitter:card', required: true },
    { name: 'twitter:title', required: false },
    { name: 'twitter:description', required: false },
    { name: 'twitter:image', required: false },
  ];

  constructor() {
    super();
    this.metaTags = [];
    this.jsonLdData = [];
    this.openGraph = {};
    this.twitterCard = {};
    this.images = [];
    this.issues = [];
    this.activeTab = 'overview';
    this._expandedSchemas = new Set();
    this._previewType = 'facebook';
  }

  connectedCallback() {
    super.connectedCallback();
    this._scanPage();
  }

  _scanPage() {
    this._scanMetaTags();
    this._scanOpenGraph();
    this._scanTwitterCard();
    this._scanJsonLd();
    this._scanImages();
    this._generateIssues();
  }

  _scanMetaTags() {
    const tags = [];

    SeoPanel.REQUIRED_META.forEach(meta => {
      const el = document.querySelector(meta.selector);
      let value = '';
      
      if (el) {
        value = meta.attr ? el.getAttribute(meta.attr) : el.textContent;
      }

      const length = value?.length || 0;
      let status = 'success';
      let hint = '';

      if (!value) {
        status = 'error';
        hint = 'Missing - this tag is required';
      } else if (meta.maxLength && length > meta.maxLength) {
        status = 'warning';
        hint = `Too long (${length}/${meta.maxLength} chars)`;
      } else if (meta.minLength && length < meta.minLength) {
        status = 'warning';
        hint = `Too short (${length}/${meta.minLength} min chars)`;
      }

      tags.push({
        name: meta.name,
        value: value || null,
        length,
        maxLength: meta.maxLength,
        minLength: meta.minLength,
        status,
        hint
      });
    });

    const canonical = document.querySelector('link[rel="canonical"]');
    tags.push({
      name: 'canonical',
      value: canonical?.href || null,
      status: canonical ? 'success' : 'warning',
      hint: canonical ? '' : 'Recommended for SEO'
    });

    const robots = document.querySelector('meta[name="robots"]');
    tags.push({
      name: 'robots',
      value: robots?.content || null,
      status: 'success',
      hint: robots?.content?.includes('noindex') ? '⚠️ Page is set to noindex' : ''
    });

    this.metaTags = tags;
  }

  _scanOpenGraph() {
    const og = {};
    
    SeoPanel.OG_TAGS.forEach(tag => {
      const el = document.querySelector(`meta[property="${tag.name}"]`);
      og[tag.name] = {
        value: el?.content || null,
        required: tag.required
      };
    });

    this.openGraph = og;
  }

  _scanTwitterCard() {
    const twitter = {};
    
    SeoPanel.TWITTER_TAGS.forEach(tag => {
      const el = document.querySelector(`meta[name="${tag.name}"]`);
      twitter[tag.name] = {
        value: el?.content || null,
        required: tag.required
      };
    });

    this.twitterCard = twitter;
  }

  _scanJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const schemas = [];

    scripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        
        items.forEach(item => {
          schemas.push({
            id: `schema-${index}-${schemas.length}`,
            type: item['@type'] || 'Unknown',
            data: item,
            isValid: true
          });
        });
      } catch (e) {
        schemas.push({
          id: `schema-${index}`,
          type: 'Invalid JSON',
          data: { error: e.message, raw: script.textContent.substring(0, 200) },
          isValid: false
        });
      }
    });

    this.jsonLdData = schemas;
  }

  _scanImages() {
    const images = document.querySelectorAll('img');
    const imageData = [];

    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.src || img.dataset.src;
      
      if (!src || src.startsWith('data:')) return;

      imageData.push({
        id: index,
        src,
        alt,
        hasAlt: alt !== null && alt !== '',
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        loading: img.loading,
        isLazy: img.loading === 'lazy' || img.dataset.src
      });
    });

    this.images = imageData;
  }

  _generateIssues() {
    const issues = [];

    const title = this.metaTags.find(t => t.name === 'title');
    if (!title?.value) {
      issues.push({ type: 'error', title: 'Missing page title', description: 'Every page should have a unique title tag' });
    } else if (title.length > 60) {
      issues.push({ type: 'warning', title: 'Title too long', description: `Title is ${title.length} characters (recommended: 60 max)` });
    }

    const desc = this.metaTags.find(t => t.name === 'description');
    if (!desc?.value) {
      issues.push({ type: 'error', title: 'Missing meta description', description: 'Add a meta description for better SEO' });
    } else if (desc.length > 160) {
      issues.push({ type: 'warning', title: 'Description too long', description: `Description is ${desc.length} characters (recommended: 160 max)` });
    }

    if (!this.openGraph['og:image']?.value) {
      issues.push({ type: 'warning', title: 'Missing og:image', description: 'Add an Open Graph image for social sharing' });
    }

    if (!this.openGraph['og:title']?.value) {
      issues.push({ type: 'warning', title: 'Missing og:title', description: 'Add an Open Graph title for social sharing' });
    }

    const missingAlt = this.images.filter(img => !img.hasAlt);
    if (missingAlt.length > 0) {
      issues.push({ 
        type: 'warning', 
        title: `${missingAlt.length} image${missingAlt.length > 1 ? 's' : ''} missing alt text`, 
        description: 'Alt text improves accessibility and SEO' 
      });
    }

    const invalidSchemas = this.jsonLdData.filter(s => !s.isValid);
    if (invalidSchemas.length > 0) {
      issues.push({ type: 'error', title: 'Invalid JSON-LD schema', description: 'Fix JSON syntax errors in structured data' });
    }

    const canonical = this.metaTags.find(t => t.name === 'canonical');
    if (!canonical?.value) {
      issues.push({ type: 'warning', title: 'Missing canonical URL', description: 'Add a canonical link to prevent duplicate content issues' });
    }

    this.issues = issues;
  }

  _getScore() {
    const total = 10;
    let score = total;

    this.issues.forEach(issue => {
      if (issue.type === 'error') score -= 2;
      else if (issue.type === 'warning') score -= 1;
    });

    return Math.max(0, score);
  }

  _getScoreClass(score) {
    if (score >= 8) return 'good';
    if (score >= 5) return 'warning';
    return 'error';
  }

  _setTab(tab) {
    this.activeTab = tab;
  }

  _setPreviewType(type) {
    this._previewType = type;
    this.requestUpdate();
  }

  _toggleSchema(id) {
    const expanded = new Set(this._expandedSchemas);
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    this._expandedSchemas = expanded;
    this.requestUpdate();
  }

  _renderOverview() {
    const score = this._getScore();
    const scoreClass = this._getScoreClass(score);
    const errorCount = this.issues.filter(i => i.type === 'error').length;
    const warningCount = this.issues.filter(i => i.type === 'warning').length;

    return html`
      <div class="score-card">
        <div class="score score--${scoreClass}">${score}/10</div>
        <div class="score-details">
          <div class="score-title">SEO Score</div>
          <div class="score-summary">
            ${errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}, ` : ''}
            ${warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}
            ${errorCount === 0 && warningCount === 0 ? '✓ All checks passed' : ''}
          </div>
        </div>
      </div>

      ${this.issues.length > 0 ? html`
        <div class="section">
          <div class="section-title">Issues Found</div>
          <div class="issue-list">
            ${this.issues.map(issue => html`
              <div class="issue-item issue-item--${issue.type}">
                <span class="issue-icon">${issue.type === 'error' ? '❌' : '⚠️'}</span>
                <div class="issue-content">
                  <div class="issue-title">${issue.title}</div>
                  <div class="issue-description">${issue.description}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Essential Meta Tags</div>
        <div class="meta-list">
          ${this.metaTags.map(tag => html`
            <div class="meta-item meta-item--${tag.status}">
              <div class="meta-header">
                <span class="meta-name">${tag.name}</span>
                ${tag.maxLength ? html`
                  <span class="meta-length ${tag.length > tag.maxLength ? 'meta-length--error' : tag.length < (tag.minLength || 0) ? 'meta-length--warning' : ''}">
                    ${tag.length}/${tag.maxLength}
                  </span>
                ` : ''}
              </div>
              <div class="meta-value ${!tag.value ? 'meta-value--missing' : ''}">
                ${tag.value || 'Not set'}
              </div>
              ${tag.hint ? html`<div class="meta-hint">${tag.hint}</div>` : ''}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderSocialPreview() {
    const ogImage = this.openGraph['og:image']?.value;
    const ogTitle = this.openGraph['og:title']?.value || this.metaTags.find(t => t.name === 'title')?.value;
    const ogDesc = this.openGraph['og:description']?.value || this.metaTags.find(t => t.name === 'description')?.value;
    const siteName = this.openGraph['og:site_name']?.value || window.location.hostname;

    const twitterImage = this.twitterCard['twitter:image']?.value || ogImage;
    const twitterTitle = this.twitterCard['twitter:title']?.value || ogTitle;
    const twitterDesc = this.twitterCard['twitter:description']?.value || ogDesc;

    return html`
      <div class="preview-tabs">
        <button 
          class="preview-tab ${this._previewType === 'facebook' ? 'preview-tab--active' : ''}"
          @click=${() => this._setPreviewType('facebook')}
        >
          📘 Facebook
        </button>
        <button 
          class="preview-tab ${this._previewType === 'twitter' ? 'preview-tab--active' : ''}"
          @click=${() => this._setPreviewType('twitter')}
        >
          🐦 Twitter
        </button>
        <button 
          class="preview-tab ${this._previewType === 'linkedin' ? 'preview-tab--active' : ''}"
          @click=${() => this._setPreviewType('linkedin')}
        >
          💼 LinkedIn
        </button>
      </div>

      ${this._previewType === 'facebook' || this._previewType === 'linkedin' ? html`
        <div class="og-preview">
          <div class="og-preview__image">
            ${ogImage 
              ? html`<img src="${ogImage}" alt="OG Image" @error=${(e) => e.target.style.display = 'none'}>` 
              : 'No image set'
            }
          </div>
          <div class="og-preview__content">
            <div class="og-preview__site">${siteName}</div>
            <div class="og-preview__title">${ogTitle || 'No title set'}</div>
            <div class="og-preview__description">${ogDesc || 'No description set'}</div>
          </div>
        </div>
      ` : html`
        <div class="twitter-preview">
          <div class="twitter-preview__image">
            ${twitterImage 
              ? html`<img src="${twitterImage}" alt="Twitter Image" @error=${(e) => e.target.style.display = 'none'}>` 
              : 'No image set'
            }
          </div>
          <div class="twitter-preview__content">
            <div class="twitter-preview__title">${twitterTitle || 'No title set'}</div>
            <div class="twitter-preview__description">${twitterDesc || 'No description set'}</div>
            <div class="twitter-preview__domain">🔗 ${window.location.hostname}</div>
          </div>
        </div>
      `}

      <div class="section" style="margin-top: 20px;">
        <div class="section-title">Open Graph Tags</div>
        <div class="meta-list">
          ${Object.entries(this.openGraph).map(([name, data]) => html`
            <div class="meta-item ${data.value ? 'meta-item--success' : data.required ? 'meta-item--error' : 'meta-item--warning'}">
              <div class="meta-header">
                <span class="meta-name">${name}</span>
                ${data.required ? html`<span class="meta-badge ${data.value ? 'meta-badge--success' : 'meta-badge--error'}">${data.value ? '✓' : 'Required'}</span>` : ''}
              </div>
              <div class="meta-value ${!data.value ? 'meta-value--missing' : ''}">
                ${data.value || 'Not set'}
              </div>
            </div>
          `)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Twitter Card Tags</div>
        <div class="meta-list">
          ${Object.entries(this.twitterCard).map(([name, data]) => html`
            <div class="meta-item ${data.value ? 'meta-item--success' : data.required ? 'meta-item--error' : ''}">
              <div class="meta-header">
                <span class="meta-name">${name}</span>
              </div>
              <div class="meta-value ${!data.value ? 'meta-value--missing' : ''}">
                ${data.value || 'Not set (falls back to OG)'}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderSchema() {
    if (this.jsonLdData.length === 0) {
      return html`
        <div class="empty-state">
          <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
          <div>No JSON-LD structured data found</div>
          <div style="font-size: 11px; margin-top: 8px; color: var(--tdt-text-muted);">
            Add structured data to improve rich snippets in search results
          </div>
        </div>
      `;
    }

    return html`
      <div class="section">
        <div class="section-title">Structured Data (${this.jsonLdData.length} schemas)</div>
        ${this.jsonLdData.map(schema => html`
          <div class="schema-item">
            <div class="schema-header" @click=${() => this._toggleSchema(schema.id)}>
              <span class="schema-type">${schema.type}</span>
              <span class="schema-badge" style="${!schema.isValid ? 'background: var(--tdt-error)' : ''}">
                ${schema.isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>
            ${this._expandedSchemas.has(schema.id) ? html`
              <div class="schema-content">
                <tdt-object-inspector .data=${schema.data} .path=${'schema'}></tdt-object-inspector>
              </div>
            ` : ''}
          </div>
        `)}
      </div>
    `;
  }

  _renderImages() {
    const missingAlt = this.images.filter(img => !img.hasAlt);
    const withAlt = this.images.filter(img => img.hasAlt);

    return html`
      ${missingAlt.length > 0 ? html`
        <div class="section">
          <div class="section-title">⚠️ Missing Alt Text (${missingAlt.length})</div>
          <div class="image-grid">
            ${missingAlt.map(img => html`
              <div class="image-item image-item--error">
                <div class="image-item__preview">
                  <img src="${img.src}" alt="" @error=${(e) => e.target.style.display = 'none'}>
                </div>
                <div class="image-item__info">
                  <div class="image-item__alt image-item__alt--missing">No alt text</div>
                  ${img.width && img.height ? html`
                    <div class="image-item__size">${img.width}×${img.height}</div>
                  ` : ''}
                </div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">✓ Images with Alt Text (${withAlt.length})</div>
        ${withAlt.length === 0 ? html`
          <div class="empty-state">No images with alt text found</div>
        ` : html`
          <div class="image-grid">
            ${withAlt.slice(0, 20).map(img => html`
              <div class="image-item">
                <div class="image-item__preview">
                  <img src="${img.src}" alt="${img.alt}" @error=${(e) => e.target.style.display = 'none'}>
                </div>
                <div class="image-item__info">
                  <div class="image-item__alt">${img.alt}</div>
                  ${img.width && img.height ? html`
                    <div class="image-item__size">${img.width}×${img.height}</div>
                  ` : ''}
                </div>
              </div>
            `)}
          </div>
          ${withAlt.length > 20 ? html`<div style="text-align: center; color: var(--tdt-text-muted); margin-top: 12px;">... and ${withAlt.length - 20} more</div>` : ''}
        `}
      </div>
    `;
  }

  render() {
    const issueCount = this.issues.length;
    const missingAltCount = this.images.filter(i => !i.hasAlt).length;

    return html`
      <div class="tabs">
        <button 
          class="tab ${this.activeTab === 'overview' ? 'tab--active' : ''} ${issueCount > 0 ? 'tab--warning' : ''}"
          @click=${() => this._setTab('overview')}
        >
          📊 Overview 
          ${issueCount > 0 ? html`<span class="tab__count">${issueCount}</span>` : ''}
        </button>
        <button 
          class="tab ${this.activeTab === 'social' ? 'tab--active' : ''}"
          @click=${() => this._setTab('social')}
        >
          📱 Social Preview
        </button>
        <button 
          class="tab ${this.activeTab === 'schema' ? 'tab--active' : ''}"
          @click=${() => this._setTab('schema')}
        >
          📋 Schema <span class="tab__count">${this.jsonLdData.length}</span>
        </button>
        <button 
          class="tab ${this.activeTab === 'images' ? 'tab--active' : ''} ${missingAltCount > 0 ? 'tab--warning' : ''}"
          @click=${() => this._setTab('images')}
        >
          🖼️ Images 
          ${missingAltCount > 0 ? html`<span class="tab__count">${missingAltCount}</span>` : ''}
        </button>
      </div>

      ${this.activeTab === 'overview' ? this._renderOverview() : ''}
      ${this.activeTab === 'social' ? this._renderSocialPreview() : ''}
      ${this.activeTab === 'schema' ? this._renderSchema() : ''}
      ${this.activeTab === 'images' ? this._renderImages() : ''}
    `;
  }
}

customElements.define('tdt-seo-panel', SeoPanel);

