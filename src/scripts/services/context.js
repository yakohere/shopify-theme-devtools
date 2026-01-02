const CONTEXT_ID = '__THEME_DEVTOOLS_CONTEXT__';

class ContextParser {
  constructor() {
    this.context = null;
  }

  parse() {
    const contextEl = document.getElementById(CONTEXT_ID);
    if (!contextEl) {
      console.warn('[Theme Devtools] Context element not found');
      return null;
    }

    try {
      this.context = JSON.parse(contextEl.textContent);
      return this.context;
    } catch (e) {
      console.error('[Theme Devtools] Failed to parse context:', e);
      return null;
    }
  }

  get(path) {
    if (!this.context) return undefined;
    return path.split('.').reduce((obj, key) => obj?.[key], this.context);
  }

  getMeta() {
    return this.context?.meta || {};
  }

  getObjects() {
    return this.context?.objects || {};
  }
}

export const contextParser = new ContextParser();
