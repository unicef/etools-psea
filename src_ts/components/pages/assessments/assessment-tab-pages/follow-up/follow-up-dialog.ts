import {LitElement, html, property, customElement} from 'lit-element';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {GenericObject, Constructor} from '../../../../../types/globals';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {cloneDeep} from '../../../../utils/utils';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {formatDate} from '../../../../utils/date-utility';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import isEqual from 'lodash-es/isEqual';

@customElement('follow-up-dialog')
class FollowUpDialog extends connect(store)(LitElement as Constructor<LitElement>) {
  render() {
    return html`
      ${gridLayoutStylesLit}
      ${SharedStylesLit}
      <style>
        :host .copy-warning {
          position: relative;
          margin-bottom: 10px;
          padding: 20px 24px;
          background-color: #ededee;
          color: #212121;
          font-size: 15px;
        }

        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }

        etools-dropdown.fua-category {
          --paper-listbox: {
            max-height: 340px;
            -ms-overflow-style: auto;
          };
        }

        etools-dropdown.fua-person {
          --paper-listbox: {
            max-height: 140px;
            -ms-overflow-style: auto;
          };
        }

        .checkbox-container {
          padding-left: 12px;
          box-sizing: border-box;
          height: 34px;
          padding-top: 6px;
        }

        .input-container paper-button {
          height: 34px;
          color: rgba(0, 0, 0, .54);
          font-weight: 500;
          z-index: 5;
          border: 1px solid rgba(0, 0, 0, .54);
          padding: 6px 13px;
        }

        .input-container.input-container-ms {
          width: 50%;
        }
    
        .input-container.input-container-l {
          width: 100%;
        }
    
        .input-container.input-container-40 {
          width: 35%;
        }
    
        .group:after {
          visibility: hidden;
          display: block;
          font-size: 0;
          content: " ";
          clear: both;
          height: 0;
        }
    
        .input-container {
          position: relative;
          float: left;
          margin-right: 0;
          width: 33.33%;
        }
      </style>

      <etools-dialog no-padding keep-dialog-open size="md"
                     ?opened="${this.dialogOpened}"
                     dialog-title="${this.dialogTitle}"
                     ok-btn-text="${this.confirmBtnTxt}"
                     ?hide-confirm-btn="${!this.confirmBtnTxt}"
                     ?show-spinner="${this.requestInProcess}"
                     ?disable-confirm-btn="${this.requestInProcess}"
                     @confirm-btn-clicked="${this.onSaveClick}"
                     @close="${this.handleDialogClosed}">
        ${this.watchForChanges ? 
          html`
            <div class="copy-warning">
                It is required to change at least one of the fields below.
            </div>
          ` :
          html``
        }

        <div class="row-hrepeatable-item-container" without-line>
          <div class="repeatable-item-content">

            <div class="row-h group">
              <div class="input-container input-container-ms">
                    
                <etools-dropdown
                        id="partnerInput"
                        class="disabled-as-readonly validate-input required fua-person"
                        ?required
                        .selected="${this.editedItem.partner}"
                        label="Partner"
                        .options="${this.partners}"
                        option-label="name"
                        option-value="id"
                        ?readOnly="${this.editedItem.partner}">
                </etools-dropdown>
              </div>
              <div class="input-container input-container-ms">
                  
                <etools-dropdown
                        id="assessmentInput"
                        class="disabled-as-readonly validate-input required fua-person"
                        ?required
                        .selected="${this.editedItem.psea_assessment}"
                        label="Assessment"
                        .options="${this._getAsArray(this.assessment.reference_number)}"
                        option-label="number"
                        option-value="id"
                        ?readOnly="${this.editedItem.psea_assessment}">
                </etools-dropdown>
              </div>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container input-container-ms">
                
              <etools-dropdown
                      id="categoryInput"
                      class="disabled-as-readonly validate-input required fua-person"
                      .selected="${this.editedItem.category}"
                      label="Category"
                      .options="${this.categories}"
                      option-label="display_name"
                      ?required
                      option-value="value"
                      trigger-value-change-event
                      @etools-selected-item-changed="${this._handleChange}">
              </etools-dropdown>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container input-container-l">
                
              <paper-textarea
                      id="descriptionInput"
                      class="validate-input required"
                      ?required
                      allowed-pattern="[\d\s]"
                      value="${this.editedItem.description}"
                      label="Description"
                      .max-rows="4"
                      @keyup="${this._handleChange}">
              </paper-textarea>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container input-container-ms">

              <etools-dropdown
                      id="assignedToInput"
                      class="disabled-as-readonly validate-input required fua-person"
                      .selected="${this.editedItem.assigned_to}"
                      label="Assigned To"
                      .options="${this.users}"
                      option-label="name"
                      ?required
                      option-value="id"
                      trigger-value-change-event
                      @etools-selected-item-changed="${this._handleChange}">
              </etools-dropdown>
            </div>

            <div class="input-container input-container-ms">
                
              <etools-dropdown
                      id="sectionInput"
                      class="disabled-as-readonly validate-input required fua-person"
                      .selected="${this.editedItem.section}"
                      label="Section"
                      .options="${this.sections}"
                      option-label="name"
                      ?required
                      option-value="id"
                      trigger-value-change-event
                      @etools-selected-item-changed="${this._handleChange}">
              </etools-dropdown>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container input-container-ms">
                

              <etools-dropdown
                      id="officeInput"
                      class="disabled-as-readonly validate-input required fua-person"
                      .selected="${this.editedItem.office}"
                      label="Office"
                      .options="${this.offices}"
                      option-label="name"
                      ?required
                      option-value="id"
                      trigger-value-change-event
                      @etools-selected-item-changed="${this._handleChange}">
              </etools-dropdown>
            </div>

            <div class="input-container input-container-40">
                
              <datepicker-lite
                      id="dueDateInput"
                      class="disabled-as-readonly validate-input required"
                      value="${this.editedItem.due_date}"
                      label="Due Date"
                      ?required
                      fire-date-has-changed
                      @date-has-changed="${(e: CustomEvent) => this._setSelectedDate(e.detail.date)}"
                      selected-date-display-format="D MMM YYYY">
              </datepicker-lite>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container checkbox-container input-container-l">
              <paper-checkbox
                      class="disabled-as-readonly required"
                      ?checked="${this.editedItem.high_priority}">
                      This action point is high priority
              </paper-checkbox>
            </div>
          </div>

        </div>
      </etools-dialog>
    `;
  }

