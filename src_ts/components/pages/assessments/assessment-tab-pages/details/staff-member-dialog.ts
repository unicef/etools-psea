import {LitElement, html, property, customElement, query} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PolymerElement} from '@polymer/polymer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {EtoolsStaffMemberModel} from '../../../../../types/user-model';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {cloneDeep, isJsonStrMatch} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';

/**
 * @customElement
 *  @LitElement
 */
@customElement('staff-member-dialog')
export class StaffMemberDialog extends LitElement {
  static get styles() {
    return [SharedStylesLit, gridLayoutStylesLit, labelAndvalueStylesLit];
  }

  render() {
    // language=HTML
    return html`
      <style>
        #has-access-checkbox-wrapper {
          padding: 16px 0;
        }
      </style>
      <etools-dialog id="staffMemberDialog"
                      ?opened="${this.dialogOpened}"
                      dialog-title="${this.dialogTitle}"
                      size="md"
                      ?show-spinner="${this.requestInProgress}"
                      @close="${this.handleDialogClosed}"
                      ok-btn-text="${this.confirmBtnText}"
                      ?disable-confirm-btn="${this.requestInProgress}"
                      keep-dialog-open
                      @confirm-btn-clicked="${this.onSaveClick}">

        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Email address -->
            <paper-input
                    id="emailInput"
                    value="${this.editedItem.user.email}"
                    label="E-mail"
                    type="email"
                    placeholder="Enter E-mail"
                    ?required = "${this.isNewRecord}"
                    ?disabled="${!this.isNewRecord}"
                    maxlength="45"
                    error-message="Email is required"
                    @focus="${this.resetFieldError}"
                    @tap="${this.resetFieldError}">
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>

          <div class="col col-4">
            <!-- First Name -->
            <paper-input
                    id="firstNameInput"
                    value="${this.editedItem.user.first_name}"
                    label="First Name"
                    placeholder="Enter First Name"
                    required
                    maxlength="30"
                    error-message="${this.requiredMessage}"
                    @focus="${this.resetFieldError}"
                    @tap="${this.resetFieldError}">
            </paper-input>
          </div>

          <div class="col col-4">
            <!-- Last Name -->
            <paper-input
                    id="lastNameInput"
                    value="${this.editedItem.user.last_name}"
                    label="Last Name"
                    placeholder="Enter Last Name"
                    required
                    maxlength="30"
                    error-message="${this.requiredMessage}"
                    @focus="${this.resetFieldError}"
                    @tap="${this.resetFieldError}">
            </paper-input>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Position -->
            <paper-input
                    id="positionInput"
                    value="${this.editedItem.user.profile.job_title}"
                    label="Position"
                    placeholder="Enter Position"
                    maxlength="45"
                    error-message="{{errors.profile.job_title}}">
            </paper-input>
          </div>

          <div class="col col-4">
            <!-- Phone number -->
            <paper-input
                    id="phoneInput"
                    value="${this.editedItem.user.profile.phone_number}"
                    allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]"
                    label="Phone number"
                    placeholder="Enter Phone"
                    maxlength="20"
                    error-message="{{errors.user.profile.phone_number}}">
              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
            </paper-input>
          </div>
        </div>

        <div id="has-access-checkbox-wrapper" class="layout-horizontal">
          <paper-checkbox
                  id="hasAccessInput"
                  ?checked="${this.editedItem.hasAccess}">
              Has Access
          </paper-checkbox>
        </div>
      </etools-dialog>
    `;
  }

  private defaultItem: EtoolsStaffMemberModel = {
    user: {
      email: '',
      first_name: '',
      last_name: '',
      profile: {phone_number: '', job_title: ''}
    },
    hasAccess: false,
    id: ''
  };
  private validationSelectors: string[] = ['#emailInput', '#firstNameInput', '#lastNameInput'];

  @query('#emailInput')
  emailInputEl!: HTMLInputElement;

  @query('#firstNameInput')
  firstNameInputEl!: HTMLInputElement;

  @query('#lastNameInput')
  lastNameInputEl!: HTMLInputElement;

