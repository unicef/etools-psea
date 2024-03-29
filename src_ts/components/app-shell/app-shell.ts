/**
@license
Copyright (c) 2019 The eTools Project Authors. All rights reserved.
*/

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {installRouter} from 'pwa-helpers/router.js';

// This element is connected to the Redux store.
import {store, RootState} from '../../redux/store';

// These are the actions needed by this element.
import {
  navigate,
  // updateOffline,
  updateDrawerState
} from '../../redux/actions/app';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics';
import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';

import {AppDrawerLayoutElement} from '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import {AppHeaderLayoutElement} from '@polymer/app-layout/app-header-layout/app-header-layout';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer';
import {customElement, html, LitElement, property, query} from 'lit-element';

import {AppShellStyles} from './app-shell-styles';

import './menu/app-menu.js';
import './header/page-header.js';
import './footer/page-footer.js';

import './app-theme.js';
import {ToastNotificationHelper} from '../common/toast-notifications/toast-notification-helper';
import user from '../../redux/reducers/user';
import commonData from '../../redux/reducers/common-data';
import pageData from '../../redux/reducers/page-data';
import {ROOT_PATH, setLoggingLevel, SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../config/config';
import {getCurrentUser} from '../user/user-actions';
import {EtoolsRouter} from '../../routing/routes';
import {RouteDetails} from '../../routing/router';
import {
  loadPartners,
  loadOffices,
  loadSections,
  loadStaticData,
  loadExternalIndividuals,
  loadAssessingFirms,
  loadUnicefUsers
} from '../../redux/actions/common-data';
import {checkEnvFlags} from '../common/environment-flags';
import {logInfo} from '@unicef-polymer/etools-behaviors/etools-logging';
declare const dayjs: any;
declare const dayjs_plugin_utc: any;

dayjs.extend(dayjs_plugin_utc);

store.addReducers({
  user,
  commonData,
  pageData
});

/**
 * @customElement
 * @LitElement
 */
@customElement('app-shell')
export class AppShell extends connect(store)(LitElement) {
  static get styles() {
    return [AppShellStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      <etools-piwik-analytics
        .page="${ROOT_PATH + this.mainPage}"
        .user="${this.user}"
        .toast="${this.currentToastMessage}"
      >
      </etools-piwik-analytics>

      <app-drawer-layout
        id="layout"
        responsive-width="850px"
        fullbleed
        ?narrow="${this.narrow}"
        ?small-menu="${this.smallMenu}"
      >
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          @app-drawer-transitioned="${this.onDrawerToggle}"
          ?opened="${this.drawerOpened}"
          ?swipe-open="${this.narrow}"
          ?small-menu="${this.smallMenu}"
        >
          <!-- App main menu(left sidebar) -->
          <app-menu
            selected-option="${this.mainPage}"
            @toggle-small-menu="${(e: CustomEvent) => this.toggleMenu(e)}"
            ?small-menu="${this.smallMenu}"
          ></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader"></page-header>
          </app-header>

          <!-- Main content -->
          <main role="main" class="main-content">
            <assessments-list
              class="page"
              ?active="${this.isActivePage(this.mainPage, 'assessments', this.subPage, 'list')}"
            >
            </assessments-list>
            <assessment-tabs
              class="page"
              ?active="${this.isActivePage(
                this.mainPage,
                'assessments',
                this.subPage,
                'details|questionnaire|followup'
              )}"
            >
            </assessment-tabs>
            <page-not-found class="page" ?active="${this.isActivePage(this.mainPage, 'page-not-found')}">
            </page-not-found>
          </main>

          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  @property({type: Boolean})
  public narrow = true;

  @property({type: Boolean})
  public drawerOpened = false;

  @property({type: Object})
  public routeDetails!: RouteDetails;

  @property({type: String})
  public mainPage = ''; // routeName

  @property({type: String})
  public subPage: string | null = null; // subRouteName

  @property({type: Boolean})
  public smallMenu = false;

  @property({type: Object})
  user!: any;

  @property({type: String})
  currentToastMessage!: string;

  @query('#layout') private drawerLayout!: AppDrawerLayoutElement;
  @query('#drawer') private drawer!: AppDrawerElement;
  @query('#appHeadLayout') private appHeaderLayout!: AppHeaderLayoutElement;

  private appToastsNotificationsHelper!: ToastNotificationHelper;

  constructor() {
    super();

    setLoggingLevel();
    // Gesture events like tap and track generated from touch will not be
    // preventable, allowing for better scrolling performance.
    setPassiveTouchGestures(true);
    // init toasts notifications queue
    this.appToastsNotificationsHelper = new ToastNotificationHelper(this);
    this.appToastsNotificationsHelper.addToastNotificationListeners();

    const menuTypeStoredVal: string | null = localStorage.getItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY);
    if (!menuTypeStoredVal) {
      this.smallMenu = false;
    } else {
      this.smallMenu = !!parseInt(menuTypeStoredVal, 10);
    }

    checkEnvFlags().then((response) => {
      if (!this._pseaIsDisabled(response)) {
        getCurrentUser().then((user) => {
          this.user = user;
          if (user && user.is_unicef_user) {
            store.dispatch(loadExternalIndividuals());
            store.dispatch(loadAssessingFirms());
            store.dispatch(loadUnicefUsers());
          }
        });
        store.dispatch(loadPartners());
        store.dispatch(loadOffices());
        store.dispatch(loadSections());
        store.dispatch(loadStaticData());
      }
    });
  }

  protected _pseaIsDisabled(response: any) {
    const activeFlag = response.active_flags.find((flag: string) => flag === 'psea_disabled');
    return activeFlag === undefined ? false : true;
  }

  public connectedCallback() {
    super.connectedCallback();

    this.checkAppVersion();
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname + location.search))));
    installMediaQueryWatcher(`(min-width: 460px)`, () => store.dispatch(updateDrawerState(false)));

    // this will prevent the header to overlap etools-dropdown
    customElements.whenDefined('app-header-layout').then(() => {
      if (this.appHeaderLayout !== null) {
        window.EtoolsEsmmFitIntoEl = this.appHeaderLayout!.shadowRoot!.querySelector('#contentContainer');
      }
    });
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    // remove toasts notifications listeners
    this.appToastsNotificationsHelper.removeToastNotificationListeners();
  }

  public stateChanged(state: RootState) {
    this.routeDetails = state.app!.routeDetails;
    this.mainPage = state.app!.routeDetails!.routeName;
    this.subPage = state.app!.routeDetails!.subRouteName;
    this.drawerOpened = state.app!.drawerOpened;
  }

  // TODO: just for testing...
  public getState() {
    logInfo('Current redux state', 'AppShell', store.getState());
  }

  // Testing router (from console)
  public getRouter() {
    return EtoolsRouter;
  }

  public onDrawerToggle() {
    if (this.drawerOpened !== this.drawer.opened) {
      store.dispatch(updateDrawerState(this.drawer.opened));
    }
  }

  public toggleMenu(e: CustomEvent) {
    this.smallMenu = e.detail.value;
    this._updateDrawerStyles();
    this._notifyLayoutResize();
  }

  private _updateDrawerStyles(): void {
    this.drawerLayout.updateStyles();
    this.drawer.updateStyles();
  }

  private _notifyLayoutResize(): void {
    this.drawerLayout.notifyResize();
    this.appHeaderLayout.notifyResize();
  }

  protected isActiveMainPage(currentPageName: string, expectedPageName: string): boolean {
    return currentPageName === expectedPageName;
  }

  protected isActiveSubPage(currentSubPageName: string, expectedSubPageNames: string): boolean {
    const subPages: string[] = expectedSubPageNames.split('|');
    return subPages.indexOf(currentSubPageName) > -1;
  }

  protected isActivePage(
    pageName: string,
    expectedPageName: string,
    currentSubPageName?: string | null,
    expectedSubPageNames?: string
  ): boolean {
    if (!this.isActiveMainPage(pageName, expectedPageName)) {
      return false;
    }
    if (currentSubPageName && expectedSubPageNames) {
      return this.isActiveSubPage(currentSubPageName, expectedSubPageNames);
    }
    return true;
  }

  protected checkAppVersion() {
    fetch('version.json')
      .then((res) => res.json())
      .then((version) => {
        if (version.revision != document.getElementById('buildRevNo')!.innerText) {
          console.log('version.json', version.revision);
          console.log('buildRevNo ', document.getElementById('buildRevNo')!.innerText);
          this._showConfirmNewVersionDialog();
        }
      });
  }

  private _showConfirmNewVersionDialog() {
    const msg = document.createElement('span');
    msg.innerText = 'A new version of the app is available. Refresh page?';
    const conf: any = {
      size: 'md',
      closeCallback: this._onConfirmNewVersion.bind(this),
      content: msg
    };
    const confirmNewVersionDialog = createDynamicDialog(conf);
    confirmNewVersionDialog.opened = true;
  }

  private _onConfirmNewVersion(e: CustomEvent) {
    if (e.detail.confirmed) {
      if (navigator.serviceWorker) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
          location.reload();
        });
      }
    }
  }
}