  private defaultItem: GenericObject = {
    psea_assessment: null,
    assigned_to: null,
    section: null,
    office: null,
    description: '',
    due_date: '',
    high_priority: false
  }

  private validationSelectors: string[] = ['#categoryInput', '#assignedToInput', '#sectionInput', '#officeInput', '#dateInput'];

  @property({type: Array})
  users: GenericObject[] = [];

  @property({type: Array})
  sections: GenericObject[] = [];

  @property({type: Array})
  offices: GenericObject[] = [];

  @property({type: Boolean})
  dialogOpened: boolean = false;

  @property({type: Array})
  partners: object[] = [];

  @property({type: Object})
  assessment: any = {};

  @property({type: String})
  dialogTitle: string = 'Add Action Point';

  @property({type: String})
  confirmBtnTxt: string = 'Save';

  @property({type: String})
  cancelBtnText: string = 'Cancel';

  @property({type: Object})
  editedItem: GenericObject = cloneDeep(this.defaultItem);

  // @property({type: Number})
  // selectedPartnerId: number | null = null;

  @property({type: Array})
  categories: GenericObject[] = [];

  @property({type: String})
  assessmentId!: any;

  @property({type: Boolean})
  requestInProcess: boolean = false;

  @property({type: Boolean})
  isNewRecord: boolean = true;

  @property({type: Object})
  toastEventSource!: LitElement;

