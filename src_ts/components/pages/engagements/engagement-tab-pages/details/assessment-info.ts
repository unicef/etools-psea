import {LitElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {GenericObject, UnicefUser} from '../../../../../types/globals';
import './partner-details';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {makeRequest} from '../../../../utils/request-helper';
import {isJsonStrMatch} from '../../../../utils/utils';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

/**
 * @customElement
 * @LitElement
 */
class AssessmentInfo extends connect(store)(LitElement) {

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      ${SharedStylesLit}${gridLayoutStylesLit} ${buttonsStyles}
      <etools-content-panel panel-title="Assessment Information">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown label="Partner Organization to Assess"
          class="row-padding-v col-6 w100"
          ?readonly="${this.readonly}"
          .options="${this.partners}"
          option-value="id"
          option-label="name"
          trigger-value-change-event
          @etools-selected-item-changed="${this._setSelectedPartner}">
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner)}

        <etools-dropdown label="UNICEF Focal Point"
          class="row-padding-v"
          .options="${this.unicefUsers}"
          option-label="name"
          option-value="id"
          enable-none-option>
        </etools-dropdown>

        <datepicker-lite label="Assessment Date"
          class="row-padding-v"
          selected-date-display-format="D MMM YYYY">
        </datepicker-lite>

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
  engagement!: GenericObject;

  @property({type: Object})
  partners!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  readonly: boolean = false;

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Array})
  staffMembers: GenericObject[] = [];

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }

  }

  connectedCallback() {
    super.connectedCallback();
    this._getPartners();
  }

  _getPartners() {
    makeRequest(etoolsEndpoints.partners)
      .then((resp: any) => this.partners = resp)
      .catch((err: any) => console.log(err));
  }

  _allowEdit() {

  }

  _showPartnerDetails(selectedPartner: GenericObject) {
    return selectedPartner ?
      html`<partner-details .partner="${this.selectedPartner}" .staffMembers="${this.staffMembers}">
      </partner-details>`: '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;

    makeRequest(getEndpoint('partnerStaffMembers', {id: this.selectedPartner.id}))
      .then((resp: any[]) => {this.staffMembers = resp;})
      .catch((err: any) => {this.staffMembers = []; logError(err)});
  }

}

window.customElements.define('assessment-info', AssessmentInfo);
