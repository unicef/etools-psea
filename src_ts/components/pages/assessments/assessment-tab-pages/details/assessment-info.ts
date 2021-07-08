import {LitElement, html, property, customElement, css} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {GenericObject} from '../../../../../types/globals';
import './partner-details';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {isJsonStrMatch, cloneDeep, onListPage} from '../../../../utils/utils';
import {Assessment, AssessmentInvalidator, AssessmentPermissions, Assessor} from '../../../../../types/assessment';
import {updateAppLocation} from '../../../../../routing/routes';
import {formatDate} from '../../../../utils/date-utility';
import {fireEvent} from '../../../../utils/fire-custom-event';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {updateAssessmentData, updateAssessmentAndAssessor} from '../../../../../redux/actions/page-data';
import PermissionsMixin from '../../../mixins/permissions-mixins';
import get from 'lodash-es/get';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import '@unicef-polymer/etools-loading';
import {handleUsersNoLongerAssignedToCurrentCountry} from '../../../../common/common-methods';
import {UnicefUser} from '../../../../../types/user-model';

/**
 * @customElement
 * @LitElement
 */
@customElement('assessment-info')
export class AssessmentInfo extends connect(store)(PermissionsMixin(LitElement)) {
  static get styles() {
    return [
      buttonsStyles,
      css`
        :host {
          display: block;
          margin-bottom: 24px;
        }
      `,
      gridLayoutStylesLit
    ];
  }

