import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/paper-radio-group';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {buttonsStyles} from '../../../../styles/button-styles';
import './unicef-staff-assessor';
import './assessing-firm';
import './external-individual';
import {labelAndvalueStyles} from '../../../../styles/label-and-value-styles';
import {GenericObject} from '../../../../../types/globals';


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
      ${gridLayoutStyles}${buttonsStyles}${labelAndvalueStyles}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <label class="paper-label">Assessor is:</label>
        <paper-radio-group selected="{{engagement.assessor_type}}">
          <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
          <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
          <paper-radio-button name="external">External Individual</paper-radio-button>
        </paper-radio-group>

        <template is="dom-if" if="[[_isActive(engagement.assessor_type, 'staff')]]">
          <unicef-staff-assessor></unicef-staff-assessor>
        </template>
        <template is="dom-if" if="[[_isActive(engagement.assessor_type, 'firm')]]">
          <assessing-firm></assessing-firm>
        </template>
        <template is="dom-if" if="[[_isActive(engagement.assessor_type, 'external')]]">
          <external-individual></external-individual>
        </template>

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
  engagement: GenericObject = {assessor_type: 'staff'};

  _isActive(selectedAssessor, expected) {
    return selectedAssessor === expected;
  }



}
window.customElements.define('assessor-info', AssessorInfo);
