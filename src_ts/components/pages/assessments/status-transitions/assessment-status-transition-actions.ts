import {
  LitElement, html, customElement, property
} from 'lit-element';
import '@polymer/paper-input/paper-textarea.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {ConfigObj, createDynamicDialog, removeDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import {Assessment} from '../../../../types/assessment';
import {getEndpoint} from '../../../../endpoints/endpoints';
import {etoolsEndpoints} from '../../../../endpoints/endpoints-list';
import {makeRequest} from '../../../utils/request-helper';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../redux/store';
import {updateAssessmentData} from '../../../../redux/actions/page-data';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-error-parser';
import {buttonsStyles} from '../../../styles/button-styles';
import './assessment-rejection-dialog';
import {AssessmentRejectionDialog} from './assessment-rejection-dialog';

@customElement('assessment-status-transition-actions')
export class AssessmentStatusTransitionActions extends connect(store)(LitElement) {

  @property({type: Object})
  assessment!: Assessment;

  @property({type: Object})
  rejectionDialog!: AssessmentRejectionDialog;

  private statusChangeConfirmationDialog: EtoolsDialog | null = null;
  private confirmationMSg: HTMLSpanElement = document.createElement('span');
  private currentStatusAction = '';

  render() {
    // language=HTML
    return html`
      ${buttonsStyles}
      ${this.cancelAssessmentStatusActionTmpl(this.assessment)}
      ${this.assessmentStatusActionBtnsTmpl(this.assessment)}
    `;
  }

  cancelBtnHtml() {
    return html`
      <paper-button class="default right-icon" raised @tap="${() => this.updateAssessmentStatus('cancel')}">
        Cancel
        <iron-icon icon="remove-circle-outline"></iron-icon>
      </paper-button>
    `;
  }

  assignBtnHtml() {
    return html`
      <paper-button class="primary right-icon" 
          raised @tap="${() => this.updateAssessmentStatus('assign')}">
        Assign
        <iron-icon icon="assignment-ind"></iron-icon>
      </paper-button>
    `;
  }

  submitBtnHtml() {
    return html`
      <paper-button class="primary right-icon" 
          raised @tap="${() => this.updateAssessmentStatus('submit')}">
        Submit
        <iron-icon icon="chevron-right"></iron-icon>
      </paper-button>
    `;
  }

  rejectBtnHtml() {
    return html`
      <paper-button class="error right-icon"
        raised @tap="${() => this.updateAssessmentStatus('reject')}">
        Reject
        <iron-icon icon="assignment-return"></iron-icon>
      </paper-button>
    `;
  }

  finalizeBtnHtml() {
    return html`
      <paper-button class="success right-icon"
          raised @tap="${() => this.updateAssessmentStatus('finalize')}">
        Finalize
        <iron-icon icon="chevron-right"></iron-icon>
      </paper-button>
    `;
  }

  cancelAssessmentStatusActionTmpl(assessment: Assessment) {
    if (!this.canShowActionBtn(assessment.available_actions, 'cancel')) {
      return;
    }
    return this.cancelBtnHtml();
  }

