import '@polymer/paper-button/paper-button';

import '../../common/layout/page-content-header/page-content-header';
import '../../common/layout/etools-tabs';
import '@unicef-polymer/etools-loading/etools-loading';
// eslint-disable-next-line max-len
import {pageContentHeaderSlottedStyles} from '../../common/layout/page-content-header/page-content-header-slotted-styles';
import '../../common/layout/status/etools-status';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';
import {updateAppLocation} from '../../../routing/routes';
import {customElement, LitElement, html, property} from 'lit-element';
import {elevationStyles} from '../../styles/lit-styles/elevation-styles';
import {RouteDetails} from '../../../routing/router';
import {SharedStylesLit} from '../../styles/shared-styles-lit';
import {Assessment, Assessor} from '../../../types/assessment';
import {requestAssessmentAndAssessor, updateAssessmentAndAssessor} from '../../../redux/actions/page-data';
import {cloneDeep, isJsonStrMatch} from '../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {EtoolsStatusModel} from '../../common/layout/status/etools-status';
import './status-transitions/assessment-status-transition-actions';
import isNil from 'lodash-es/isNil';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import '../../common/layout/etools-error-warn-box';
import '../../common/layout/export-data';
import {GenericObject} from '../../../types/globals';
import get from 'lodash-es/get';
import {rejectionTabStyles} from '../../styles/rejection-tab-styles';

/**
 * @LitElement
 * @customElement
 */
