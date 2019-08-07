import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './questionnaire-item';

/**
 * @customElement
 * @polymer
 */
class EngagementQuestionnairePage extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
        .overall {
          padding: 24px 0;
          margin-bottom: 32px;
          font-size: 22px;
          font-weight: 600;
          color: white;
          text-align: center;
          background-color: green;
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
      </style>

      <div class="overall" elevation="1">
        Overall Assessment: Positive
      </div>
      <questionnaire-item></questionnaire-item>
    `;
  }

  static get properties() {
    return {};
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
