import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import './unicef-staff-assessor';
import './assessing-firm';
import './external-individual';
import {GenericObject} from '../../../../../types/globals';
import {LitElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStylesLit} from '../../../../styles/button-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';


/**
 * @customElement
 * @LitElement
 */
class AssessorInfo extends LitElement {

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

      </style>
      ${gridLayoutStylesLit}${buttonsStylesLit}${labelAndvalueStylesLit}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <label class="paper-label">Assessor is:</label>
          <paper-radio-group .selected="${this.engagement.assessor_type}" @selected-changed="${e => this._assessorTypeChanged(e.target.selected)}">
            <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
            <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
            <paper-radio-button name="external">External Individual</paper-radio-button>
          </paper-radio-group>
        </div>

        ${this._getTemplateByAssessorType(this.engagement.assessor_type)}

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

  _getTemplateByAssessorType(assessorType: string) {
    switch(assessorType) {
      case 'staff':
        return html`
         <unicef-staff-assessor></unicef-staff-assessor>
        `;
      case 'firm':
        return html`
          <assessing-firm></assessing-firm>
        `;
      case 'external':
        return html`
          <external-individual></external-individual>
        `;
      default:
        return '';
    }
  }

  _assessorTypeChanged(selected: string) {
    this.engagement.assessor_type = selected;
    this.requestUpdate();
  }



}
window.customElements.define('assessor-info', AssessorInfo);
