import '@polymer/paper-button/paper-button';

import '../../common/layout/page-content-header/page-content-header';
import '../../common/layout/etools-tabs';
import {pageContentHeaderSlottedStyles}
  from '../../common/layout/page-content-header/page-content-header-slotted-styles';
import '../../common/layout/status/etools-status';
import {pageLayoutStyles} from '../../styles/page-layout-styles';

import {GenericObject} from '../../../types/globals';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';
import {updateAppLocation} from '../../../routing/routes';
import {customElement, LitElement, html, property} from 'lit-element';
import {elevationStyles} from '../../styles/lit-styles/elevation-styles';
import {RouteDetails} from '../../../routing/router';
import {SharedStylesLit} from '../../styles/shared-styles-lit';
import {Assessment} from '../../../types/engagement';

/**
 * @LitElement
 * @customElement
 */
@customElement('engagement-tabs')
export class EngagementTabs extends connect(store)(LitElement) {

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
        <engagement-details-page ?hidden="${!this.isActiveTab(this.activeTab,'details')}">
        </engagement-details-page>
        <engagement-questionnaire-page ?hidden="${!this.isActiveTab(this.activeTab,'questionnaire')}">
        </engagement-questionnaire-page>
        <follow-up-page ?hidden="${!this.isActiveTab(this.activeTab,'followup')}"></follow-up-page>
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
      hidden: false
    },
    {
      tab: 'questionnaire',
      tabLabel: 'Questionnaire‎',
      hidden: false
    },
    {
      tab: 'followup',
      tabLabel: 'Follow-Up',
      hidden: false
    }
  ];

  @property({type: String})
  activeTab: string = 'details';

  @property({type: Object})
  engagement: GenericObject = {};

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: RootState) {
    // update page route data
    if (state.app!.routeDetails.routeName === 'engagements' &&
      state.app!.routeDetails.subRouteName !== 'list') {
      this.routeDetails = state.app!.routeDetails;

      const stateActiveTab = state.app!.routeDetails.subRouteName as string;
      if (stateActiveTab !== this.activeTab) {
        const oldActiveTabValue = this.activeTab;
        this.activeTab = state.app!.routeDetails.subRouteName as string;
        //this.tabChanged(this.activeTab, oldActiveTabValue);// Is this needed here?
      }

      if (state.pageData && this.routeDetails.params) {
        this.pageTitle = this._getPageTitle(this.routeDetails.params!.engagementId, state.pageData.currentAssessment);
      }

    }
  }

  _getPageTitle(assessmentId: string | number, assessment: Assessment) {
    if (!assessmentId || assessmentId === 'new') {
      return 'New PSEA Assessment';
    }
    return assessment.reference_number ? `${assessment.reference_number}: ${assessment.partner_name}` : '';

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
      const newPath = `engagements/${this.routeDetails!.params ? this.routeDetails!.params.engagementId : 'new'}/${newTabName}`;
      if (this.routeDetails.path === newPath) {
        return;
      }
      // go to new tab
      updateAppLocation(newPath, true);
    }
  }

}
