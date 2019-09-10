import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './follow-up-dialog';
import { FollowUpDialogEl } from './follow-up-dialog';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
// import '../../list-tab-elements/list-header/list-header';
import {EtoolsTableColumn, EtoolsTableColumnType} from '../../../../common/layout/etools-table/etools-table'
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import { GenericObject, Constructor } from '../../../../../types/globals';
// import { getFollowUpDummydata } from './follow-up-dummy-data';
// import { ROOT_PATH } from '../../../../../config/config';
import {cloneDeep} from '../../../../utils/utils';
import { makeRequest } from '../../../../utils/request-helper';
import { etoolsEndpoints } from '../../../../../endpoints/endpoints-list';
import { getEndpoint } from '../../../../../endpoints/endpoints';
import { RootState, store } from '../../../../../redux/store';
import { connect } from 'pwa-helpers/connect-mixin';

@customElement('follow-up-page')
export class FollowUpPage extends connect(store)(LitElement as Constructor<LitElement>) {
  render() {
    return html`
      <etools-content-panel panel-title="Action Points">
        <div slot="panel-btns">
          <paper-icon-button
                @tap="${() => this.openFollowUpDialog()}"
                icon="add">
          </paper-icon-button>
        </div>

        <!-- <list-header data="[[columns]]"
                     order-by="{{orderBy}}"
                     no-additional
                     base-permission-path="[[basePermissionPath]]"></list-header> -->
        ${this.hasItems ? 
        html`<etools-table .items="${this.dataItems}"
                           .columns="${this.columns}"
                           showEdit
                           showCopy>
        </etools-table>` : 
        html`<div>
        <etools-table
                .items"${this.dataItems}"
                .columns="${this.columns}">
          <div slot="checkbox" class="checkbox">
            <span>–</span>
          </div>
        </etools-table></div>`}
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  modelFields: string[] = ['assigned_to', 'category', 'description', 'section', 'office', 'due_date',
    'high_priority', 'psea_assessment'];
  
  @property({type: Array})
  dataItems: object[] = [];
  
  @property({type: Object})
  itemModel: GenericObject = {
    assigned_to: '',
    due_date: undefined,
    description: '',
    high_priority: false
  };

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Reference #',
      name: 'reference_number',
      // link_tmpl: `${ROOT_PATH}blahblah`,
      // sort: EtoolsTableColumnSort.Asc,
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Action Point Category',
      name: 'category',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Assignee (Section / Office)',
      name: 'assigned_to.name',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Due Date',
      name: 'due_date',
      type: EtoolsTableColumnType.Date
    }, {
      label: 'Priority',
      name: 'high_priority',
      type: EtoolsTableColumnType.Text
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add Action Point', confirmBtn: 'Save'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Action Point'};

  @property({type: Object})
  copyDialogTexts: GenericObject = {title: 'Duplicate Action Point'};

  @property({type: Array})
  viewDialogTexts: GenericObject = {title: 'View Action Point'};

  @property({type: String})
  orderBy: string = '-reference_number';

  @property({type: Object})
  requestData!: GenericObject;

  @property({type: Boolean})
  copyDialog!: boolean;

  // @property({type: Array})
  // itemsToDisplay!: GenericObject[];

  @property({type: Boolean})
  canBeChanged!: boolean;

  @property({type: Object})
  followUpDialog: any;

  @property({type: String})
  assessmentId: string | number | null = null;

  @property({type: Boolean})
  hasItems: boolean = false;

  stateChanged(state: RootState) {
    if (state.app && state.app.routeDetails.params && state.app.routeDetails.params.assessmentId) {
      this.assessmentId = state.app.routeDetails.params.assessmentId
      this.getFollowUpData();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.createFollowUpDialog();
    this.addEventListener('edit-item', () => this.editActionPoint());
    this.addEventListener('copy-item', () => this.copyActionPoint());
  }

  getFollowUpData() {
    let endpoint = getEndpoint(etoolsEndpoints.actionPoints, {id: this.assessmentId})

    console.log('get follow-up data...');
    // @ts-ignore
    makeRequest(endpoint).then((response: any) => {
      // debugger
      this.dataItems = response;
      this.hasItems = true;
    }).catch((err: any) => console.error(err));
  }

  editActionPoint() {
    console.log('editttttt');
  }

  copyActionPoint() {
    console.log('copyyyyy');
  }

  createFollowUpDialog() {
    this.followUpDialog = document.createElement('follow-up-dialog') as FollowUpDialogEl;
    this.followUpDialog.setAttribute('id', 'followUpDialog');
    // this.onStaffMemberSaved = this.onStaffMemberSaved.bind(this);
    // this.followUpDialog.addEventListener('member-updated', this.onStaffMemberSaved);
    document.querySelector('body')!.appendChild(this.followUpDialog);
  }

  openFollowUpDialog(event?: any) {
    if (event && event.detail) {
      this.followUpDialog.editedItem = cloneDeep(event.detail);
    }
    // this.followUpDialog.firmId = this.firmId;
    this.followUpDialog.openDialog();
  }

  canBeEdited(status: string) {
    return status !== 'completed';
  }
}
