import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStyles} from '../../../styles/grid-layout-styles';

/**
 * @customElement
 * @polymer
 */
class EngagementDetails extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
      </style>
      ${gridLayoutStyles}

      <etools-content-panel panel-title="Assessment Information">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown label="Partner Organization to Assess"
          class="row-padding-v">
        </etools-dropdown>

        <datepicker-lite label="Assessment Date"
          class="row-padding-v"
          selected-date-display-format="D MMM YYYY">
        </datepicker-lite>


      </etools-content-panel>
    `;
  }

}

window.customElements.define('engagement-details', EngagementDetails);
