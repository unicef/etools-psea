import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType} from '../../../../common/layout/etools-table/etools-table';
import {
  defaultPaginator,
  EtoolsPaginator,
  getPaginator
} from '../../../../common/layout/etools-table/pagination/paginator';
import '../../../../common/layout/etools-table/etools-table';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {makeRequest, RequestEndpoint} from '../../../../utils/request-helper';
import {buildUrlQueryString} from '../../../../common/layout/etools-table/etools-table-utility';
import {GenericObject} from '../../../../../types/globals';
import './staff-member-dialog';
import {StaffMemberDialog} from './staff-member-dialog';
import {cloneDeep} from '../../../../utils/utils';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {EtoolsStaffMemberModel} from "../../../../user/user-model";
import {fireEvent} from "../../../../utils/fire-custom-event";
import {formatServerErrorAsText} from "../../../../utils/ajax-error-parser";

/**
 * @customElement
 * @LitElement
 */
@customElement('firm-staff-members')
export class FirmStaffMembers extends LitElement {

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
            @edit-item="${this.openStaffMemberDialog}" 
            @item-updated="${this.itemUpdated}">
          </etools-table>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Number})
  assessmentId!: number;

  @property({type: Array})
  currentFirmAssessorStaffWithAccess!: number[];

  @property({type: Number})
  assessorId!: number;

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
  private dialogStaffMember!: StaffMemberDialog;

  @property({type: String})
  firmId!: string;

  connectedCallback() {
    super.connectedCallback();
    this.createAddStaffMemberDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
  }

  removeListeners() {
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
    const endpoint = getEndpoint(etoolsEndpoints.staffMembers, {id: this.firmId});
    endpoint.url += `?${buildUrlQueryString(this.paginator)}`;
    makeRequest(endpoint as RequestEndpoint)
      .then((resp: any) => {
        this.staffMembers = resp.results.map((sm: any) => {
          return {...sm, hasAccess: this.currentFirmAssessorStaffWithAccess.includes(sm.id)}
        });
        this.paginator = getPaginator(this.paginator, {count: resp.count, data: this.staffMembers});
      })
      .catch((err: any) => {
        this.staffMembers = [];
        this.paginator = getPaginator(this.paginator, {count: 0, data: this.staffMembers});
        console.log(err);
      });
  }

  createAddStaffMemberDialog() {
    this.dialogStaffMember = document.createElement('staff-member-dialog') as StaffMemberDialog;
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
    this.updateItemData(savedItem);
    this.updateFirmAssessorStaffAccess(savedItem as EtoolsStaffMemberModel);
  }

  updateItemData(itemData: any) {
    const index = this.staffMembers.findIndex((r: any) => r.id === itemData.id);
    if (index > -1) { // edit
      this.staffMembers.splice(index, 1, itemData);
    } else {
      this.paginator.count++;
      this.staffMembers.push(itemData);
    }
    this.paginator = getPaginator(this.paginator, {count: this.paginator.count, data: this.staffMembers});
  }

  updateFirmAssessorStaffAccess(staffMember: EtoolsStaffMemberModel) {
    if ((staffMember.hasAccess && this.currentFirmAssessorStaffWithAccess.includes(staffMember.id)) ||
      (!staffMember.hasAccess && !this.currentFirmAssessorStaffWithAccess.includes(staffMember.id))) {
      return;
    }

    let updatedStaffWithAccessIds: number[] = [...this.currentFirmAssessorStaffWithAccess];
    if (staffMember.hasAccess) {
      updatedStaffWithAccessIds.push(staffMember.id);
    } else {
      updatedStaffWithAccessIds = updatedStaffWithAccessIds.filter((id: number) => id !== staffMember.id);
    }

    const baseUrl = getEndpoint(etoolsEndpoints.assessor, {id: this.assessmentId}).url!;
    const endpointData = new RequestEndpoint(baseUrl + this.assessorId + '/', 'PATCH');

    makeRequest(endpointData, {auditor_firm_staff: updatedStaffWithAccessIds})
      .then((resp) => {
        this.currentFirmAssessorStaffWithAccess = [...resp.auditor_firm_staff];
        fireEvent(this, 'toast', {
          text: `${staffMember.user.first_name} ${staffMember.user.last_name} access has been updated`});
      })
      .catch((err: any) =>
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err), showCloseBtn: true}));
  }

  itemUpdated(e: CustomEvent) {
    this.updateItemData(e.detail);
    this.updateFirmAssessorStaffAccess(e.detail as EtoolsStaffMemberModel);
  }

}
