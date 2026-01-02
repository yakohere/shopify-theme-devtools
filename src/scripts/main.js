import '../styles/main.css';
import './components/theme-devtools.js';

const ROOT_ID = '__THEME_DEVTOOLS_ROOT__';

function init() {
  const rootEl = document.getElementById(ROOT_ID);
  if (!rootEl) {
    console.warn('[Theme Devtools] Root element not found');
    return;
  }

  const devtools = document.createElement('theme-devtools');
  rootEl.appendChild(devtools);
  
  window.__THEME_DEVTOOLS__ = devtools;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
