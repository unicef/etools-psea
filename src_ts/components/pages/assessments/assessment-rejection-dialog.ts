import {customElement, LitElement, html, property, query} from "lit-element";
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea.js';

import {SharedStylesLit} from "../../styles/shared-styles-lit";
import {fireEvent} from "../../utils/fire-custom-event";
import {PaperTextareaElement} from "@polymer/paper-input/paper-textarea";
import {values} from "lodash-es";

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
                    ok-btn-text="OK"
                    keep-dialog-open 
                    @confirm-btn-clicked="${this.onConfirmClick}">
                    <paper-textarea id="rejectionReason"
                        label="Reason for rejection"
                        type="text"
                        .value="${this.reason}"
                        required
                        error-message="Please provide a rejection reason."
                        placeholder="&#8212;"></paper-textarea>
                    
                    
      </etools-dialog>
    `;
  }

  @property({type: Boolean, reflect: true})
  dialogOpened: boolean = false;

  @property({type: String})
  reason!: string;

  @property({type: Object})
  fireEventSource!: object;

  @query('#rejectionReason') private rejectionCommentEl!: PaperTextareaElement;

  connectedCallback(): void {
    super.connectedCallback();
    // console.log('this.dialogOpened', this.dialogOpened);
  }

  private onConfirmClick() {
    console.log("click click pac pac");

    this.requestUpdate(this.reason).then(() => console.log(this.reason));
    // console.log(this.reason);

    if (this.rejectionCommentEl.validate()) {
      const reason = this.reason;

      fireEvent(this.fireEventSource, 'someEvent', {confirmed: true, this.rejectionCommentEl.value});
    }
    // this.dialogOpened = false;
    // fireEvent(this, 'toast', {
    //   text: 'All changes are saved.',
    //   showCloseBtn: false
    // });
    // fireEvent(this.fireEventSource, 'someEvent', {reason: "some reason"});
    // this.fire('someEvent');
    // this.saveDialogData();
  }


}
