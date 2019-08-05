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
        /* CSS rules for your element */
      </style>

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
