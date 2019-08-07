import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-spinner/paper-spinner';
import {property} from '@polymer/decorators';
import {labelAndvalueStyles} from '../../../../styles/label-and-value-styles';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {GenericObject} from '../../../../../types/globals';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @customElement
 * @polymer
 */
class AssessingFirm extends EtoolsAjaxRequestMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      <style>
        .input-width {
          max-width: 230px;
        }
      </style>
      ${labelAndvalueStyles}${gridLayoutStyles}
      <paper-input id="poNumber" label="Enter PO Number" always-float-label
        class="input-width row-padding-v"
        value="{{engagement.po_number}}"
        allowed-pattern="[0-9]"
        max-length=10
        on-blur="_getFirmName">
      </paper-input>
      <div class="layout-vertical row-padding-v" hidden$="[[_hideFirmName(originalEngagement.firm_name, requestInProgress)]]">
        <label class="paper-label">Firm Name</label>
        <label class="input-label">
        [[engagement.firm_name]]
        <paper-spinner hidden$="[[!requestInProgress]]" active="[[requestInProgress]]"></paper-spinner>
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
   // poNumberElem!.invalid = valid;

    return valid;
  }

  _hideFirmName(firmName ,requestInProgress) {
    return !(firmName || requestInProgress);
  }

}

window.customElements.define('assessing-firm', AssessingFirm);

