import {GenericObject} from '../../../../../types/globals';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
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
        .header th{
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text-color);
        }
        .row td{
          font-size: 16px;
          color: var(--primary-text-color);
        }

        paper-icon-button#editrow {
          visibility: visible;
        }

        tr:hover td paper-icon-button#editrow {
          visibility: visible;
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
          <table class="mdc-data-table__table" aria-label="Firm Staff Members">
            <thead>
              <tr class="mdc-data-table__header-row header">
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Has Access</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Position</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">First Name</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Last Name</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Phone Number</th>
                <th class="mdc-data-table__header-cell" role="columnheader" scope="col">E-mail Address</th>
              </tr>
            </thead>
            <tbody class="mdc-data-table__content">
            ${this.staffMembers.map(staff => html`
                <tr class="mdc-data-table__row row">
                  <td class="mdc-data-table__cell"></td>
                  <td class="mdc-data-table__cell">${staff.user.profile.job_title}</td>
                  <td class="mdc-data-table__cell">${staff.user.first_name}</td>
                  <td class="mdc-data-table__cell">${staff.user.last_name}</td>
                  <td class="mdc-data-table__cell">${staff.user.profile.phone_number}</td>
                  <td class="mdc-data-table__cell layout-horizontal space-between align-items-center">${staff.user.email} <paper-icon-button id="editrow"
                  icon="create">
            </paper-icon-button></td>

                </tr>
            `)}
            </tbody>
          </table>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  staffMembers: GenericObject = [
    {
      "id": 431,
      "user": {
        "first_name": "Alv",
        "last_name": "Aro",
        "email": "alvaro@gmail.org",
        "is_active": true,
        "profile": {
          "job_title": "",
          "phone_number": ""
        },
        "full_name": "Alv Aro"
      },
      "hidden": false,
      "hasAccess": false
    },
    {
      "id": 426,
      "user": {
        "first_name": "Suciu",
        "last_name": "Alina",
        "email": "alinaaa.testing1@gmail.com",
        "is_active": true,
        "profile": {
          "job_title": "",
          "phone_number": "0748618743"
        },
        "full_name": "Suciu Alina"
      },
      "hidden": false,
      "hasAccess": true
    },
    {
      "id": 424,
      "user": {
        "first_name": "Adriana",
        "last_name": "Trif",
        "email": "adriana.trif@nordlogic.com",
        "is_active": true,
        "profile": {
          "job_title": "Grand Duchess",
          "phone_number": "12345671"
        },
        "full_name": "Adriana Trif"
      },
      "hidden": false,
      "hasAccess": true
    }

  ];


  _allowAdd() {

  }
}

window.customElements.define('firm-staff-members', FirmStaffMembers);
