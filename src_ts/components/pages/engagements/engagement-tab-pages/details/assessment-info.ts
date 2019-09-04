import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../styles/button-styles';
import {GenericObject, UnicefUser} from '../../../../../types/globals';
import './partner-details';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {isJsonStrMatch, cloneDeep} from '../../../../utils/utils';
import {Assessment, AssessmentInvalidator} from '../../../../../types/engagement';
import {updateAppLocation} from '../../../../../routing/routes';
import {formatDate} from '../../../../utils/date-utility';
import {fireEvent} from '../../../../utils/fire-custom-event';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {updateAssessmentData} from '../../../../../redux/actions/page-data';
import {PageDataState} from '../../../../../redux/reducers/page-data';

/**
 * @customElement
 * @LitElement
 */
@customElement('assessment-info')
export class AssessmentInfo extends connect(store)(LitElement) {

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
                ?hidden="${this.hideEditIcon(this.isNew, this.editMode)}"
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
          ?readonly="${!this.editMode}"
          required
          ?invalid="${this.invalid.partner}"
          auto-validate>
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner, this.staffMembers)}

        <etools-dropdown-multi label="UNICEF Focal Point"
          class="row-padding-v"
          .selectedValues="${this.assessment.focal_points}"
          .options="${this.unicefUsers}"
          option-label="name"
          option-value="id"
          enable-none-option
          trigger-value-change-event
          @etools-selected-items-changed="${this._setSelectedFocalPoints}"
          ?readonly="${!this.editMode}">
        </etools-dropdown-multi>

        <datepicker-lite id="assessmentDate" label="Assessment Date"
          class="row-padding-v"
          .value="${this.assessment.assessment_date}"
          selected-date-display-format="D MMM YYYY"
          fire-date-has-changed
          @date-has-changed="${(e: CustomEvent) => this._setSelectedDate(e.detail.date)}"
          ?readonly="${!this.editMode}"
          required
          ?invalid="${this.invalid.assessment_date}"
          auto-validate>
        </datepicker-lite>

        <div class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.isNew, this.editMode)}">
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
  assessment = new Assessment();

  @property({type: Object})
  originalAssessment!: Assessment;

  @property({type: Object})
  partners!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  editMode: boolean = false;

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Array})
  staffMembers: GenericObject[] = [];

  @property({type: Boolean})
  isNew!: boolean;

  @property({type: Object})
  invalid = new AssessmentInvalidator();

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }
    if (state.commonData && !isJsonStrMatch(this.partners, state.commonData!.partners)) {
      this.partners = [...state.commonData!.partners];
    }

    if (state.app!.routeDetails!.params) {
      const assessmentId = state.app!.routeDetails.params.engagementId;
      this.setPageData(assessmentId, state.pageData!);
    }
  }

  setPageData(assessmnetId: string | number, pageData: PageDataState) {
    this.isNew = (assessmnetId === 'new');
    this.editMode = this.isNew;
    this._getAssessmentInfo(assessmnetId)
      .then(() => {
        setTimeout(() => this.resetValidations(), 100);
        if (!pageData || !isJsonStrMatch(this.assessment, pageData.currentAssessment)) {
          store.dispatch(updateAssessmentData(this.assessment));
        }
      });

  }


  _getAssessmentInfo(assessmentId: string | number) {
    if (!assessmentId || assessmentId === 'new') {
      this.assessment = new Assessment();
      return Promise.resolve();
    }
    if (this.assessment && this.assessment.id == assessmentId) {
      return Promise.resolve();
    }

    const url = etoolsEndpoints.assessment.url! + assessmentId + '/';

    return makeRequest({url: url})
      .then((response) => {
        this.assessment = response;
        this.originalAssessment = cloneDeep(this.assessment);
      })
      .catch(err => this.handleGetAssessmentError(err));
  }

  handleGetAssessmentError(err: any) {
    if (err.status == 404) {
      updateAppLocation('/page-not-found', true);
    }
  }

  _allowEdit() {
    this.editMode = true;
  }

  _showPartnerDetails(selectedPartner: GenericObject, staffMembers: GenericObject[]) {
    return selectedPartner ?
      html`<partner-details .partner="${selectedPartner}" .staffMembers="${staffMembers}"></partner-details>` : '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;

    if (this.selectedPartner) {
      this.assessment.partner = this.selectedPartner.id;
      makeRequest(getEndpoint(etoolsEndpoints.partnerStaffMembers, {id: this.selectedPartner.id}) as RequestEndpoint)
        .then((resp: any[]) => {
          this.staffMembers = resp;
          this.requestUpdate();
        })
        .catch((err: any) => {
          this.staffMembers = [];
          logError(err);
        });
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

    const options = {
      url: this._getUrl()!,
      method: this.isNew ? 'POST' : 'PATCH'
    };

    if (this.isNew) {
      this.assessment.status = 'draft';
    }
    const body = this.assessment;

    makeRequest(options, body)
      .then((response: any) =>
        updateAppLocation(`/engagements/${response.id}/details`, true)
      )
      .catch(_err => fireEvent(this, 'toast', {text: 'Error saving Assessment Info.'}));
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
    if (!this.assessment.assessment_date) {
      valid = false;
      invalid.assessment_date = true;
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

  hideEditIcon(isNew: boolean, editMode: boolean) {
    return isNew || editMode;
  }

  hideActionButtons(isNew: boolean, editMode: boolean) {
    return !isNew || !editMode;
  }

}
