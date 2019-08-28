import { LitElement, html, property, customElement } from 'lit-element';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin.js';
import { GenericObject, Constructor } from '../../../../../types/globals';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import { fireEvent } from '../../../../utils/fire-custom-event';
import { getEndpoint } from '../../../../../endpoints/endpoints'
import { inputsStyles } from '../../../../styles/inputs-styles';

import get from 'lodash-es/get';
import omit from 'lodash-es/omit';

let _permissionCollection: {
  edited_ap_options?: {allowed_actions:[]},
  new_engagement?: {POST:GenericObject, GET: GenericObject, allowed_actions:[]},
  new_staff_sc?:{POST:GenericObject, GET:GenericObject, title:string, allowed_actions:[]},
  [key:string]: any
} = {};

@customElement('follow-up-dialog')
export class FollowUpDialog extends (EtoolsAjaxRequestMixin(LitElement) as Constructor<LitElement>) {
  render() {
    return html`
      ${inputsStyles}
      <etools-dialog no-padding keep-dialog-open size="md"
            ?opened="${this.dialogOpened}"
            dialog-title="${this.dialogTitle}"
            ok-btn-text="${this.confirmBtnText}"
            ?hide-confirm-btn="${!this.confirmBtnText}"
            ?show-spinner="${this.requestInProcess}"
            disable-confirm-btn="${this.requestInProcess}"
            @confirm-btn-clicked="_addActionPoint">
        <template is="dom-if" if="${this.notTouched}">
            <div class="copy-warning">
                It is required to change at least one of the fields below.
            </div>
        </template>

        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">

            <div class="row-h group">
              <div class="input-container input-container-ms">
                    
                <etools-dropdown
                        class="disabled-as-readonly validate-input [[_setRequired('partner', editedApBase)]] fua-person"
                        selected="${this.selectedPartnerId}"
                        label="${this.getLabel('partner', this.editedApBase)}"
                        placeholder="${this.getPlaceholderText('partner', this.editedApBase, 'select')}"
                        .options="${this.partners}"
                        .option-label="name"
                        .option-value="id"
                        invalid="${this.errors.partner}"
                        error-message="${this.errors.partner}"
                        on-focus="_resetFieldError"
                        on-tap="_resetFieldError">
                </etools-dropdown>
              </div>
              <div class="input-container input-container-ms">
                  
                <etools-dropdown
                        class="disabled-as-readonly validate-input [[_setRequired('intervention', editedApBase)]] fua-person"
                        label="${this.getLabel('intervention', this.editedApBase)}"
                        placeholder="${this.getPlaceholderText('intervention', this.editedApBase, 'select')}"
                        .options="${this.fullPartner.interventions}"
                        .option-label="title"
                        .option-value="id"
                        invalid="${this.errors.intervention}"
                        error-message="${this.errors.intervention}"
                        on-focus="_resetFieldError"
                        on-tap="_resetFieldError">
                </etools-dropdown>
              </div>
            </div>
          </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        
                        <etools-dropdown
                                class="disabled-as-readonly validate-input [[_setRequired('category', editedApBase)]] fua-person"
                                label="${this.getLabel('category', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('category', this.editedApBase, 'select')}"
                                .options="${this.categories}"
                                .option-label="display_name"
                                .option-value="value"
                                invalid="${this.errors.category}"
                                error-message="${this.errors.category}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </etools-dropdown>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-l">
                        
                        <paper-textarea
                                class="validate-input ${this._setRequired('description', this.editedApBase)}"
                                allowed-pattern="[\d\s]"
                                label="${this.getLabel('description', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('description', this.editedApBase)}"
                                max-rows="4"
                                invalid="${this.errors.description}"
                                error-message="${this.errors.description}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </paper-textarea>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input [[_setRequired('assigned_to', this.editedApBase)]] fua-person"
                                label="${this.getLabel('assigned_to', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('assigned_to', this.editedApBase, 'select')}"
                                .options="${this.users}"
                                .option-label="full_name"
                                .option-value="id"
                                invalid="${this.errors.assigned_to}"
                                error-message="${this.errors.assigned_to}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </etools-dropdown>
                    </div>

                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input [[_setRequired('section', this.editedApBase)]] fua-person"
                                label="${this.getLabel('section', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('section', this.editedApBase, 'select')}"
                                .options="${this.sections}"
                                .option-label="name"
                                .option-value="id"
                                invalid="${this.errors.section}"
                                error-message="${this.errors.section}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </etools-dropdown>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-ms">
                        

                        <etools-dropdown
                                class="disabled-as-readonly validate-input [[_setRequired('office', this.editedApBase)]] fua-person"
                                label="${this.getLabel('office', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('office', this.editedApBase, 'select')}"
                                .options="${this.offices}"
                                .option-label="name"
                                .option-value="id"
                                invalid="${this.errors.office}"
                                error-message="${this.errors.office}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </etools-dropdown>
                    </div>

                    <div class="input-container input-container-40">
                        
                        <datepicker-lite
                                id="deadlineAction"
                                class="disabled-as-readonly validate-input [[_setRequired('due_date', this.editedApBase)]]"
                                label="${this.getLabel('due_date', this.editedApBase)}"
                                placeholder="${this.getPlaceholderText('due_date', this.editedApBase, 'select')}"
                                invalid="${this.errors.due_date}"
                                error-message="${this.errors.due_date}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError"
                                selected-date-display-format="D MMM YYYY">
                        </datepicker-lite>
                    </div>
                </div>

                <div class="row-h group">
                    
                    <div class="input-container checkbox-container input-container-l">
                        <paper-checkbox
                                class="disabled-as-readonly">
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
  dialogTitle: string = '';

  @property({type: String})
  confirmBtnText: string = '';

  @property({type: String})
  cancelBtnText: string = '';

  @property({type: Boolean})
  requestInProcess: boolean = false;

  @property({type: Array})
  errors: any = [];

  @property({type: Object})
  editedItem: any = {};

  @property({type: String})
  selectedPartnerId: string = '';

  @property({type: String})
  editedApBase!: string;

  @property({type: Array})
  categories: GenericObject[] = [];

  @property({type: Boolean, computed: '_checkNotTouched(copyDialog, editedItem.*)'})
  notTouched: boolean = false;

  @property({type: Number})
  engagementId!: number;

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

  _handleOptionResponse(detail: any) {
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
      endpoint: {
        url
      },
    };
    this.sendRequest(requestOptions)
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
}