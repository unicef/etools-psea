import {LitElement, html, property} from 'lit-element';
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
import {makeRequest} from '../../../../utils/request-helper';
import {isJsonStrMatch} from '../../../../utils/utils';
import {Assessment} from '../../../../../types/engagement';
import {updateAppLocation} from '../../../../../routing/routes';
import {formatDate} from '../../../../utils/date-utility';


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
                ?hidden="${this.hideEditIcon(this.isNew, this.editMode)}"
                @tap="${() => this._allowEdit()}"
                icon="create">
          </paper-icon-button>
        </div>

        <etools-dropdown label="Partner Organization to Assess"
          class="row-padding-v col-6 w100"
          .options="${this.partners}"
          .selected="${this.assessment.partner}"
          option-value="id"
          option-label="name"
          trigger-value-change-event
          @etools-selected-item-changed="${this._setSelectedPartner}">
        </etools-dropdown>

        ${this._showPartnerDetails(this.selectedPartner)}

        <etools-dropdown-multi label="UNICEF Focal Point"
          class="row-padding-v"
          .options="${this.unicefUsers}"
          option-label="name"
          option-value="id"
          enable-none-option
          trigger-value-change-event
          @etools-selected-items-changed="${this._setSelectedFocalPoints}">
        </etools-dropdown-multi>

        <datepicker-lite label="Assessment Date"
          class="row-padding-v"
          value="${this.assessment.assessment_date}"
          selected-date-display-format="D MMM YYYY"
          fire-date-has-changed
          @date-has-changed="${(e: CustomEvent) => this._setSelectedDate(e.detail.date)}">
        </datepicker-lite>

        <div class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.isNew, this.editMode)}">
          <paper-button class="default">
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
  partners!: GenericObject;

  @property({type: Object})
  selectedPartner!: GenericObject;

  @property({type: Boolean})
  editMode: boolean = false;

  @property({type: Array})
  unicefUsers!: UnicefUser[];

  @property({type: Boolean})
  isNew!: boolean;

  stateChanged(state: RootState) {
    if (state.commonData && !isJsonStrMatch(this.unicefUsers, state.commonData!.unicefUsers)) {
      this.unicefUsers = [...state.commonData!.unicefUsers];
    }
    if (state.app!.routeDetails.params) {
      let engagementId = state.app!.routeDetails!.params!.engagementId;
      this.isNew = (engagementId === 'new');
      this._getAssessmentInfo(engagementId);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._getPartners();
  }

  _getAssessmentInfo(engagementId: string|number) {

    if (!engagementId || engagementId === 'new' ) {
      this.assessment = new Assessment();
      return;
    }
    if (this.assessment && this.assessment.id == engagementId) {
      return;
    }

    let url = etoolsEndpoints.assessment.url! + engagementId;

    makeRequest({url: url})
      .then((response) => this.assessment = response)
      .catch(err => console.error('handle this error' , err));
  }

  _getPartners() {
    makeRequest(etoolsEndpoints.partners)
       .then((resp:any) => this.partners = resp)
       .catch((err:any) => console.log(err));
  }

  _allowEdit() {
    this.editMode = true;
  }

  _showPartnerDetails(selectedPartner: GenericObject) {
    return selectedPartner?
      html`<partner-details .partner="${this.selectedPartner}">
      </partner-details>`: '';
  }

  _setSelectedPartner(event: CustomEvent) {
    this.selectedPartner = event.detail.selectedItem;
    if (this.selectedPartner) {
      this.assessment.partner = this.selectedPartner.id;
    }
  }

  _setSelectedDate(selDate: Date) {
    this.assessment.assessment_date = formatDate(selDate, 'YYYY-MM-DD');
  }

  _setSelectedFocalPoints(e: CustomEvent) {
    this.assessment.focal_points = e .detail.selectedItems.map((i:any) => i.id);
  }

  saveAssessment() {
    console.log('save');

    let options = {
      url: this._getUrl(),
      method: this.isNew ?  'POST' : 'PATCH'
    };

    if (this.isNew) {
      this.assessment.status = 'draft';
    }
    let  body = this.assessment;

    makeRequest(options, body)
    .then((response) =>
      updateAppLocation(`/engagements/${response.id}/details`, true)
     )
    .catch(err => console.log(err));
  }

  _getUrl() {
    let url = etoolsEndpoints.assessment.url;
    if (this.isNew) {
      return url;
    }
    return url! + this.assessment.id;
  }

  hideEditIcon(isNew: boolean, editMode: boolean) {
    if (this.isNew || this.editMode) {
      return true;
    }
    return false;
  }

  hideActionButtons(isNew: boolean, editMode: boolean) {
    if (this.isNew || this.editMode) {
      return false;
    }
    return true;
  }

}

window.customElements.define('assessment-info', AssessmentInfo);
