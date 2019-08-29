import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button.js';
// import {FollowUpDialog} from './follow-up-dialog';
import './follow-up-dialog';
import { FollowUpDialogEl } from './follow-up-dialog';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
// import '../../list-tab-elements/list-header/list-header';
import {EtoolsTableColumn, EtoolsTableColumnType, EtoolsTableColumnSort} from '../../../../common/layout/etools-table/etools-table'
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import { GenericObject, Constructor } from '../../../../../types/globals';
import { getFollowUpDummydata } from './follow-up-dummy-data';
import { ROOT_PATH } from '../../../../../config/config';
import {cloneDeep} from '../../../../utils/utils';

@customElement('follow-up-page')
export class FollowUpPage extends (LitElement as Constructor<LitElement>) {
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

            <!-- <template is="dom-repeat" items="[[itemsToDisplay]]" filter="_showItems"> -->
              <etools-table .items="${this.itemsToDisplay}"
                            .columns="${this.columns}">
                <!-- <div slot="checkbox" class="checkbox">
                  <paper-checkbox disabled="disabled"
                                  checked="{{item.high_priority}}"
                                  label="">
                  </paper-checkbox>
                </div> -->
                <div slot="hover" class="edit-icon-slot">
                  <paper-icon-button icon="icons:content-copy" class="edit-icon" on-tap="_openCopyDialog"></paper-icon-button>
                </div>
              </etools-table>
              <!-- <list-element class="list-element"
                            data="[[item]]"
                            base-permission-path="[[basePermissionPath]]"
                            headings="[[columns]]"
                            no-additional
                            no-animation>
                <div slot="checkbox" class="checkbox">
                  <paper-checkbox disabled="disabled"
                                  checked="{{item.high_priority}}"
                                  label="">
                  </paper-checkbox>
                </div>
                <div slot="hover" class="edit-icon-slot">
                  <paper-icon-button icon="icons:content-copy" class="edit-icon" on-tap="_openCopyDialog"></paper-icon-button>
                  <paper-icon-button icon="icons:create" class="edit-icon" on-tap="_openEditDialog" hidden$="[[!canBeEdited(item.status)]]"></paper-icon-button>
                </div>
              </list-element> -->
            <!-- </template> -->

            <template is="dom-if" if="${!this.dataItems.length}">
              <etools-table
                      data="${this.itemModel}"
                      headings="${this.columns}">
                <div slot="checkbox" class="checkbox">
                  <span>–</span>
                </div>
              </etools-table>
            </template>
        </etools-content-panel>
    `;
  }

  @property({type: Array})
  modelFields: string[] = ['assigned_to', 'category', 'description', 'section', 'office', 'due_date',
    'high_priority', 'intervention'];
  
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
      name: 'ref_number',
      link_tmpl: `${ROOT_PATH}blahblah`,
      sort: EtoolsTableColumnSort.Asc,
      type: EtoolsTableColumnType.Link
    }, {
      label: 'Action Point Category',
      name: 'category',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Assignee (Section / Office)',
      name: 'assignee',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Text
    }, {
      label: 'Due Date',
      name: 'date',
      type: EtoolsTableColumnType.Date
    }, {
      label: 'Priority',
      name: 'priority',
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

  @property({type: Array})
  itemsToDisplay!: GenericObject[];

  @property({type: Boolean})
  canBeChanged!: boolean;

  @property()
  followUpDialog: any;

  connectedCallback() {
    super.connectedCallback();
    this.createFollowUpDialog();
    this.getFollowUpData();
  }

  getFollowUpData() {
  /**
     * TODO:
     *  - replace getFollowUpDummydata with the request to endpoint
     *  - include in req params filters, sort, page, page_size
     */
    // const requestParams = {
    //   ...this.selectedFilters,
    //   page: this.paginator.page,
    //   page_size: this.paginator.page_size,
    //   sort: this.sort
    // };

    console.log('get follow-up data...');
    getFollowUpDummydata().then((response: any) => {
      // update paginator (total_pages, visible_range, count...)
      // // // this.paginator = getPaginator(this.paginator, response);
      this.itemsToDisplay = [...response.results];
    }).catch((err: any) => {
      // TODO: handle req errors
      console.error(err);
    });
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
}
