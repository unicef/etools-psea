import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-app-selector/etools-app-selector';
import {customElement, LitElement, html, property} from 'lit-element';

import '../../common/layout/support-btn';
import './countries-dropdown';
import '@unicef-polymer/etools-profile-dropdown/etools-profile-dropdown';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {RootState, store} from '../../../redux/store';
import {isProductionServer, isStagingServer, isDevServer, isDemoServer, ROOT_PATH} from '../../../config/config';
import {updateDrawerState} from '../../../redux/actions/app';
import {EtoolsUserModel} from '../../../types/user-model';
import {fireEvent} from '../../utils/fire-custom-event';
import {updateCurrentUserData} from '../../user/user-actions';
import {GenericObject} from '../../../types/globals';
import isEmpty from 'lodash-es/isEmpty';

import {pageHeaderStyles} from './page-header-styles';

/**
 * page header element
 * @LitElement
 * @customElement
 */
@customElement('page-header')
export class PageHeader extends connect(store)(LitElement) {
  static get styles() {
    return [pageHeaderStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      <style>
        app-toolbar {
          background-color: ${this.headerColor};
        }
      </style>

      <app-toolbar sticky class="content-align">
        <paper-icon-button id="menuButton" icon="menu" @tap="${() => this.menuBtnClicked()}"></paper-icon-button>
        <div class="titlebar content-align">
          <etools-app-selector .user="${this.profile}"></etools-app-selector>
          <img id="app-logo" src="${this.rootPath}images/etools-logo-color-white.svg" alt="eTools" />
          ${!this.isProduction
            ? html`<div class="envWarning">
          <span class='envLong'> - </span>${this.environment} <span class='envLong'>TESTING ENVIRONMENT<span></div>`
            : ''}
        </div>
        <div class="content-align">
          <countries-dropdown></countries-dropdown>

          <support-btn title="Support"></support-btn>

          <etools-profile-dropdown
            title="Profile and Sign out"
            .sections="${this.profileDrSections}"
            .offices="${this.profileDrOffices}"
            .users="${this.profileDrUsers}"
            .profile="${this.profile ? {...this.profile} : {}}"
            @save-profile="${this.handleSaveProfile}"
            @sign-out="${this._signOut}"
          >
          </etools-profile-dropdown>
        </div>
      </app-toolbar>
    `;
  }

  @property({type: Boolean})
  public isProduction = false;

  @property({type: String})
  rootPath: string = ROOT_PATH;

  @property({type: String})
  public headerColor = 'var(--header-bg-color)';

  @property({type: Object})
  profile!: EtoolsUserModel;

  @property({type: Object})
  profileDropdownData: any | null = null;

  @property({type: Array})
  offices: any[] = [];

  @property({type: Array})
  sections: any[] = [];

  @property({type: Array})
  users: any[] = [];

  @property({type: Array})
  profileDrOffices: any[] = [];

  @property({type: Array})
  profileDrSections: any[] = [];

  @property({type: Array})
  profileDrUsers: any[] = [];

  @property({type: String})
  environment = 'LOCAL';

  @property({type: Array})
  editableFields: string[] = ['office', 'section', 'job_title', 'phone_number', 'oic', 'supervisor'];

  public connectedCallback() {
    super.connectedCallback();
    this.setBgColor();
    this.checkEnvironment();
  }

  public stateChanged(state: RootState) {
    if (state) {
      this.profile = state.user!.data as EtoolsUserModel;
    }
  }

  public handleSaveProfile(e: any) {
    const modifiedFields = this._getModifiedFields(this.profile, e.detail.profile);
    if (isEmpty(modifiedFields)) {
      // empty profile means no changes found
      this.showSaveNotification();
      return;
    }
    this.profileSaveLoadingMsgDisplay();
    updateCurrentUserData(modifiedFields)
      .then(() => {
        this.showSaveNotification();
      })
      .catch(() => {
        this.showSaveNotification('Profile data not saved. Save profile error!');
      })
      .then(() => {
        this.profileSaveLoadingMsgDisplay(false);
      });
  }

  protected profileSaveLoadingMsgDisplay(show = true) {
    fireEvent(this, 'global-loading', {
      active: show,
      loadingSource: 'profile-save'
    });
  }

  protected showSaveNotification(msg?: string) {
    fireEvent(this, 'toast', {
      text: msg ? msg : 'All changes are saved.',
      showCloseBtn: false
    });
  }

  protected _getModifiedFields(originalData: any, newData: any) {
    const modifiedFields: GenericObject = {};
    this.editableFields.forEach(function (field: any) {
      if (originalData[field] !== newData[field]) {
        modifiedFields[field] = newData[field];
      }
    });

    return modifiedFields;
  }

  protected checkEnvironment() {
    this.isProduction = isProductionServer();
    this.environment = isDevServer()
      ? 'DEVELOPMENT'
      : isDemoServer()
      ? 'DEMO'
      : isStagingServer()
      ? 'STAGING'
      : 'LOCAL';
  }

  public menuBtnClicked() {
    store.dispatch(updateDrawerState(true));
    // fireEvent(this, 'drawer');
  }

  private setBgColor() {
    // If not production environment, changing header color to red
    if (!isProductionServer()) {
      this.headerColor = 'var(--nonprod-header-color)';
    }
  }

  protected _signOut() {
    // this._clearDexieDbs();
    this.clearLocalStorage();
    window.location.href = window.location.origin + '/social/unicef-logout/';
  }

  // TODO
  // protected _clearDexieDbs() {
  //   window.EtoolsPmpApp.DexieDb.delete();
  // }

  protected clearLocalStorage() {
    localStorage.clear();
  }
}
