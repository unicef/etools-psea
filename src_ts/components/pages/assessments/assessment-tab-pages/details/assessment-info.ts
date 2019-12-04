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
import {makeRequest} from '../../../../utils/request-helper';
import {isJsonStrMatch, cloneDeep} from '../../../../utils/utils';
import {Assessment, AssessmentInvalidator, AssessmentPermissions, Assessor} from '../../../../../types/assessment';
import {updateAppLocation} from '../../../../../routing/routes';
import {formatDate} from '../../../../utils/date-utility';
import {fireEvent} from '../../../../utils/fire-custom-event';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {updateAssessmentData, updateAssessmentAndAssessor} from '../../../../../redux/actions/page-data';
import PermissionsMixin from '../../../mixins/permissions-mixins';
import get from 'lodash-es/get';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
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
      SharedStylesLit,
      gridLayoutStylesLit,
      buttonsStyles,
      css`
      :host {
        display: block;
        margin-bottom: 24px;
      }`];
  }

  render() {
    if (!this.assessment) {
      return html``;
    }
    // language=HTML
    return html`
      <etools-content-panel panel-title="Assessment Information">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <paper-icon-button
                ?hidden="${this.hideEditIcon(this.isNew, this.editMode, this.canEditAssessmentInfo)}"
                @tap="${this._allowEdit}"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown id="partner" label="Partner Organization to Assess"
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
          auto-validate>
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner)}

        <etools-dropdown-multi label="UNICEF Focal Point"
          class="row-padding-v"
          .selectedValues="${this.assessment.focal_points}"
          .options="${this.unicefFocalPointUsers}"
          option-label="name"
          option-value="id"
          trigger-value-change-event
          @etools-selected-items-changed="${this._setSelectedFocalPoints}"
          ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.focal_points)}">
        </etools-dropdown-multi>

        <datepicker-lite id="assessmentDate" label="Assessment Date"
          class="row-padding-v"
          .value="${this.assessment.assessment_date}"
          selected-date-display-format="D MMM YYYY"
          fire-date-has-changed
          @date-has-changed="${(e: CustomEvent) => this._setSelectedDate(e.detail.date)}"
          ?readonly="${this.isReadonly(this.editMode, this.assessment.permissions.edit.assessment_date)}"
          ?required="${this.assessment.permissions.required.assessment_date}"
          ?invalid="${this.invalid.assessment_date}"
          max-date=${this.getCurrentDate()}
          auto-validate>
        </datepicker-lite>

        <div class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.isNew, this.editMode, this.canEditAssessmentInfo)}">
          <paper-button class="default" @tap="${this.cancelAssessment}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.saveAssessment}">
            Save
          </paper-button>
        </div>

      </etools-content-panel>
    `;
  }

  @property({type: Object})
  assessment!: Assessment;

  @property({type: Object})
  originalAssessment!: Assessment;

  @property({type: Object})
  partners!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  editMode: boolean = false;

  @property({type: Array})
  unicefFocalPointUsers!: UnicefUser[];

  @property({type: Boolean})
  isNew!: boolean;

  @property({type: Object})
  invalid = new AssessmentInvalidator();

  @property({type: Boolean})
  canEditAssessmentInfo!: boolean;

  @property({type: Boolean})
  isUnicefUser: boolean = false;

  @property({type: Boolean})
  showLoading: boolean = false;

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.partners, state.commonData!.partners)) {
      this.partners = [...state.commonData!.partners];
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }

    const currentAssessment: Assessment = get(state, 'pageData.currentAssessment');
    if (currentAssessment && Object.keys(currentAssessment).length &&
      !isJsonStrMatch(this.assessment, currentAssessment)) {

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
        this.unicefFocalPointUsers = [...this.assessment.focal_points_details];
      } else if (get(state, 'commonData.unicefUsers.length')) {
        this.unicefFocalPointUsers = [...state.commonData!.unicefUsers];
        // check if already saved users exists on loaded data, if not they will be added
        // (they might be missing if changed country)
        handleUsersNoLongerAssignedToCurrentCountry(this.unicefFocalPointUsers, this.assessment.focal_points_details);
        this.unicefFocalPointUsers = [...this.unicefFocalPointUsers];
      }
    }
  }

  setAssessmentInfoPermissions(permissions: AssessmentPermissions) {
    this.canEditAssessmentInfo = permissions.edit.partner || permissions.edit.focal_points ||
      permissions.edit.assessment_date;
  }

  _allowEdit() {
    this.editMode = true;
  }

  _showPartnerDetails(selectedPartner: GenericObject) {
    return selectedPartner ?
      html`<partner-details .partner="${selectedPartner}"></partner-details>` : '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;

    if (this.selectedPartner) {
      this.assessment.partner = this.selectedPartner.id;
    }
  }

  _setSelectedDate(selDate: Date) {
    this.assessment.assessment_date = formatDate(selDate, 'YYYY-MM-DD');
    this.requestUpdate();
  }

  _setSelectedFocalPoints(e: CustomEvent) {
    this.assessment.focal_points = e.detail.selectedItems.map((i: any) => i.id);
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
    const options = {
      url: this._getUrl()!,
      method: this.isNew ? 'POST' : 'PATCH'
    };

    if (this.isNew) {
      this.assessment.status = 'draft';
    }
    const body = this.assessment;

    makeRequest(options, body)
      .then((response: any) => {
        if (this.isNew) {

          let newAssessor = new Assessor();
          newAssessor.assessment = response.id;//To pass stateChanged dirty check

          store.dispatch(updateAssessmentAndAssessor(response, newAssessor));
          updateAppLocation(`/assessments/${response.id}/details`, true);
        } else {
          store.dispatch(updateAssessmentData(response));
        }
      })
      .catch(err => fireEvent(this, 'toast', {text: formatServerErrorAsText(err)}))
      .then(() => this.showLoading = false);
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

    if (!this.assessment.partner) {
      valid = false;
      invalid.partner = true;
    }

    this.invalid = cloneDeep(invalid);
    return valid;
  }

  _getUrl() {
    const url = etoolsEndpoints.assessment.url;
    if (this.isNew) {
      return url;
    }
    return url! + this.assessment.id + '/';
  }

  getCurrentDate() {
    return new Date();
  }

}
