import {GenericObject} from '../../../../../types/globals';
import './assessment-info';
import './assessor-info';
import './firm-staff-members';
import {LitElement, html, property, customElement} from 'lit-element';
import {FirmStaffMembersEl} from './firm-staff-members';

/**
 * @customElement
 * @LitElement
 */
@customElement('engagement-details-page')
class EngagementDetailsPage extends LitElement {

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
      </style>

      <assessment-info .engagement="${this.engagement}"></assessment-info>
      <assessor-info @firm-changed="${this.firmChanged}"></assessor-info>
      <firm-staff-members id="firmStaffMembers"></firm-staff-members>
    `;
  }

  @property({type: Boolean})
  isNew: boolean = false;

  @property({type: Object})
  engagement!: GenericObject;

  firmChanged(e: CustomEvent) {
    let firmStaffMembersEl = this.shadowRoot!.querySelector('#firmStaffMembers') as FirmStaffMembersEl;
    firmStaffMembersEl.populateStaffMembersList(e.detail.id);
  }
}
