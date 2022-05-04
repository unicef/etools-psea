import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-input/paper-textarea.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {ConfigObj, createDynamicDialog, removeDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import {Assessment} from '../../../../types/assessment';
import {getEndpoint} from '../../../../endpoints/endpoints';
import {etoolsEndpoints} from '../../../../endpoints/endpoints-list';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../redux/store';
import {updateAssessmentData} from '../../../../redux/actions/page-data';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {buttonsStyles} from '../../../styles/button-styles';
import './assessment-rejection-dialog';
import './nfr-finalize-dialog.js';
import {openDialog} from '../../../utils/dialog';

@customElement('assessment-status-transition-actions')
export class AssessmentStatusTransitionActions extends connect(store)(LitElement) {
  static get styles() {
    return [buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>
      ${this.cancelAssessmentStatusActionTmpl(this.assessment)} ${this.assessmentStatusActionBtnsTmpl(this.assessment)}
    `;
  }

  @property({type: Object})
  assessment!: Assessment;

  @property({type: Boolean})
  showLoading = false;

  private statusChangeConfirmationDialog: EtoolsDialog | null = null;
  private confirmationMSg: HTMLSpanElement = document.createElement('span');
  private currentStatusAction = '';

  cancelBtnHtml() {
    return html`
      <paper-button
        id="btnCancelAssessment"
        class="default right-icon responsive"
        raised
        @tap="${() => this.updateAssessmentStatus('cancel')}"
      >
        Cancel
        <iron-icon icon="remove-circle-outline"></iron-icon>
      </paper-button>
    `;
  }

  assignBtnHtml() {
    return html`
      <paper-button
        id="btnAssignAssessment"
        class="primary right-icon responsive"
        raised
        @tap="${() => this.updateAssessmentStatus('assign')}"
      >
        Assign
        <iron-icon icon="assignment-ind"></iron-icon>
      </paper-button>
    `;
  }

  submitBtnHtml() {
    return html`
      <paper-button
        id="btnSubmitAssessment"
        class="primary right-icon responsive"
        raised
        @tap="${() => this.updateAssessmentStatus('submit')}"
      >
        Submit
        <iron-icon icon="chevron-right"></iron-icon>
      </paper-button>
    `;
  }

  rejectBtnHtml() {
    return html`
      <paper-button
        id="btnRejectAssessment"
        class="error right-icon responsive"
        raised
        @tap="${() => this.updateAssessmentStatus('reject')}"
      >
        Reject
        <iron-icon icon="assignment-return"></iron-icon>
      </paper-button>
    `;
  }

  finalizeBtnHtml() {
    return html`
      <paper-button
        id="btnFinalizeAssessment"
        class="success right-icon responsive"
        raised
        @tap="${() => this.updateAssessmentStatus('finalize')}"
      >
        Finalize
        <iron-icon icon="chevron-right"></iron-icon>
      </paper-button>
    `;
  }

  cancelAssessmentStatusActionTmpl(assessment: Assessment) {
    if (
      !assessment ||
      !assessment.available_actions ||
      !this.canShowActionBtn(assessment.available_actions, 'cancel')
    ) {
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
        return this.canShowActionBtn(assessment.available_actions, 'assign') ? this.assignBtnHtml() : '';
      case 'in_progress':
      case 'rejected':
        return this.canShowActionBtn(assessment.available_actions, 'submit') ? this.submitBtnHtml() : '';
      case 'submitted':
        return html`
          ${this.canShowActionBtn(assessment.available_actions, 'reject') ? this.rejectBtnHtml() : ''}
          ${this.canShowActionBtn(assessment.available_actions, 'finalize') ? this.finalizeBtnHtml() : ''}
        `;
      default:
        return '';
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.onStatusChangeConfirmation = this.onStatusChangeConfirmation.bind(this);
    this.createStatusChangeConfirmationsDialog();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeStatusChangeConfirmationsDialog();
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
    return assessment && assessment.id && !!assessment.assessor && assessment.available_actions;
  }

  updateAssessmentStatus(action: string) {
    this.currentStatusAction = action;
    switch (action) {
      case 'reject':
        this.openRejectDialog();
        break;
      default:
        this.updateConfirmationMsgAction(this.currentStatusAction);
        if (!this.statusChangeConfirmationDialog) {
          throw new Error('statusChangeConfirmationDialog is not created!');
        }
        this.statusChangeConfirmationDialog.opened = true;
        break;
    }
  }

  openRejectDialog() {
    openDialog({
      dialog: 'assessment-rejection-dialog',
      dialogData: {
        assessmentId: this.assessment.id
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      this.onStatusChangeConfirmation({detail: {confirmed: confirmed, response: response}} as CustomEvent);
      return null;
    });
  }

  updateConfirmationMsgAction(action: string) {
    let warnMsg = `Are you sure you want to ${action} this assessment?`;
    if (action === 'finalize') {
      warnMsg =
        'Your finalisation of this Assessment confirms that you are satisfied that: <br/>' +
        ' - The process followed by the Assessor is in line with expected procedure <br/>' +
        ' - The Proof of Evidence provided by the Partner supports the rating against each Core Standard';
    }
    this.confirmationMSg.innerHTML = warnMsg;
  }

  async openNFRFinalize() {
    const nfrAttId = await openDialog({dialog: 'nfr-finalize-dialog'}).then(({confirmed, response}) => {
      if (confirmed) {
        return response.nfrAttachmentId;
      } else {
        return null;
      }
    });
    return nfrAttId;
  }

  async onStatusChangeConfirmation(e: CustomEvent) {
    const containerHeight = document
      .querySelector('app-shell')!
      .shadowRoot!.querySelector('#appHeadLayout')!
      .shadowRoot!.querySelector('#contentContainer')!.scrollHeight;

    this.shadowRoot!.querySelector('etools-loading')!.style.height = `${containerHeight}px`; // why is this here?

    if (!e.detail.confirmed) {
      // cancel status update action
      this.currentStatusAction = '';
      return;
    }
    if (!this.assessment || !this.currentStatusAction) {
      throw new Error('Assessment obj or statusAction not set!');
    }

    let nfrAttachmentId = '';
    if (this.currentStatusAction == 'finalize' && this.assessment.overall_rating?.display == 'High') {
      nfrAttachmentId = await this.openNFRFinalize();
      if (!nfrAttachmentId) {
        return;
      }
    }

    this.showLoading = true;

    const url = getEndpoint(etoolsEndpoints.assessmentStatusUpdate, {
      id: this.assessment.id,
      statusAction: this.currentStatusAction
    }).url!;

    switch (this.currentStatusAction) {
      case 'reject':
        this.rejectAssessment(e.detail.response);
        break;
      case 'finalize':
        this.requestStatusUpdate(url, {nfr_attachment: nfrAttachmentId});
        break;

      default:
        this.requestStatusUpdate(url);
        break;
    }
  }

  requestStatusUpdate(url: string, body = {}) {
    sendRequest({
      endpoint: {url: url},
      method: 'PATCH',
      body: body
    })
      .then((response) => {
        this.showLoading = false;
        // update assessment data in redux store
        store.dispatch(updateAssessmentData(response));
      })
      .catch((err: any) => {
        this.showLoading = false;
        logError('Status update failed', 'AssessmentStatusTransitionActions', err);
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      })
      .then(() => {
        // req finalized... reset data
        this.currentStatusAction = '';
      });
  }

  rejectAssessment(response: any) {
    store.dispatch(updateAssessmentData(response));
    this.currentStatusAction = '';
    this.showLoading = false;
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
    }
  }

  removeStatusChangeConfirmationsDialog() {
    if (this.statusChangeConfirmationDialog !== null) {
      removeDialog(this.statusChangeConfirmationDialog);
    }
  }
}
