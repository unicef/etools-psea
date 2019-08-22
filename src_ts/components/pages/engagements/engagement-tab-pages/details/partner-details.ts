import {GenericObject} from '../../../../../types/globals';
import {LitElement, html, property} from 'lit-element';
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
          <span class="paper-label">Partner Organization Address</span>
          <span class="input-span" ?empty="${!this.partner.name}">${this.partner.name}</span>
        </div>
        <div class="layout-vertical col-4">
          <span class="paper-label">Phone Number</span>
          <span class="input-label" ?empty="${!this.partner.phone}">${this.partner.phone}</span>
        </div>
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Authorizes Officers</span>
          <span class="input-label" ?empty="${!this.thereAreStaffMembers}">
            ${this._getStaffMembers(this.partner.id)}
          </span>
        </div>
        <div class="layout-vertical col-4">
          <span class="paper-label">Email Address</span>
          <span class="input-label" ?empty="${!this.partner.email}">${this.partner.email}</span>
        </div>
      </div>
    `;
  }

  @property({type: Object, reflect: true, attribute: true})
  partner: GenericObject = {};

  @property({type: Boolean})
  thereAreStaffMembers: boolean = false;


  _getStaffMembers(partnerId) {
    this.thereAreStaffMembers = true;
    return 'TODO- get staff members'
    // TODO - call to GET partner staff members
    this.requestUpdate();
  }


}

window.customElements.define('partner-details', PartnerDetails);
