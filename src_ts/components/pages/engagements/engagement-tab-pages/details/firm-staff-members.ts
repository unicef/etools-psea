import {GenericObject} from '../../../../../types/globals';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {LitElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';

/**
 * @customElement
 * @LitElement
 */
class FirmStaffMembers extends LitElement {

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="../../../../../../node_modules/@material/data-table/dist/mdc.data-table.css">
      ${gridLayoutStylesLit}
      <style>
        :host {
          display: block;
          --ecp-content: {
            padding: 0 0;
          }
        }
      </style>
      <etools-content-panel panel-title="Firm Staff Members with Access">
        <div slot="panel-btns">
          <paper-icon-button
                on-tap="_allowAdd"
                icon="add">
          </paper-icon-button>
        </div>

        <div class="mdc-data-table w100">
          <table class="mdc-data-table__table" aria-label="Dessert calories">
            <thead>
              <tr class="mdc-data-table__header-row">
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Dessert</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Carbs (g)</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Protein (g)</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Comments</th>
              </tr>
            </thead>
            <tbody class="mdc-data-table__content">
              <tr class="mdc-data-table__row">
                <td class="mdc-data-table__cell">Frozen yogurt</td>
                <td class="mdc-data-table__cell">24</td>
                <td class="mdc-data-table__cell">4.0</td>
                <td class="mdc-data-table__cell">Super tasty</td>
              </tr>
            </tbody>
          </table>
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
