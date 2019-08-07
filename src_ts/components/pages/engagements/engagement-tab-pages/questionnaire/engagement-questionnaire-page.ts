import {LitElement, html} from 'lit-element';
import './questionnaire-item';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';

/**
 * @customElement
 */
class EngagementQuestionnairePage extends LitElement {

  render() {
    // language=HTML
    return html`
      ${gridLayoutStylesLit}
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
        .overall {
          padding: 16px 0;
          margin-bottom: 32px;
          font-size: 24px;
          color: white;
          background-color: var(--primary-shade-of-green);
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        .r-align {
          text-align: right;
        }
        .l-align {
          text-align: left;
        }
      </style>

      <div class="overall layout-horizontal">
        <div class="col-5 r-align">Overall Assessment:</div><div class="col-1"></div>
        <div class="col-6 l-align"> Positive</div>
      </div>
      <questionnaire-item></questionnaire-item>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

}

window.customElements.define('engagement-questionnaire-page', EngagementQuestionnairePage);
