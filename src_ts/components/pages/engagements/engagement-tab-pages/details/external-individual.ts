import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {LitElement, html} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';

/**
 * @customElement
 * @polymer
 */
class ExternalIndividual extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      ${labelAndvalueStylesLit}${SharedStylesLit}${gridLayoutStylesLit}
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

