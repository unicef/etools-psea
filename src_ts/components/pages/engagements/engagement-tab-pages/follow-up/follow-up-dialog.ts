import { LitElement, html, property, customElement } from 'lit-element';
import { GenericObject, Constructor } from '../../../../../types/globals';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import { fireEvent } from '../../../../utils/fire-custom-event';
import { getEndpoint } from '../../../../../endpoints/endpoints';
import { inputsStyles } from '../../../../styles/inputs-styles';
import { makeRequest } from '../../../../utils/request-helper';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../../../redux/store';
import './get-partner-data';
import get from 'lodash-es/get';
import omit from 'lodash-es/omit';
import { SharedStylesLit } from '../../../../styles/shared-styles-lit'; 
// import { etoolsEndpoints } from '../../../../../endpoints/endpoints-list';
import { labelAndvalueStylesLit } from '../../../../styles/label-and-value-styles-lit';
import { gridLayoutStylesLit } from '../../../../styles/grid-layout-styles-lit';

let _permissionCollection: {
  edited_ap_options?: {allowed_actions:[]},
  new_engagement?: {POST:GenericObject, GET: GenericObject, allowed_actions:[]},
  new_staff_sc?:{POST:GenericObject, GET:GenericObject, title:string, allowed_actions:[]},
  [key:string]: any
} = {};

