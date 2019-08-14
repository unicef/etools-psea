import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/globals';
import './assessment-info';
import './assessor-info';
import './firm-staff-members';

/**
 * @customElement
 * @polymer
 */
class EngagementDetailsPage extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
      </style>

      <assessment-info engagement="{{engagement}}"></assessment-info>
      <assessor-info></assessor-info>
      <firm-staff-members></firm-staff-members>
    `;
  }

  @property({type: Object})
  engagement!: GenericObject;

}

window.customElements.define('engagement-details-page', EngagementDetailsPage);