  assessmentStatusActionBtnsTmpl(assessment: Assessment) {
    if (!this.canShowStatusActions(assessment)) {
      return;
    }
    switch (assessment.status) {
      case 'draft':
        return this.canShowActionBtn(assessment.available_actions, 'assign')
          ? this.assignBtnHtml()
          : '';
      case 'in_progress':
      case 'rejected':
        return this.canShowActionBtn(assessment.available_actions, 'submit')
          ? this.submitBtnHtml()
          : '';
      case 'submitted':
        return html`
          ${this.canShowActionBtn(assessment.available_actions, 'reject')
            ? this.rejectBtnHtml()
            : ''}
          ${this.canShowActionBtn(assessment.available_actions, 'finalize')
            ? this.finalizeBtnHtml()
            : ''}
          `;
      default:
        return '';
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.onStatusChangeConfirmation = this.onStatusChangeConfirmation.bind(this);
    this.createStatusChangeConfirmationsDialog();
    this.createRejectionDialog();
    // @ts-ignore
    this.addEventListener('rejection-confirmed', this.onStatusChangeConfirmation);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeStatusChangeConfirmationsDialog();
    this.removeRejectionDialog();
    // @ts-ignore
    this.removeEventListener('rejection-confirmed', this.onStatusChangeConfirmation);
  }

  public stateChanged(state: RootState) {
    if (state.pageData!.currentAssessment) {
      // initialize assessment object
      this.assessment = {...state.pageData!.currentAssessment};
    }
  }

  /**
   * @param assessmentActionsList (assessment.available_actions will contain allowed actions)
   * @param btnActionName
   */
  canShowActionBtn(assessmentActionsList: string[], btnActionName: string): boolean {
    return assessmentActionsList.indexOf(btnActionName) > -1;
  }

  canShowStatusActions(assessment: Assessment) {
    return assessment && assessment.id && !!assessment.assessor;
  }

  // validateStatusChange(): boolean {
  //   let valid = false;
  //   switch (this.currentStatusAction) {
  //     case 'assign':
  //       // assessment should be added
  //       valid = this.assessment !== null && !!this.assessment.id && !!this.assessment.assessor;
  //       break;
  //     case 'submit':
  //     case 'reject':
  //     case 'finalize':
  //       // use only validation of status transition of the API
  //       valid = true;
  //       break;
  //     case 'cancel':
  //       // TODO: determine cancel validations by user group and add it to this condition
  //       valid = this.assessment !== null;
  //       break;
  //   }
  //   return valid;
  // }

  updateAssessmentStatus(action: string) {
    // console.log('action', action);
    this.currentStatusAction = action;

    // if (!this.validateStatusChange()) {
    //   // TODO: show a toast message explaining why status change cannot be made
    //   this.currentStatusAction = '';
    //   return;
    // }

    if (this.currentStatusAction === 'reject') {
      this.rejectionDialog.dialogOpened = true;
    } else {
      this.updateConfirmationMsgAction(this.currentStatusAction);
      if (!this.statusChangeConfirmationDialog) {
        throw new Error('statusChangeConfirmationDialog is not created!');
      }
      this.statusChangeConfirmationDialog.opened = true;
    }

  }

  updateConfirmationMsgAction(action: string) {
    this.confirmationMSg.innerText = `Are you sure you want to ${action} this assessment`;
  }

  onStatusChangeConfirmation(e: CustomEvent) {
    if (!e.detail.confirmed) {
      // cancel status update action
      this.currentStatusAction = '';
      return;
    }
    if (!this.assessment || !this.currentStatusAction) {
      throw new Error('Assessment obj or statusAction not set!');
    }
    const url = getEndpoint(etoolsEndpoints.assessmentStatusUpdate,
      {id: this.assessment.id, statusAction: this.currentStatusAction}).url!;

    if (this.currentStatusAction === 'reject') {
      this.rejectAssessment(url, e.detail.reason);
    } else {
      this.requestStatusUpdate(url);
    }
  }

  requestStatusUpdate(url: string) {
    makeRequest({url: url, method: 'PATCH'})
      .then((response) => {
        // update assessment data in redux store
        store.dispatch(updateAssessmentData(response));
      }).catch((err: any) => {
        logError(err);
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      }).then(() => {
        // req finalized... reset data
        this.currentStatusAction = '';
      });
  }

  rejectAssessment(url: string, reason: string) {
    const reqPayloadData = {comment: reason};
    this.rejectionDialog.spinnerLoading = true;
    makeRequest({url: url, method: 'PATCH'}, reqPayloadData)
      .then((response) => {
        // update assessment data in redux store
        store.dispatch(updateAssessmentData(response));
        this.rejectionDialog.closeDialog();
        this.currentStatusAction = '';
      }).catch((err: any) => {
        logError(err);
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      }).then(() => {
        // req finalized...
        this.rejectionDialog.spinnerLoading = false;
      });
  }

  createStatusChangeConfirmationsDialog() {
    if (!this.statusChangeConfirmationDialog) {
      const confirmationDialogConf: ConfigObj = {
        title: 'Assessment status update',
        size: 'md',
        okBtnText: 'Yes',
        cancelBtnText: 'No',
        closeCallback: this.onStatusChangeConfirmation,
        content: this.confirmationMSg
      };
      this.statusChangeConfirmationDialog = createDynamicDialog(confirmationDialogConf);
      this.statusChangeConfirmationDialog.updateStyles({'--etools-dialog-confirm-btn-bg': 'var(--primary-color)'});
    }
  }

  createRejectionDialog() {
    if (!this.rejectionDialog) {
      this.rejectionDialog =
        document.createElement('assessment-rejection-dialog') as AssessmentRejectionDialog;
      this.rejectionDialog.fireEventSource = this;
      document.querySelector('body')!.appendChild(this.rejectionDialog);
    }
  }

  removeStatusChangeConfirmationsDialog() {
    if (this.statusChangeConfirmationDialog !== null) {
      removeDialog(this.statusChangeConfirmationDialog);
    }
  }

  removeRejectionDialog() {
    if (this.rejectionDialog) {
      document.querySelector('body')!.removeChild(this.rejectionDialog);
    }
  }
}
