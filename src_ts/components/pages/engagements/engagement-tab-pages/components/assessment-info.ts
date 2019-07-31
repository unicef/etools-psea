import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {buttonsStyles} from '../../../../styles/button-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/globals';
import './partner-details';

/**
 * @customElement
 * @polymer
 */
class AssessmentInfo extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      ${gridLayoutStyles} ${buttonsStyles}
      <etools-content-panel panel-title="Assessment Information">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown label="Partner Organization to Assess"
          class="row-padding-v col-6 w100"
          trigger-value-change-event
          on-etools-selected-item-changed="_showPartnerDetails">
        </etools-dropdown>

        <partner-details partner="[[selectedPartner]]">
        </partner-details>

        <datepicker-lite label="Assessment Date"
          class="row-padding-v"
          selected-date-display-format="D MMM YYYY">
        </datepicker-lite>

        <div class="layout-horizontal right-align row-padding-v">
          <paper-button class="grey">
            Cancel
          </paper-button>
          <paper-button class="primary">
            Save
          </paper-button>
        </div>

      </etools-content-panel>
    `;
  }

  @property({type: Object})
  assessment!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  _allowEdit() {

  }

  _showPartnerDetails() {

  }

}

window.customElements.define('assessment-info', AssessmentInfo)
