import { LitElement, html, css } from 'lit';
import { baseStyles } from '../../styles/theme.js';

export class InfoPanel extends LitElement {
  static properties = {
    meta: { type: Object },
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

      .section {
        margin-bottom: 16px;
      }

      .section__title {
        font-size: calc(11px * var(--tdt-scale, 1));
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--tdt-text-muted);
        margin: 0 0 8px 0;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--tdt-border);
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table td {
        padding: 4px 0;
        vertical-align: top;
      }

      .table__label {
        color: var(--tdt-text-muted);
        width: 120px;
      }

      .table__value {
        color: var(--tdt-text);
        word-break: break-all;
      }
    `
  ];

  constructor() {
    super();
    this.meta = {};
  }

  _renderSection(title, items) {
    return html`
      <div class="section">
        <h4 class="section__title">${title}</h4>
        <table class="table">
          ${items.map(([label, value]) => html`
            <tr>
              <td class="table__label">${label}</td>
              <td class="table__value">${value ?? '—'}</td>
            </tr>
          `)}
        </table>
      </div>
    `;
  }

  render() {
    if (!this.meta) {
      return html`<div class="empty-state">No metadata available</div>`;
    }

    const sections = [
      {
        title: 'Theme',
        items: [
          ['ID', this.meta.theme?.id],
          ['Name', this.meta.theme?.name],
          ['Role', this.meta.theme?.role],
        ]
      },
      {
        title: 'Template',
        items: [
          ['Name', this.meta.template?.name],
          ['Suffix', this.meta.template?.suffix || '—'],
          ['Directory', this.meta.template?.directory || '—'],
        ]
      },
      {
        title: 'Request',
        items: [
          ['Page Type', this.meta.request?.page_type],
          ['Path', this.meta.request?.path],
          ['Host', this.meta.request?.host],
          ['Design Mode', this.meta.request?.design_mode ? 'Yes' : 'No'],
          ['Visual Preview', this.meta.request?.visual_preview_mode ? 'Yes' : 'No'],
        ]
      },
      {
        title: 'Localization',
        items: [
          ['Locale', `${this.meta.request?.locale?.name || ''} (${this.meta.request?.locale?.iso_code || ''})`],
          ['Country', `${this.meta.localization?.country?.name || ''} (${this.meta.localization?.country?.iso_code || ''})`],
          ['Currency', `${this.meta.localization?.country?.currency?.symbol || ''} ${this.meta.localization?.country?.currency?.iso_code || ''}`],
          ['Market', this.meta.localization?.market?.handle || '—'],
        ]
      }
    ];

    return html`
      ${sections.map(section => this._renderSection(section.title, section.items))}
    `;
  }
}

customElements.define('tdt-info-panel', InfoPanel);

