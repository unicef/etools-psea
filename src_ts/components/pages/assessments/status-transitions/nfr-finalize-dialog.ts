import {customElement, LitElement, html, property, query, css} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea.js';

import {SharedStylesLit} from '../../../styles/shared-styles-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import '@unicef-polymer/etools-upload/etools-upload';
import {etoolsEndpoints} from '../../../../endpoints/endpoints-list';
import {EtoolsUpload} from '@unicef-polymer/etools-upload/etools-upload';

/**
 * @customElement
 *  @LitElement
 */
// NFR = Note For the Record
@customElement('nfr-finalize-dialog')
export class NfrFinalizeDialog extends LitElement {
  static get styles() {
    return [
      css`
        .container {
          padding: 12px 0;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      ${SharedStylesLit}
      <etools-dialog
        id="nfrDialog"
        dialog-title="Note For Record Attachment"
        size="md"
        ok-btn-text="Save & Finalize"
        opened
        cancel-btn-text="Cancel"
        keep-dialog-open
        ?show-spinner="${this.spinnerLoading}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onSave}"
      >
      <div class="container">As of July 1, 2021, partners who are assessed as 'high risk' require a Note for the Record approved by the Head of the Office. If this partner is 'high risk', please attach the NFR here to ensure that GSSC can enter the results of this PSEA assessment in VISION.</div>
      <div class="container">
          <etools-upload
            id="nfrUpload"
            label="NFR Attachment"
            accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
            .fileUrl="${this.nfrAttachmentId}"
            .uploadEndpoint="${etoolsEndpoints.attachmentsUpload.url}"
            @upload-finished="${this._uploadFinished}"
            required
            error-message="NFR is required"
          >
        </div>
      </etools-dialog>
    `;
  }

  @query('#nfrUpload') private nfrUploadEl!: EtoolsUpload;

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Boolean})
  spinnerLoading = false;

  @property({type: Number})
  nfrAttachmentId!: number;

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  private onSave() {
    if (!this.nfrUploadEl.validate()) {
      return;
    }
    fireEvent(this, 'dialog-closed', {confirmed: true, nfrAttachmentId: this.nfrAttachmentId});
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.nfrAttachmentId = uploadResponse.id;
    }
  }
}
