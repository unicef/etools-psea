import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import './assessing-firm';
import './external-individual';
import './firm-staff-members';
import { UnicefUser} from '../../../../../types/globals';
import {LitElement, html, property, query} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch} from '../../../../utils/utils';
import {Assessor, AssessorTypes} from '../../../../../types/engagement';
import {AssessingFirmElement} from './assessing-firm';
import {ExternalIndividualElement} from './external-individual';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {FirmStaffMembersEl} from './firm-staff-members';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {getEndpoint} from '../../../../../endpoints/endpoints';


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
          font-size: 16px;
        }

        etools-content-panel {
          display: block;
          margin-bottom: 24px;
        }

      </style>
      ${SharedStylesLit}${gridLayoutStylesLit}${buttonsStyles}${labelAndvalueStylesLit}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowEdit"
                icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <label class="paper-label">Assessor is:</label>
          <paper-radio-group .selected="${this.assessor.assessor_type}"
              @selected-changed="${(e: CustomEvent) => this._assessorTypeChanged((e.target as PaperRadioGroupElement)!.selected!)}">
            <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
            <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
            <paper-radio-button name="external">External Individual</paper-radio-button>
          </paper-radio-group>
        </div>

        ${this._getTemplateByAssessorType(this.assessor.assessor_type)}

        <div class="layout-horizontal right-align row-padding-v">
          <paper-button class="default">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.saveAssessor}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>

      <firm-staff-members  id="firmStaffMembers" ?hidden="${this.hideFirmStaffMembers(this.assessor.assessor_type)}"></firm-staff-members>
    `;
  }

  @property({type: Object})
  assessor = new Assessor();

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Object})
  assessmentId!: string | number;

  @query('#assessingFirm')
  assessingFirmElement!: AssessingFirmElement;

  @query('#externalIndividual')
  externalIndividualElement!: ExternalIndividualElement;

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }
    if (state.app!.routeDetails!.params) {
      let engagementId = state.app!.routeDetails.params.engagementId;
      if (this.assessmentId !== engagementId) {
        this.assessmentId = engagementId;
        this.setPageData(this.assessmentId);
      }
    }

  }

  setPageData(assessmentId: string | number) {
    if (!assessmentId || assessmentId === 'new') {
      this.assessor = new Assessor();
      return;
    }
    let url = getEndpoint(etoolsEndpoints.assessor, {id: assessmentId}).url!;
    makeRequest(new RequestEndpoint(url, 'GET'))
      .then(resp => this.assessor = resp)
      .catch((err) => this._handleErrorrOnGetAssessor(err));
  }

  _handleErrorrOnGetAssessor(err: any) {
    if (err.status === 404) {
      this.assessor = new Assessor();
    } else {
      fireEvent(this, 'toast', {text: 'Error on getting assessor data'})
    }
  }

  _getTemplateByAssessorType(assessorType: string) {
    switch (assessorType) {
      case 'staff':
        return html`
          <etools-dropdown label="Unicef Staff" class="row-padding-v"
            .options="${this.unicefUsers}"
            .selected="${this.assessor.user}"
            trigger-value-change-event
            @etools-selected-item-changed="${this._setSelectedUnicefUser}"
            option-label="name"
            option-value="id">
          </etools-dropdown>
        `;
      case 'firm':
        return html`
          <assessing-firm id="assessingFirm" .assessor="${this.assessor}"></assessing-firm>
        `;
      case 'external':
        return html`
          <external-individual id="externalIndividual" .assessor="${this.assessor}"></external-individual>
        `;
      default:
        return '';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.firmChanged = this.firmChanged.bind(this);
    this.addEventListener('firm-changed', this.firmChanged as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('firm-changed', this.firmChanged as any);
  }

  firmChanged(e: CustomEvent) {
    let firmStaffMembersEl = this.shadowRoot!.querySelector('#firmStaffMembers') as FirmStaffMembersEl;
    firmStaffMembersEl.hidden = false;
    firmStaffMembersEl.populateStaffMembersList(e.detail.id);
  }

  hideFirmStaffMembers(assessorType: AssessorTypes) {
    if (!assessorType) {
      return true;
    }
    if ([AssessorTypes.Staff, AssessorTypes.ExternalIndividual].includes(assessorType)) {
      return true;
    }

    return false;
  }

  _assessorTypeChanged(selected: any) {
    this.assessor.assessor_type = selected;
    this.requestUpdate();
  }

  _setSelectedUnicefUser(event: CustomEvent) {
    let selectedUser = event.detail.selectedItem;
    if (selectedUser) {
      this.assessor.user = selectedUser.id;
    } else {
      this.assessor.user = null;
    }
    this.requestUpdate();
  }

  saveAssessor() {
    if (!this.validate()) {
      return;
    }

    let endpointData = new RequestEndpoint(this._getUrl(),
       this._getMethod());

    makeRequest(endpointData, this.collectAssessorData())
      .then((resp) => this.assessor = resp)
      .catch((err) =>  fireEvent(this, 'toast', {text: formatServerErrorAsText(err), showCloseBtn: true}));
  }

  _getMethod() {
    return this.assessor.id ? 'PATCH' : 'POST';
  }

  _getUrl() {
    let baseUrl = getEndpoint(etoolsEndpoints.assessor, {id: this.assessmentId}).url!;
    return this.assessor.id ? baseUrl + this.assessor.id + '/' : baseUrl;
  }

  collectAssessorData() {
    let assessorPart1 = { assessor_type: this.assessor.assessor_type };

    switch (this.assessor.assessor_type) {
      case AssessorTypes.Staff:
        return {
            ...assessorPart1,
            ...this._getDataForStaffAssessor()
          };
      case AssessorTypes.Firm:
        return {
          ...assessorPart1,
          ...this._getDataForFirmAssessor()
        };
      case AssessorTypes.ExternalIndividual:
          return {
            ...assessorPart1,
            ...this._getDataForExternalIndivAssessor()
          };
      default:
        return {};
    }
  }

  _getDataForStaffAssessor() {
    return {user: this.assessor.user};
  }

  _getDataForFirmAssessor() {
    return this.assessingFirmElement.getAssessorForSave();
  }

  _getDataForExternalIndivAssessor() {
    return this.externalIndividualElement.getAssessorForSave();
  }


  validate() {
    return true;
  }


}
window.customElements.define('assessor-info', AssessorInfo);
