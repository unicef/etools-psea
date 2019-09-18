import {customElement, LitElement, html, property, query} from "lit-element";
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea.js';

import {SharedStylesLit} from "../../styles/shared-styles-lit";
import {fireEvent} from "../../utils/fire-custom-event";
import {PaperTextareaElement} from "@polymer/paper-input/paper-textarea";


/**
 * @customElement
 *  @LitElement
 */
@customElement('assessment-rejection-dialog')
export class AssessmentRejectionDialog extends LitElement {

  render() {
    // language=HTML
    return html`
      <style>
      
        #rejectionReason {
          --paper-input-error: {
            position: relative !important;
          }
        }
      
      </style>
        ${SharedStylesLit}
      <etools-dialog id="assessmentRejectionDialog"
                    ?opened="${this.dialogOpened}"
                    dialog-title="Are you sure you want to reject this assessment?"
                    size="md"
                    ok-btn-text="YES"
                    cancel-btn-text="Cancel"
                    keep-dialog-open 
                    ?show-spinner="${this.spinnerLoading}"
                    @close="${() => this.dialogClosed()}"
                    @confirm-btn-clicked="${this.onConfirm}">
                    <paper-textarea id="rejectionReason"
                        label="Reason for rejection"
                        type="text"
                        .value="${this.reason}"
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

  @property({type: String})
  reason!: string;

  @property({type: Object})
  fireEventSource!: HTMLElement;

  @query('#rejectionReason') private rejectionCommentEl!: PaperTextareaElement;

  connectedCallback(): void {
    super.connectedCallback();
    // console.log('this.dialogOpened', this.dialogOpened);
  }

  private onConfirm() {
    if (this.rejectionCommentEl.validate()) {
      const reason = this.rejectionCommentEl.value;
      fireEvent(this.fireEventSource, 'someEvent', {confirmed: true, reason});
    }

  }

  public dialogClosed() {
    this.dialogOpened = false;
    this.rejectionCommentEl.value = '';
    this.rejectionCommentEl.invalid = false;
  }


}
