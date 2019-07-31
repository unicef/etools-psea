import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {labelAndvalueStyles} from '../../../../styles/label-and-value-styles';
import {SharedStyles} from '../../../../styles/shared-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';

/**
 * @customElement
 * @polymer
 */
class ExternalIndividual extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style></style>
      ${labelAndvalueStyles}${SharedStyles}${gridLayoutStyles}
      <div class="row-padding-v">
        <etools-dropdown label="Select External Individual">
        </etools-dropdown>
        <label class="paper-label">User not yet in the system? Add them <a on-tap="_openAddDialog">here</a></label>
      </div>
    `;
  }


  _openAddDialog() {
    console.log('here');
  }
}

window.customElements.define('external-individual', ExternalIndividual)

