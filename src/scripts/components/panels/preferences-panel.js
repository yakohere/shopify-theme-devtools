import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { settingsService, DEFAULT_SETTINGS } from '../../services/settings.js';

export class PreferencesPanel extends LitElement {
  static properties = {
    settings: { type: Object, state: true },
    isRecordingShortcut: { type: Boolean, state: true },
    tempShortcut: { type: Object, state: true },
  };

  static AVAILABLE_TABS = [
    { id: 'objects', label: 'Objects' },
    { id: 'metafields', label: 'Metafields' },
    { id: 'cart', label: 'Cart' },
    { id: 'locale', label: 'Locale' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'seo', label: 'SEO' },
    { id: 'apps', label: 'Apps' },
    { id: 'console', label: 'Console' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'storage', label: 'Storage' },
    { id: 'info', label: 'Info' },
  ];

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 16px;
        height: 100%;
        overflow: auto;
      }

      .settings-container {
        max-width: 600px;
      }

      .section {
        margin-bottom: 24px;
      }

      .section-title {
        font-size: calc(13px * var(--tdt-scale, 1));
        font-weight: 600;
        color: var(--tdt-text);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--tdt-border);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .setting-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--tdt-border);
        gap: 16px;
      }

      .setting-row:last-child {
        border-bottom: none;
      }

      .setting-info {
        flex: 1;
        min-width: 0;
      }

      .setting-label {
        font-size: calc(12px * var(--tdt-scale, 1));
        font-weight: 500;
        color: var(--tdt-text);
        margin-bottom: 4px;
      }

      .setting-description {
        font-size: calc(11px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        line-height: 1.4;
      }

      .setting-control {
        flex-shrink: 0;
      }

      /* Select dropdown */
      .select {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 6px 28px 6px 10px;
        color: var(--tdt-text);
        font-size: calc(11px * var(--tdt-scale, 1));
        font-family: var(--tdt-font);
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        min-width: 120px;
      }

      .select:hover {
        border-color: var(--tdt-accent);
      }

      .select:focus {
        outline: none;
        border-color: var(--tdt-accent);
      }

      /* Toggle switch */
      .toggle {
        position: relative;
        width: 44px;
        height: 24px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: var(--tdt-text-muted);
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .toggle--active {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
      }

      .toggle--active::after {
        left: 22px;
        background: white;
      }

      /* Keyboard shortcut */
      .shortcut-display {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .key {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 500;
        color: var(--tdt-text);
        min-width: 28px;
        text-align: center;
      }

      .key--recording {
        border-color: var(--tdt-accent);
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .shortcut-btn {
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        padding: 4px 10px;
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        cursor: pointer;
        font-family: var(--tdt-font);
      }

      .shortcut-btn:hover {
        background: var(--tdt-bg-hover);
        color: var(--tdt-text);
        border-color: var(--tdt-accent);
      }

      .shortcut-btn--recording {
        background: var(--tdt-accent);
        border-color: var(--tdt-accent);
        color: white;
      }

      .shortcut-hint {
        font-size: calc(10px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        margin-top: 8px;
      }

      /* Reset button */
      .reset-section {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px dashed var(--tdt-border);
      }

      .reset-btn {
        background: transparent;
        border: 1px solid var(--tdt-error);
        border-radius: var(--tdt-radius);
        padding: 8px 16px;
        color: var(--tdt-error);
        font-size: calc(11px * var(--tdt-scale, 1));
        cursor: pointer;
        font-family: var(--tdt-font);
        transition: all 0.15s ease;
      }

      .reset-btn:hover {
        background: var(--tdt-error);
        color: white;
      }

      /* Theme preview */
      .theme-preview {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .theme-option {
        width: 60px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        border: 2px solid var(--tdt-border);
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .theme-option:hover {
        border-color: var(--tdt-text-muted);
      }

      .theme-option--active {
        border-color: var(--tdt-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--tdt-accent) 30%, transparent);
      }

      .theme-option--dark {
        background: #1a1a1a;
      }

      .theme-option--light {
        background: #ffffff;
      }

      .theme-option--system {
        background: linear-gradient(135deg, #1a1a1a 50%, #ffffff 50%);
      }

      .theme-icon {
        font-size: calc(16px * var(--tdt-scale, 1));
        line-height: 1;
      }

      .theme-option--dark .theme-icon {
        filter: none;
      }

      .theme-option--light .theme-icon {
        filter: none;
      }

      .theme-option--system .theme-icon {
        text-shadow: 0 0 2px rgba(0,0,0,0.5), 0 0 2px rgba(255,255,255,0.5);
      }

      .theme-label {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        text-align: center;
        margin-top: 4px;
      }

      .theme-option-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .theme-option-wrapper--active .theme-label {
        color: var(--tdt-accent);
      }

      /* Font size preview */
      .font-preview {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-top: 8px;
      }

      .font-option {
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid transparent;
        color: var(--tdt-text-muted);
        transition: all 0.15s ease;
      }

      .font-option:hover {
        color: var(--tdt-text);
      }

      .font-option--active {
        border-color: var(--tdt-accent);
        color: var(--tdt-accent);
      }

      .font-option--small { font-size: calc(10px * var(--tdt-scale, 1)); }
      .font-option--medium { font-size: calc(12px * var(--tdt-scale, 1)); }
      .font-option--large { font-size: calc(14px * var(--tdt-scale, 1)); }

      /* Panel position preview */
      .position-preview {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .position-option {
        width: 48px;
        height: 36px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid var(--tdt-border);
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--tdt-bg-secondary);
        position: relative;
        overflow: hidden;
      }

      .position-option:hover {
        border-color: var(--tdt-text-muted);
      }

      .position-option--active {
        border-color: var(--tdt-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--tdt-accent) 30%, transparent);
      }

      .position-option__inner {
        position: absolute;
        background: var(--tdt-accent);
        border-radius: 2px;
      }

      .position-option--bottom .position-option__inner {
        bottom: 4px;
        left: 6px;
        right: 6px;
        height: 10px;
      }

      .position-option--floating .position-option__inner {
        width: 20px;
        height: 16px;
        border-radius: 3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      .position-option-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .position-option-wrapper--active .position-label {
        color: var(--tdt-accent);
      }

      .position-label {
        font-size: calc(9px * var(--tdt-scale, 1));
        color: var(--tdt-text-muted);
        text-align: center;
        margin-top: 4px;
      }

      /* Height preview */
      .height-preview {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .height-option {
        cursor: pointer;
        padding: 4px 12px;
        border-radius: 4px;
        border: 1px solid transparent;
        color: var(--tdt-text-muted);
        transition: all 0.15s ease;
        font-size: calc(11px * var(--tdt-scale, 1));
      }

      .height-option:hover {
        color: var(--tdt-text);
      }

      .height-option--active {
        border-color: var(--tdt-accent);
        color: var(--tdt-accent);
      }
    `
  ];

  constructor() {
    super();
    this.settings = settingsService.getAll();
    this.isRecordingShortcut = false;
    this.tempShortcut = null;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = settingsService.subscribe(() => {
      this.settings = settingsService.getAll();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    this._stopRecordingShortcut();
  }

  _handleThemeChange(theme) {
    settingsService.set('theme', theme);
    this._dispatchSettingsChanged();
  }

  _handleFontSizeChange(fontSize) {
    settingsService.set('fontSize', fontSize);
    this._dispatchSettingsChanged();
  }

  _handlePersistenceChange() {
    const newValue = !this.settings.persistAcrossSessions;
    settingsService.set('persistAcrossSessions', newValue);
  }

  _handleDefaultTabChange(tab) {
    settingsService.set('defaultTab', tab);
    this._dispatchSettingsChanged();
  }

  _handlePanelHeightChange(height) {
    settingsService.set('panelHeight', height);
    this._dispatchSettingsChanged();
  }

  _handlePanelPositionChange(position) {
    settingsService.set('panelPosition', position);
    this._dispatchSettingsChanged();
  }

  _startRecordingShortcut() {
    this.isRecordingShortcut = true;
    this.tempShortcut = null;

    this._recordingHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier-only keys
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      // Capture the shortcut
      this.tempShortcut = {
        key: e.key.toUpperCase(),
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      };

      // Save and stop recording
      settingsService.set('keyboardShortcut', this.tempShortcut);
      this._stopRecordingShortcut();
      this._dispatchSettingsChanged();
    };

    document.addEventListener('keydown', this._recordingHandler, { capture: true });
  }

  _stopRecordingShortcut() {
    this.isRecordingShortcut = false;
    if (this._recordingHandler) {
      document.removeEventListener('keydown', this._recordingHandler, { capture: true });
      this._recordingHandler = null;
    }
  }

  _cancelRecordingShortcut() {
    this.tempShortcut = null;
    this._stopRecordingShortcut();
  }

  _resetShortcut() {
    settingsService.set('keyboardShortcut', DEFAULT_SETTINGS.keyboardShortcut);
    this._dispatchSettingsChanged();
  }

  _resetAllSettings() {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      settingsService.reset();
      this._dispatchSettingsChanged();
    }
  }

  _dispatchSettingsChanged() {
    this.dispatchEvent(new CustomEvent('settings-changed', {
      bubbles: true,
      composed: true,
    }));
  }

  _formatShortcutKey(shortcut) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const parts = [];

    if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
    if (shortcut.meta) parts.push(isMac ? '⌘' : 'Win');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');

    return { modifiers: parts, key: shortcut.key };
  }

  render() {
    const { modifiers, key } = this._formatShortcutKey(this.settings.keyboardShortcut);

    return html`
      <div class="settings-container">
        <div class="section">
          <div class="section-title">
            Appearance
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Theme</div>
              <div class="setting-description">Choose the color scheme for the devtools panel</div>
              <div class="theme-preview">
                <div
                  class="theme-option-wrapper ${this.settings.theme === 'dark' ? 'theme-option-wrapper--active' : ''}"
                  @click=${() => this._handleThemeChange('dark')}
                >
                  <div class="theme-option theme-option--dark ${this.settings.theme === 'dark' ? 'theme-option--active' : ''}">
                    <span class="theme-icon">🌙</span>
                  </div>
                  <div class="theme-label">Dark</div>
                </div>
                <div
                  class="theme-option-wrapper ${this.settings.theme === 'light' ? 'theme-option-wrapper--active' : ''}"
                  @click=${() => this._handleThemeChange('light')}
                >
                  <div class="theme-option theme-option--light ${this.settings.theme === 'light' ? 'theme-option--active' : ''}">
                    <span class="theme-icon">☀️</span>
                  </div>
                  <div class="theme-label">Light</div>
                </div>
                <div
                  class="theme-option-wrapper ${this.settings.theme === 'system' ? 'theme-option-wrapper--active' : ''}"
                  @click=${() => this._handleThemeChange('system')}
                >
                  <div class="theme-option theme-option--system ${this.settings.theme === 'system' ? 'theme-option--active' : ''}">
                    <span class="theme-icon">⚙️</span>
                  </div>
                  <div class="theme-label">Auto</div>
                </div>
              </div>
            </div>
            <div class="setting-control">
              <select
                class="select"
                .value=${this.settings.theme}
                @change=${(e) => this._handleThemeChange(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Font Size</div>
              <div class="setting-description">Adjust the text size in the devtools panel</div>
              <div class="font-preview">
                <span
                  class="font-option font-option--small ${this.settings.fontSize === 'small' ? 'font-option--active' : ''}"
                  @click=${() => this._handleFontSizeChange('small')}
                >Small</span>
                <span
                  class="font-option font-option--medium ${this.settings.fontSize === 'medium' ? 'font-option--active' : ''}"
                  @click=${() => this._handleFontSizeChange('medium')}
                >Medium</span>
                <span
                  class="font-option font-option--large ${this.settings.fontSize === 'large' ? 'font-option--active' : ''}"
                  @click=${() => this._handleFontSizeChange('large')}
                >Large</span>
              </div>
            </div>
            <div class="setting-control">
              <select
                class="select"
                .value=${this.settings.fontSize}
                @change=${(e) => this._handleFontSizeChange(e.target.value)}
              >
                <option value="small">Small (11px)</option>
                <option value="medium">Medium (12px)</option>
                <option value="large">Large (14px)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Panel
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Default Tab</div>
              <div class="setting-description">Which panel opens by default when devtools loads</div>
            </div>
            <div class="setting-control">
              <select
                class="select"
                .value=${this.settings.defaultTab}
                @change=${(e) => this._handleDefaultTabChange(e.target.value)}
              >
                ${PreferencesPanel.AVAILABLE_TABS.map(tab => html`
                  <option value="${tab.id}">${tab.label}</option>
                `)}
              </select>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Panel Height</div>
              <div class="setting-description">Default height of the devtools panel</div>
              <div class="height-preview">
                <span
                  class="height-option ${this.settings.panelHeight === '40' ? 'height-option--active' : ''}"
                  @click=${() => this._handlePanelHeightChange('40')}
                >40%</span>
                <span
                  class="height-option ${this.settings.panelHeight === '50' ? 'height-option--active' : ''}"
                  @click=${() => this._handlePanelHeightChange('50')}
                >50%</span>
                <span
                  class="height-option ${this.settings.panelHeight === '60' ? 'height-option--active' : ''}"
                  @click=${() => this._handlePanelHeightChange('60')}
                >60%</span>
                <span
                  class="height-option ${this.settings.panelHeight === '70' ? 'height-option--active' : ''}"
                  @click=${() => this._handlePanelHeightChange('70')}
                >70%</span>
              </div>
            </div>
            <div class="setting-control">
              <select
                class="select"
                .value=${this.settings.panelHeight}
                @change=${(e) => this._handlePanelHeightChange(e.target.value)}
              >
                <option value="40">40% (Compact)</option>
                <option value="50">50% (Default)</option>
                <option value="60">60% (Tall)</option>
                <option value="70">70% (Taller)</option>
              </select>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Panel Position</div>
              <div class="setting-description">Where the devtools panel appears on the screen</div>
              <div class="position-preview">
                <div
                  class="position-option-wrapper ${this.settings.panelPosition === 'bottom' ? 'position-option-wrapper--active' : ''}"
                  @click=${() => this._handlePanelPositionChange('bottom')}
                >
                  <div class="position-option position-option--bottom ${this.settings.panelPosition === 'bottom' ? 'position-option--active' : ''}">
                    <div class="position-option__inner"></div>
                  </div>
                  <div class="position-label">Bottom</div>
                </div>
                <div
                  class="position-option-wrapper ${this.settings.panelPosition === 'floating' ? 'position-option-wrapper--active' : ''}"
                  @click=${() => this._handlePanelPositionChange('floating')}
                >
                  <div class="position-option position-option--floating ${this.settings.panelPosition === 'floating' ? 'position-option--active' : ''}">
                    <div class="position-option__inner"></div>
                  </div>
                  <div class="position-label">Floating</div>
                </div>
              </div>
            </div>
            <div class="setting-control">
              <select
                class="select"
                .value=${this.settings.panelPosition}
                @change=${(e) => this._handlePanelPositionChange(e.target.value)}
              >
                <option value="bottom">Bottom</option>
                <option value="floating">Floating</option>
              </select>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Storage
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Persist Across Sessions</div>
              <div class="setting-description">
                ${this.settings.persistAcrossSessions
                  ? 'Settings are saved to localStorage and persist after browser restart'
                  : 'Settings are saved to sessionStorage and reset when the browser closes'}
              </div>
            </div>
            <div class="setting-control">
              <div
                class="toggle ${this.settings.persistAcrossSessions ? 'toggle--active' : ''}"
                @click=${this._handlePersistenceChange}
                role="switch"
                aria-checked=${this.settings.persistAcrossSessions}
              ></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Keyboard Shortcut
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Toggle Panel</div>
              <div class="setting-description">Keyboard shortcut to show/hide the devtools panel</div>
              ${this.isRecordingShortcut ? html`
                <div class="shortcut-hint">Press any key combination...</div>
              ` : ''}
            </div>
            <div class="setting-control">
              <div class="shortcut-display">
                <div class="shortcut-keys">
                  ${this.isRecordingShortcut ? html`
                    <span class="key key--recording">...</span>
                  ` : html`
                    ${modifiers.map(mod => html`<span class="key">${mod}</span>`)}
                    <span class="key">${key}</span>
                  `}
                </div>
                ${this.isRecordingShortcut ? html`
                  <button
                    class="shortcut-btn shortcut-btn--recording"
                    @click=${this._cancelRecordingShortcut}
                  >Cancel</button>
                ` : html`
                  <button
                    class="shortcut-btn"
                    @click=${this._startRecordingShortcut}
                  >Change</button>
                  <button
                    class="shortcut-btn"
                    @click=${this._resetShortcut}
                    title="Reset to default (Ctrl+Shift+D)"
                  >Reset</button>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="reset-section">
          <button class="reset-btn" @click=${this._resetAllSettings}>
            Reset All Settings to Defaults
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('tdt-preferences-panel', PreferencesPanel);