  @query('#positionInput')
  positionInputEl!: HTMLInputElement;

  @query('#phoneInput')
  phoneInputEl!: HTMLInputElement;

  @query('#hasAccessInput')
  hasAccessInputEl!: HTMLInputElement;

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: Boolean, reflect: true})
  requestInProgress: boolean = false;

  @property({type: String})
  dialogTitle!: string;

  @property({type: String})
  confirmBtnText!: string;

  @property({type: String})
  requiredMessage: string = 'This field is required';

  @property({type: Object})
  editedItem!: EtoolsStaffMemberModel;

  @property({type: Boolean})
  isNewRecord!: boolean;

  @property({type: String})
  firmId!: string;

  @property({type: Object})
  toastEventSource!: LitElement;

  private initialItem!: EtoolsStaffMemberModel;

  connectedCallback(): void {
    super.connectedCallback();
    this.editedItem = cloneDeep(this.defaultItem);
  }

  public openDialog() {
    this.isNewRecord = !(parseInt(this.editedItem.id as string) > 0);
    this.dialogTitle = this.isNewRecord ? 'Add New Firm Staff Member' : 'Edit Firm Staff Member';
    this.confirmBtnText = this.isNewRecord ? 'Add' : 'Save';
    this.dialogOpened = true;
    this.initialItem = cloneDeep(this.editedItem);
  }

  private handleDialogClosed() {
    this.dialogOpened = false;
    this.resetControls();
  }

  private onSaveClick() {
    if (this.validate()) {
      this.saveDialogData();
    }
  }

  private resetControls() {
    this.validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PaperInputElement;
      el.invalid = false;
      el.value = '';
    });
    this.positionInputEl.value = '';
    this.phoneInputEl.value = '';
    this.hasAccessInputEl.checked = false;
    this.editedItem = cloneDeep(this.defaultItem);
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

  private resetFieldError(e: CustomEvent) {
    if (!e || !e.target) {
      return;
    }
    (e.target as PaperInputElement).invalid = false;
  }

  private getControlsData() {
    this.editedItem.user.email = this.emailInputEl.value;
    this.editedItem.user.first_name = this.firstNameInputEl.value;
    this.editedItem.user.last_name = this.lastNameInputEl.value;
    this.editedItem.hasAccess = this.hasAccessInputEl.checked;
    this.editedItem.user.profile.phone_number = this.phoneInputEl.value;
    this.editedItem.user.profile.job_title = this.positionInputEl.value;
  }

  private saveDialogData() {
    this.getControlsData();
    this.requestInProgress = true;

    const options = {
      method: this.isNewRecord ? 'POST' : 'PATCH',
      url: getEndpoint(
        etoolsEndpoints.staffMembers,
        {id: this.firmId}).url! + (this.editedItem.id ? this.editedItem.id + '/' : '')
    };

    if (this._staffMemberDataHasChanged()) {
      makeRequest(options, this.editedItem)
        .then((resp: any) => this._staffMemberDataUpdateComplete(resp))
        .catch((err: any) => this._handleError(err))
        .then(() => this.requestInProgress = false);
    } else {
      if (this.initialItem.hasAccess !== this.editedItem.hasAccess) {
        this._staffMemberDataUpdateComplete(this.editedItem);
      } else {
        this.requestInProgress = false;
        fireEvent(this.toastEventSource, 'toast', {
          text: `No changes have been detected to ${this.editedItem.user.first_name} ${this.editedItem.user.last_name}.`
        });

      }
    }
  }

  private _staffMemberDataHasChanged() {
    return !isJsonStrMatch(this.initialItem.user, this.editedItem.user);
  }

  _staffMemberDataUpdateComplete(resp: any) {
    this.requestInProgress = false;
    fireEvent(this, 'staff-member-updated', {...resp, hasAccess: this.editedItem.hasAccess});
    this.handleDialogClosed();
  }

  _handleError(err: any) {
    const msg = formatServerErrorAsText(err);
    logError(msg, 'staff-member', err);
    fireEvent(this.toastEventSource, 'toast', {text: msg});
  }

}
