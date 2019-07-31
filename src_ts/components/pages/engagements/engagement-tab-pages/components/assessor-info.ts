import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/paper-radio-group';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {buttonsStyles} from '../../../../styles/button-styles';

/**
 * @customElement
 * @polymer
 */
class AssessorInfo extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      ${gridLayoutStyles}${buttonsStyles}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        Assessor is:
        <paper-radio-group selected="[[assessment.assessor_type]]">
          <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
          <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
          <paper-radio-button name="external">External Individual</paper-radio-button>
        </paper-radio-group>

        <unicef-staff-assessor></unicef-staff-assessor>
        <assessing-firm></assessing-firm>
        <external-individual></external-individual>

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
}
window.customElements.define('assessor-info', AssessorInfo);
