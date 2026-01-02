import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';
import { sectionHighlighter } from '../../services/sections.js';

export class SectionsPanel extends LitElement {
  static properties = {
    sections: { type: Array, state: true },
    activeSection: { type: String, state: true },
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

      .header {
        margin-bottom: 12px;
      }

      .section-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .section-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--tdt-bg-secondary);
        border: 1px solid var(--tdt-border);
        border-radius: var(--tdt-radius);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .section-item:hover {
        background: var(--tdt-bg-hover);
        border-color: var(--tdt-accent);
      }

      .section-item--active {
        border-color: var(--tdt-accent);
        background: rgba(59, 130, 246, 0.1);
      }

      .section-id {
        font-weight: 600;
        color: var(--tdt-text);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .section-type {
        color: var(--tdt-accent);
        font-size: 11px;
      }

      .section-blocks {
        color: var(--tdt-text-muted);
        font-size: 11px;
      }
    `
  ];

  constructor() {
    super();
    this.sections = [];
    this.activeSection = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._refreshSections();
  }

  _refreshSections() {
    this.sections = sectionHighlighter.findSections();
  }

  _handleSectionClick(sectionId) {
    this.activeSection = sectionId;
    sectionHighlighter.highlight(sectionId);
  }

  _handleSectionLeave() {
    this.activeSection = null;
    sectionHighlighter.hide();
  }

  render() {
    return html`
      <div class="header">
        <button class="btn btn--sm" @click=${this._refreshSections}>↻ Refresh</button>
      </div>

      ${this.sections.length === 0 
        ? html`<div class="empty-state">No sections found on this page</div>`
        : html`
          <div class="section-list">
            ${this.sections.map(section => html`
              <div
                class="section-item ${this.activeSection === section.id ? 'section-item--active' : ''}"
                @click=${() => this._handleSectionClick(section.id)}
                @mouseleave=${this._handleSectionLeave}
              >
                <span class="section-id">${section.id}</span>
                <span class="section-type">${section.type}</span>
                <span class="section-blocks">${section.blockCount} blocks</span>
              </div>
            `)}
          </div>
        `
      }
    `;
  }
}

customElements.define('tdt-sections-panel', SectionsPanel);

