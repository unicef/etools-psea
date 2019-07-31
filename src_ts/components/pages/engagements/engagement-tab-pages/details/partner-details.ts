import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/globals';
import {labelAndvalueStyles} from '../../../../styles/label-and-value-styles';


/**
 * @customElement
 * @polymer
 */
class PartnerDetails extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${labelAndvalueStyles}
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <label class="paper-label">Partner Organization address</label>
          <label class="input-label" empty$="[[!partner.name]]">[[partner.name]]</label>
        </div>
        <div class="layout-vertical col-4">
          <label class="paper-label">Phone Number</label>
          <label class="input-label" empty$="[[!partner.phone]]">[[partner.Phone]]</label>
        </div>
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <label class="paper-label">Authorizes Officers</label>
          <label class="input-label" empty$="[[!partner.name]]">[[partner.name]]</label>
        </div>
        <div class="layout-vertical col-4">
          <label class="paper-label">Email Address</label>
          <label class="input-label" empty$="[[!partner.name]]">[[partner.name]]</label>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  partner: GenericObject = {};

}

window.customElements.define('partner-details', PartnerDetails)
