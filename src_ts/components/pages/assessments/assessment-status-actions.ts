import {html} from 'lit-html';
import {EtoolsStatusModel} from '../../common/layout/status/etools-status';
import {Assessment} from '../../../types/assessment';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import {makeRequest} from '../../utils/request-helper';
import {getEndpoint} from '../../../endpoints/endpoints';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {ConfigObj, createDynamicDialog, removeDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../utils/ajax-error-parser';
import {AssessmentTabs} from './assessment-tabs';
import {store} from "../../../redux/store";
import {updateAssessmentData} from "../../../redux/actions/page-data";
import {cloneDeep} from "../../utils/utils";

let assessmentTabsElement: AssessmentTabs | null = null;
export const setStatusActionsModuleParentEl = (el: AssessmentTabs) => {
  assessmentTabsElement = el;
};

let assessment: Assessment | null = null;
let statusAction: string | null = null;

let statusChangeConfirmationDialog: EtoolsDialog | null = null;
const confirmationMSg: HTMLSpanElement = document.createElement('span');

const updateConfirmationMsgAction = (action: string) => {
  confirmationMSg.innerText = `Are you sure you want to ${action} this assessment`;
};

export const canShowCancelAction = (assessment: Assessment) => {
  return !!assessment.id;
};

export const canShowStatusActions = (assessment: Assessment) => {
  return assessment.id && !!assessment.assessor;
};

export const getAssessmentStatusesList = (statusesList: string[][]): EtoolsStatusModel[] => {
  if (statusesList.length === 0) return [];
  return statusesList.map((s: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return {status: s[0], label: s[1]} as EtoolsStatusModel;
  });
};

export const cancelAssessmentStatusActionTmpl = (statusAction: (...args: any[]) => void) => {
  return html`
    <paper-button class="default right-icon" raised @tap="${() => statusAction('cancel')}">
      Cancel
      <iron-icon icon="remove-circle-outline"></iron-icon>
    </paper-button>
  `;
};

export const assessmentStatusActionBtnsTmpl = (status: string, statusAction: (...args: any[]) => void) => {
  switch (status) {
    case 'draft':
      return html`
        <paper-button class="primary right-icon" raised @tap="${() => statusAction('assign')}">
          Assign
          <iron-icon icon="assignment-ind"></iron-icon>
        </paper-button>
      `;
    case 'in-progress':
      return html`
        <paper-button class="primary right-icon" raised @tap="${() => statusAction('submit')}">
          Submit
          <iron-icon icon="chevron-right"></iron-icon>
        </paper-button>
      `;
    case 'submitted':
      return html`
        <paper-button class="error right-icon" raised @tap="${() => statusAction('reject')}">
          Reject
          <iron-icon icon="assignment-return"></iron-icon>
        </paper-button>
        <paper-button class="success right-icon" raised @tap="${() => statusAction('finalize')}">
          Finalize
          <iron-icon icon="chevron-right"></iron-icon>
        </paper-button>
      `;
    default:
      return '';
  }
};

const validateStatusChange = (): boolean => {
  let valid = false;
  switch (statusAction) {
    case 'assign':
      // assessment should be added
      valid = assessment !== null && !!assessment.id && !!assessment.assessor;
      break;
    case 'submit':
    case 'reject':
    case 'finalize':
      // use only validation of status transition of the API
      valid = true;
      break;
    case 'cancel':
      // TODO: determine cancel validations by user group and add it to this condition
      valid = assessment !== null && (['submitted', 'final'].indexOf(assessment.status) === -1);
      break;
  }
  return valid;
};

const resetCurrentStatusUpdateData = () => {
  assessment = null;
  statusAction = null;
};

export const updateAssessmentStatus = (currentAssessment: Assessment, action: string) => {
  console.log(currentAssessment, action);
  assessment = {...currentAssessment};
  statusAction = action;
  if (!validateStatusChange()) {
    // TODO: show a toast message explaining why status change cannot be made
    resetCurrentStatusUpdateData();
    return;
  }

  updateConfirmationMsgAction(statusAction);
  if (!statusChangeConfirmationDialog) {
    throw new Error('statusChangeConfirmationDialog is not created!');
  }
  statusChangeConfirmationDialog.opened = true;
};

const onStatusChangeConfirmation = (e: CustomEvent) => {
  if (!e.detail.confirmed) {
    // cancel status update action
    resetCurrentStatusUpdateData();
    return;
  }
  if (!assessment || !statusAction) {
    throw new Error('Assessment obj or statusAction not set!');
  }
  const url = getEndpoint(etoolsEndpoints.assessmentStatusUpdate,
    {id: assessment.id, statusAction: statusAction}).url!;
  console.log('update status: PATCH', url);
  return makeRequest({url: url, method: 'PATCH'})
    .then((response) => {
      console.log('success on status change...', response);
      // update assessment data in redux store
      store.dispatch(updateAssessmentData({...assessment, response}));
    })
    .catch((err: any) => {
      logError(err);
      parseRequestErrorsAndShowAsToastMsgs(err, assessmentTabsElement);
    }).then(() => {
      // req finalized... reset data
      resetCurrentStatusUpdateData();
    });
};

export const createStatusChangeConfirmationsDialog = () => {
  if (!statusChangeConfirmationDialog) {
    const confirmationDialogConf: ConfigObj = {
      title: 'Assessment status update',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: onStatusChangeConfirmation,
      content: confirmationMSg
    };
    statusChangeConfirmationDialog = createDynamicDialog(confirmationDialogConf);
    statusChangeConfirmationDialog.updateStyles({'--etools-dialog-confirm-btn-bg': 'var(--primary-color)'});
  }
};

export const removeStatusChangeConfirmationsDialog = () => {
  if (statusChangeConfirmationDialog !== null) {
    removeDialog(statusChangeConfirmationDialog);
  }
};