@customElement('assessment-tabs')
export class AssessmentTabs extends connect(store)(LitElement) {
  static get styles() {
    return [elevationStyles, pageLayoutStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      ${SharedStylesLit}${pageContentHeaderSlottedStyles}
      <style>
        ${rejectionTabStyles} etools-status {
          justify-content: center;
        }

      </style>
      ${this.assessment && this.assessment.id
        ? html`<etools-status
            .statuses="${this.getAssessmentStatusesList(this.assessment.status_list)}"
            .activeStatus="${this.assessment.status}"
          ></etools-status>`
        : ''}

      <page-content-header with-tabs-visible>
        <h1 slot="page-title">${this.getPageTitle(this.assessment)}</h1>

        <div slot="title-row-actions" class="content-header-actions">
          ${this.assessment && this.assessment.id && this.canExport
            ? html`
                <export-data
                  exportPdf
                  .endpoint="${etoolsEndpoints.assessment.url!}${this.assessment.id}/"
                ></export-data>
              `
            : ''}

          <assessment-status-transition-actions></assessment-status-transition-actions>
        </div>

        <etools-tabs
          slot="tabs"
          .tabs="${this.pageTabs}"
          .activeTab="${this.activeTab}"
          @iron-select="${this.handleTabChange}"
        ></etools-tabs>
      </page-content-header>
      <section
        class="elevation page-content no-padding"
        elevation="1"
        ?hidden="${!this.showRejectionNote(this.assessment)}"
      >
        <etools-content-panel class="rejection-tab" panel-title="">
          <div slot="panel-btns" class="bookmark">
            <iron-icon icon="bookmark"></iron-icon>
          </div>
          <div class="rejection-title">Rejection Note</div>
          <div class="rejection-text">${this.assessment?.rejected_comment}</div>
        </etools-content-panel>
      </section>

      <div class="page-content">
        <assessment-details-page ?hidden="${!this.isActiveTab(this.activeTab, 'details')}">
          <etools-loading loading-text="Loading..." active></etools-loading>
        </assessment-details-page>
        <assessment-questionnaire-page ?hidden="${!this.isActiveTab(this.activeTab, 'questionnaire')}">
          <etools-loading loading-text="Loading..." active></etools-loading>
        </assessment-questionnaire-page>
        <follow-up-page ?hidden="${!this.isActiveTab(this.activeTab, 'followup')}">
          <etools-loading loading-text="Loading..." active></etools-loading>
        </follow-up-page>
      </div>
    `;
  }

  @property({type: Object})
  routeDetails!: RouteDetails;

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
  activeTab = 'details';

  @property({type: Object})
  assessment!: Assessment;

  @property({type: Boolean})
  canExport = false;

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: RootState) {
    if (this.onListPage(get(state, 'app.routeDetails'))) {
      return;
    }

    this.hideFollowUpTabForNonUnicefUsers(get(state, 'user.data'));

    // update page route data
    const stateActiveTab = state.app!.routeDetails.subRouteName as string;
    if (stateActiveTab !== this.activeTab) {
      this.activeTab = state.app!.routeDetails.subRouteName as string;
    }

    // initialize assessment object from redux state
    if (state.pageData!.currentAssessment) {
      const newAssessment = state.pageData!.currentAssessment;
      if (!isJsonStrMatch(this.assessment, newAssessment)) {
        this.assessment = cloneDeep(newAssessment);
      }
    }

    /**
     * Get route assessment id and get assessment data
     * Prevent multiple times execution by making sure store routeDetails data
     * is different than the current routeDetails data
     * (stateChanged can be triggered by many other store data updates)
     */
    if (!isJsonStrMatch(state.app!.routeDetails!, this.routeDetails)) {
      this.routeDetails = cloneDeep(state.app!.routeDetails);
      const routeAssessmentId = this.routeDetails!.params!.assessmentId;
      if (isNil(this.assessment) || routeAssessmentId !== String(this.assessment.id)) {
        /**
         * on this level, make assessment get request or init new assessment only
         * if route id is different than assessment.id or assessment is null
         */
        this.setAssessmentInfo(routeAssessmentId);
      }

      // enable/disable tabs (new assessment has only details tab active until first save)
      if (this.assessment !== null && routeAssessmentId) {
        this.setActiveTabs(routeAssessmentId);
      }
    }

    if (get(state, 'user.permissions')) {
      this.canExport = state.user!.permissions!.canExportAssessment;
    }
  }

  hideFollowUpTabForNonUnicefUsers(userData: any) {
    if (userData && !userData.is_unicef_user) {
      const followupTab = this.pageTabs.find((elem: GenericObject) => elem.tab === 'followup');
      if (followupTab) {
        followupTab.hidden = true;
        this.pageTabs = [...this.pageTabs];
      }
    }
  }

  onListPage(routeDetails: any) {
    return routeDetails.routeName === 'assessments' && routeDetails.subRouteName == 'list';
  }

  setActiveTabs(assessmentId: string | number) {
    if (assessmentId !== 'new') {
      this.enableTabs();
    } else {
      this.resetTabs();
    }
  }

  /**
   * populate redux store currentAssessment (stateChanged will run again and set assessment object)
   * @param assessmentId
   */
  setAssessmentInfo(assessmentId: string | number) {
    if (assessmentId === 'new') {
      store.dispatch(updateAssessmentAndAssessor(new Assessment(), new Assessor()));
    } else {
      store.dispatch(requestAssessmentAndAssessor(Number(assessmentId), this.handleGetAssessmentError.bind(this)));
    }
  }

  handleGetAssessmentError(err: any) {
    if (err.status == 404) {
      updateAppLocation('/page-not-found', true);
    }
    logError('Assessment req error', 'AssessmentTabs', err);
  }

  getPageTitle(assessment: Assessment) {
    if (!assessment) {
      return '';
    }
    if (!assessment.id) {
      return 'New PSEA Assessment';
    }
    return assessment.reference_number ? `${assessment.reference_number}: ${assessment.partner_name}` : '';
  }

  enableTabs() {
    this.pageTabs.forEach((tab) => {
      tab.disabled = false;
    });
    this.pageTabs = [...this.pageTabs];
  }

  resetTabs() {
    this.pageTabs.forEach((tab) => {
      tab.tab == 'details' ? (tab.disabled = false) : (tab.disabled = true);
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
      const newPath = `assessments/${
        this.routeDetails!.params ? this.routeDetails!.params.assessmentId : 'new'
      }/${newTabName}`;
      if (this.routeDetails.path === newPath) {
        return;
      }
      // go to new tab
      updateAppLocation(newPath, true);
    }
  }

  getAssessmentStatusesList(statusesList: string[][]): EtoolsStatusModel[] {
    if (statusesList.length === 0) return [];
    return statusesList.map((s: string[]) => {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return {status: s[0], label: s[1]} as EtoolsStatusModel;
    });
  }

  showRejectionNote(assessment: Assessment) {
    return assessment?.rejected_comment && assessment.status !== 'final';
  }
}
