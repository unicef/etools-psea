import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PolymerElement} from '@polymer/polymer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {EtoolsStaffMemberModel} from '../../../../user/user-model';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {PaperCheckboxElement} from '@polymer/paper-checkbox';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {GenericObject, Constructor} from '../../../../../types/globals';
import {cloneDeep} from 'lodash-es';

/**
 * @customElement
 *  @LitElement
 */
@customElement('staff-member')
class StaffMember extends (EtoolsAjaxRequestMixin(LitElement) as Constructor<LitElement>) {
  render() {
    // language=HTML
    return html`
      <style>
        .input-container {
          position: relative;
          float: left;
          margin: 0 12px 0 0;
          width: 33.33%;
        }
        .input-container:last-of-type {
          margin-right: 0;
        }
        .row-h {
          margin-bottom: 8px;
          padding: 0px !important;
        }
      </style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
      <etools-dialog id="staff-members" no-padding
                      ?opened="${this.dialogOpened}"
                      dialog-title="${this.dialogTitle}"
                      size="md"
                      @close="${this.handleDialogClosed}"
                      ok-btn-text="${this.confirmBtnText}"
                      ?disable-confirm-btn="${this.requestInProcess}"
                      keep-dialog-open
                      @confirm-btn-clicked="${this.onSaveClick}">

          <div class="row-h repeatable-item-container" without-line>
              <div class="repeatable-item-content">
                  <div class="row-h group">
                      <div class="input-container">
                          <!-- Email address -->
                          <paper-input
                                  id="emailInput"
                                  class$="validate-input required email"
                                  value="${this.editedItem.user.email}"
                                  label="E-mail"
                                  placeholder="Enter E-mail"
                                  ?required = "${this.isNewRecord}"
                                  ?disabled="${!this.isNewRecord || this.requestInProcess}"
                                  maxlength="45"
                                  error-message="Email is required"
                                  @focus="${this.resetFieldError}"
                                  @tap="${this.resetFieldError}"
                                  @on-blur="${this.checkEmail}">
                              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
                          </paper-input>
                      </div>

                      <div class="input-container">
                          <!-- First Name -->
                          <paper-input
                                  id="firstNameInput"
                                  class$="validate-input required"
                                  value="${this.editedItem.user.first_name}"
                                  label="First Name"
                                  placeholder="Enter First Name"
                                  required
                                  ?disabled="${this.requestInProcess}"
                                  ?readonly="${this.requestInProcess}"
                                  maxlength="30"
                                  error-message="${this.requiredMessage}"
                                  @focus="${this.resetFieldError}"
                                  @tap="${this.resetFieldError}">
                          </paper-input>
                      </div>

                      <div class="input-container">
                          <!-- Last Name -->
                          <paper-input
                                  id="lastNameInput"
                                  class$="validate-input required"
                                  value="${this.editedItem.user.last_name}"
                                  label="Last Name"
                                  placeholder="Enter Last Name"
                                  required
                                  ?disabled="${this.requestInProcess}"
                                  ?readonly$="${this.requestInProcess}"
                                  maxlength="30"
                                  error-message="${this.requiredMessage}"
                                  @focus="${this.resetFieldError}"
                                  @tap="${this.resetFieldError}">
                          </paper-input>
                      </div>
                  </div>
                  <div class="row-h group">
                      <div class="input-container">
                          <!-- Position -->
                          <paper-input
                                  id="positionInput"
                                  class$="validate-input"
                                  value="${this.editedItem.user.profile.job_title}"
                                  label="Position"
                                  placeholder="Enter Position"
                                  ?disabled="${this.requestInProcess}"
                                  ?readonly="${this.requestInProcess}"
                                  maxlength="45"
                                  error-message="{{errors.profile.job_title}}">
                          </paper-input>
                      </div>

                      <div class="input-container">
                          <!-- Phone number -->
                          <paper-input
                                  id="phoneInput"
                                  class$="validate-input"
                                  value="${this.editedItem.user.profile.phone_number}"
                                  allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]"
                                  label="Phone number"
                                  placeholder="Enter Phone"
                                  ?disabled="${this.requestInProcess}"
                                  ?readonly="${this.requestInProcess}"
                                  maxlength="20"
                                  error-message="{{errors.user.profile.phone_number}}">
                              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
                          </paper-input>
                      </div>
                      <div class="input-container"></div>
                  </div>

                  <div class="row-h group">
                      <!--receive notification-->
                      <div class="input-container">
                          <paper-checkbox
                                  id="hasAccessInput"
                                  ?checked="${this.editedItem.hasAccess}"
                                  ?disabled="${this.requestInProcess}"
                                  ?readonly="${this.requestInProcess}">
                              Has Access
                          </paper-checkbox>
                      </div>
                  </div>
              </div>
          </div>
      </etools-dialog>
    `;
  }

  private defaultItem: EtoolsStaffMemberModel = {user: {email: '', first_name: '', last_name: '', profile: {phone_number: '', job_title: ''}}, hasAccess: false, id: ''};
  private validationSelectors: string[] = ['#emailInput', '#firstNameInput', '#lastNameInput'];

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: Boolean, reflect: true})
  requestInProcess: boolean = false;

  @property({type: String})
  dialogTitle: string = 'Add New Firm Staff Member';

  @property({type: String})
  confirmBtnText: string = 'Add';

  @property({type: String})
  requiredMessage: string = 'This field is required';

  @property({type: Object})
  editedItem: EtoolsStaffMemberModel = cloneDeep(this.defaultItem);

  @property({type: Boolean})
  isNewRecord!: boolean;

  @property({type: Number})
  organisationId: number = 10;

  // connectedCallback() {
  //   super.connectedCallback();
  // }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  // }

  public openDialog() {
    this.dialogOpened = true;
    this.isNewRecord  = !(parseInt(this.editedItem.id) > 0);
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
    (this.shadowRoot!.querySelector('#positionInput') as PaperInputElement).value ='';
    (this.shadowRoot!.querySelector('#phoneInput') as PaperInputElement).value = '';
    (this.shadowRoot!.querySelector('#hasAccessInput') as PaperCheckboxElement).checked = false;
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

  private checkEmail(e) {

  }

  private saveDialogData() {
    this.editedItem.hasAccess = this.shadowRoot!.querySelector('#hasAccessInput').checked;
    this.editedItem.user.first_name = this.shadowRoot!.querySelector('#firstNameInput').value;
    this.editedItem.user.last_name = this.shadowRoot!.querySelector('#lastNameInput').value;
    // this.editedItem.hasAccess = this.shadowRoot!.querySelector('hasAccess').value;


    const options = {
      method: parseInt(this.editedItem.id) > 0 ? 'PATCH' : 'POST',
      endpoint: {
        url: getEndpoint('staffMembers', {id: this.organisationId}).url + this.editedItem.id + '/'
      },
      body: this.editedItem
    };
    this.sendRequest(options)
      .then(resp => this._handleResponse(resp))
      .catch(err => this._handleError(err));
  }

  _handleResponse(data) {
    // if (!this.requestsCompleted.data || !this.requestsCompleted.options) {return;}

    // this.dataItems = data.results;
    // if (this.queries && !this.queries.search) {
    //   this.datalength = data.count;
    // }
    // this.listLoading = false;
    // this.url = null;
    // this.staffsBase = `staff_members_${this.organisationId}`;
  }

  _handleError(error) {
    let responseData = error && error.request && error.request.detail &&
      error.request.detail.request && error.request.detail.request.xhr;
    console.error(responseData);
    // this.listLoading = false;
    // this.url = null;
  }

}

export {StaffMember as StaffMemberEl}