@customElement('follow-up-dialog')
class FollowUpDialog extends connect(store)(LitElement as Constructor<LitElement>) {
  render() {
    return html`
    ${inputsStyles}
      <style>
        etools-content-panel {
          --ecp-content: {
                padding: 0;
            };
        }
        etools-dropdown.fua-category {
          --paper-listbox: {
                max-height: 340px;
                -ms-overflow-style: auto;
            };
        }
        etools-dropdown.fua-person {
          --paper-listbox: {
                max-height: 140px;
                -ms-overflow-style: auto;
            };
        }
        .checkbox-container {
          padding-left: 12px;
          box-sizing: border-box;
          height: 34px;
          padding-top: 6px;
        }
        .input-container paper-button {
          height: 34px;
          color: rgba(0, 0, 0, .54);
          font-weight: 500;
          z-index: 5;
          border: 1px solid rgba(0, 0, 0, .54);
          padding: 6px 13px;
        }
      </style>
      <get-partner-data partner="${this.fullPartner}" partner-id="${this.selectedPartnerId}"></get-partner-data>
      <etools-dialog no-padding keep-dialog-open size="md"
            ?opened="${this.dialogOpened}"
            dialog-title="${this.dialogTitle}"
            ok-btn-text="${this.confirmBtnText}"
            ?hide-confirm-btn="${!this.confirmBtnText}"
            ?show-spinner="${this.requestInProcess}"
            ?disable-confirm-btn="${this.requestInProcess}"
            @confirm-btn-clicked="${this._addActionPoint}"
            @close="${this.handleDialogClosed}">
        <!-- <template is="dom-if" if="[[this.notTouched]]">
            <div class="copy-warning">
                It is required to change at least one of the fields below.
            </div>
        </template> -->

        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">

            <div class="row-h group">
              <div class="input-container input-container-ms">
                    
                <etools-dropdown
                        class="disabled-as-readonly validate-input required fua-person"
                        ?required
                        .selected="${this.selectedPartnerId}"
                        label="Partner"
                        .options="${this.partners}"
                        option-label="name"
                        option-value="id"
                        trigger-value-change-event
                        @etools-selected-item-changed="${this._requestPartner}">
                </etools-dropdown>
              </div>
              <div class="input-container input-container-ms">
                  
                <etools-dropdown
                        class="disabled-as-readonly validate-input required fua-person"
                        ?required
                        ?selected="${this.editedItem.intervention.id}"
                        label="Intervention"
                        .options="${this.fullPartner.interventions}"
                        option-label="title"
                        option-value="id">
                </etools-dropdown>
              </div>
            </div>
          </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        
                        <etools-dropdown
                                class="disabled-as-readonly validate-input required fua-person"
                                ?selected="${this.editedItem.category}"
                                label="Category"
                                .options="${this.categories}"
                                option-label="display_name"
                                ?required
                                option-value="value">
                        </etools-dropdown>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-l">
                        
                        <paper-textarea
                                class="validate-input required"
                                ?required
                                allowed-pattern="[\d\s]"
                                .value="${this.editedItem.description}"
                                label="Description"
                                max-rows="4">
                        </paper-textarea>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input required fua-person"
                                ?selected="${this.editedItem.assigned_to.id}"
                                label="Assigned To"
                                .options="${this.users}"
                                option-label="name"
                                ?required
                                option-value="id">
                        </etools-dropdown>
                    </div>

                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input required fua-person"
                                ?selected="${this.editedItem.section.id}"
                                label="Section"
                                .options="${this.sections}"
                                option-label="name"
                                ?required
                                option-value="id">
                        </etools-dropdown>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input required fua-person"
                                ?selected="${this.editedItem.office.id}"
                                label="Office"
                                .options="${this.offices}"
                                option-label="name"
                                ?required
                                option-value="id">
                        </etools-dropdown>
                    </div>

                    <div class="input-container input-container-40">
                        
                        <datepicker-lite
                                id="deadlineAction"
                                class="disabled-as-readonly validate-input required"
                                value="${this.editedItem.due_date}"
                                label="Due Date"
                                ?required
                                selected-date-display-format="D MMM YYYY">
                        </datepicker-lite>
                    </div>
                </div>

                <div class="row-h group">
                    
                    <div class="input-container checkbox-container input-container-l">
                        <paper-checkbox
                                class="disabled-as-readonly required"
                                ?checked="${this.editedItem.high_priority}">
                                This action point is high priority
                        </paper-checkbox>
                    </div>
                </div>
            </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  users: GenericObject[] = [{label: 'Zack', value: 'Zack'}];

  @property({type: Array})
  sections: GenericObject[] = [{label: 'section', value: 'section'}];

  @property({type: Array})
  offices: GenericObject[] = [{label: 'office', value: 'office'}];

  @property({type: Boolean})
  dialogOpened: boolean = false;

  @property({type: Array})
  partners: object[] = [{label: 'guy', value: 'partner'}];

  @property({type: Object})
  fullPartner: any = {interventions: []};

  @property({type: String})
  dialogTitle: string = 'Add Action Point';

  @property({type: String})
  confirmBtnText: string = '';

  @property({type: String})
  cancelBtnText: string = '';

  @property({type: Boolean})
  requestInProcess: boolean = false;

  @property({type: Array})
  errors: any = [];

  @property({type: Object})
  editedItem: any = {intervention: {id: ''}, assigned_to: {id: ''}, section: {id: ''}, office: {id: ''}};

  @property({type: String})
  selectedPartnerId: number | null = 0;

  @property({type: String})
  editedApBase!: string;

  @property({type: Array})
  categories: GenericObject[] = [];

  // @property({type: Boolean, computed: '_checkNotTouched(copyDialog, editedItem.*)'})
  // notTouched: boolean = false;

  @property({type: Number})
  engagementId!: number | null;

  @property({type: Array})
  dataItems: object[] = [];

  @property({type: Object})
  itemModel: GenericObject = {
    assigned_to: '',
    due_date: undefined,
    description: '',
    high_priority: false
  };

  @property({type: Number})
  _selectedAPIndex!: number | null;

  @property({type: Object})
  originalEditedObj: any = {};

  stateChanged(state: RootState) {
    debugger
    if (state.commonData) {
      this.partners = [...state.commonData.partners];
      this.users = [...state.commonData.unicefUsers];
      this.offices = [...state.commonData.offices];
      this.sections = [...state.commonData.sections];
    }

    if (state.app && state.app.routeDetails.params.engagementId) {
      this.engagementId = parseInt(state.app.routeDetails.params.engagementId);
    }
  }

  // _resetFieldError(event: any) {
  //   if (!event || !event.target) {
  //     return;
  //   }

  //   let field = event.target.getAttribute('field');
  //   if (field) {
  //     this.errors[field] = false;
  //   }

  //   event.target.invalid = false;
  // }

  setPageData(engagementId) {
    if (!engagementId) {
      engagementId = 'new'
    }

    // let url = getEndpoint(etoolsEndpoints.)
  }

  _openEditDialog(event: any) {
    this.editedApBase = '';
    fireEvent(this, 'global-loading', {type: 'get-ap-options', active: true, message: 'Loading data...'});

    let index = this._getIndex(event);
    this._selectedAPIndex = index;

    let id = get(this, `dataItems.${index}.id`);
    let apBaseUrl = getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url,
      url = `${apBaseUrl}action-points/${id}/`;

    this._sendOptionsRequest(url);
  }

  _handleOptionResponse(detail: GenericObject) {
    fireEvent(this, 'global-loading', {type: 'get-ap-options'});
    if (detail && detail.actions) {
      this.updateCollection('edited_ap_options', detail.actions);
    }
    this.editedApBase = 'edited_ap_options';
    let itemIndex = this._selectedAPIndex;
    this._selectedAPIndex = null;

    if (this.collectionExists('edited_ap_options.PUT')) {
      this._openEditDialog({itemIndex});
    } else {
      this.dialogTitle = get(this, 'viewDialogTexts.title');
      this.confirmBtnText = '';
      this.cancelBtnText = 'Cancel';
      // this._openDialog(itemIndex);
    }
  }

  _requestPartner(event: CustomEvent) {
    //is this the best way of doing this?
    if (!event.detail.selectedItem) {
      return;
    }
    let partner = event.detail.selectedItem;
    let id = partner && +partner.id || null;
    // this.partnerId = id;
    this.selectedPartnerId = id;
  }

  private handleDialogClosed() {
    this.dialogOpened = false;
    // this.resetControls();
  }

  updateCollection(collectionName: string, data: string, title?: string) {
    if (!_permissionCollection[collectionName]) {
      console.warn(`Collection ${collectionName} does not exist!`);
      return false;
    }
    // @ts-ignore
    if (typeof data !== 'object' || typeof data.forEach === 'function') {
      console.warn('data must be an object');
      return false;
    }
  
    _permissionCollection[collectionName] = data;
    if (title) {
      _permissionCollection[collectionName].title = title;
    }
    this._manageActions(collectionName);
    return true;
  }

  _manageActions(collectionName: string) {
    let collection = _permissionCollection[collectionName];
    if (!collection) {
      console.warn(`Collection ${collectionName} does not exist!`);
      return false;
    }
  
    let allowed_actions = collection.allowed_FSM_transitions as any || [];
  
    let actions: any[] = [];
    if (this.isValidCollection(collection.PUT)) {
      actions.push(this._createAction('save', allowed_actions[0]));
    }
    if (this.isValidCollection(collection.POST)) {
      actions.push(this._createAction('create', allowed_actions[0]));
    }
  
    collection.allowed_actions = actions.concat(allowed_actions);
    return true;
  }

  _createAction(action: any, existedAction: any) {
    if (!existedAction || typeof existedAction === 'string') {
      return action;
    }
    return {
      code: action,
      display_name: action
    };
  }

  isRequired(path: string) {
    return this.getFieldAttribute(path, 'required', 'POST') ||
      this.getFieldAttribute(path, 'required', 'PUT');
  }

  collectionExists(path: string, actionType?: string) {
    if (!path) {
      throw new Error('path argument must be provided');
    }
    if (typeof path !== 'string') {
      throw new Error('path argument must be a string');
    }
  
    return !!this.getCollection(path, actionType);
  }

  _setRequired(field: string, basePermissionPath: string) {
    if (!basePermissionPath) {
      return false;
    }

    let required = this.isRequired(`${basePermissionPath}.${field}`);

    return required ? 'required' : false;
  }

  getFieldAttribute(path: string, attribute: string, actionType?: string) {
    if (!path || !attribute) {
      throw new Error('path and attribute arguments must be provided');
    }
    if (typeof path !== 'string') {
      throw new Error('path argument must be a string');
    }
    if (typeof attribute !== 'string') {
      throw new Error('attribute argument must be a string');
    }
  
    let value = this.getCollection(path, actionType);
  
    if (value) {
      value = value[attribute];
    }
  
    return value === undefined ? null : value;
  
  }

  getLabel(path: string, base: string) {
    // remove following line
    return path;

    if (!base) {
      return '';
    }
    return this.getFieldAttribute(`${base}.${path}`, 'label', 'POST') ||
      this.getFieldAttribute(`${base}.${path}`, 'label', 'GET');
  }

  getCollection(path: any, actionType?: string) {
    path = path.split('.');
  
    let value = _permissionCollection;
  
    while (path.length) {
      let key = path.shift();
      if (value[key]) {
        value = value[key];
      } else {
        let action = actionType ? value[actionType] : this.isValidCollection(value.POST) ||
          this.isValidCollection(value.PUT) ||
          this.isValidCollection(value.GET);
  
        value = action || value.child || value.children;
        path.unshift(key);
      }
  
      if (!value) {
        break;
      }
    }
  
    return value;
  }

  isValidCollection(collection: object) {
    let testedCollection = omit(collection, 'allowed_actions'),
      actions = get(collection, 'allowed_actions', []);
    if (collection && (Object.keys(testedCollection).length || actions.length)) {
      return collection;
    } else {
      return false;
    }
  }

  getPlaceholderText(path: string, base: string, datepicker?: string) {
    if (this.readonlyPermission(`${base}.${path}`)) {
      return 'Empty Field'
    }

    let label = this.getLabel(path, base),
      prefix = datepicker ? 'Select' : 'Enter';
    return `${prefix} ${label}`;
  }

  isReadOnly(field: string, basePermissionPath: string, inProcess?: boolean) {
    if (!basePermissionPath || inProcess) {
      return true;
    }

    let readOnly = this.readonlyPermission(`${basePermissionPath}.${field}`);
    if (readOnly === null) {
      readOnly = true;
    }

    return readOnly;
  }

  _sendOptionsRequest(url: string) {
    const requestOptions = {
      method: 'OPTIONS',
      url: url,
    };
    makeRequest(requestOptions)
      .then(this._handleOptionResponse.bind(this))
      .catch(this._handleOptionResponse.bind(this));
  }

  readonlyPermission(path: string) {//isReadonly
    return !this.collectionExists(path, 'POST') && !this.collectionExists(path, 'PUT');
  }

  _getIndex(event: any) {
    let item = event && event.model && event.model.item,
      index = this.dataItems && this.dataItems.indexOf(item);

    if ((!index && index !== 0) || index < 0) {
      throw Error('Can not find user data');
    }

    return index;
  }

  // _checkNotTouched(copyDialog: any) {
  //   if (!copyDialog || isEmpty(this.originalEditedObj)) {return false;}
  //   return every(this.originalEditedObj, (value, key) => {
  //     let isObj = isObject(value);
  //     if (isObj) {
  //       return !value.id || +value.id === +get(this, `editedItem.${key}.id`);
  //     } else {
  //       return value === this.editedItem[key];
  //     }
  //   });
  // }

  public openDialog() {
    // this.isNewRecord = !(parseInt(this.editedItem.id) > 0);
    // this.dialogTitle = this.isNewRecord ? (this.isStaffMember ? 'Add New Firm Staff Member' : 'Add New External Individual') : 'Edit Firm Staff Member';
    // this.confirmBtnText = this.isNewRecord ? 'Add' : 'Save';
    this.dialogOpened = true;
  }

  private _addActionPoint(url: string) {
    // this.getControlsData();
    this.requestInProcess = true;

    const requestOptions = {
      method: 'OPTIONS',
      url: url,
    };

    makeRequest(requestOptions, this.editedItem)
      .then(this._handleOptionResponse.bind(this))
      .catch(this._handleOptionResponse.bind(this))
  }
}

export {FollowUpDialog as FollowUpDialogEl};