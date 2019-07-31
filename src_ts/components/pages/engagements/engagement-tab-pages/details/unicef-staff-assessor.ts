import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';


/**
 * @customElement
 * @polymer
 */
class UnicefStaffAssessor extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style></style>
      ${gridLayoutStyles}
      <etools-dropdown label="Unicef Staff" class="row-padding-v">
      </<etools-dropdown>
    `;
  }


}

window.customElements.define('unicef-staff-assessor', UnicefStaffAssessor)

