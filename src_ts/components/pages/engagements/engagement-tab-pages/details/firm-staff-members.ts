import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType} from '../../../../common/layout/etools-table/etools-table';
import {defaultPaginator, EtoolsPaginator, getPaginator} from '../../../../common/layout/etools-table/pagination/paginator';
import '../../../../common/layout/etools-table/etools-table';

/**
 * @customElement
 * @LitElement
 */
@customElement('firm-staff-members')
class FirmStaffMembers extends LitElement {

  render() {
    // language=HTML
    return html`
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
          <etools-table .columns="${this.listColumns}"
            .items="${this.staffMembers}"
            .paginator="${this.paginator}"
            showEdit
            showDelete>
          </etools-table>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  staffMembers = [
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
        "first_name": "Ariana",
        "last_name": "Grande",
        "email": "ariana@nordlogic.com",
        "is_active": true,
        "profile": {
          "job_title": "Duchess",
          "phone_number": "12345671"
        },
        "full_name": "Ariana Grande"
      },
      "hidden": false,
      "hasAccess": true
    }
  ];

  @property({type: Object})
  paginator: EtoolsPaginator = {...defaultPaginator};

  @property({type: Array})
  listColumns: EtoolsTableColumn[] = [
    {
      label: 'Has Access',
      name: 'hasAccess',
      type: EtoolsTableColumnType.Checkbox
    },
    {
      label: 'Position',
      name: 'user.profile.job_title',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'First Name',
      name: 'user.first_name',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Last Name',
      name: 'user.last_name',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Phone Number',
      name: 'user.profile.phone_number',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'E-mail Address',
      name: 'user.email',
      type: EtoolsTableColumnType.Text
    }
  ];

  connectedCallback() {
    super.connectedCallback();
    this.populateStaffMembersList('2');// TODO remove
  }

  populateStaffMembersList(firmId: string) {
    // call to get staff members by firmId
    this.paginator = getPaginator(this.paginator, {count: this.staffMembers.length, data:this.staffMembers});//TODO getP by response
  }

  _allowAdd() {

  }
}

export {FirmStaffMembers as FirmStaffMembersEl}
