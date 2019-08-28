import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import './assessing-firm';
import './external-individual';
import {GenericObject, UnicefUser} from '../../../../../types/globals';
import {LitElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch} from '../../../../utils/utils';


/**
 * @customElement
 * @LitElement
 */
class AssessorInfo extends connect(store)(LitElement) {

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          font-size: 16px;
        }

      </style>
      ${gridLayoutStylesLit}${buttonsStyles}${labelAndvalueStylesLit}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <label class="paper-label">Assessor is:</label>
          <paper-radio-group .selected="${this.engagement.assessor_type}"
              @selected-changed="${(e: CustomEvent) => this._assessorTypeChanged((e.target as PaperRadioGroupElement)!.selected!)}">
            <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
            <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
            <paper-radio-button name="external">External Individual</paper-radio-button>
          </paper-radio-group>
        </div>

        ${this._getTemplateByAssessorType(this.engagement.assessor_type)}

        <div class="layout-horizontal right-align row-padding-v">
          <paper-button class="default">
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

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }

  }

  _getTemplateByAssessorType(assessorType: string) {
    switch (assessorType) {
      case 'staff':
        return html`
          <etools-dropdown label="Unicef Staff" class="row-padding-v"
            .options="${this.unicefUsers}"
            option-label="name"
            option-value="id">
          </etools-dropdown>
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

  _assessorTypeChanged(selected: any) {
    this.engagement.assessor_type = selected;
    this.requestUpdate();
  }


}
window.customElements.define('assessor-info', AssessorInfo);
