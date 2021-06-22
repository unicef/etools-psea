import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './follow-up-dialog';

import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';

import {GenericObject, ActionPoint} from '../../../../../types/globals';
import {Assessment} from '../../../../../types/assessment';
import {cloneDeep, getFileNameFromURL} from '../../../../utils/utils';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {RootState, store} from '../../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import '@unicef-polymer/etools-loading';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import get from 'lodash-es/get';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {openDialog} from '../../../../utils/dialog';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';

@customElement('follow-up-page')
export class FollowUpPage extends connect(store)(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, labelAndvalueStylesLit];
  }
  render() {
    return html`
      ${SharedStylesLit}
      <style>
        :host {
          --ecp-content-padding: 0;
        }
        .container {
          padding: 24px 24px;
        }

        .margin-b {
          margin-bottom: 24px;
        }
      </style>
      <etools-content-panel panel-title="Action Points" class="margin-b">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <paper-icon-button @tap="${() => this.openFollowUpDialog()}" icon="add"> </paper-icon-button>
        </div>

        <etools-table
          .items="${this.dataItems}"
          .columns="${this.columns}"
          @edit-item="${this.editActionPoint}"
          @copy-item="${this.copyActionPoint}"
          .setRowActionsVisibility="${this.setRowActionsVisibility.bind(this)}"
        >
        </etools-table>
      </etools-content-panel>

      <etools-content-panel
        panel-title="Note for Record"
        ?hidden="${this.assessment?.overall_rating?.display != 'High'}"
      >
        <div class="layout-horizontal container">
          <div class="col-4">
            <div class="paper-label">NFR Attachment</div>
            <div class="input-label" ?empty="${!this.assessment?.nfr_attachment}">
              <a href="${this.assessment?.nfr_attachment}" target="_blank">
                ${getFileNameFromURL(this.assessment?.nfr_attachment)}</a
              >
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Reference #',
      name: 'reference_number',
      type: EtoolsTableColumnType.Link,
      link_tmpl: `/apd/action-points/detail/:id`,
      isExternalLink: true
    },
    {
      label: 'Assignee (Section / Office)',
      name: 'assigned_to.name',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Due Date',
      name: 'due_date',
      type: EtoolsTableColumnType.Date
    },
    {
      label: 'Priority',
      name: 'high_priority',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any) => {
        return item.high_priority ? 'High' : '';
      }
    }
  ];

  @property({type: String})
  assessmentId: string | number | null = null;

  @property({type: Object})
  assessment!: Assessment;

  stateChanged(state: RootState) {
    const stateAssessmentId = get(state, 'app.routeDetails.params.assessmentId');
    if (stateAssessmentId && stateAssessmentId !== 'new') {
      if (this.assessmentId !== stateAssessmentId) {
        this.assessmentId = stateAssessmentId;
        this.getFollowUpData();
      }
    }
    this.assessment = state.pageData?.currentAssessment!;
  }

  updateActionPoints(actionPoint: GenericObject) {
    const oldActionPointsData = cloneDeep(this.dataItems);
    const existingActionPointIndex: number = this.dataItems.findIndex((ap: GenericObject) => ap.id === actionPoint.id);
    if (existingActionPointIndex > -1) {
      oldActionPointsData.splice(existingActionPointIndex, 1, actionPoint);
    } else {
      oldActionPointsData.push(actionPoint);
    }
    this.dataItems = oldActionPointsData;
    this.requestUpdate();
  }

  getFollowUpData() {
    this.showLoading = true;
    // @ts-ignore
    sendRequest({
      endpoint: getEndpoint(etoolsEndpoints.actionPoints, {id: this.assessmentId})
    })
      .then((response: any) => {
        this.dataItems = response;
      })
      .catch((err: any) => logError('Get action points list data req failed', 'FollowUpPage', err))
      .then(() => (this.showLoading = false));
  }

  setRowActionsVisibility(item: GenericObject) {
    const isEditable = item && item.status !== 'completed';
    return {showEdit: isEditable, showCopy: true};
  }

  editActionPoint(event: GenericObject) {
    const editedItem = this.extractActionPointData(event.detail);
    this.openFollowUpDialog(editedItem);
  }

  copyActionPoint(event: GenericObject) {
    const item = this.extractActionPointData(event.detail);
    item.id = 'new';
    const warningMessage = 'It is required to change at least one of the fields below.';

    this.openFollowUpDialog(item, warningMessage);
  }

  extractActionPointData(item: ActionPoint) {
    const newEditedItem: ActionPoint = {
      partner: item.partner!.id,
      // category: item.category.id,
      assigned_to: item.assigned_to!.id,
      section: item.section!.id.toString(),
      office: item.office!.id,
      psea_assessment: item.psea_assessment,
      description: item.description,
      id: item.id,
      due_date: item.due_date,
      high_priority: item.high_priority
    };
    return newEditedItem;
  }

  openFollowUpDialog(item?: ActionPoint, warningMessage?: string) {
    openDialog({
      dialog: 'follow-up-dialog',
      dialogData: {
        item: item,
        warningMessage: warningMessage
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      this.updateActionPoints(response);
      return null;
    });
  }
}
