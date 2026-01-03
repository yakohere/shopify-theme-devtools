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
    headings: { type: Array, state: true },
    links: { type: Object, state: true },
    contentStats: { type: Object, state: true },
    copiedField: { type: String, state: true },
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
      }

      .toolbar-spacer {
        flex: 1;
      }

      .btn-export {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .btn-export:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        flex: 1;
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
        gap: 8px;
      }

      .meta-name {
        font-weight: 600;
        font-size: 10px;
        color: var(--tdt-accent);
        font-family: var(--tdt-font-mono);
      }

      .meta-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .btn-copy {
        background: transparent;
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        border-radius: var(--tdt-radius);
        padding: 2px 6px;
        font-size: 9px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.15s ease;
        font-family: var(--tdt-font);
      }

      .meta-item:hover .btn-copy {
        opacity: 1;
      }

      .btn-copy:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .btn-copy--copied {
        background: var(--tdt-success) !important;
        border-color: var(--tdt-success) !important;
        color: white !important;
        opacity: 1 !important;
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

      /* SERP Preview - Dark Mode (Google Dark Theme) */
      .serp-preview {
        background: #202124;
        border: 1px solid #3c4043;
        border-radius: 8px;
        padding: 16px;
        max-width: 600px;
        font-family: Arial, sans-serif;
      }

      .serp-preview__url {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .serp-preview__favicon {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #303134;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }

      .serp-preview__domain {
        font-size: 14px;
        color: #bdc1c6;
      }

      .serp-preview__breadcrumb {
        font-size: 12px;
        color: #9aa0a6;
      }

      .serp-preview__title {
        font-size: 20px;
        color: #8ab4f8;
        line-height: 1.3;
        margin-bottom: 4px;
        cursor: pointer;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .serp-preview__title:hover {
        text-decoration: underline;
      }

      .serp-preview__description {
        font-size: 14px;
        color: #bdc1c6;
        line-height: 1.58;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .serp-preview__char-count {
        margin-top: 8px;
        font-size: 11px;
        color: var(--tdt-text-muted);
        font-family: var(--tdt-font);
        display: flex;
        gap: 16px;
      }

      .serp-preview__char-count span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .char-count--warning {
        color: var(--tdt-warning);
      }

      .char-count--error {
        color: var(--tdt-error);
      }

      /* Social previews */
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

      /* Headings */
      .heading-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 4px;
      }

      .heading-item--error {
        border-left: 3px solid var(--tdt-error);
        background: rgba(255, 77, 77, 0.05);
      }

      .heading-item--warning {
        border-left: 3px solid var(--tdt-warning);
        background: rgba(255, 193, 100, 0.05);
      }

      .heading-tag {
        font-weight: 700;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-accent);
        color: white;
        font-family: var(--tdt-font-mono);
        flex-shrink: 0;
      }

      .heading-tag--h1 { background: #6366f1; }
      .heading-tag--h2 { background: #8b5cf6; }
      .heading-tag--h3 { background: #a855f7; }
      .heading-tag--h4 { background: #c084fc; }
      .heading-tag--h5 { background: #d8b4fe; color: #000; }
      .heading-tag--h6 { background: #e9d5ff; color: #000; }

      .heading-text {
        font-size: 11px;
        color: var(--tdt-text);
        word-break: break-word;
      }

      .heading-indent {
        margin-left: var(--indent, 0);
      }

      /* Links */
      .link-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin-bottom: 12px;
      }

      .link-stat {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px;
        text-align: center;
      }

      .link-stat__value {
        font-size: 20px;
        font-weight: 700;
        color: var(--tdt-text);
      }

      .link-stat__label {
        font-size: 10px;
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      .link-stat--warning .link-stat__value {
        color: var(--tdt-warning);
      }

      .link-stat--error .link-stat__value {
        color: var(--tdt-error);
      }

      .link-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        margin-bottom: 4px;
        font-size: 11px;
      }

      .link-item--nofollow {
        border-left: 3px solid var(--tdt-warning);
      }

      .link-item__type {
        font-size: 9px;
        padding: 2px 5px;
        border-radius: var(--tdt-radius);
        font-weight: 600;
        flex-shrink: 0;
      }

      .link-item__type--internal {
        background: rgba(34, 197, 94, 0.2);
        color: var(--tdt-success);
      }

      .link-item__type--external {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
      }

      .link-item__type--nofollow {
        background: rgba(255, 193, 100, 0.2);
        color: var(--tdt-warning);
      }

      .link-item__url {
        flex: 1;
        color: var(--tdt-text);
        word-break: break-all;
        cursor: pointer;
      }

      .link-item__url:hover {
        color: var(--tdt-accent);
      }

      .link-item__text {
        color: var(--tdt-text-muted);
        font-size: 10px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Content Stats */
      .content-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px;
        margin-bottom: 12px;
      }

      .content-stat {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 12px;
        text-align: center;
      }

      .content-stat__value {
        font-size: 18px;
        font-weight: 700;
        color: var(--tdt-text);
      }

      .content-stat__label {
        font-size: 10px;
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      /* Schema */
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

      .schema-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .schema-badge {
        font-size: 9px;
        padding: 1px 5px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-success);
        color: white;
        font-family: var(--tdt-font);
      }

      .schema-validate-btn {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: var(--tdt-radius);
        background: var(--tdt-bg);
        border: 1px solid var(--tdt-border);
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
        text-decoration: none;
      }

      .schema-validate-btn:hover {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .schema-content {
        border-top: 1px solid var(--tdt-border);
        padding: 8px 10px;
        background: var(--tdt-bg);
      }

      /* Images */
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

      /* Issues */
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
    this.headings = [];
    this.links = { internal: [], external: [], nofollow: [] };
    this.contentStats = {};
    this.copiedField = null;
    this._expandedSchemas = new Set();
    this._previewType = 'google';
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
    this._scanHeadings();
    this._scanLinks();
    this._analyzeContent();
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

  _scanHeadings() {
    const headings = [];
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    elements.forEach((el, index) => {
      const level = parseInt(el.tagName[1]);
      const text = el.textContent?.trim() || '';

      // Skip hidden elements
      if (el.offsetParent === null && !el.closest('[style*="display: none"]')) {
        return;
      }

      headings.push({
        id: index,
        level,
        tag: el.tagName.toLowerCase(),
        text: text.substring(0, 200),
        isEmpty: !text
      });
    });

    this.headings = headings;
  }

  _scanLinks() {
    const links = document.querySelectorAll('a[href]');
    const internal = [];
    const external = [];
    const nofollow = [];
    const currentHost = window.location.hostname;

    links.forEach((link, index) => {
      const href = link.href;
      const text = link.textContent?.trim().substring(0, 100) || '';
      const rel = link.getAttribute('rel') || '';
      const isNofollow = rel.includes('nofollow');

      try {
        const url = new URL(href);
        const isInternal = url.hostname === currentHost || url.hostname.endsWith('.' + currentHost);

        const linkData = {
          id: index,
          href,
          text,
          rel,
          isNofollow
        };

        if (isNofollow) {
          nofollow.push(linkData);
        }

        if (isInternal) {
          internal.push(linkData);
        } else if (url.protocol.startsWith('http')) {
          external.push(linkData);
        }
      } catch {
        // Invalid URL, skip
      }
    });

    this.links = { internal, external, nofollow };
  }

  _analyzeContent() {
    // Get visible text content
    const bodyText = document.body.innerText || '';
    const words = bodyText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Count sentences (rough estimate)
    const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Count paragraphs
    const paragraphs = document.querySelectorAll('p').length;

    this.contentStats = {
      wordCount,
      readingTime,
      sentences,
      paragraphs,
      charCount: bodyText.length
    };
  }

  _generateIssues() {
    const issues = [];

    // Title checks
    const title = this.metaTags.find(t => t.name === 'title');
    if (!title?.value) {
      issues.push({ type: 'error', title: 'Missing page title', description: 'Every page should have a unique title tag' });
    } else if (title.length > 60) {
      issues.push({ type: 'warning', title: 'Title too long', description: `Title is ${title.length} characters (recommended: 60 max)` });
    }

    // Description checks
    const desc = this.metaTags.find(t => t.name === 'description');
    if (!desc?.value) {
      issues.push({ type: 'error', title: 'Missing meta description', description: 'Add a meta description for better SEO' });
    } else if (desc.length > 160) {
      issues.push({ type: 'warning', title: 'Description too long', description: `Description is ${desc.length} characters (recommended: 160 max)` });
    }

    // OG checks
    if (!this.openGraph['og:image']?.value) {
      issues.push({ type: 'warning', title: 'Missing og:image', description: 'Add an Open Graph image for social sharing' });
    }

    if (!this.openGraph['og:title']?.value) {
      issues.push({ type: 'warning', title: 'Missing og:title', description: 'Add an Open Graph title for social sharing' });
    }

    // Image alt checks
    const missingAlt = this.images.filter(img => !img.hasAlt);
    if (missingAlt.length > 0) {
      issues.push({
        type: 'warning',
        title: `${missingAlt.length} image${missingAlt.length > 1 ? 's' : ''} missing alt text`,
        description: 'Alt text improves accessibility and SEO'
      });
    }

    // Schema checks
    const invalidSchemas = this.jsonLdData.filter(s => !s.isValid);
    if (invalidSchemas.length > 0) {
      issues.push({ type: 'error', title: 'Invalid JSON-LD schema', description: 'Fix JSON syntax errors in structured data' });
    }

    // Canonical checks
    const canonical = this.metaTags.find(t => t.name === 'canonical');
    if (!canonical?.value) {
      issues.push({ type: 'warning', title: 'Missing canonical URL', description: 'Add a canonical link to prevent duplicate content issues' });
    }

    // Heading checks
    const h1Count = this.headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({ type: 'error', title: 'Missing H1 heading', description: 'Every page should have exactly one H1 tag' });
    } else if (h1Count > 1) {
      issues.push({ type: 'warning', title: 'Multiple H1 headings', description: `Found ${h1Count} H1 tags. Recommended: 1` });
    }

    // Check for skipped heading levels
    const levels = this.headings.map(h => h.level);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        issues.push({
          type: 'warning',
          title: 'Skipped heading level',
          description: `H${levels[i - 1]} followed by H${levels[i]}. Don't skip levels.`
        });
        break;
      }
    }

    this.issues = issues;
  }

  async _copyValue(value, fieldName) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.copiedField = fieldName;
      setTimeout(() => {
        this.copiedField = null;
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  _exportReport() {
    const title = this.metaTags.find(t => t.name === 'title')?.value;
    const description = this.metaTags.find(t => t.name === 'description')?.value;

    const report = {
      exportedAt: new Date().toISOString(),
      url: window.location.href,
      score: this._getScore(),

      meta: {
        title: { value: title, length: title?.length || 0, maxLength: 60 },
        description: { value: description, length: description?.length || 0, maxLength: 160 },
        canonical: this.metaTags.find(t => t.name === 'canonical')?.value,
        robots: this.metaTags.find(t => t.name === 'robots')?.value,
      },

      openGraph: Object.fromEntries(
        Object.entries(this.openGraph).map(([k, v]) => [k, v.value])
      ),

      twitterCard: Object.fromEntries(
        Object.entries(this.twitterCard).map(([k, v]) => [k, v.value])
      ),

      headings: {
        structure: this.headings.map(h => ({ tag: h.tag, text: h.text })),
        h1Count: this.headings.filter(h => h.level === 1).length,
        totalHeadings: this.headings.length
      },

      links: {
        internalCount: this.links.internal.length,
        externalCount: this.links.external.length,
        nofollowCount: this.links.nofollow.length,
        internal: this.links.internal.slice(0, 50).map(l => ({ href: l.href, text: l.text })),
        external: this.links.external.slice(0, 50).map(l => ({ href: l.href, text: l.text })),
      },

      content: this.contentStats,

      images: {
        total: this.images.length,
        missingAlt: this.images.filter(i => !i.hasAlt).length,
        withAlt: this.images.filter(i => i.hasAlt).length,
      },

      schema: this.jsonLdData.map(s => ({
        type: s.type,
        isValid: s.isValid,
        data: s.data
      })),

      issues: this.issues
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  _openRichResultsTest() {
    const url = `https://search.google.com/test/rich-results?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }

  _renderOverview() {
    const score = this._getScore();
    const scoreClass = this._getScoreClass(score);
    const errorCount = this.issues.filter(i => i.type === 'error').length;
    const warningCount = this.issues.filter(i => i.type === 'warning').length;

    const title = this.metaTags.find(t => t.name === 'title')?.value || '';
    const description = this.metaTags.find(t => t.name === 'description')?.value || '';

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

      <!-- Google SERP Preview -->
      <div class="section">
        <div class="section-title">Google Search Preview</div>
        <div class="serp-preview">
          <div class="serp-preview__url">
            <div class="serp-preview__favicon">🌐</div>
            <div>
              <div class="serp-preview__domain">${window.location.hostname}</div>
              <div class="serp-preview__breadcrumb">${window.location.pathname}</div>
            </div>
          </div>
          <div class="serp-preview__title">${title || 'No title set'}</div>
          <div class="serp-preview__description">${description || 'No description set'}</div>
          <div class="serp-preview__char-count">
            <span class="${title.length > 60 ? 'char-count--warning' : ''}">
              Title: ${title.length}/60
            </span>
            <span class="${description.length > 160 ? 'char-count--warning' : ''}">
              Description: ${description.length}/160
            </span>
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
                <div class="meta-actions">
                  ${tag.value ? html`
                    <button
                      class="btn-copy ${this.copiedField === tag.name ? 'btn-copy--copied' : ''}"
                      @click=${() => this._copyValue(tag.value, tag.name)}
                    >
                      ${this.copiedField === tag.name ? 'Copied!' : 'Copy'}
                    </button>
                  ` : ''}
                  ${tag.maxLength ? html`
                    <span class="meta-length ${tag.length > tag.maxLength ? 'meta-length--error' : tag.length < (tag.minLength || 0) ? 'meta-length--warning' : ''}">
                      ${tag.length}/${tag.maxLength}
                    </span>
                  ` : ''}
                </div>
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
                <div class="meta-actions">
                  ${data.value ? html`
                    <button
                      class="btn-copy ${this.copiedField === name ? 'btn-copy--copied' : ''}"
                      @click=${() => this._copyValue(data.value, name)}
                    >
                      ${this.copiedField === name ? 'Copied!' : 'Copy'}
                    </button>
                  ` : ''}
                  ${data.required ? html`<span class="meta-badge ${data.value ? 'meta-badge--success' : 'meta-badge--error'}">${data.value ? '✓' : 'Required'}</span>` : ''}
                </div>
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
                ${data.value ? html`
                  <button
                    class="btn-copy ${this.copiedField === name ? 'btn-copy--copied' : ''}"
                    @click=${() => this._copyValue(data.value, name)}
                  >
                    ${this.copiedField === name ? 'Copied!' : 'Copy'}
                  </button>
                ` : ''}
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

  _renderHeadings() {
    const h1Count = this.headings.filter(h => h.level === 1).length;
    const hasIssues = h1Count !== 1;

    // Check for skipped levels
    const levels = this.headings.map(h => h.level);
    let hasSkippedLevels = false;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        hasSkippedLevels = true;
        break;
      }
    }

    return html`
      <div class="content-stats">
        <div class="content-stat ${h1Count !== 1 ? 'link-stat--warning' : ''}">
          <div class="content-stat__value">${h1Count}</div>
          <div class="content-stat__label">H1 Tags</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.headings.filter(h => h.level === 2).length}</div>
          <div class="content-stat__label">H2 Tags</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.headings.filter(h => h.level === 3).length}</div>
          <div class="content-stat__label">H3 Tags</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.headings.length}</div>
          <div class="content-stat__label">Total</div>
        </div>
      </div>

      ${hasIssues || hasSkippedLevels ? html`
        <div class="section">
          <div class="section-title">Issues</div>
          <div class="issue-list">
            ${h1Count === 0 ? html`
              <div class="issue-item issue-item--error">
                <span class="issue-icon">❌</span>
                <div class="issue-content">
                  <div class="issue-title">Missing H1</div>
                  <div class="issue-description">Every page should have exactly one H1 heading</div>
                </div>
              </div>
            ` : ''}
            ${h1Count > 1 ? html`
              <div class="issue-item issue-item--warning">
                <span class="issue-icon">⚠️</span>
                <div class="issue-content">
                  <div class="issue-title">Multiple H1 tags (${h1Count})</div>
                  <div class="issue-description">Consider using only one H1 per page</div>
                </div>
              </div>
            ` : ''}
            ${hasSkippedLevels ? html`
              <div class="issue-item issue-item--warning">
                <span class="issue-icon">⚠️</span>
                <div class="issue-content">
                  <div class="issue-title">Skipped heading levels</div>
                  <div class="issue-description">Heading hierarchy should not skip levels (e.g., H2 to H4)</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Heading Structure</div>
        ${this.headings.length === 0 ? html`
          <div class="empty-state">No headings found on this page</div>
        ` : html`
          ${this.headings.map((heading, index) => {
            const prevLevel = index > 0 ? this.headings[index - 1].level : 0;
            const isSkipped = heading.level > prevLevel + 1 && prevLevel > 0;
            const isMultipleH1 = heading.level === 1 && h1Count > 1;

            return html`
              <div
                class="heading-item ${isSkipped ? 'heading-item--warning' : ''} ${isMultipleH1 ? 'heading-item--warning' : ''}"
                style="--indent: ${(heading.level - 1) * 16}px"
              >
                <span class="heading-tag heading-tag--${heading.tag}" style="margin-left: ${(heading.level - 1) * 16}px">
                  ${heading.tag.toUpperCase()}
                </span>
                <span class="heading-text">${heading.text || '(empty)'}</span>
              </div>
            `;
          })}
        `}
      </div>
    `;
  }

  _renderLinks() {
    return html`
      <div class="link-stats">
        <div class="link-stat">
          <div class="link-stat__value">${this.links.internal.length}</div>
          <div class="link-stat__label">Internal Links</div>
        </div>
        <div class="link-stat">
          <div class="link-stat__value">${this.links.external.length}</div>
          <div class="link-stat__label">External Links</div>
        </div>
        <div class="link-stat ${this.links.nofollow.length > 0 ? 'link-stat--warning' : ''}">
          <div class="link-stat__value">${this.links.nofollow.length}</div>
          <div class="link-stat__label">Nofollow Links</div>
        </div>
        <div class="link-stat">
          <div class="link-stat__value">${this.links.internal.length + this.links.external.length}</div>
          <div class="link-stat__label">Total Links</div>
        </div>
      </div>

      ${this.links.external.length > 0 ? html`
        <div class="section">
          <div class="section-title">External Links (${this.links.external.length})</div>
          ${this.links.external.slice(0, 20).map(link => html`
            <div class="link-item ${link.isNofollow ? 'link-item--nofollow' : ''}">
              <span class="link-item__type link-item__type--external">External</span>
              ${link.isNofollow ? html`<span class="link-item__type link-item__type--nofollow">nofollow</span>` : ''}
              <span class="link-item__url" @click=${() => window.open(link.href, '_blank')}>${link.href}</span>
              ${link.text ? html`<span class="link-item__text">${link.text}</span>` : ''}
            </div>
          `)}
          ${this.links.external.length > 20 ? html`
            <div style="text-align: center; color: var(--tdt-text-muted); padding: 8px;">
              ... and ${this.links.external.length - 20} more
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${this.links.nofollow.length > 0 ? html`
        <div class="section">
          <div class="section-title">Nofollow Links (${this.links.nofollow.length})</div>
          ${this.links.nofollow.slice(0, 10).map(link => html`
            <div class="link-item link-item--nofollow">
              <span class="link-item__type link-item__type--nofollow">nofollow</span>
              <span class="link-item__url" @click=${() => window.open(link.href, '_blank')}>${link.href}</span>
              ${link.text ? html`<span class="link-item__text">${link.text}</span>` : ''}
            </div>
          `)}
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Internal Links (${this.links.internal.length})</div>
        ${this.links.internal.length === 0 ? html`
          <div class="empty-state">No internal links found</div>
        ` : html`
          ${this.links.internal.slice(0, 20).map(link => html`
            <div class="link-item">
              <span class="link-item__type link-item__type--internal">Internal</span>
              <span class="link-item__url" @click=${() => window.open(link.href, '_blank')}>${link.href}</span>
              ${link.text ? html`<span class="link-item__text">${link.text}</span>` : ''}
            </div>
          `)}
          ${this.links.internal.length > 20 ? html`
            <div style="text-align: center; color: var(--tdt-text-muted); padding: 8px;">
              ... and ${this.links.internal.length - 20} more
            </div>
          ` : ''}
        `}
      </div>
    `;
  }

  _renderContent() {
    return html`
      <div class="content-stats">
        <div class="content-stat">
          <div class="content-stat__value">${this.contentStats.wordCount?.toLocaleString() || 0}</div>
          <div class="content-stat__label">Words</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.contentStats.readingTime || 0} min</div>
          <div class="content-stat__label">Reading Time</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.contentStats.sentences || 0}</div>
          <div class="content-stat__label">Sentences</div>
        </div>
        <div class="content-stat">
          <div class="content-stat__value">${this.contentStats.paragraphs || 0}</div>
          <div class="content-stat__label">Paragraphs</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Content Analysis</div>
        <div class="meta-list">
          <div class="meta-item ${this.contentStats.wordCount > 300 ? 'meta-item--success' : 'meta-item--warning'}">
            <div class="meta-header">
              <span class="meta-name">Word Count</span>
              <span class="meta-badge ${this.contentStats.wordCount > 300 ? 'meta-badge--success' : 'meta-badge--warning'}">
                ${this.contentStats.wordCount > 300 ? '✓ Good' : 'Thin content'}
              </span>
            </div>
            <div class="meta-value">
              ${this.contentStats.wordCount?.toLocaleString() || 0} words
            </div>
            <div class="meta-hint">
              ${this.contentStats.wordCount < 300
                ? 'Consider adding more content (300+ words recommended for SEO)'
                : 'Good content length for SEO'}
            </div>
          </div>

          <div class="meta-item meta-item--success">
            <div class="meta-header">
              <span class="meta-name">Character Count</span>
            </div>
            <div class="meta-value">
              ${this.contentStats.charCount?.toLocaleString() || 0} characters
            </div>
          </div>

          <div class="meta-item meta-item--success">
            <div class="meta-header">
              <span class="meta-name">Avg. Words per Sentence</span>
            </div>
            <div class="meta-value">
              ${this.contentStats.sentences > 0
                ? Math.round(this.contentStats.wordCount / this.contentStats.sentences)
                : 0} words
            </div>
            <div class="meta-hint">
              15-20 words per sentence is ideal for readability
            </div>
          </div>
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

        <div style="margin-bottom: 12px;">
          <button class="btn-export" @click=${this._openRichResultsTest}>
            🔍 Test with Google Rich Results
          </button>
        </div>

        ${this.jsonLdData.map(schema => html`
          <div class="schema-item">
            <div class="schema-header" @click=${() => this._toggleSchema(schema.id)}>
              <span class="schema-type">${schema.type}</span>
              <div class="schema-actions">
                <span class="schema-badge" style="${!schema.isValid ? 'background: var(--tdt-error)' : ''}">
                  ${schema.isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
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
    const h1Count = this.headings.filter(h => h.level === 1).length;
    const headingIssues = h1Count !== 1;

    return html`
      <div class="toolbar">
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
            📱 Social
          </button>
          <button
            class="tab ${this.activeTab === 'headings' ? 'tab--active' : ''} ${headingIssues ? 'tab--warning' : ''}"
            @click=${() => this._setTab('headings')}
          >
            📝 Headings
          </button>
          <button
            class="tab ${this.activeTab === 'links' ? 'tab--active' : ''}"
            @click=${() => this._setTab('links')}
          >
            🔗 Links
          </button>
          <button
            class="tab ${this.activeTab === 'content' ? 'tab--active' : ''}"
            @click=${() => this._setTab('content')}
          >
            📄 Content
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
        <button class="btn-export" @click=${this._exportReport}>
          📥 Export
        </button>
      </div>

      ${this.activeTab === 'overview' ? this._renderOverview() : ''}
      ${this.activeTab === 'social' ? this._renderSocialPreview() : ''}
      ${this.activeTab === 'headings' ? this._renderHeadings() : ''}
      ${this.activeTab === 'links' ? this._renderLinks() : ''}
      ${this.activeTab === 'content' ? this._renderContent() : ''}
      ${this.activeTab === 'schema' ? this._renderSchema() : ''}
      ${this.activeTab === 'images' ? this._renderImages() : ''}
    `;
  }
}

customElements.define('tdt-seo-panel', SeoPanel);
