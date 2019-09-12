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
import {EtoolsTableColumn, EtoolsTableColumnType} from '../../../../common/layout/etools-table/etools-table'
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import { GenericObject, Constructor } from '../../../../../types/globals';
import { cloneDeep } from '../../../../utils/utils';
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
        
        <etools-table .items="${this.hasItems ? this.dataItems : this.blankAPList}"
                      .columns="${this.columns}"
                      ?showEdit="${this.hasItems}"
                      ?showCopy="${this.hasItems}">
        </etools-table>
      </etools-content-panel>
    `;
  }
  
  @property({type: Array})
  dataItems: object[] = [];

  @property({type: Array})
  blankAPList: object[] = [
    {reference_number: '', category: '', assigned_to: '', status: '', due_date: '', high_priority: ''}
  ];

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Reference #',
      name: 'reference_number',
      type: EtoolsTableColumnType.Link,
      link_tmpl: `/apd/action-points/detail/:id`
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
  followUpDialog: any;

  @property({type: String})
  assessmentId: string | number | null = null;

  @property({type: Boolean})
  hasItems: boolean = false;

  @property({type: Boolean})
  listLoaded: boolean = false;

  @property({type: Number})
  partnerId: number | null = null;

  stateChanged(state: RootState) {
    if (state.app && state.app.routeDetails.params && state.app.routeDetails.params.assessmentId !== 'new') {
      if (this.assessmentId !== state.app.routeDetails.params.assessmentId) {
        this.assessmentId = state.app.routeDetails.params.assessmentId
        this.getFollowUpData();
      }
      if (!this.listLoaded) {
        this.getFollowUpData();
      }
    }

    if (state && state.pageData && state.pageData.currentAssessment && this.followUpDialog) {
      // @ts-ignore
      this.partnerId = state.pageData.currentAssessment.partner
      this.followUpDialog.selectedPartnerId = this.partnerId;
      this.followUpDialog.editedItem.partner = this.partnerId;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.createFollowUpDialog();
    this.addEventListener('edit-item', (e) => this.editActionPoint(e));
    this.addEventListener('copy-item', (e) => this.copyActionPoint(e));
    document.addEventListener('action-point-updated', (e) => this.updateActionPoints(e));
  }

  updateActionPoints(event: GenericObject) {
    let oldArray = cloneDeep(this.dataItems);
    let existingActionPointIndex: number = this.dataItems.findIndex((ap: GenericObject) => ap.id === event.detail.id);
    if (existingActionPointIndex > -1) {
      oldArray.splice(existingActionPointIndex, 1, event.detail);
    } else {
      oldArray.push(event.detail);
    }
    this.dataItems = oldArray;
    this.requestUpdate();
  }

  getFollowUpData() {
    let endpoint = getEndpoint(etoolsEndpoints.actionPoints, {id: this.assessmentId})
    // @ts-ignore
    makeRequest(endpoint).then((response: any) => {
      this.dataItems = response;
      this.hasItems = this.dataItems.length ? true : false;
    }).catch((err: any) => console.error(err));
    this.listLoaded = true;
  }

  editActionPoint(event: GenericObject) {
    this.extractActionPointData(event.detail);
    this.openFollowUpDialog();
  }

  copyActionPoint(event: GenericObject) {
    this.extractActionPointData(event.detail);
    this.followUpDialog.editedItem.id = 0;
    this.followUpDialog.watchForChanges = true;
    this.openFollowUpDialog();
  }

  extractActionPointData(item: GenericObject) {
    let newEditedItem = {partner: null, category: null, assigned_to: null, section: '', office: null};
    newEditedItem.partner = item.partner.id;
    // newEditedItem.category = item.category.id;
    newEditedItem.assigned_to = item.assigned_to.id;
    newEditedItem.section = item.section.id;
    newEditedItem.office = item.office.id;
    this.followUpDialog.editedItem = newEditedItem;
  }

  createFollowUpDialog() {
    this.followUpDialog = document.createElement('follow-up-dialog') as FollowUpDialogEl;
    this.followUpDialog.setAttribute('id', 'followUpDialog');
    this.followUpDialog.assessmentId = this.assessmentId;
    this.followUpDialog.toastEventSource = this;
    document.querySelector('body')!.appendChild(this.followUpDialog);
  }

  openFollowUpDialog(event?: any) {
    if (event && event.detail) {
      this.followUpDialog.editedItem = cloneDeep(event.detail);
    }
    this.followUpDialog.openDialog();
  }
}
