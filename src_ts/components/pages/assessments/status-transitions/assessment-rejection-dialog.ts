import {customElement, LitElement, html, property, query, css} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea.js';

import {SharedStylesLit} from '../../../styles/shared-styles-lit';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {etoolsEndpoints} from '../../../../endpoints/endpoints-list';
import {getEndpoint} from '../../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from '../../../utils/fire-custom-event';
import {GenericObject} from '../../../../types/globals';

/**
 * @customElement
 *  @LitElement
 */
@customElement('assessment-rejection-dialog')
export class AssessmentRejectionDialog extends LitElement {
  static get styles() {
    return [
      css`
        #rejectionReason {
          padding-bottom: 24px;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <etools-dialog
        id="assessmentRejectionDialog"
        ?opened="${this.dialogOpened}"
        dialog-title="Are you sure you want to reject this assessment?"
        size="md"
        ok-btn-text="YES"
        cancel-btn-text="Cancel"
        keep-dialog-open
        ?show-spinner="${this.spinnerLoading}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onConfirm}"
      >
        <paper-textarea
          id="rejectionReason"
          label="Reason for rejection"
          type="text"
          required
          auto-validate
          error-message="Please provide a rejection reason."
          placeholder="&#8212;"
        ></paper-textarea>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  dialogOpened = true;

  @property({type: Boolean})
  spinnerLoading = false;

  @property({type: String})
  assessmentId!: string;

  @query('#rejectionReason') private rejectionCommentEl!: PaperTextareaElement;

  set dialogData(data: GenericObject) {
    this.assessmentId = data.assessmentId;
  }

  private onConfirm() {
    if (!this.rejectionCommentEl.validate()) {
      return;
    }
    this.spinnerLoading = true;

    const url = getEndpoint(etoolsEndpoints.assessmentStatusUpdate, {
      id: this.assessmentId,
      statusAction: 'reject'
    }).url!;

    const reqPayloadData = {comment: this.rejectionCommentEl.value};
    sendRequest({
      endpoint: {url: url},
      method: 'PATCH',
      body: reqPayloadData
    })
      .then((response) => {
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response});
      })
      .catch((err: any) => {
        logError('Reject req failed', 'AssessmentStatusTransitionActions', err);
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      })
      .then(() => {
        this.spinnerLoading = false;
      });
  }

  public onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
