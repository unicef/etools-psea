import {LitElement, html, property, customElement} from 'lit-element';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-textarea.js';
import {GenericObject, ActionPoint} from '../../../../../types/globals';
import {Assessment} from '../../../../../types/assessment';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../../../redux/store';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {cloneDeep, isJsonStrMatch} from '../../../../utils/utils';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import get from 'lodash-es/get';
import '../../../../common/layout/etools-error-warn-box';

@customElement('follow-up-dialog')
export class FollowUpDialog extends connect(store)(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    if (!this.assessment) {
      return html` ${SharedStylesLit}`;
    }
    return html`
      ${SharedStylesLit}
      <style>
        etools-dropdown {
          --esmm-external-wrapper: {
            width: 100%;
          }
        }

        paper-textarea {
          width: 100%;
        }

        .highPriority {
          padding: 16px 0;
        }
        .p-relative {
          position: relative;
        }
      </style>

      <etools-dialog
        keep-dialog-open
        size="md"
        opened
        dialog-title="${this.dialogTitle}"
        ok-btn-text="${this.confirmBtnTxt}"
        ?hide-confirm-btn="${!this.confirmBtnTxt}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onConfirmBtnClick}"
        @close="${this.onClose}"
      >
        <!-- TODO: The following warning may be replaced -->

        <etools-error-warn-box .messages="${this.warningMessages}"> </etools-error-warn-box>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-dropdown
              id="partnerInput"
              required
              .selected="${this.editedItem.partner}"
              label="Partner"
              .options="${this.partners}"
              option-label="name"
              option-value="id"
              ?readOnly="${this.editedItem.partner}"
              auto-validate
            >
            </etools-dropdown>
          </div>
          <div class="col col-6">
            <etools-dropdown
              id="assessmentInput"
              required
              .selected="${this.assessment.id}"
              label="Assessment"
              .options="${[this.assessment]}"
              option-label="reference_number"
              option-value="id"
              ?readOnly="${this.assessment.id}"
              auto-validate
            >
            </etools-dropdown>
          </div>
        </div>

        <div class="layout-horizontal">
          <paper-textarea
            id="descriptionInput"
            always-float-label
            placeholder="—"
            required
            allowed-pattern="[ds]"
            value="${this.editedItem.description}"
            label="Description"
            max-rows="4"
            @focus="${() => (this.autoValidate = true)}"
            .autoValidate="${this.autoValidate}"
          >
          </paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-dropdown
              id="assignedToInput"
              .selected="${this.editedItem.assigned_to}"
              label="Assigned To"
              .options="${this.users}"
              option-label="name"
              required
              option-value="id"
              auto-validate
            >
            </etools-dropdown>
          </div>

          <div class="col col-6">
            <etools-dropdown
              id="sectionInput"
              .selected="${this.editedItem.section}"
              label="Section"
              .options="${this.sections}"
              option-label="name"
              required
              option-value="id"
              auto-validate
            >
            </etools-dropdown>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-dropdown
              id="officeInput"
              .selected="${this.editedItem.office}"
              label="Office"
              .options="${this.offices}"
              option-label="name"
              required
              option-value="id"
              auto-validate
            >
            </etools-dropdown>
          </div>

          <div class="col col-6 p-relative">
            <datepicker-lite
              id="dueDateInput"
              value="${this.editedItem.due_date}"
              label="Due Date"
              required
              selected-date-display-format="D MMM YYYY"
              auto-validate
            >
            </datepicker-lite>
          </div>
        </div>

        <div class="layout-horizontal highPriority">
          <paper-checkbox id="highPriorityInput" ?checked="${this.editedItem.high_priority}">
            This action point is high priority
          </paper-checkbox>
        </div>
      </etools-dialog>
    `;
  }

  private defaultItem: ActionPoint = {
    partner: null,
    id: null,
    psea_assessment: null,
    assigned_to: null,
    section: null,
    office: null,
    description: '',
    due_date: '',
    high_priority: false
  };

  private validationSelectors: string[] = [
    '#descriptionInput',
    '#assignedToInput',
    '#sectionInput',
    '#officeInput',
    '#dueDateInput'
  ];

  @property({type: Array})
  users: GenericObject[] = [];

  @property({type: Array})
  sections: GenericObject[] = [];

  @property({type: Array})
  offices: GenericObject[] = [];

  @property({type: Array})
  partners: object[] = [];

  @property({type: Object})
  assessment!: Assessment;

  @property({type: String})
  dialogTitle = 'Add Action Point';

  @property({type: String})
  confirmBtnTxt = 'Save';

  @property({type: String})
  cancelBtnText = 'Cancel';

  @property({type: Object})
  editedItem!: ActionPoint;

  @property({type: Array})
  categories: GenericObject[] = [];

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Boolean})
  isNewRecord = true;

  @property({type: Array, reflect: true})
  warningMessages: string[] = [];

  private initialItem!: ActionPoint;

  set dialogData(data: any) {
    if (!data) {
      return;
    }

    if (data.item) {
      this.editedItem = data.item;
    } else {
      this.resetEditedItem();
    }
    if (data.warningMessage) {
      this.warningMessages = [data.warningMessage];
    }
    this.isNewRecord = !this.editedItem.id || this.editedItem.id == 'new';
    this.dialogTitle = this.isNewRecord ? 'Add Action Point' : 'Edit Action Point';
    this.confirmBtnTxt = this.isNewRecord ? 'Add' : 'Save';
    this.initialItem = cloneDeep(this.editedItem);
  }

  stateChanged(state: RootState) {
    if (state.commonData) {
      if (!isJsonStrMatch(this.partners, state.commonData.partners)) {
        this.partners = [...state.commonData.partners];
      }
      if (!isJsonStrMatch(this.users, state.commonData.unicefUsers)) {
        this.users = [...state.commonData.unicefUsers];
      }
      if (!isJsonStrMatch(this.offices, state.commonData.offices)) {
        this.offices = [...state.commonData.offices];
      }
      if (!isJsonStrMatch(this.sections, state.commonData.sections)) {
        this.sections = [...state.commonData.sections];
      }
    }

    if (
      get(state, 'pageData.currentAssessment') &&
      !isJsonStrMatch(this.assessment, state.pageData!.currentAssessment)
    ) {
      // initialize assessment object
      this.assessment = cloneDeep(state.pageData!.currentAssessment);
      this.resetEditedItem();
    }
  }

  onConfirmBtnClick() {
    if (this.validate()) {
      this.saveDialogData();
    }
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

  private getControlsData() {
    // @ts-ignore
    this.editedItem.assigned_to = this.getEl('#assignedToInput').selected;
    // @ts-ignore
    this.editedItem.section = this.getEl('#sectionInput').selected;
    // @ts-ignore
    this.editedItem.office = this.getEl('#officeInput').selected;
    this.editedItem.due_date = this.getEl('#dueDateInput').value;
    this.editedItem.description = this.getEl('#descriptionInput').value;
    this.editedItem.high_priority = this.getEl('#highPriorityInput').checked;
  }

  private _editedItemHasChanged() {
    return !isJsonStrMatch(this.initialItem, this.editedItem);
  }

  private saveDialogData() {
    this.getControlsData();
    if (!this._editedItemHasChanged()) {
      fireEvent(this, 'toast', {
        text: `No changes have been detected on this action point.`
      });
      this.onClose();
      return;
    }

    this.requestInProcess = true;

    sendRequest({
      endpoint: {url: this._getUrl()},
      method: this.isNewRecord ? 'POST' : 'PATCH',
      body: this.editedItem
    })
      .then((resp: any) => this._handleResponse(resp))
      .catch((err: any) => this._handleError(err));
  }

  _getUrl() {
    const actionPointsUrl = getEndpoint(etoolsEndpoints.actionPoints, {id: this.assessment.id}).url!;
    return this.isNewRecord ? actionPointsUrl : actionPointsUrl + this.editedItem.id + '/';
  }

  _handleResponse(resp: any) {
    this.requestInProcess = false;
    fireEvent(this, 'dialog-closed', {confirmed: true, response: resp});
  }

  _handleError(err: any) {
    this.requestInProcess = false;
    const msg = 'Failed to save/update new Action Point!';
    logError(msg, 'action-point', err);
    fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
  }

  onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  resetEditedItem() {
    this.editedItem = cloneDeep(this.defaultItem);
    this.editedItem.psea_assessment = this.assessment.id;
    // @ts-ignore
    this.editedItem.partner = this.assessment.partner;
  }

  getEl(elName: string): HTMLInputElement {
    return this.shadowRoot!.querySelector(elName)! as HTMLInputElement;
  }
}
