import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-button/paper-button.js';
import './assessing-firm';
import './external-individual';
import './firm-staff-members';
import {UnicefUser} from '../../../../../types/user-model';
import {LitElement, html, property, query, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {PaperRadioGroupElement} from '@polymer/paper-radio-group';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch, cloneDeep} from '../../../../utils/utils';
import {Assessment, Assessor, AssessorTypes} from '../../../../../types/assessment';
import {AssessingFirm} from './assessing-firm';
import {ExternalIndividual} from './external-individual';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {FirmStaffMembers} from './firm-staff-members';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {saveAssessorData} from '../../../../../redux/actions/page-data';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

/**
 * @customElement
 * @LitElement
 */
@customElement('assessor-info')
export class AssessorInfo extends connect(store)(LitElement) {

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
                @tap="${this.allowEdit}"
                icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <label class="paper-label">Assessor is:</label>
          <paper-radio-group .selected="${this.getAssessorType(this.assessor)}"
              ?readonly="${this.isReadonly(this.editMode)}"
              @selected-changed="${(e: CustomEvent) =>
                this.setSelectedAssessorType((e.target as PaperRadioGroupElement)!.selected!)}">
            <paper-radio-button name="staff">Unicef Staff</paper-radio-button>
            <paper-radio-button name="firm">Assessing Firm</paper-radio-button>
            <paper-radio-button name="external">External Individual</paper-radio-button>
          </paper-radio-group>
        </div>

        ${this._getTemplateByAssessorType(this.assessor, this.editMode, this.isNew)}

        <div class="layout-horizontal right-align row-padding-v"
            ?hidden="${this.hideActionButtons(this.isNew, this.editMode)}">
          <paper-button class="default" @tap="${this.cancelAssessorUpdate}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.saveAssessorChanges}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>

      ${this.getFirmStaffMembersHtml(this.isNew, this.assessor)}
    `;
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
            @etools-selected-item-changed="${this.setSelectedUnicefUser}"
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

  getFirmStaffMembersHtml(isNew: boolean, assessor: Assessor) {
    if (!assessor) {
      return;
    }
    return html`<firm-staff-members id="firmStaffMembers"
        ?hidden="${this.hideFirmStaffMembers(isNew, assessor, this.editMode)}"
        .assessorId="${this.assessor.id}"
        .assessmentId="${this.assessment.id}"
        .currentFirmAssessorStaffWithAccess="${this.assessor.auditor_firm_staff}">
      </firm-staff-members>`;
  }

  @property({type: Object})
  assessor!: Assessor; // Initialization here causes eternal individual field reset on refresh

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Object})
  assessment!: Assessment;

  @property({type: Boolean})
  isNew: boolean = false;

  @property({type: Boolean})
  editMode: boolean = true;

  @property({type: Object})
  originalAssessor!: Assessor;

  @query('#assessingFirm')
  assessingFirmElement!: AssessingFirm;

  @query('#externalIndividual')
  externalIndividualElement!: ExternalIndividual;

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }

    // initialize assessment object from redux state
    if (state.pageData!.currentAssessment) {
      const newAssessment = state.pageData!.currentAssessment;
      if (!isJsonStrMatch(this.assessment, newAssessment)) {
        this.assessment = cloneDeep(newAssessment);
      }
    }

    // initialize assessor object from redux state
    if (state.pageData!.assessor) {
      const newAssessor = state.pageData!.assessor;
      if (!isJsonStrMatch(this.assessor, newAssessor)) {
        this.assessor = cloneDeep(newAssessor);
        this.initializeRelatedData();
      }
    }
  }

  protected initializeRelatedData(): void {
    this.isNew = !this.assessor.id;
    this.editMode = this.isNew;
    this.originalAssessor = cloneDeep(this.assessor);
    this.requestUpdate().then(() => {
      // load staff members after staff members element is initialized
      if (this.assessor.assessor_type === AssessorTypes.Firm && this.assessor.auditor_firm) {
        this.loadFirmStaffMembers(this.assessor.auditor_firm!);
      }
    });
  }

  loadFirmStaffMembers(firmId: string) {
    const firmStaffMembersEl = this.shadowRoot!.querySelector('#firmStaffMembers') as FirmStaffMembers;
    if (!firmStaffMembersEl) {
      return;
    }
    firmStaffMembersEl.populateStaffMembersList(firmId);
  }

  hideFirmStaffMembers(isNew: boolean, assessor: Assessor | null, editMode: boolean) {
    if (editMode) {
      return true;
    }
    if (!assessor || !assessor.assessor_type || isNew) {
      return true;
    }
    const assessorType = assessor.assessor_type;
    if ([AssessorTypes.Staff, AssessorTypes.ExternalIndividual].includes(assessorType)) {
      return true;
    }

    if (assessorType === AssessorTypes.Firm) {
      return !assessor.auditor_firm;
    }
    return true;
  }

  setSelectedAssessorType(assessorType: string | number) {
    if (!this.assessor) {
      return;
    }
    this.assessor.assessor_type = assessorType as AssessorTypes;
    this.assessor.user = null;
    this.requestUpdate();
  }

  getAssessorType(assessor: Assessor | null) {
    if (!assessor) {
      return null;
    }
    return assessor.assessor_type;
  }

  setSelectedUnicefUser(event: CustomEvent) {
    const selectedUser = event.detail.selectedItem;
    if (selectedUser) {
      this.assessor.user = selectedUser.id;
    } else {
      this.assessor.user = null;
    }
    this.requestUpdate();
  }

  saveAssessorChanges() {
    if (!this.validate()) {
      return;
    }

    store.dispatch(saveAssessorData(this.assessment.id as number,
      this.assessor.id, this.collectAssessorData(), this.handleAssessorSaveError.bind(this)));
  }

  handleAssessorSaveError(error: any) {
    logError(error);
    fireEvent(this, 'toast', {text: formatServerErrorAsText(error), showCloseBtn: true});
  }

  collectAssessorData() {
    const assessorPart1 = {assessor_type: this.assessor.assessor_type};

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
    switch (this.assessor.assessor_type) {
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


  cancelAssessorUpdate() {
    this.assessor = cloneDeep(this.originalAssessor);
    this.editMode = this.isNew;
  }

  allowEdit() {
    this.editMode = true;
  }

  hideEditIcon(isNew: boolean, editMode: boolean) {
    return isNew || editMode;
  }

  hideActionButtons(isNew: boolean, editMode: boolean) {
    return !(isNew || editMode);
  }

  isReadonly(editMode: boolean) {
    return !editMode;
  }

}
