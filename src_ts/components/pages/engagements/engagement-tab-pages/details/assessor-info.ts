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
import {isJsonStrMatch, cloneDeep} from '../../../../utils/utils';
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
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';

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

        paper-radio-group[readonly] paper-radio-button:not([checked]){
          display: none;
        }

      </style>
      ${SharedStylesLit}${gridLayoutStylesLit}${buttonsStyles}${labelAndvalueStylesLit}

      <etools-content-panel panel-title="Primary Assessor">
        <div slot="panel-btns">
          <paper-icon-button
                ?hidden="${this.hideEditIcon(this.isNew, this.editMode)}"
                @tap="${this._allowEdit}"
                icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <label class="paper-label">Assessor is:</label>
          <paper-radio-group .selected="${this._getAssessorType(this.assessor)}" ?readonly="${this.isReadonly(this.editMode)}"
              @selected-changed="${(e: CustomEvent) => this._setSelectedAssessorType((e.target as PaperRadioGroupElement)!.selected!)}">
            <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
            <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
            <paper-radio-button name="external">External Individual</paper-radio-button>
          </paper-radio-group>
        </div>

        ${this._getTemplateByAssessorType(this.assessor, this.editMode, this.isNew)}

        <div class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.isNew, this.editMode)}">
          <paper-button class="default" @tap="${this.cancelAssessor}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.saveAssessor}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>

      <firm-staff-members  id="firmStaffMembers" ?hidden="${this.hideFirmStaffMembers(this.isNew, this.assessor)}"></firm-staff-members>
    `;
  }

  @property({type: Object})
  assessor!: Assessor;// Initialization here causes eternal individual field reset on refresh

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Object})
  assessmentId!: string | number;

  @property({type: Boolean})
  isNew: boolean = false;

  @property({type: Boolean})
  editMode: boolean = true;

  @property({type: Object})
  originalAssessor!: Assessor;

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
      .then(resp => {
        this.assessor = resp;
        this.isNew = false;
        this.editMode = this.isNew;
        this.originalAssessor = cloneDeep(this.assessor);
        this.requestUpdate();

        if (this.assessor.assessor_type === AssessorTypes.Firm && this.assessor.auditor_firm) {
          this.loadFirmStaffMembers(this.assessor.auditor_firm!);
        }

      })
      .catch((err) => this._handleErrorrOnGetAssessor(err));
  }

  _handleErrorrOnGetAssessor(err: any) {
    if (err.status === 404) {
      this.assessor = new Assessor();
      this.isNew = true;
      this.editMode = this.isNew;
    } else {
      fireEvent(this, 'toast', {text: 'Error on getting assessor data'})
    }
  }

  _getTemplateByAssessorType(assessor: Assessor | null, editMode: boolean, isNew: boolean) {
    if (!assessor) {
      return '';
    }
    switch (assessor.assessor_type) {
      case 'staff':
        return html`
          <etools-dropdown id="unicefUser"
            label="Unicef Staff" class="row-padding-v"
            .options="${this.unicefUsers}"
            .selected="${this.assessor.user}"
            trigger-value-change-event
            @etools-selected-item-changed="${this._setSelectedUnicefUser}"
            option-label="name"
            option-value="id"
            required
            auto-validate
            ?readonly="${this.isReadonly(this.editMode)}">
          </etools-dropdown>
        `;
      case 'firm':
        return html`
          <assessing-firm id="assessingFirm"
            .assessor="${cloneDeep(this.assessor)}"
            .prevOrderNumber="${this.assessor.order_number}"
            .editMode="${editMode}"
            .isNew="${isNew}">
          </assessing-firm>
        `;
      case 'external':
        return html`
          <external-individual id="externalIndividual"
           .assessor="${cloneDeep(this.assessor)}"
           .editMode="${this.editMode}">
          </external-individual>
        `;
      default:
        return '';
    }
  }

  loadFirmStaffMembers(firmId: string) {
    let firmStaffMembersEl = this.shadowRoot!.querySelector('#firmStaffMembers') as FirmStaffMembersEl;
    firmStaffMembersEl.populateStaffMembersList(firmId);
  }

  hideFirmStaffMembers(isNew: boolean, assessor: Assessor | null) {
    if (!assessor || !assessor.assessor_type || isNew) {
      return true;
    }
    let assessorType = assessor.assessor_type;
    if ([AssessorTypes.Staff, AssessorTypes.ExternalIndividual].includes(assessorType)) {
      return true;
    }

    if (assessorType === AssessorTypes.Firm) {
     return !assessor.auditor_firm;
    }
    return true;
  }

  _setSelectedAssessorType(selected: any) {
    if (!this.assessor) {
      // @ts-ignore
      this.assessor = {};
    }
    this.assessor.assessor_type = selected;
    this.requestUpdate();
  }

  _getAssessorType(assessor: Assessor | null) {
    if (!assessor) {
      return null;
    }
    return assessor.assessor_type;
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
      .then((resp) => {
        this._handleAssessorSaved(resp);
      })
      .catch((err) =>  fireEvent(this, 'toast', {text: formatServerErrorAsText(err), showCloseBtn: true}));
  }


  _handleAssessorSaved(resp: any) {
    this.assessor = resp;
    this.originalAssessor = cloneDeep(this.assessor);
    this.editMode = false;
    this.isNew = false;

    if (this.assessor.assessor_type === AssessorTypes.Firm) {
      this.loadFirmStaffMembers(this.assessor.auditor_firm!);
    }
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
    if (!this.assessor.assessor_type) {
      return false;
    }
    switch(this.assessor.assessor_type) {
      case AssessorTypes.Staff:
        return this._validateUnicefStaff();
      case AssessorTypes.Firm:
        return this.assessingFirmElement.validate();
      case AssessorTypes.ExternalIndividual:
        return this.externalIndividualElement.validate();
      default:
        return false;
    }
  }
  _validateUnicefStaff() {
    if (!this.assessor.user) {
      (this.shadowRoot!.querySelector('#unicefUser') as EtoolsDropdownEl).invalid = true;
      return false;
    }
    return true;
  }


  cancelAssessor() {
    if (this.isNew) {
      this.assessor = new Assessor();
    } else {
      this.assessor = cloneDeep(this.originalAssessor);
       this.editMode = false;
    }
  }

  _allowEdit() {
    this.editMode = true;
  }

  hideEditIcon(isNew: boolean, editMode: boolean) {
    if (isNew || editMode) {
      return true;
    }
    return false;
  }

  hideActionButtons(isNew: boolean, editMode: boolean) {
    if (isNew || editMode) {
      return false;
    }
    return true;
  }

  isReadonly(editMode: boolean) {
    return !editMode;
  }

}
window.customElements.define('assessor-info', AssessorInfo);
