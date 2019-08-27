import {LitElement, html, property} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-spinner/paper-spinner';
import {GenericObject} from '../../../../../types/globals';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {cloneDeep} from 'lodash-es';

/**
 * @customElement
 * @LitElement
 */
class AssessingFirm extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        .input-width {
          max-width: 230px;
        }

      </style>
      ${SharedStylesLit}${labelAndvalueStylesLit}${gridLayoutStylesLit}
      <div class="row-padding-v">
        <paper-input id="poNumber" label="Enter PO Number" always-float-label
          class="input-width"
          .value="${this.engagement.order_number}"
          @value-changed=${(e: CustomEvent) => this._updateEngagementPoNumber((e.target! as PaperInputElement).value!)}
          allowed-pattern="[0-9]"
          max-length=10
          error-message="PO number is incorrect"
          @blur="${this._getFirmName}">
        </paper-input>
      </div>
      <div class="layout-vertical row-padding-v"
          ?hidden="${this._hideFirmName(this.engagement.name, this.requestInProgress)}">
        <label class="paper-label">Firm Name</label>
        <label class="input-label row-padding-v">
          ${this.engagement.name}
          <paper-spinner ?hidden="${!this.requestInProgress}" ?active="${this.requestInProgress}"></paper-spinner>
        </label>

      </div>
    `;
  }

  @property({type: String})
  prevOrderNumber: string = '';

  @property({type: Object})
  engagement: GenericObject = {name: ''};

  @property({type: Object})
  assessor!: GenericObject;

  @property({type: Boolean})
  requestInProgress: boolean = false;


  _getFirmName() {

    if (!this._validatePONumber()) {
      return;
    }

    if (Number(this.engagement.order_number) === Number(this.prevOrderNumber)) {
      return;
    }
    this.requestInProgress = true;

    makeRequest(getEndpoint('auditorFirm', {id: this.engagement.order_number}))
      .then((resp: any) => {
        this.assessor = {auditor_firm: resp.auditor_firm.id, order_number:  resp.order_number};
        this.engagement = {name: resp.auditor_firm.name, order_number: resp.order_number};
        this.prevOrderNumber = resp.order_number;
        this.requestInProgress = false;
        this.dispatchEvent(new CustomEvent('firm-changed', {
          detail: resp.auditor_firm,
          bubbles: true,
          composed: true
        }));
      })
      .catch((err: any) => {this.requestInProgress = false; console.log(err)});
  }

  _validatePONumber() {
    const poNumber = this.engagement.order_number;
    const valid = poNumber && poNumber.length === 10;
    const poNumberElem = this.shadowRoot!.querySelector('#poNumber') as PaperInputElement;
    if (poNumberElem) {
      poNumberElem.invalid = !valid;
    }

    return valid;
  }
  _updateEngagementPoNumber(newVal: string) {
    this.engagement.order_number = newVal;
  }

  _hideFirmName(firmName: string, requestInProgress: boolean) {
    return !(firmName || requestInProgress);
  }

}

window.customElements.define('assessing-firm', AssessingFirm);
