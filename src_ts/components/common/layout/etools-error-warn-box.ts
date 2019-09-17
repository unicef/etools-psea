import {LitElement, html, customElement, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-button/paper-button.js';
import {SharedStylesLit} from '../../styles/shared-styles-lit';
import {buttonsStyles} from '../../styles/button-styles';
import {gridLayoutStylesLit} from '../../styles/grid-layout-styles-lit';

/**
 * @LitElement
 * @customElement
 */

@customElement('etools-error-warn-box')
export class EtoolsErrorWarnBox extends LitElement {

  public render() {
    // language=HTML
    return html`
      ${SharedStylesLit} ${gridLayoutStylesLit} ${buttonsStyles}
      <style>
        :host {
          width: 100%;
        }
        :host([hidden]) {
          display: none;
        }

        .warning {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 16px 24px;
          background-color: var(--lightest-info-color);
        }
        .warning p {
          margin: 0;
        }
        .warning p + p {
          margin-top: 12px;
        }


        etools-content-panel {
          width: 100%;
        }
        .errors-box {
          margin-bottom: 25px;
        }

        .errors-box {
          --epc-header: {
            background-color: var(--error-box-heading-color);
          }
          --epc-header-color: var(---primary-background-color);
          --ecp-header-title: {
            text-align: center;
          }
          --ecp-content: {
            color: var(--error-box-text-color);
            background-color: var(--error-box-bg-color);
            border-color: var(--error-box-border-color);
          };
        }
        ul {
          padding: 0 0 0 20px;
          margin: 0;
        }
        .errors-box-actions {
          margin-top: 20px;
          @apply --layout-horizontal;
          @apply --layout-end-justified;
        }
        paper-button {
          margin: 0;
        }
        .cancel-li-display {
          display: block;
        }
      </style>

      ${this.getHTML()}
    `;
  }

  @property({type: String})
  alertType: string = '';

  @property({type: String})
  title!: string;

  @property({type: Array})
  messages: string[] = [];

  startsWithEmptySpace(val: string) {
    return val.startsWith(' ');
  }

  getHTML() {
    if (this.alertType === 'warning') {
      return html`
        ${this.messages.map(msg => this.getWarningHTML(msg))}
      `;
    }
    if (this.alertType === 'error') {
      return html`
      <etools-content-panel class="errors-box" panel-title="${this.title}">
          <ul>
            ${this.messages.map(msg => this.getErrorHTML(msg))}
          </ul>
          <div class="errors-box-actions">
            <paper-button class="primary-btn danger-btn"
                          @tap="${this.resetErrors}">
              Ok
            </paper-button>
          </div>
      </etools-content-panel>
      `;
    }
    return html``;
  }

  getWarningHTML(msg: string) {
    return html`
    <div class="warning">
      <p>${msg}</p>
    </div>
    `;
  }

  getErrorHTML(msg: string) {
    return html`
    ${this.startsWithEmptySpace(msg) ? html`<li>${msg}</li>` : html`<li class="cancel-li-display">${msg}</li>`}
    `;
  }

  resetErrors() {
    this.messages = [];
  }

}
