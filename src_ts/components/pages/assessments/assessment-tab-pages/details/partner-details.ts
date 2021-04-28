import {GenericObject} from '../../../../../types/globals';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import isEmpty from 'lodash-es/isEmpty';

/**
 * @customElement
 * @LitElement
 */
@customElement('partner-details')
export class PartnerDetails extends LitElement {
  static get styles() {
    return [labelAndvalueStylesLit, gridLayoutStylesLit];
  }
  render() {
    // language=HTML
    return html`
      <style>
        .input-label p {
          margin: 0;
        }
        iron-icon {
          color: var(--secondary-text-color);
        }
      </style>
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Vendor Number</span>
          <span class="input-label" ?empty="${!this.partner.vendor_number}">${this.partner.vendor_number}</span>
        </div>
        <div class="layout-vertical col-8">
          <span class="paper-label">Partner Type</span>
          <span class="input-label" ?empty="${!this._computePartnerType(this.partner)}"
            >${this._computePartnerType(this.partner)}</span
          >
        </div>
      </div>
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-12">
          <span class="paper-label">Partner Organization Address</span>
          <span class="input-label" ?empty="${!this.partner.address}">
            <iron-icon icon="communication:location-on"></iron-icon>
            ${this.partner.address}
          </span>
        </div>
      </div>
      <div class="layout-horizontal row-padding-v">
        <div class="layout-vertical col-4">
          <span class="paper-label">Phone Number</span>
          <span class="input-label" ?empty="${!this.partner.phone_number}">
            <iron-icon icon="communication:phone"></iron-icon>
            ${this.partner.phone_number}
          </span>
        </div>
        <div class="layout-vertical col-8">
          <span class="paper-label">Email Address</span>
          <span class="input-label" ?empty="${!this.partner.email}">
            <iron-icon icon="communication:email"></iron-icon>
            ${this.partner.email}
          </span>
        </div>
      </div>
    `;
  }

  @property({type: Object, reflect: true, attribute: true})
  partner: GenericObject = {};

  _computePartnerType(partner: GenericObject) {
    return !isEmpty(partner) ? this._getPartnerType(partner.partner_type, partner.cso_type) : '';
  }

  _getPartnerType(partnerType: any, csoType: any) {
    return csoType !== null ? `${partnerType}/${csoType}` : partnerType;
  }
}
