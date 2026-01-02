import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class LocalizationPanel extends LitElement {
  static properties = {
    meta: { type: Object },
    translations: { type: Array, state: true },
    missingTranslations: { type: Array, state: true },
    availableLocales: { type: Array, state: true },
    availableCountries: { type: Array, state: true },
    filter: { type: String, state: true },
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

      .market-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .info-card {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 12px;
      }

      .info-card__icon {
        font-size: 20px;
        margin-bottom: 6px;
      }

      .info-card__label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tdt-text-muted);
        margin-bottom: 4px;
      }

      .info-card__value {
        font-weight: 600;
        color: var(--tdt-text);
        font-size: 14px;
      }

      .info-card__subvalue {
        font-size: 11px;
        color: var(--tdt-text-muted);
        margin-top: 2px;
      }

      .section {
        margin-bottom: 20px;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--tdt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
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

      .locale-switcher {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .locale-btn {
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

      .locale-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
      }

      .locale-btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .locale-btn__code {
        font-weight: 600;
      }

      .locale-btn__flag {
        font-size: 14px;
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

      .tab__count {
        font-size: 10px;
        opacity: 0.8;
        background: rgba(255,255,255,0.15);
        padding: 1px 5px;
        border-radius: 8px;
      }

      .search {
        width: 100%;
        margin-bottom: 12px;
      }

      .translation-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .translation-item {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 10px 12px;
      }

      .translation-item--missing {
        border-left: 3px solid var(--tdt-warning);
        background: rgba(255, 193, 100, 0.05);
      }

      .translation-key {
        font-family: var(--tdt-font-mono);
        font-size: 11px;
        color: var(--tdt-accent);
        margin-bottom: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .translation-key:hover {
        text-decoration: underline;
      }

      .translation-key__path {
        flex: 1;
        word-break: break-all;
      }

      .translation-key__copy {
        opacity: 0;
        font-size: 10px;
        color: var(--tdt-text-muted);
      }

      .translation-key:hover .translation-key__copy {
        opacity: 1;
      }

      .translation-value {
        font-size: 12px;
        color: var(--tdt-text);
      }

      .translation-value--missing {
        color: var(--tdt-warning);
        font-style: italic;
      }

      .translation-context {
        font-size: 10px;
        color: var(--tdt-text-muted);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--tdt-text-muted);
      }

      .empty-state__icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .country-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
      }

      .country-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 8px;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
      }

      .country-btn:hover {
        background: var(--tdt-bg-hover);
        border-color: var(--tdt-accent);
      }

      .country-btn--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .country-btn__flag {
        font-size: 20px;
      }

      .country-btn__name {
        font-size: 10px;
        margin-top: 4px;
      }

      .country-btn__currency {
        font-size: 9px;
        opacity: 0.7;
      }

      .url-helper {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 12px;
        margin-top: 12px;
      }

      .url-helper__label {
        font-size: 10px;
        color: var(--tdt-text-muted);
        margin-bottom: 6px;
      }

      .url-helper__url {
        font-family: var(--tdt-font-mono);
        font-size: 11px;
        color: var(--tdt-accent);
        word-break: break-all;
        background: var(--tdt-bg);
        padding: 8px;
        border-radius: var(--tdt-radius);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .url-helper__actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      .btn {
        padding: 6px 12px;
        border-radius: var(--tdt-radius);
        font-size: 11px;
        cursor: pointer;
        border: 1px solid var(--tdt-border);
        background: var(--tdt-bg-secondary);
        color: var(--tdt-text);
      }

      .btn:hover {
        background: var(--tdt-bg-hover);
      }

      .btn--primary {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .stats-row {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border-radius: var(--tdt-radius);
        font-size: 11px;
      }

      .stat {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        color: var(--tdt-text-muted);
        font-size: 9px;
        text-transform: uppercase;
      }

      .stat-value {
        font-weight: 600;
        color: var(--tdt-text);
      }

      .stat-value--warning {
        color: var(--tdt-warning);
      }
    `
  ];

  static COUNTRY_FLAGS = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'AU': '🇦🇺', 'DE': '🇩🇪',
    'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'JP': '🇯🇵', 'CN': '🇨🇳',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
    'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'AT': '🇦🇹', 'CH': '🇨🇭',
    'BE': '🇧🇪', 'IE': '🇮🇪', 'NZ': '🇳🇿', 'SG': '🇸🇬', 'HK': '🇭🇰',
    'KR': '🇰🇷', 'IN': '🇮🇳', 'AE': '🇦🇪', 'SA': '🇸🇦', 'ZA': '🇿🇦',
    'PT': '🇵🇹', 'CZ': '🇨🇿', 'RO': '🇷🇴', 'HU': '🇭🇺', 'IL': '🇮🇱',
  };

  static LANGUAGE_FLAGS = {
    'en': '🇬🇧', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
    'pt': '🇵🇹', 'nl': '🇳🇱', 'pl': '🇵🇱', 'ja': '🇯🇵', 'zh': '🇨🇳',
    'ko': '🇰🇷', 'ar': '🇸🇦', 'ru': '🇷🇺', 'sv': '🇸🇪', 'da': '🇩🇰',
    'fi': '🇫🇮', 'no': '🇳🇴', 'cs': '🇨🇿', 'hu': '🇭🇺', 'ro': '🇷🇴',
  };

  constructor() {
    super();
    this.meta = {};
    this.translations = [];
    this.missingTranslations = [];
    this.availableLocales = [];
    this.availableCountries = [];
    this.filter = '';
    this.activeTab = 'overview';
    this._selectedLocale = null;
    this._selectedCountry = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._scanTranslations();
    this._loadAvailableLocales();
  }

  updated(changedProps) {
    if (changedProps.has('meta') && this.meta) {
      this._selectedLocale = this.meta.request?.locale?.iso_code;
      this._selectedCountry = this.meta.localization?.country?.iso_code;
    }
  }

  _loadAvailableLocales() {
    const localeSelector = document.querySelector('[data-locale-selector]') || 
                          document.querySelector('form[action*="/localization"]');
    
    if (localeSelector) {
      const localeOptions = localeSelector.querySelectorAll('option[value], [data-locale]');
      this.availableLocales = Array.from(localeOptions).map(opt => ({
        code: opt.value || opt.dataset.locale,
        name: opt.textContent?.trim() || opt.value
      }));
    }

    const countrySelector = document.querySelector('[data-country-selector]') ||
                           document.querySelector('select[name="country_code"]');
    
    if (countrySelector) {
      const countryOptions = countrySelector.querySelectorAll('option[value]');
      this.availableCountries = Array.from(countryOptions).map(opt => ({
        code: opt.value,
        name: opt.textContent?.trim() || opt.value
      }));
    }

    if (this.availableLocales.length === 0) {
      const shopLocales = window.__THEME_DEVTOOLS_CONTEXT__?.objects?.shop?.enabled_locales;
      if (shopLocales) {
        this.availableLocales = shopLocales.map(code => ({
          code,
          name: new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code
        }));
      }
    }
  }

  _scanTranslations() {
    const translations = [];
    const missing = [];

    const pageHTML = document.body.innerHTML;
    
    const translationPatterns = [
      /\{\{\s*['"]([^'"]+)['"]\s*\|\s*t\s*\}\}/g,
      /\{\{\s*['"]([^'"]+)['"]\s*\|\s*t:\s*[^}]+\}\}/g,
      /data-translation-key=["']([^"']+)["']/g,
    ];

    const foundKeys = new Set();
    
    translationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(pageHTML)) !== null) {
        if (!foundKeys.has(match[1])) {
          foundKeys.add(match[1]);
        }
      }
    });

    const textNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    while (textNodes.nextNode()) {
      const text = textNodes.currentNode.textContent.trim();
      if (text.startsWith('translation missing:') || 
          text.includes('Translation missing') ||
          text.match(/^[a-z_]+\.[a-z_]+(\.[a-z_]+)*$/i)) {
        
        const keyMatch = text.match(/translation missing:\s*([^\s]+)/i) ||
                        text.match(/^([a-z_]+\.[a-z_]+(?:\.[a-z_]+)*)$/i);
        
        if (keyMatch) {
          missing.push({
            key: keyMatch[1],
            context: textNodes.currentNode.parentElement?.tagName || 'unknown',
            element: textNodes.currentNode.parentElement
          });
        }
      }
    }

    const elements = document.querySelectorAll('[data-t], [data-translate]');
    elements.forEach(el => {
      const key = el.dataset.t || el.dataset.translate;
      const value = el.textContent?.trim();
      
      if (key) {
        translations.push({
          key,
          value: value || '(empty)',
          element: el.tagName,
          isMissing: !value || value.includes('translation missing')
        });
        
        if (!value || value.includes('translation missing')) {
          missing.push({ key, context: el.tagName, element: el });
        }
      }
    });

    foundKeys.forEach(key => {
      if (!translations.some(t => t.key === key)) {
        translations.push({
          key,
          value: '(rendered)',
          element: 'Liquid',
          isMissing: false
        });
      }
    });

    this.translations = translations;
    this.missingTranslations = missing;
  }

  _getFlag(code, type = 'country') {
    if (type === 'language') {
      const langCode = code.split('-')[0].toLowerCase();
      return LocalizationPanel.LANGUAGE_FLAGS[langCode] || '🌐';
    }
    return LocalizationPanel.COUNTRY_FLAGS[code?.toUpperCase()] || '🏳️';
  }

  _setTab(tab) {
    this.activeTab = tab;
  }

  _filterTranslations(e) {
    this.filter = e.target.value;
  }

  _getFilteredTranslations() {
    const list = this.activeTab === 'missing' ? this.missingTranslations : this.translations;
    
    if (!this.filter) return list;
    
    const lower = this.filter.toLowerCase();
    return list.filter(t => 
      t.key.toLowerCase().includes(lower) ||
      (t.value && t.value.toLowerCase().includes(lower))
    );
  }

  _copyKey(key) {
    const liquidPath = `{{ '${key}' | t }}`;
    navigator.clipboard.writeText(liquidPath);
  }

  _selectLocale(code) {
    this._selectedLocale = code;
    this.requestUpdate();
  }

  _selectCountry(code) {
    this._selectedCountry = code;
    this.requestUpdate();
  }

  _buildLocaleUrl() {
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/').filter(Boolean);
    
    const currentLocale = this.meta.request?.locale?.iso_code;
    const newLocale = this._selectedLocale;
    const newCountry = this._selectedCountry;
    
    if (pathParts[0]?.match(/^[a-z]{2}(-[a-z]{2})?$/i)) {
      pathParts.shift();
    }
    
    let newPath = '';
    if (newLocale && newLocale !== this.meta.request?.locale?.primary_locale) {
      newPath = `/${newLocale}`;
    }
    newPath += '/' + pathParts.join('/');
    
    currentUrl.pathname = newPath || '/';
    
    return currentUrl.toString();
  }

  _goToLocale() {
    const url = this._buildLocaleUrl();
    window.location.href = url;
  }

  _copyLocaleUrl() {
    const url = this._buildLocaleUrl();
    navigator.clipboard.writeText(url);
  }

  _renderMarketInfo() {
    const { localization, request } = this.meta;
    
    return html`
      <div class="market-info">
        <div class="info-card">
          <div class="info-card__icon">${this._getFlag(localization?.country?.iso_code)}</div>
          <div class="info-card__label">Country</div>
          <div class="info-card__value">${localization?.country?.name || '—'}</div>
          <div class="info-card__subvalue">${localization?.country?.iso_code || ''}</div>
        </div>
        
        <div class="info-card">
          <div class="info-card__icon">${this._getFlag(request?.locale?.iso_code, 'language')}</div>
          <div class="info-card__label">Language</div>
          <div class="info-card__value">${request?.locale?.name || localization?.language?.name || '—'}</div>
          <div class="info-card__subvalue">${request?.locale?.iso_code || ''} ${request?.locale?.primary ? '(Primary)' : ''}</div>
        </div>
        
        <div class="info-card">
          <div class="info-card__icon">💰</div>
          <div class="info-card__label">Currency</div>
          <div class="info-card__value">${localization?.country?.currency?.iso_code || '—'}</div>
          <div class="info-card__subvalue">${localization?.country?.currency?.symbol || ''}</div>
        </div>
        
        <div class="info-card">
          <div class="info-card__icon">🏪</div>
          <div class="info-card__label">Market</div>
          <div class="info-card__value">${localization?.market?.handle || '—'}</div>
          <div class="info-card__subvalue">ID: ${localization?.market?.id || '—'}</div>
        </div>
      </div>
    `;
  }

  _renderLocaleSwitcher() {
    const currentLocale = this.meta.request?.locale?.iso_code;
    const currentCountry = this.meta.localization?.country?.iso_code;
    
    return html`
      <div class="section">
        <div class="section-title">Quick Locale Switch</div>
        
        ${this.availableLocales.length > 0 ? html`
          <div class="locale-switcher">
            ${this.availableLocales.map(locale => html`
              <button 
                class="locale-btn ${this._selectedLocale === locale.code ? 'locale-btn--active' : ''}"
                @click=${() => this._selectLocale(locale.code)}
              >
                <span class="locale-btn__flag">${this._getFlag(locale.code, 'language')}</span>
                <span class="locale-btn__code">${locale.code.toUpperCase()}</span>
              </button>
            `)}
          </div>
        ` : html`
          <div class="locale-switcher">
            ${['en', 'es', 'fr', 'de', 'ja', 'zh'].map(code => html`
              <button 
                class="locale-btn ${this._selectedLocale === code ? 'locale-btn--active' : ''}"
                @click=${() => this._selectLocale(code)}
              >
                <span class="locale-btn__flag">${this._getFlag(code, 'language')}</span>
                <span class="locale-btn__code">${code.toUpperCase()}</span>
              </button>
            `)}
          </div>
        `}
        
        ${(this._selectedLocale && this._selectedLocale !== currentLocale) ? html`
          <div class="url-helper">
            <div class="url-helper__label">Preview URL for ${this._selectedLocale.toUpperCase()}</div>
            <div class="url-helper__url">
              <span>${this._buildLocaleUrl()}</span>
              <div class="url-helper__actions">
                <button class="btn" @click=${this._copyLocaleUrl}>Copy</button>
                <button class="btn btn--primary" @click=${this._goToLocale}>Go →</button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderTranslations() {
    const filtered = this._getFilteredTranslations();
    
    return html`
      <div class="stats-row">
        <div class="stat">
          <span class="stat-label">Total Keys</span>
          <span class="stat-value">${this.translations.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Missing</span>
          <span class="stat-value ${this.missingTranslations.length > 0 ? 'stat-value--warning' : ''}">
            ${this.missingTranslations.length}
          </span>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab ${this.activeTab === 'all' ? 'tab--active' : ''}"
          @click=${() => this._setTab('all')}
        >
          All Keys <span class="tab__count">${this.translations.length}</span>
        </button>
        <button 
          class="tab tab--warning ${this.activeTab === 'missing' ? 'tab--active' : ''}"
          @click=${() => this._setTab('missing')}
        >
          ⚠️ Missing <span class="tab__count">${this.missingTranslations.length}</span>
        </button>
      </div>

      <input 
        type="search" 
        class="search" 
        placeholder="Filter translations..."
        .value=${this.filter}
        @input=${this._filterTranslations}
      >

      ${filtered.length === 0 
        ? html`
          <div class="empty-state">
            <div class="empty-state__icon">🌐</div>
            <div>No ${this.activeTab === 'missing' ? 'missing ' : ''}translations found</div>
          </div>
        `
        : html`
          <div class="translation-list">
            ${filtered.map(t => html`
              <div class="translation-item ${t.isMissing ? 'translation-item--missing' : ''}">
                <div class="translation-key" @click=${() => this._copyKey(t.key)}>
                  <span class="translation-key__path">${t.key}</span>
                  <span class="translation-key__copy">📋 Copy Liquid</span>
                </div>
                <div class="translation-value ${t.isMissing ? 'translation-value--missing' : ''}">
                  ${t.value || '(missing translation)'}
                </div>
                <div class="translation-context">
                  <span>📍 ${t.context || t.element || 'Page'}</span>
                </div>
              </div>
            `)}
          </div>
        `
      }
    `;
  }

  render() {
    return html`
      ${this._renderMarketInfo()}
      ${this._renderLocaleSwitcher()}
      
      <div class="section">
        <div class="section-title">Translation Keys on Page</div>
        ${this._renderTranslations()}
      </div>
    `;
  }
}

customElements.define('tdt-localization-panel', LocalizationPanel);

