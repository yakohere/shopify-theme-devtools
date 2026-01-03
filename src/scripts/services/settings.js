/**
 * Settings service for Theme Devtools
 * Handles persistence and retrieval of user preferences
 */

const DEFAULT_SETTINGS = {
  // Appearance
  theme: 'dark', // 'dark', 'light', 'system'
  fontSize: 'medium', // 'small', 'medium', 'large'

  // Panel
  defaultTab: 'objects', // Which tab opens by default
  panelHeight: '50', // '40', '50', '60' (percentage)
  panelPosition: 'bottom', // 'bottom', 'floating'

  // Storage
  persistAcrossSessions: true, // true = localStorage, false = sessionStorage

  // Keyboard shortcut
  keyboardShortcut: {
    key: 'D',
    ctrl: true,
    shift: true,
    alt: false,
    meta: false, // Cmd on Mac
  },
};

class SettingsService {
  static STORAGE_KEY = 'tdt-settings';

  constructor() {
    this._settings = { ...DEFAULT_SETTINGS };
    this._listeners = new Set();
    this._load();
  }

  /**
   * Get all settings
   */
  getAll() {
    return { ...this._settings };
  }

  /**
   * Get a specific setting
   */
  get(key) {
    return this._settings[key];
  }

  /**
   * Update a setting
   */
  set(key, value) {
    const oldValue = this._settings[key];
    this._settings[key] = value;
    this._save();
    this._notify(key, value, oldValue);
  }

  /**
   * Update multiple settings at once
   */
  setMultiple(updates) {
    const changes = {};
    for (const [key, value] of Object.entries(updates)) {
      if (this._settings[key] !== value) {
        changes[key] = { old: this._settings[key], new: value };
        this._settings[key] = value;
      }
    }
    this._save();
    for (const [key, { old: oldValue, new: newValue }] of Object.entries(changes)) {
      this._notify(key, newValue, oldValue);
    }
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    this._settings = { ...DEFAULT_SETTINGS };
    this._save();
    this._notify('*', this._settings, null);
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Get the storage mechanism based on persistAcrossSessions setting
   */
  getStorage() {
    return this._settings.persistAcrossSessions ? localStorage : sessionStorage;
  }

  /**
   * Check if a keyboard event matches the configured shortcut
   */
  matchesShortcut(event) {
    const shortcut = this._settings.keyboardShortcut;

    const keyMatch = event.key.toUpperCase() === shortcut.key.toUpperCase();
    const ctrlMatch = event.ctrlKey === shortcut.ctrl;
    const shiftMatch = event.shiftKey === shortcut.shift;
    const altMatch = event.altKey === shortcut.alt;
    const metaMatch = event.metaKey === shortcut.meta;

    // On Mac, Ctrl+Shift is often Cmd+Shift
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if (isMac && shortcut.ctrl && !shortcut.meta) {
      // Allow Cmd to act as Ctrl on Mac
      return keyMatch && (ctrlMatch || event.metaKey) && shiftMatch && altMatch;
    }

    return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
  }

  /**
   * Format the keyboard shortcut for display
   */
  formatShortcut() {
    const shortcut = this._settings.keyboardShortcut;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const parts = [];
    if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
    if (shortcut.meta) parts.push(isMac ? '⌘' : 'Win');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? '' : '+');
  }


  _load() {
    try {
      // Try localStorage first (for cross-session persistence)
      let stored = localStorage.getItem(SettingsService.STORAGE_KEY);

      // Fall back to sessionStorage
      if (!stored) {
        stored = sessionStorage.getItem(SettingsService.STORAGE_KEY);
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        this._settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('[Theme Devtools] Failed to load settings:', e);
    }
  }

  _save() {
    try {
      const json = JSON.stringify(this._settings);

      if (this._settings.persistAcrossSessions) {
        localStorage.setItem(SettingsService.STORAGE_KEY, json);
        // Clean up sessionStorage if switching to localStorage
        sessionStorage.removeItem(SettingsService.STORAGE_KEY);
      } else {
        sessionStorage.setItem(SettingsService.STORAGE_KEY, json);
        // Clean up localStorage if switching to sessionStorage
        localStorage.removeItem(SettingsService.STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[Theme Devtools] Failed to save settings:', e);
    }
  }

  _notify(key, newValue, oldValue) {
    this._listeners.forEach(callback => {
      try {
        callback(key, newValue, oldValue);
      } catch (e) {
        console.error('[Theme Devtools] Settings listener error:', e);
      }
    });
  }
}

export const settingsService = new SettingsService();
export { DEFAULT_SETTINGS };
