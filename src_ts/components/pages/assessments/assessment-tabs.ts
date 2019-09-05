import '@polymer/paper-button/paper-button';

import '../../common/layout/page-content-header/page-content-header';
import '../../common/layout/etools-tabs';
import {pageContentHeaderSlottedStyles}
  from '../../common/layout/page-content-header/page-content-header-slotted-styles';
import '../../common/layout/status/etools-status';
import {pageLayoutStyles} from '../../styles/page-layout-styles';

import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';
import {updateAppLocation} from '../../../routing/routes';
import {customElement, LitElement, html, property} from 'lit-element';
import {elevationStyles} from '../../styles/lit-styles/elevation-styles';
import {RouteDetails} from '../../../routing/router';
import {SharedStylesLit} from '../../styles/shared-styles-lit';
import {Assessment} from '../../../types/assessment';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import {makeRequest} from '../../utils/request-helper';
import {updateAssessmentData} from '../../../redux/actions/page-data';
import {isJsonStrMatch, cloneDeep} from '../../utils/utils';
import {PageDataState} from '../../../redux/reducers/page-data';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

/**
 * @LitElement
 * @customElement
 */
@customElement('assessment-tabs')
export class AssessmentTabs extends connect(store)(LitElement) {

  static get styles() {
    return [elevationStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      ${SharedStylesLit} ${pageContentHeaderSlottedStyles} ${pageLayoutStyles}
      <style>
        etools-status {
          justify-content: center;
        }
      </style>
      <etools-status></etools-status>

      <page-content-header with-tabs-visible>

        <h1 slot="page-title">${this.pageTitle}</h1>

        <div slot="title-row-actions" class="content-header-actions">
          <paper-button raised>Action 1</paper-button>
          <paper-button raised>Action 2</paper-button>
        </div>

        <etools-tabs slot="tabs"
                     .tabs="${this.pageTabs}"
                     .activeTab="${this.activeTab}"
                     @iron-select="${this.handleTabChange}"></etools-tabs>
      </page-content-header>

      <div class="page-content">
        ${this.isActiveTab(this.activeTab,
        'details') ? html`<assessment-details-page></assessment-details-page>` : ''}
        ${this.isActiveTab(this.activeTab,
          'questionnaire') ? html`<assessment-questionnaire-page></assessment-questionnaire-page>` : ''}
        ${this.isActiveTab(this.activeTab,
          'followup') ? html`<follow-up-page></follow-up-page>` : ''}
      </div>
    `;
  }

  @property({type: Object})
  routeDetails!: RouteDetails;

  @property({type: String})
  pageTitle: string = '';

  @property({type: Array})
  pageTabs = [
    {
      tab: 'details',
      tabLabel: 'Details',
      hidden: false,
      disabled: false
    },
    {
      tab: 'questionnaire',
      tabLabel: 'Questionnaire‎',
      hidden: false,
      disabled: true
    },
    {
      tab: 'followup',
      tabLabel: 'Follow-Up',
      hidden: false,
      disabled: true
    }
  ];

  @property({type: String})
  activeTab: string = 'details';

  @property({type: Object})
  assessment!: Assessment;

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: RootState) {
    // update page route data
    if (state.app!.routeDetails.routeName === 'assessments' &&
        state.app!.routeDetails.subRouteName !== 'list') {
      this.routeDetails = state.app!.routeDetails;

      const stateActiveTab = state.app!.routeDetails.subRouteName as string;
      if (stateActiveTab !== this.activeTab) {
        const oldActiveTabValue = this.activeTab;
        this.activeTab = state.app!.routeDetails.subRouteName as string;
        //this.tabChanged(this.activeTab, oldActiveTabValue);// Is this needed here?
      }

      if (state.app!.routeDetails!.params) {
        const assessmentId = state.app!.routeDetails.params.assessmentId;
        this.setPageData(assessmentId, state.pageData!);
        if (state.pageData && this.routeDetails.params) {
          if (this.routeDetails.params.assessmentId !== 'new') {
            this.enableTabs();
          } else {
            this.resetTabs();
          }
        }

      }
    }
  }

  setPageData(assessmnetId: string | number, pageData: PageDataState) {
    this._getAssessmentInfo(assessmnetId)
      .then(() => {
        if (!pageData || !isJsonStrMatch(this.assessment, pageData.currentAssessment)) {
          store.dispatch(updateAssessmentData(cloneDeep(this.assessment)));
          this.pageTitle = this._getPageTitle();
        }
      });
  }

  _getAssessmentInfo(assessmentId: string | number) {
    if (this.assessment && this.assessment.id == assessmentId) {
      return Promise.resolve();
    }
    if (!assessmentId || assessmentId === 'new') {
      this.assessment = new Assessment();
      return Promise.resolve();
    }
    const url = etoolsEndpoints.assessment.url! + assessmentId + '/';

    return makeRequest({url: url})
      .then((response) => {
        this.assessment = response;
      })
      .catch(err => this.handleGetAssessmentError(err));
  }

  handleGetAssessmentError(err: any) {
    if (err.status == 404) {
      updateAppLocation('/page-not-found', true);
    }
    logError(err);
  }

  _getPageTitle() {
    if (!this.assessment.id) {
      return 'New PSEA Assessment';
    }
    return this.assessment.reference_number ? `${this.assessment.reference_number}: ${this.assessment.partner_name}` : '';
  }

  enableTabs() {
    this.pageTabs.forEach((tab) => {
      tab.disabled = false;
    });
    this.pageTabs = [...this.pageTabs];
  }

  resetTabs() {
    this.pageTabs.forEach((tab) => {
      tab.tab == 'details' ? tab.disabled = false : tab.disabled = true;
    });
    this.pageTabs = [...this.pageTabs];
  }

  handleTabChange(e: CustomEvent) {
    const newTabName: string = e.detail.item.getAttribute('name');
    if (newTabName === this.activeTab) {
      return;
    }
    this.tabChanged(newTabName, this.activeTab);
  }

  tabChanged(newTabName: string, oldTabName: string | undefined) {
    if (oldTabName === undefined) {
      // page load, tab init, component is gonna be imported in loadPageComponents action
      return;
    }
    if (newTabName !== oldTabName) {
      const newPath = `assessments/${this.routeDetails!.params ? this.routeDetails!.params.assessmentId : 'new'}/${newTabName}`;
      if (this.routeDetails.path === newPath) {
        return;
      }
      // go to new tab
      updateAppLocation(newPath, true);
    }
  }

}