  @property({type: Number})
  selectedAssessmentId: number = 1;

  @property({type: Boolean})
  watchForChanges: boolean = false;

  stateChanged(state: RootState) {
    if (state.commonData) {
      this.partners = [...state.commonData.partners];
      this.users = [...state.commonData.unicefUsers];
      this.offices = [...state.commonData.offices];
      this.sections = [...state.commonData.sections];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getAssessmentsData(this.assessmentId);
  }

  updated(changedProperties: GenericObject) {
    if (this.watchForChanges && !changedProperties.has('watchForChanges') && !isEqual(this.editedItem, changedProperties.get('editedItem'))) {
      this.watchForChanges = !this.watchForChanges;
    }
  }

  getAssessmentsData(assessmentId: string) {
    let endpoint = {url: etoolsEndpoints.assessment.url + `/${assessmentId}`};
    return makeRequest(endpoint).then((response: GenericObject) => {
      this.assessment = response;
      this.editedItem.psea_assessment = assessmentId;
    })
      .catch((err: any) => console.error(err));
  }

  onSaveClick() {
    if (this.validate()) {
      this.saveDialogData();
    }
  }

  _getAsArray(number: string) {
    return [{number: number, id: 1}];
  }

  private validate() {
    let isValid = true;
    this.validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement & {validate(): boolean};
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  private saveDialogData() {
    this.requestInProcess = true;
    const options: any = {
      method: this.isNewRecord ? 'POST' : 'PATCH',
      url: this.isNewRecord ?
        getEndpoint(etoolsEndpoints.actionPoints, {id: this.assessmentId}).url :
        getEndpoint(etoolsEndpoints.editActionPoint, {id: this.assessmentId, actionPoint: this.editedItem.id}).url
    };

    makeRequest(options, this.editedItem)
      .then((resp: any) => this._handleResponse(resp))
      .catch((err: any) => this._handleError(err));
  }

  _handleResponse(resp: any) {
    this.requestInProcess = false;
    fireEvent(this, 'action-point-updated', {...resp, hasAccess: this.editedItem.hasAccess});
    this.handleDialogClosed();
  }

  _handleError(err: any) {
    this.requestInProcess = false;
    const msg = 'Failed to save/update new Action Point!';
    logError(msg, 'action-point', err);
    fireEvent(this.toastEventSource, 'toast', {text: formatServerErrorAsText(err)});
  }

  _handleChange(e: GenericObject) {
    if (!e.detail.selectedItem) {return; }
    let oldValue = cloneDeep(this.editedItem);

    switch (e.target.id) {
      case 'categoryInput':
        oldValue.category = e.detail.selectedItem.id;
        break;
      case 'descriptionInput':
        oldValue.description = e.target.value;
        break;
      case 'assignedToInput':
        oldValue.assigned_to = e.detail.selectedItem.id;
        break;
      case 'sectionInput':
        oldValue.section = e.detail.selectedItem.id;
        break;
      case 'officeInput':
        oldValue.office = e.detail.selectedItem.id;
        break;
    }
    this.editedItem = oldValue;
  }

  _setSelectedDate(selDate: Date) {
    if (!selDate) {
      return;
    }
    let oldValue = cloneDeep(this.editedItem);
    oldValue.due_date = formatDate(selDate, 'YYYY-MM-DD');
    this.editedItem = oldValue;
  }

  private handleDialogClosed() {
    this.dialogOpened = false;
    this.resetFields();
  }

  private resetFields() {
    this.editedItem = cloneDeep(this.defaultItem)
  }

  public openDialog() {
    this.isNewRecord = !(parseInt(this.editedItem.id) > 0);
    this.dialogTitle = this.isNewRecord ? 'Add Action Point' : 'Edit Action Point';
    this.confirmBtnTxt = this.isNewRecord ? 'Add' : 'Save';
    this.dialogOpened = true;
  }
}

export {FollowUpDialog as FollowUpDialogEl};