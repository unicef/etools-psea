import {LitElement, html, property} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-spinner/paper-spinner';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {GenericObject} from '../../../../../types/globals';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {PaperInputElement} from '@polymer/paper-input/paper-input';


/**
 * @customElement
 * @polymer
 */
class AssessingFirm extends EtoolsAjaxRequestMixin(LitElement) {
  render() {
    // language=HTML
    return html`
      <style>
        .input-width {
          max-width: 230px;
        }
      </style>
      ${labelAndvalueStylesLit}${gridLayoutStylesLit}
      <div class="row-padding-v">
        <paper-input id="poNumber" label="Enter PO Number" always-float-label
          class="input-width"
          .value="${this.engagement.po_number}"
          @value-changed=${e => this._updateEngagementPoNumber(e.target.value)}
          allowed-pattern="[0-9]"
          max-length=10
          error-message="PO number is incorrect"
          @blur="${this._getFirmName}">
        </paper-input>
      </div>
      <div class="layout-vertical row-padding-v" ?hidden="${this._hideFirmName(this.originalEngagement.firm_name, this.requestInProgress)}">
        <label class="paper-label">Firm Name</label>
        <label class="input-label row-padding-v">
          ${this.engagement.firm_name}
          <paper-spinner ?hidden="${!this.requestInProgress}" ?active="${this.requestInProgress}"></paper-spinner>
        </label>

      </div>
    `;
  }


  @property({type: Object})
  originalEngagement: GenericObject = {};

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Boolean})
  requestInProgress: boolean = false;


  _getFirmName() {

    if (!this._validatePONumber()) {
      return;
    }

    if (Number(this.engagement.po_number) === Number(this.originalEngagement.po_number)) {
      return;
    }
    this.requestInProgress = true;

    // make call to endpoint to get Firm name
  }

  _validatePONumber() {
    let poNumber = this.engagement.po_number;
    let valid = poNumber && poNumber.length === 10;
    let poNumberElem = this.shadowRoot!.querySelector('#poNumber') as PaperInputElement;
    if (poNumberElem) {
      poNumberElem.invalid = !valid;
    }

    return valid;
  }
  _updateEngagementPoNumber(newVal: string) {
    this.engagement.po_number = newVal;
  }

  _hideFirmName(firmName: string ,requestInProgress: boolean) {
    return !(firmName || requestInProgress);
  }

}

window.customElements.define('assessing-firm', AssessingFirm);

