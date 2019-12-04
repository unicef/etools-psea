import './assessment-info';
import './assessor-info';
import './firm-staff-members';
import {LitElement, html, property, customElement} from 'lit-element';
import {store, RootState} from '../../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';

/**
 * @customElement
 * @LitElement
 */
@customElement('assessment-details-page')
export class AssessmentDetailsPage extends connect(store)(LitElement) {
  // static get styles() {
  //   return []
  // }
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
      <assessor-info ?hidden="${this.isNew}"></assessor-info>
    `;
  }

  @property({type: Boolean, reflect: true})
  isNew: boolean = false;

  stateChanged(state: RootState) {
    if (state.app!.routeDetails && state.app!.routeDetails.params) {
      this.isNew = (state.app!.routeDetails.params.assessmentId === 'new');
    }
  }

}
