import {GenericObject} from '../../../../../types/globals';
import {LitElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

/**
 * @customElement
 * @LitElement
 */
class PartnerDetails extends LitElement {
  render() {
    // language=HTML
    return html`
      ${gridLayoutStylesLit} ${labelAndvalueStylesLit}
      <style>
        .input-label p{
          margin: 0px;
        }
      </style>
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Partner Organization Address</span>
          <span class="input-span" ?empty="${!this.partner.address}">${this.partner.address}</span>
        </div>
        <div class="layout-vertical col-4">
          <span class="paper-label">Phone Number</span>
          <span class="input-label" ?empty="${!this.partner.phone_number}">${this.partner.phone_number}</span>
        </div>
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Authorizes Officers</span>
          <span class="input-label" ?empty="${!this.thereAreStaffMembers}">
            ${this._getStaffMembers(this.partner.id)}
            ${this.staffMembers.map(i => html`<p>${i.first_name}, ${i.last_name}</p>`)}
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

  @property({type: Array})
  staffMembers: GenericObject[] = [];

  _getStaffMembers(partnerId: number) {
    this.thereAreStaffMembers = true;
    makeRequest(getEndpoint('partnerStaffMembers', {id: partnerId}))
      .then((resp: any[]) => this.staffMembers = resp)
      .catch((err: any) => {this.staffMembers = []; logError(err)});
  }

}

window.customElements.define('partner-details', PartnerDetails);