  render() {
    if (!this.assessment) {
      return html` ${SharedStylesLit}
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${SharedStylesLit}
      <etools-content-panel panel-title="Partner Details">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${this.hideEditIcon(this.isNew, this.editMode, this.canEditAssessmentInfo)}"
            @tap="${this._allowEdit}"
            icon="create"
          >
          </paper-icon-button>
        </div>

        <etools-dropdown
          id="partner"
          label="Partner Organization to Assess"
          class="row-padding-v w100"
          .options="${this.partners}"
          .selected="${this.assessment.partner}"
          option-value="id"
          option-label="name"
          trigger-value-change-event
          @etools-selected-item-changed="${this._setSelectedPartner}"
          ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.partner)}"
          required
          ?invalid="${this.invalid.partner}"
          auto-validate
        >
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner)}

        <etools-dropdown-multi
          label="UNICEF Focal Point"
          class="row-padding-v"
          .selectedValues="${this.assessment.focal_points}"
          .options="${this.unicefFocalPointUsers}"
          option-label="name"
          option-value="id"
          trigger-value-change-event
          @etools-selected-items-changed="${this._setSelectedFocalPoints}"
          ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.focal_points)}"
        >
        </etools-dropdown-multi>

        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <etools-dropdown
              id="seaType"
              label="Assessment Type"
              class="w100"
              .options="${this.assessment_types}"
              .selected="${this.assessment.assessment_type}"
              option-value="value"
              option-label="label"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (detail.selectedItem) {
                  this.assessment!.assessment_type = detail.selectedItem.value;
                }
              }}"
              ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.assessment_type)}"
              ?required="${this.assessment.permissions.required.assessment_type}"
              ?invalid="${this.invalid.assessment_type}"
              auto-validate
            >
            </etools-dropdown>
          </div>
          <div class="col col-6">
            <etools-dropdown
              id="reasonIngo"
              label="Reason for Country-level INGO Assessment"
              class="w100"
              .options="${this.ingo_reasons}"
              .selected="${this.assessment.assessment_ingo_reason}"
              option-value="value"
              option-label="label"
              enable-none-option
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.assessment!.assessment_ingo_reason = detail.selectedItem ? detail.selectedItem.value : '';
              }}"
              ?required="${this.assessment.permissions.required.assessment_ingo_reason}"
              ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.assessment_ingo_reason)}"
            >
            </etools-dropdown>
          </div>
        </div>
        <datepicker-lite
          id="assessmentDate"
          label="Assessment Date"
          class="row-padding-v"
          .value="${this.assessment.assessment_date}"
          selected-date-display-format="D MMM YYYY"
          fire-date-has-changed
          @date-has-changed="${(e: CustomEvent) => this._setSelectedDate(e.detail.date)}"
          ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.assessment_date)}"
          ?required="${this.assessment.permissions.required.assessment_date}"
          ?invalid="${this.invalid.assessment_date}"
          max-date=${this.getCurrentDate()}
          auto-validate
        >
        </datepicker-lite>

        <div
          class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.isNew, this.editMode, this.canEditAssessmentInfo)}"
        >
          <paper-button class="default" @tap="${this.cancelAssessment}">Cancel</paper-button>
          <paper-button class="primary" @tap="${this.saveAssessment}">Save</paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  assessment!: Assessment | null;

  @property({type: Object})
  originalAssessment!: Assessment;

  @property({type: Object})
  partners!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  editMode = false;

  @property({type: Array})
  unicefFocalPointUsers!: UnicefUser[];

  @property({type: Array})
  assessment_types!: [];

  @property({type: Array})
  ingo_reasons!: [];

  @property({type: Boolean})
  isNew!: boolean;

  @property({type: Object})
  invalid = new AssessmentInvalidator();

  @property({type: Boolean})
  canEditAssessmentInfo!: boolean;

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Boolean})
  showLoading = false;

  stateChanged(state: RootState) {
    if (onListPage(get(state, 'app.routeDetails'))) {
      this.assessment = null;
      return;
    }

    if (state.commonData && !isJsonStrMatch(this.partners, state.commonData!.partners)) {
      this.partners = [...state.commonData!.partners];
    }
    if (state.commonData && !isJsonStrMatch(this.assessment_types, state.commonData!.assessment_types)) {
      this.assessment_types = [...state.commonData!.assessment_types];
    }
    if (state.commonData && !isJsonStrMatch(this.ingo_reasons, state.commonData!.ingo_reasons)) {
      this.ingo_reasons = [...state.commonData!.ingo_reasons];
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }

    const currentAssessment: Assessment = get(state, 'pageData.currentAssessment');
    if (
      currentAssessment &&
      Object.keys(currentAssessment).length &&
      !isJsonStrMatch(this.assessment, currentAssessment)
    ) {
      this.assessment = {...currentAssessment};
      this.originalAssessment = cloneDeep(this.assessment);
      this.isNew = !this.assessment.id;
      this.editMode = this.isNew;
      this.setAssessmentInfoPermissions(this.assessment.permissions);
      setTimeout(() => this.resetValidations(), 10);
    }
    this.populateUnicefFocalPointsDropdown(state);
  }

  populateUnicefFocalPointsDropdown(state: RootState) {
    // waiting for required data to be loaded from redux
    if (get(state, 'pageData.currentAssessment') && get(state, 'user.data')) {
      if (!this.isUnicefUser) {
        // if user is not Unicef user, this is opened in read-only mode and we just display already saved
        this.unicefFocalPointUsers = [...this.assessment!.focal_points_details];
      } else if (get(state, 'commonData.unicefUsers.length')) {
        this.unicefFocalPointUsers = [...state.commonData!.unicefUsers];
        // check if already saved users exists on loaded data, if not they will be added
        // (they might be missing if changed country)
        handleUsersNoLongerAssignedToCurrentCountry(this.unicefFocalPointUsers, this.assessment!.focal_points_details);
        this.unicefFocalPointUsers = [...this.unicefFocalPointUsers];
      }
    }
  }

  setAssessmentInfoPermissions(permissions: AssessmentPermissions) {
    this.canEditAssessmentInfo =
      permissions.edit.partner || permissions.edit.focal_points || permissions.edit.assessment_date;
  }

  _allowEdit() {
    this.editMode = true;
  }

  _showPartnerDetails(selectedPartner: GenericObject) {
    return selectedPartner ? html`<partner-details .partner="${selectedPartner}"></partner-details>` : '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;

    if (this.selectedPartner) {
      this.assessment!.partner = this.selectedPartner.id;
    }
  }

  _setSelectedDate(selDate: Date) {
    this.assessment!.assessment_date = formatDate(selDate, 'YYYY-MM-DD');
    this.requestUpdate();
  }

  _setSelectedFocalPoints(e: CustomEvent) {
    this.assessment!.focal_points = e.detail.selectedItems.map((i: any) => i.id);
  }

  cancelAssessment() {
    if (this.isNew) {
      this.assessment = new Assessment();
      return;
    }
    this.assessment = cloneDeep(this.originalAssessment);
    this.editMode = false;
  }

  saveAssessment() {
    if (!this.validate()) {
      return;
    }
    this.showLoading = true;

    if (this.isNew) {
      this.assessment!.status = 'draft';
    }
    const body = this.assessment;

    sendRequest({
      endpoint: {
        url: this._getUrl()!
      },
      method: this.isNew ? 'POST' : 'PATCH',
      body: body
    })
      .then((response: any) => {
        if (this.isNew) {
          const newAssessor = new Assessor();
          newAssessor.assessment = response.id; // To pass stateChanged dirty check

          store.dispatch(updateAssessmentAndAssessor(response, newAssessor));
          updateAppLocation(`/assessments/${response.id}/details`, true);
        } else {
          store.dispatch(updateAssessmentData(response));
        }
      })
      .catch((err) => fireEvent(this, 'toast', {text: formatServerErrorAsText(err)}))
      .then(() => (this.showLoading = false));
  }

  resetValidations() {
    this.invalid = new AssessmentInvalidator();
    this._backupResetCodeBecauseLitElementDoentReRender();
  }

  _backupResetCodeBecauseLitElementDoentReRender() {
    (this.shadowRoot!.querySelector('#assessmentDate') as DatePickerLite)!.invalid = false;
    (this.shadowRoot!.querySelector('#partner') as EtoolsDropdownEl)!.invalid = false;
  }

  validate() {
    let valid = true;
    const invalid = new AssessmentInvalidator();

    if (!this.assessment!.partner) {
      valid = false;
      invalid.partner = true;
    }
    if (!this.assessment!.assessment_type) {
      valid = false;
      invalid.assessment_type = true;
    }

    this.invalid = cloneDeep(invalid);
    return valid;
  }

  _getUrl() {
    const url = etoolsEndpoints.assessment.url;
    if (this.isNew) {
      return url;
    }
    return url! + this.assessment!.id + '/';
  }

  getCurrentDate() {
    return new Date();
  }
}
