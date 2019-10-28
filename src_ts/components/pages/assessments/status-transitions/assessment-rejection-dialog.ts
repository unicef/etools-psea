import {customElement, LitElement, html, property, query} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea.js';

import {SharedStylesLit} from '../../../styles/shared-styles-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {PaperInputErrorElement} from '@polymer/paper-input/paper-input-error';

/**
 * @customElement
 *  @LitElement
 */
@customElement('assessment-rejection-dialog')
export class AssessmentRejectionDialog extends LitElement {

  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <etools-dialog id="assessmentRejectionDialog"
                    ?opened="${this.dialogOpened}"
                    dialog-title="Are you sure you want to reject this assessment?"
                    size="md"
                    ok-btn-text="YES"
                    cancel-btn-text="Cancel"
                    keep-dialog-open 
                    ?show-spinner="${this.spinnerLoading}"
                    @close="${() => this.closeDialog()}"
                    @confirm-btn-clicked="${this.onConfirm}">
                    <paper-textarea id="rejectionReason"
                        label="Reason for rejection"
                        type="text"
                        required auto-validate
                        error-message="Please provide a rejection reason."
                        placeholder="&#8212;"></paper-textarea>
                    
                    
      </etools-dialog>
    `;
  }

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: Boolean})
  spinnerLoading: boolean = false;

  @property({type: Object})
  fireEventSource!: HTMLElement;

  @query('#rejectionReason') private rejectionCommentEl!: PaperTextareaElement;

  firstUpdated(): void {
    if (this.rejectionCommentEl) {
      setTimeout(() => {
        // delay paper-input-error query (otherwise it will be null, not ideal solution)
        const rejectionReasonField: PaperInputErrorElement | null =
          this.rejectionCommentEl.shadowRoot!.querySelector('paper-input-error');
        if (rejectionReasonField) {
          rejectionReasonField.style.position = 'relative';
        }
      }, 0);
    }
  }

  private onConfirm() {
    if (this.rejectionCommentEl.validate()) {
      const reason = this.rejectionCommentEl.value;
      fireEvent(this.fireEventSource, 'rejection-confirmed', {confirmed: true, reason});
    }
  }

  public closeDialog() {
    this.dialogOpened = false;
    this.rejectionCommentEl.value = '';
    this.rejectionCommentEl.invalid = false;
  }

}
