import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PolymerElement} from '@polymer/polymer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {cloneDeep} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {GenericObject} from '../../../../../types/globals';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../redux/store';

/**
 * @customElement
 *  @LitElement
 */
@customElement('external-individual-dialog')
class ExternalIndividualDialog extends connect(store)(LitElement) {
  render() {
    // language=HTML
    return html`
      <style>
        paper-input{
          padding:4px 10px;
        }
      </style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
      <etools-dialog id="externalIndividualDialog"
                      ?opened="${this.dialogOpened}"
                      dialog-title="${this.dialogTitle}"
                      size="md"
                      ?show-spinner="${this.requestInProcess}"
                      @close="${this.handleDialogClosed}"
                      ok-btn-text="${this.confirmBtnText}"
                      ?disable-confirm-btn="${this.requestInProcess}"
                      keep-dialog-open
                      @confirm-btn-clicked="${this.onSaveClick}">

              <div class="row-padding-d">
                  <div class="layout-horizontal">
                      <div class="input-container col-4">
                          <!-- Email address -->
                          <paper-input
                                  id="emailInput"
                                  value="${this.editedItem.email}"
                                  label="E-mail"
                                  type="email"
                                  placeholder="Enter E-mail"
                                  required
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
                                  value="${this.editedItem.first_name}"
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
                                  value="${this.editedItem.last_name}"
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
              </div>
      </etools-dialog>
    `;
  }

  private defaultItem = {email: '', first_name: '', last_name: ''};
  private validationSelectors: string[] = ['#emailInput', '#firstNameInput', '#lastNameInput'];

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: Boolean, reflect: true})
  requestInProcess: boolean = false;

  @property({type: String})
  dialogTitle: string = 'Add New External Individual';

  @property({type: String})
  confirmBtnText: string = 'Add';

  @property({type: String})
  requiredMessage: string = 'This field is required';

  @property({type: Object})
  editedItem: GenericObject = cloneDeep(this.defaultItem);

  @property({type: Object})
  toastEventSource!: LitElement;

  @property({type: Array})
  externalIndividuals: any[] = [];


  stateChanged(state: RootState) {
    if (state.app!.routeDetails.routeName === 'assessments' && state.app!.routeDetails.subRouteName === 'details') {
      if (state.commonData) {
        this.externalIndividuals = state.commonData!.externalIndividuals;
      }
    }
  }

  public openDialog() {
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

  public validate() {
    if (!this.validateInput()) {
      return false;
    }
    this.getControlsData();

    // check if email is unique
    let isValid = !this.externalIndividuals.find(x => x.email === this.editedItem.email);
    if (!isValid) {
      fireEvent(this.toastEventSource, 'toast', {text: 'This email address is already being used!'});
    }
    return isValid;
  }

  private resetControls() {
    this.validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PaperInputElement;
      el.invalid = false;
      el.value = '';
    });
    this.editedItem = cloneDeep(this.defaultItem);
  }

  private validateInput() {
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
    this.editedItem.email = this.getEl('#emailInput').value;
    this.editedItem.first_name = this.getEl('#firstNameInput').value;
    this.editedItem.last_name = this.getEl('#lastNameInput').value;
  }

  private saveDialogData() {
    this.requestInProcess = true;

    const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.externalIndividuals).url!, 'POST');

    makeRequest(options, this.editedItem)
      .then((resp: any) => this._handleResponse(resp))
      .catch((err: any) => this._handleError(err))
  }

  _handleResponse(resp: any) {
    this.requestInProcess = false;
    fireEvent(this, 'external-individual-updated', resp);
    this.handleDialogClosed();
  }

  _handleError(err: any) {
    this.requestInProcess = false;
    let msg = 'Failed to save new External Individual!';
    if (err.response && err.response.email && err.response.email[0]) {
      msg = err.response.email[0];
    }
    logError(msg, 'external-individual-dialog', err);
    fireEvent(this.toastEventSource, 'toast', {text: msg});
  }

  getEl(elName: string): HTMLInputElement {
    return this.shadowRoot!.querySelector(elName)! as HTMLInputElement;
  };

}

export {ExternalIndividualDialog as ExternalIndividualDialogEl}
