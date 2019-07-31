import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/globals';
import './components/assessment-info';
import './components/assessor-info';

/**
 * @customElement
 * @polymer
 */
class EngagementDetails extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          background-color: var(--secondary-background-color);
        }
      </style>

      <assessment-info assessment="{{assessment}}"></assessment-info>
      <assessor-info></assessor-info>
    `;
  }

  @property({type: Object})
  assessment!: GenericObject;

}

window.customElements.define('engagement-details', EngagementDetails);
