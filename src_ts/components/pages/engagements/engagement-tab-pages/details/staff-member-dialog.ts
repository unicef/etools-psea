import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PolymerElement} from '@polymer/polymer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {EtoolsStaffMemberModel} from '../../../../user/user-model';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {cloneDeep} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';

/**
 * @customElement
 *  @LitElement
 */
@customElement('staff-member-dialog')
export class StaffMemberDialog extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        .layout-horizontal{
          margin: 0px 10px;
        }
        paper-input, paper-checkbox{
          padding:4px 10px;
        }
        .m-12{
          margin-top: 12px;
          margin-bottom: 12px;
        }
      </style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
      <etools-dialog id="staff-members" no-padding
                      ?opened="${this.dialogOpened}"
                      dialog-title="${this.dialogTitle}"
                      size="md"
                      ?show-spinner="${this.requestInProcess}"
                      @close="${this.handleDialogClosed}"
                      ok-btn-text="${this.confirmBtnText}"
                      ?disable-confirm-btn="${this.requestInProcess}"
                      keep-dialog-open
                      @confirm-btn-clicked="${this.onSaveClick}">


        <div class="layout-horizontal">
          <div class="input-container col-4">
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

          <div class="input-container col-4">
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

          <div class="input-container col-4">
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
          <div class="input-container col-4" ?hidden="${!this.isStaffMember}">
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

          <div class="input-container col-4">
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

        <div class="layout-horizontal m-12">
          <!--receive notification-->
          <div class="input-container col-4">
            <paper-checkbox
                    id="hasAccessInput"
                    ?checked="${this.editedItem.hasAccess}">
                Has Access
            </paper-checkbox>
          </div>
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
    }, hasAccess: false, id: ''
  };
  private validationSelectors: string[] = ['#emailInput', '#firstNameInput', '#lastNameInput'];

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: Boolean, reflect: true})
  requestInProcess: boolean = false;

  @property({type: String})
  dialogTitle!: string;

  @property({type: String})
  confirmBtnText!: string;

  @property({type: String})
  requiredMessage: string = 'This field is required';

  @property({type: Object})
  editedItem: EtoolsStaffMemberModel = cloneDeep(this.defaultItem);

  @property({type: Boolean})
  isNewRecord!: boolean;

  @property({type: Boolean})
  isStaffMember: boolean = true;

  @property({type: String})
  firmId!: string;

  public openDialog() {
    this.isNewRecord = !(parseInt(this.editedItem.id) > 0);
    this.dialogTitle = this.isNewRecord
      ? (this.isStaffMember ? 'Add New Firm Staff Member' : 'Add New External Individual')
      : 'Edit Firm Staff Member';
    this.confirmBtnText = this.isNewRecord ? 'Add' : 'Save';
    this.dialogOpened = true;
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
    this.getEl('#positionInput').value = '';
    this.getEl('#phoneInput').value = '';
    this.getEl('#hasAccessInput').checked = false;
    this.editedItem = cloneDeep(this.defaultItem);
    this.isStaffMember = true;
  }

  private validate() {
    let isValid = true;
    this.validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement & { validate(): boolean };
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
    if (this.isNewRecord) {
      this.editedItem.user.email = this.getEl('#emailInput').value;
    }
    this.editedItem.user.first_name = this.getEl('#firstNameInput').value;
    this.editedItem.user.last_name = this.getEl('#lastNameInput').value;
    this.editedItem.user.profile.phone_number = this.getEl('#phoneInput').value;
    this.editedItem.hasAccess = this.getEl('#hasAccessInput').checked;
    if (this.isStaffMember) {
      this.editedItem.user.profile.job_title = this.getEl('#positionInput').value;
    }
  }

  private saveDialogData() {
    this.getControlsData();
    this.requestInProcess = true;

    const options = {
      method: this.isNewRecord ? 'POST' : 'PATCH',
      url: getEndpoint(etoolsEndpoints.staffMembers, {id: this.firmId}).url + this.editedItem.id + '/'
    };

    makeRequest(options, this.editedItem)
      .then((resp: any) => this._handleResponse(resp))
      .catch((err: any) => this._handleError(err));
  }

  _handleResponse(resp: any) {
    this.requestInProcess = false;
    fireEvent(this, 'member-updated', {...resp, hasAccess: this.editedItem.hasAccess});
    this.handleDialogClosed();
  }

  _handleError(err: any) {
    this.requestInProcess = false;
    const msg = 'Failed to save/update new ' + this.isStaffMember ? 'Firm Staff Member' : 'External Individual' + '!';
    logError(msg, 'staff-member', err);
    fireEvent(this, 'toast', {text: msg});
  }

  getEl(elName: string): HTMLInputElement {
    return this.shadowRoot!.querySelector(elName)! as HTMLInputElement;
  }

}

