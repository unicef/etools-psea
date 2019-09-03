import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType} from '../../../../common/layout/etools-table/etools-table';
import {defaultPaginator, EtoolsPaginator, getPaginator} from '../../../../common/layout/etools-table/pagination/paginator';
import '../../../../common/layout/etools-table/etools-table';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest} from '../../../../utils/request-helper';
import {buildUrlQueryString} from '../../../../common/layout/etools-table/etools-table-utility';
import {GenericObject} from '../../../../../types/globals';
import './staff-member-dialog';
import {StaffMemberDialogEl} from './staff-member-dialog';
import {cloneDeep} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';

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
                @tap="${() => this.openStaffMemberDialog()}"
                icon="add">
          </paper-icon-button>
        </div>

        <div class="mdc-data-table w100">
          <etools-table .columns="${this.listColumns}"
            .items="${this.staffMembers}"
            .paginator="${this.paginator}"
            @paginator-change="${this.paginatorChange}"
            showEdit
            showDelete>
          </etools-table>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  staffMembers: GenericObject[] = [];

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
  private dialogStaffMember!: StaffMemberDialogEl;

  @property({type: String})
  firmId!: string;

  connectedCallback() {
    super.connectedCallback();
    this.createAddStaffMemberDialog();
    this.initListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
  }

  initListeners() {
    this.addEventListener('edit-item', this.openStaffMemberDialog);
  }

  removeListeners() {
    this.removeEventListener('edit-item', this.openStaffMemberDialog);
    if (this.dialogStaffMember) {
      this.dialogStaffMember.removeEventListener('member-updated', this.onStaffMemberSaved);
      document.querySelector('body')!.removeChild(this.dialogStaffMember);
    }
  }

  populateStaffMembersList(firmId: string) {
    this.firmId = firmId;
    this.paginator.page = 1;
    if (!firmId) {
      this.staffMembers = [];
      return;
    }
    this.loadStaffMembers();
  }

  paginatorChange(e: CustomEvent) {
    this.paginator = {...e.detail};
    this.loadStaffMembers();
  }

  loadStaffMembers() {
    let endpoint = getEndpoint(etoolsEndpoints.staffMembers, {id: this.firmId});
    endpoint.url += `?${buildUrlQueryString(this.paginator)}`;
    makeRequest(endpoint)
      .then((resp: any) => {
        this.staffMembers = resp.results;
        this.paginator = getPaginator(this.paginator, {count: resp.count, data: this.staffMembers});
      })
      .catch((err: any) => {
        this.staffMembers = [];
        this.paginator = getPaginator(this.paginator, {count: 0, data: this.staffMembers})
        console.log(err);
      }
      );
  }

  createAddStaffMemberDialog() {
    this.dialogStaffMember = document.createElement('staff-member-dialog') as StaffMemberDialogEl;
    this.dialogStaffMember.setAttribute('id', 'dialogStaffMember');
    this.onStaffMemberSaved = this.onStaffMemberSaved.bind(this);
    this.dialogStaffMember.addEventListener('member-updated', this.onStaffMemberSaved);
    document.querySelector('body')!.appendChild(this.dialogStaffMember);
  }

  openStaffMemberDialog(event?: any) {
    if (event && event.detail) {
      this.dialogStaffMember.editedItem = cloneDeep(event.detail);
    }
    this.dialogStaffMember.firmId = this.firmId;
    this.dialogStaffMember.openDialog();
  }

  onStaffMemberSaved(e: any) {
    const savedItem = e.detail;
    const index = this.staffMembers.findIndex((r: any) => r.id === savedItem.id);
    if (index > -1) { // edit
      this.staffMembers.splice(index, 1, savedItem);
    } else {
      this.paginator.count++;
      this.staffMembers.push(savedItem);
    }
    this.paginator = getPaginator(this.paginator, {count: this.paginator.count, data: this.staffMembers});
  }

  getIndexById(id: number) {
    return this.staffMembers.findIndex((r: any) => r.id === id);
  }

}

export {FirmStaffMembers as FirmStaffMembersEl}
