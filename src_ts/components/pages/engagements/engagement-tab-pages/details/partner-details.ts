import {GenericObject} from '../../../../../types/globals';
import { LitElement, html, property } from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';


/**
 * @customElement
 * @LitElement
 */
class PartnerDetails extends LitElement {
  render() {
    // language=HTML
    return html`
      ${gridLayoutStylesLit} ${labelAndvalueStylesLit}
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <label class="paper-label">Partner Organization Address</label>
          <label class="input-label" ?empty="${!this.partner.name}">${this.partner.name}</label>
        </div>
        <div class="layout-vertical col-4">
          <label class="paper-label">Phone Number</label>
          <label class="input-label" ?empty="${!this.partner.phone}">${this.partner.phone}</label>
        </div>
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <label class="paper-label">Authorizes Officers</label>
          <label class="input-label" ?empty="${!this.partner.authorized_officers}">${this.partner.authorized_officers}</label>
        </div>
        <div class="layout-vertical col-4">
          <label class="paper-label">Email Address</label>
          <label class="input-label" ?empty="${!this.partner.email}">${this.partner.email}</label>
        </div>
      </div>
    `;
  }

  @property({type: Object, reflect: true, attribute: true})
  partner: GenericObject = {};

}

window.customElements.define('partner-details', PartnerDetails)
