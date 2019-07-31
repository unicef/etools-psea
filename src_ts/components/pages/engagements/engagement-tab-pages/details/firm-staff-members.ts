import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/globals';
import '@unicef-polymer/etools-content-panel/etools-content-panel';

/**
 * @customElement
 * @polymer
 */
class FirmStaffMembers extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <etools-content-panel panel-title="Firm Staff Member with Access">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowAdd"
                icon="create">
          </paper-icon-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  engagement!: GenericObject;


  _allowAdd() {

  }
}

window.customElements.define('firm-staff-members', FirmStaffMembers);
