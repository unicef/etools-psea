import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-spinner/paper-spinner';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {buttonsStyles} from "../../../../styles/button-styles";

/**
 * @customElement
 * @LitElement
 */
@customElement('assessing-firm')
export class AssessingFirm extends LitElement {
  render() {
    // language=HTML
    return html`
      ${SharedStylesLit} ${labelAndvalueStylesLit} ${gridLayoutStylesLit} ${buttonsStyles}
      <style>
        .input-width {
          max-width: 230px;
        }
        .po-loading {
          @apply --layout-horizontal;
          @apply --layout-center;
        }
        paper-spinner {
          align-self: center;
          width: 20px;
          height: 20px;
          margin-right: 6px;
          margin-left: 16px;
        }
      </style>

      <div class="layout-horizontal row-padding-v">
        <paper-input id="poNumber" label="Enter PO Number" always-float-label
          class="input-width"
          .value="${this.assessor.order_number}"
          @value-changed=${(e: CustomEvent) => this._updatePoNumber((e.target! as PaperInputElement).value!)}
          allowed-pattern="[0-9]"
          maxlength=10
          error-message="${this.errMessage}"
          auto-validate
          required
          ?readonly="${this.isReadonly(this.editMode)}">
        </paper-input>
        <paper-button class="info left-icon" 
                      @tap="${this.getAssessorFirmByPoNumber}"
                      ?hidden="${this.isReadonly(this.editMode) || this.poRequestInProgress}">
          <iron-icon icon="autorenew"></iron-icon>
          Get firm details
        </paper-button>
        <span class="po-loading" ?hidden="${!this.poRequestInProgress}">
          <paper-spinner ?active="${this.poRequestInProgress}">
          </paper-spinner>
          Loading...
        </span>
      </div>
      <div class="layout-vertical row-padding-v">
        <span class="paper-label">Firm Name</span>
        <span class="input-label row-padding-v" ?empty="${!this.assessor.auditor_firm_name}">
          ${this.assessor.auditor_firm_name}
        </span>
      </div>
    `;
  }

  @property({type: String})
  errMessage: string = '10 digits expected';

  @property({type: String})
  prevOrderNumber: string = '';

  @property({type: String})
  currentOrderNumber: string = '';

  @property({type: Object})
  assessor = {
    order_number: '',
    auditor_firm: null,
    auditor_firm_name: ''
  };

  @property({type: Boolean})
  poRequestInProgress: boolean = false;

  @property({type: Boolean, attribute: true, reflect: true})
  editMode!: boolean;

  @property({type: Boolean, attribute: true, reflect: true})
  isNew!: boolean;

  getAssessorFirmByPoNumber() {

    if (!this._validatePONumber()) {
      return;
    }

    if (Number(this.assessor.order_number) === Number(this.prevOrderNumber)) {
      return;
    }
    this.poRequestInProgress = true;

    makeRequest(getEndpoint(etoolsEndpoints.auditorFirm, {id: this.assessor.order_number}) as RequestEndpoint)
      .then((response: any) => {
        this._handleFirmReceived(response);
      })
      .catch((err: any) => {
        this._handleErrorOnGetFirm(err);
      }).then(() => {
        this.poRequestInProgress = false;
      });
  }

  _handleFirmReceived(resp: any) {
    this.assessor = {
      auditor_firm: resp.auditor_firm.id,
      order_number: resp.order_number,
      auditor_firm_name: resp.auditor_firm.name
    };
    this.prevOrderNumber = resp.order_number;
  }

  _handleErrorOnGetFirm(err: any) {
    console.log(err);
    this.assessor.auditor_firm = null;
    this.assessor.auditor_firm_name = '';
    this.prevOrderNumber = '';
    this.errMessage = 'PO number not found';
    (this.shadowRoot!.querySelector('#poNumber') as PaperInputElement).invalid = true;
    this.requestUpdate();
  }

  _validatePONumber() {
    const poNumber = this.assessor.order_number;
    const valid = poNumber && poNumber.length === 10;
    const poNumberElem = this.shadowRoot!.querySelector('#poNumber') as PaperInputElement;
    if (poNumberElem) {
      poNumberElem.invalid = !valid;
    }

    return valid;
  }

  validate() {
    if (!this._validatePONumber()) {
      return false;
    }
    return this.assessor.auditor_firm && this.assessor.auditor_firm_name;
  }

  _updatePoNumber(newVal: string) {
    this.errMessage = '10 digits expected';
    this.assessor.order_number = newVal;
    this.requestUpdate();
    console.log('order_number updated', this.assessor.order_number);
  }

  getAssessorForSave() {
    return this.assessor;
  }

  isReadonly(editMode: boolean) {
    return !editMode;
  }

}
