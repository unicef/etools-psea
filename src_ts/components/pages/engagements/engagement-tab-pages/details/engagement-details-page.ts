import {GenericObject} from '../../../../../types/globals';
import './assessment-info';
import './assessor-info';
import './firm-staff-members';
import {LitElement, html, property, customElement} from 'lit-element';
import {FirmStaffMembersEl} from './firm-staff-members';
import {store, RootState} from '../../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';

/**
 * @customElement
 * @LitElement
 */
@customElement('engagement-details-page')
class EngagementDetailsPage extends connect(store)(LitElement) {

  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
      </style>

      <assessment-info></assessment-info>
      <assessor-info ?hidden="${this.isNew}" .assessmentId="${this.assessmentId}" @firm-changed="${this.firmChanged}"></assessor-info>
      <firm-staff-members hidden id="firmStaffMembers"></firm-staff-members>
    `;
  }

  @property({type: Boolean, reflect: true})
  isNew: boolean = false;

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  assessmentId!: string | number;

  stateChanged(state: RootState) {
    if (state.app!.routeDetails && state.app!.routeDetails.params) {
      this.assessmentId = state.app!.routeDetails.params.engagementId;
      this.isNew = (this.assessmentId === 'new');
    }
  }

  firmChanged(e: CustomEvent) {
    let firmStaffMembersEl = this.shadowRoot!.querySelector('#firmStaffMembers') as FirmStaffMembersEl;
    firmStaffMembersEl.hidden = false;
    firmStaffMembersEl.populateStaffMembersList(e.detail.id);
  }


}
