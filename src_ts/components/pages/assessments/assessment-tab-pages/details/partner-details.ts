import {GenericObject} from '../../../../../types/globals';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';


/**
 * @customElement
 * @LitElement
 */
@customElement('partner-details')
export class PartnerDetails extends LitElement {
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
          <span class="input-label" ?empty="${!this.partner.address}">${this.partner.address}</span>
        </div>
        <div class="layout-vertical col-4">
          <span class="paper-label">Phone Number</span>
          <span class="input-label" ?empty="${!this.partner.phone_number}">${this.partner.phone_number}</span>
        </div>
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Staff Members</span>
          <span class="input-label" ?empty="${this.staffMembers.length === 0}">
            ${this.staffMembers.map(i => html`<p>${this.getStaffName(i)}</p>`)}
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

  @property({type: Array})
  staffMembers: GenericObject[] = [];

  getStaffName(staff: any) {
    if (staff.first_name) {
      return `${staff.first_name} ${staff.last_name}`;
    }
    return staff;
  }
}
