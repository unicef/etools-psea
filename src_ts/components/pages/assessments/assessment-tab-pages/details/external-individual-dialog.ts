import {LitElement, html, property, customElement, query, css} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PolymerElement} from '@polymer/polymer';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {cloneDeep} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {GenericObject} from '../../../../../types/globals';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../redux/store';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';

/**
 * @customElement
 *  @LitElement
 */
@customElement('external-individual-dialog')
export class ExternalIndividualDialog extends connect(store)(LitElement) {
  static get styles() {
    return [
      labelAndvalueStylesLit,
      css`
        #ext-individual-details-row {
          padding-bottom: 24px;
        }
      `,
      gridLayoutStylesLit
    ];
  }
  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <etools-dialog
        id="externalIndividualDialog"
        ?opened="${this.dialogOpened}"
        dialog-title="${this.dialogTitle}"
        size="md"
        ?show-spinner="${this.requestInProgress}"
        @close="${this.handleDialogClosed}"
        ok-btn-text="${this.confirmBtnText}"
        ?disable-confirm-btn="${this.requestInProgress}"
        keep-dialog-open
        @confirm-btn-clicked="${this.onSaveClick}"
      >
        <div id="ext-individual-details-row" class="layout-horizontal">
          <div class="col col-4">
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
              @tap="${this.resetFieldError}"
            >
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>

          <div class="col col-4">
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
              @tap="${this.resetFieldError}"
            >
            </paper-input>
          </div>

          <div class="col col-4">
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
              @tap="${this.resetFieldError}"
            >
            </paper-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private defaultItem = {email: '', first_name: '', last_name: ''};
  private validationSelectors: string[] = ['#emailInput', '#firstNameInput', '#lastNameInput'];

  @query('#emailInput')
  emailInputEl!: HTMLInputElement;

  @query('#firstNameInput')
  firstNameInputEl!: HTMLInputElement;

  @query('#lastNameInput')
  lastNameInputEl!: HTMLInputElement;

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Boolean, reflect: true})
  requestInProgress = false;

  @property({type: String})
  dialogTitle = 'Add New External Individual';

  @property({type: String})
  confirmBtnText = 'Add';

  @property({type: String})
  requiredMessage = 'This field is required';

  @property({type: Object})
  editedItem!: GenericObject;

  @property({type: Array})
  externalIndividuals: any[] = [];

  stateChanged(state: RootState) {
    if (state.app!.routeDetails.routeName === 'assessments' && state.app!.routeDetails.subRouteName === 'details') {
      if (state.commonData) {
        this.externalIndividuals = state.commonData!.externalIndividuals;
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.editedItem = cloneDeep(this.defaultItem);
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
    const isValid = !this.externalIndividuals.find((x) => x.email === this.editedItem.email);
    if (!isValid) {
      fireEvent(this, 'toast', {text: 'This email address is already being used!'});
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
    this.editedItem.email = this.emailInputEl.value;
    this.editedItem.first_name = this.firstNameInputEl.value;
    this.editedItem.last_name = this.lastNameInputEl.value;
  }

  private saveDialogData() {
    this.requestInProgress = true;

    sendRequest({
      endpoint: {url: getEndpoint(etoolsEndpoints.externalIndividuals).url},
      method: 'POST',
      body: this.editedItem
    })
      .then((resp: any) => this._handleResponse(resp))
      .catch((err: any) => this._handleError(err))
      .then(() => (this.requestInProgress = false));
  }

  _handleResponse(resp: any) {
    fireEvent(this, 'external-individual-updated', resp);
    this.handleDialogClosed();
  }

  _handleError(err: any) {
    const msg = formatServerErrorAsText(err);
    logError(msg, 'external-individual-dialog', err);
    fireEvent(this, 'toast', {text: msg});
  }
}
